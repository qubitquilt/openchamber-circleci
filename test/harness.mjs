/**
 * A fake OpenChamber host for the built bundles.
 *
 * OpenChamber loads each surface in a sandboxed iframe and talks to it over
 * postMessage. This harness reproduces the parts of that contract a surface
 * touches at boot: the `ready` push, `storage`, `request`, `file-read` and the
 * fire-and-forget calls. It runs the real built bundle, so a surface that
 * throws on mount, reads a missing field or fails to answer its first API call
 * shows up here instead of in the app.
 *
 * The frame must be a real jsdom iframe: the SDK refuses every call when
 * `window.parent === window`, which is exactly what a top-level window does.
 */
import { readFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { JSDOM, VirtualConsole } from "jsdom";

const here = dirname(fileURLToPath(import.meta.url));
export const repoRoot = resolve(here, "..");

export const THEME_TOKENS = {
  background: "#ffffff",
  elevated: "#ffffff",
  foreground: "#111111",
  muted: "#666666",
  subtle: "#eeeeee",
  border: "#dddddd",
  hover: "#f2f2f2",
  selection: "#e8f0fe",
  focus: "#4a90d9",
  primary: "#4a90d9",
  mutedSurface: "#f4f4f5",
  elevatedForeground: "#111111",
  active: "#e8f0fe",
  selectionForeground: "#111111",
  primaryForeground: "#ffffff",
  primaryText: "#2563eb",
  successText: "#15803d",
  warningText: "#b45309",
  errorText: "#b91c1c",
  infoText: "#0369a1",
  success: "#22c55e",
  warning: "#f59e0b",
  error: "#ef4444",
  info: "#3b82f6",
  font: "system-ui, sans-serif",
  mono: "ui-monospace, monospace",
  radius: "8px",
};

export function readyMessage(options = {}) {
  return {
    channel: "openchamber.sdk",
    v: 1,
    type: "ready",
    payload: {
      theme: { mode: options.mode ?? "light", tokens: THEME_TOKENS },
      locale: "en",
      directory: options.directory === undefined ? "/home/me/web" : options.directory,
      session: options.session ?? null,
      surface: options.surface ?? "panel",
      connection: options.connection ?? { connected: true, account: "" },
      settings: {},
      item: options.item ?? null,
    },
  };
}

/** Strip the entry HTML down to markup; the bundle is evaluated by the harness. */
function withoutScripts(html) {
  return html.replace(/<script\b[^>]*><\/script>/gi, "");
}

/**
 * Boot one surface.
 *
 * `answers` maps a route (`GET /api/v3/runs`) to `{status, body}` or a
 * function. `files` maps a path to its text content. `workspace` carries the
 * host's workspace snapshot data: `projects`, and `worktrees`/`sessions`
 * keyed by project id.
 */
export async function boot(options) {
  const {
    html,
    script,
    surface = "panel",
    answers = {},
    files = {},
    connection,
    directory,
    item,
    hostErrors = {},
    workspace: workspaceData = {},
  } = options;
  const pushed = [];
  const requests = [];
  const calls = [];
  const errors = [];
  const virtualConsole = new VirtualConsole();
  virtualConsole.on("jsdomError", (error) => errors.push(String(error?.message ?? error)));

  const dom = new JSDOM(
    '<!doctype html><html><head></head><body><iframe id="surface"></iframe></body></html>',
    {
      runScripts: "outside-only",
      url: "https://guest.invalid/",
      pretendToBeVisual: true,
      virtualConsole,
    },
  );
  const top = dom.window;
  const frameElement = top.document.getElementById("surface");
  const win = frameElement.contentWindow;
  if (!win) throw new Error("jsdom did not create an iframe window");
  win.document.open();
  win.document.write(withoutScripts(await readFile(resolve(repoRoot, html), "utf8")));
  win.document.close();

  // jsdom has no layout, so the few browser APIs a UI control may reach for
  // are stubbed; a surface that needs real layout is out of scope here.
  win.ResizeObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
  win.matchMedia =
    win.matchMedia ??
    (() => ({
      matches: false,
      media: "",
      addEventListener() {},
      removeEventListener() {},
      addListener() {},
      removeListener() {},
      dispatchEvent: () => false,
    }));
  win.scrollTo = () => undefined;
  win.HTMLElement.prototype.scrollIntoView = () => undefined;

  // Guest -> host. Every `post` from the SDK lands here.
  const outbox = [];
  top.postMessage = (message) => {
    outbox.push(message);
  };

  // Host -> guest. `source` has to be the frame's parent, or the SDK drops it.
  const post = (message) => {
    win.dispatchEvent(new win.MessageEvent("message", { data: message, source: top }));
  };

  const storage = new Map();
  const answer = (request) => {
    const envelope = { channel: "openchamber.sdk", v: 1, type: "result", id: request.id, ok: true };
    // `hostErrors` makes the host refuse one call type, as a real host can.
    const refusal = hostErrors[request.type];
    if (refusal) {
      post({ ...envelope, ok: false, code: refusal.code, error: refusal.error });
      return;
    }
    switch (request.type) {
      case "storage": {
        const { op, key, value } = request.payload;
        if (op === "get") {
          const found = storage.has(key);
          post({
            ...envelope,
            payload: { storage: true, op, found, ...(found ? { value: storage.get(key) } : {}) },
          });
          return;
        }
        if (op === "set") {
          storage.set(key, value);
          post({ ...envelope, payload: { storage: true, op } });
          return;
        }
        if (op === "delete") {
          storage.delete(key);
          post({ ...envelope, payload: { storage: true, op } });
          return;
        }
        post({ ...envelope, payload: { storage: true, op: "keys", keys: [...storage.keys()] } });
        return;
      }
      case "request": {
        const input = request.payload;
        requests.push(input);
        const key = `${input.method} ${input.path}`;
        const handler =
          answers[key] ?? answers[`${input.method} ${input.path.replace(/\/[^/]+$/, "/:id")}`];
        const result = typeof handler === "function" ? handler(input, requests.length) : handler;
        const respond = (settled) => {
          if (!settled) {
            post({ ...envelope, ok: false, code: "BAD_PATH", error: `No fake route for ${key}` });
            return;
          }
          post({ ...envelope, payload: { status: settled.status, body: settled.body ?? "" } });
        };
        // A handler may return a promise, so a test can hold a request open and
        // interleave a directory switch or a poll tick with it.
        if (result instanceof Promise) {
          void result.then(respond);
          return;
        }
        respond(result);
        return;
      }
      case "file-read": {
        const path = request.payload.path;
        if (!(path in files)) {
          post({ ...envelope, ok: false, code: "NOT_FOUND", error: `${path} is not there` });
          return;
        }
        post({ ...envelope, payload: { content: files[path] } });
        return;
      }
      case "workspace-read": {
        // The projects snapshot, or the worktrees/sessions of one project id.
        const query = request.payload ?? {};
        if (query.kind === "projects") {
          post({
            ...envelope,
            payload: {
              kind: "projects",
              state: "ready",
              projects: workspaceData.projects ?? [],
            },
          });
          return;
        }
        if (query.kind === "worktrees") {
          post({
            ...envelope,
            payload: {
              kind: "worktrees",
              projectId: query.projectId,
              state: "ready",
              worktrees: workspaceData.worktrees?.[query.projectId] ?? [],
            },
          });
          return;
        }
        post({
          ...envelope,
          payload: {
            kind: "sessions",
            projectId: query.projectId,
            state: "ready",
            coverage: [],
            sessions: workspaceData.sessions?.[query.projectId] ?? [],
          },
        });
        return;
      }
      default:
        // toast, badge, attach, open-url and friends resolve with no payload.
        post(envelope);
    }
  };

  win.eval(await readFile(resolve(repoRoot, script), "utf8"));

  /** Drain the guest's outbox until it has nothing left to say. */
  async function settle(limit = 60) {
    for (let round = 0; round < limit; round += 1) {
      const batch = outbox.splice(0, outbox.length);
      if (batch.length === 0) {
        await new Promise((done) => setTimeout(done, 5));
        if (outbox.length === 0) return;
        continue;
      }
      for (const message of batch) {
        if (!message.id) continue;
        calls.push({ type: message.type, id: message.id, payload: message.payload });
        // The guest's own answers and notices are results, not requests.
        if (message.type.endsWith("-result") || message.type.endsWith("-event")) continue;
        answer(message);
      }
      await new Promise((done) => setTimeout(done, 5));
    }
  }

  /** Drive one `/command` the way the composer's resolver does. */
  async function resolveCommand(command, args) {
    const id = `resolve-${command}-${args}`;
    post({ channel: "openchamber.sdk", v: 1, type: "resolve", id, payload: { command, args } });
    await settle();
    return calls.find((entry) => entry.id === id);
  }

  post(
    readyMessage({
      surface,
      connection,
      directory,
      item,
      session: options.session,
    }),
  );
  await settle();

  return {
    dom,
    win,
    doc: win.document,
    storage,
    requests,
    calls,
    errors,
    settle,
    resolveCommand,
    text: () => win.document.body.textContent ?? "",
    send: (message) => {
      pushed.push(message);
      post(message);
    },
    dispose: () => dom.window.close(),
  };
}
