import assert from "node:assert/strict";
import test from "node:test";

import { boot, readyMessage, THEME_TOKENS } from "./harness.mjs";

const json = (status, payload) => ({ status, body: JSON.stringify(payload) });
const now = new Date("2026-01-01T12:00:00Z").toISOString();

function project() {
  return {
    id: "project-1",
    attributes: { name: "web" },
    references: { org: { id: "org-1", attributes: { name: "acme" } } },
  };
}

function run(overrides = {}) {
  return {
    id: "run-1",
    attributes: {
      number: 12,
      phase: "ended",
      current_outcome: "failed",
      created_at: now,
      errors: [],
      warnings: [],
      ...overrides,
    },
    references: {
      event: {
        attributes: {
          type: "webhook",
          vcs: {
            branch: "main",
            revision: "abcdef0123456789",
            commit: { subject: "Fix the login form" },
          },
        },
      },
      pipeline: { id: "pipe-1", attributes: { name: "main config" } },
      trigger: { id: "trigger-1", attributes: { name: "webhook" } },
    },
  };
}

function workflow(overrides = {}) {
  return {
    id: "workflow-1",
    attributes: {
      name: "build-and-test",
      phase: "ended",
      outcome: "failed",
      current_outcome: "failed",
      created_at: now,
      ended_at: now,
      ...overrides,
    },
  };
}

function job(overrides = {}) {
  return {
    id: "job-1",
    attributes: {
      name: "unit-tests",
      number: 7,
      type: "build",
      phase: "ended",
      outcome: "failed",
      started_at: now,
      ended_at: now,
      ...overrides,
    },
  };
}

function routes(overrides = {}) {
  return {
    "GET /api/v3/users": () =>
      json(200, { data: [{ id: "user-1", attributes: { login: "ada", name: "Ada" } }] }),
    "GET /api/v3/projects": () => json(200, { data: [project()], page: { next: null } }),
    "GET /api/v3/runs": () => json(200, { data: [run()], page: { next: null } }),
    "GET /api/v3/workflows": () => json(200, { data: [workflow()], page: { next: null } }),
    "GET /api/v3/jobs": () => json(200, { data: [job()], page: { next: null } }),
    "GET /api/v3/jobs/job-1": () =>
      json(200, {
        data: {
          id: "job-1",
          attributes: {
            name: "unit-tests",
            number: 7,
            type: "build",
            phase: "ended",
            outcome: "failed",
            errors: [{ type: "config", message: "npm test exited 1" }],
            parallel_executions: [
              {
                steps: [
                  {
                    num: 1,
                    name: "Run tests",
                    type: "run",
                    phase: "ended",
                    outcome: "failed",
                    exit_code: 1,
                    command: "npm test",
                  },
                ],
              },
            ],
          },
        },
      }),
    "GET /api/v3/jobs/job-1/stdout/condensed": () => ({
      status: 200,
      body: "FAIL src/login.test.ts",
    }),
    ...overrides,
  };
}

const gitFiles = {
  ".git/config": '[remote "origin"]\n\turl = git@github.com:acme/web.git\n',
  ".git/HEAD": "ref: refs/heads/main\n",
};

test("the rail panel resolves the project and lists runs", async () => {
  const surface = await boot({
    html: "panel/index.html",
    script: "panel/main.js",
    surface: "panel",
    answers: routes(),
    files: gitFiles,
  });
  try {
    assert.deepEqual(surface.errors, []);
    const text = surface.text();
    assert.match(text, /acme\/web/);
    assert.match(text, /ada/);
    assert.match(text, /#12/);
    assert.match(text, /main/);
    assert.match(text, /Failed/);
    assert.match(text, /Fix the login form/);
    // The slug lookup came from the git remote, not the picker.
    const projectCall = surface.requests.find((entry) => entry.path === "/api/v3/projects");
    assert.equal(projectCall.query["filter[slug]"], "gh/acme/web");
    // The resolved project is remembered for next time.
    assert.equal(surface.storage.size > 0, true);
  } finally {
    surface.dispose();
  }
});

test("the panel falls back to the picker when there is no git remote", async () => {
  const surface = await boot({
    html: "panel/index.html",
    script: "panel/main.js",
    surface: "panel",
    answers: routes({
      "GET /api/v3/orgs": () =>
        json(200, { data: [{ id: "org-1", attributes: { name: "acme" } }], page: { next: null } }),
    }),
    files: {},
  });
  try {
    assert.deepEqual(surface.errors, []);
    const text = surface.text();
    assert.match(text, /Choose a CircleCI project/);
    assert.match(text, /acme\/web/);
    // Without a remote there is no slug to try, so no CircleCI call is made.
    assert.equal(
      surface.requests.some((entry) => entry.query?.["filter[slug]"]),
      false,
    );
  } finally {
    surface.dispose();
  }
});

test("the panel shows the connect state without a token", async () => {
  const surface = await boot({
    html: "panel/index.html",
    script: "panel/main.js",
    surface: "panel",
    connection: { connected: false, account: "" },
    answers: routes(),
    files: gitFiles,
  });
  try {
    assert.deepEqual(surface.errors, []);
    assert.match(surface.text(), /Connect CircleCI/);
    assert.equal(surface.requests.length, 0);
  } finally {
    surface.dispose();
  }
});

test("the panel survives an API failure with a banner, not a blank screen", async () => {
  const surface = await boot({
    html: "panel/index.html",
    script: "panel/main.js",
    surface: "panel",
    answers: routes({
      "GET /api/v3/runs": () =>
        json(404, { error: { type: "not_found", title: "No such project" } }),
    }),
    files: gitFiles,
  });
  try {
    assert.deepEqual(surface.errors, []);
    assert.match(surface.text(), /No such project/);
  } finally {
    surface.dispose();
  }
});

test("the full-screen page renders runs and the selected run's workflows", async () => {
  const surface = await boot({
    html: "panel/page.html",
    script: "panel/page.js",
    surface: "page",
    answers: routes(),
    files: gitFiles,
  });
  try {
    assert.deepEqual(surface.errors, []);
    const text = surface.text();
    assert.match(text, /#12/);
    // It auto-selects the first run and lists its workflows.
    assert.match(text, /build-and-test/);
    assert.match(text, /Pick a run|unit-tests/);
  } finally {
    surface.dispose();
  }
});

test("the attach picker previews a run's failing workflow", async () => {
  const surface = await boot({
    html: "panel/attach.html",
    script: "panel/attach.js",
    surface: "dialog",
    answers: routes(),
    files: gitFiles,
  });
  try {
    assert.deepEqual(surface.errors, []);
    const text = surface.text();
    assert.match(text, /build-and-test/);
    assert.match(text, /Attaching build-and-test/);
    assert.match(text, /Failing: unit-tests/);
    assert.match(text, /Attach/);
  } finally {
    surface.dispose();
  }
});

test("the background frame boots idle and makes no call on its own", async () => {
  const surface = await boot({
    html: "background/index.html",
    script: "background/main.js",
    surface: "background",
    answers: routes(),
    files: gitFiles,
  });
  try {
    assert.deepEqual(surface.errors, []);
    assert.equal(surface.requests.length, 0);
  } finally {
    surface.dispose();
  }
});

/* ------------------------------------------------------------- interactions */

function clickByText(doc, text) {
  const nodes = [...doc.querySelectorAll("button, [role='option'], [role='tab'], a")];
  const node = nodes.find((entry) => (entry.textContent ?? "").trim().includes(text));
  if (!node) throw new Error(`no clickable containing ${JSON.stringify(text)}`);
  node.click();
  return node;
}

/** A button whose whole label is `text`, for cases where `includes` is too loose. */
function clickExact(doc, text) {
  const node = [...doc.querySelectorAll("button")].find(
    (entry) => (entry.textContent ?? "").trim() === text,
  );
  if (!node) throw new Error(`no button labelled ${JSON.stringify(text)}`);
  node.click();
  return node;
}

test("the panel drills run -> workflow -> job and attaches the failure with its output", async () => {
  const surface = await boot({
    html: "panel/index.html",
    script: "panel/main.js",
    surface: "panel",
    answers: routes(),
    files: gitFiles,
  });
  try {
    clickByText(surface.doc, "#12");
    await surface.settle();
    assert.match(surface.text(), /build-and-test/);
    assert.match(surface.text(), /Rerun failed/);

    clickByText(surface.doc, "Jobs");
    await surface.settle();
    assert.match(surface.text(), /unit-tests/);
    assert.match(surface.text(), /Attach failure/);

    clickByText(surface.doc, "Details");
    await surface.settle();
    assert.match(surface.text(), /Run tests/);
    assert.match(surface.text(), /FAIL src\/login\.test\.ts/);

    clickByText(surface.doc, "Attach to chat");
    await surface.settle();
    const attach = surface.calls.find((entry) => entry.type === "attach");
    assert.ok(attach, "attach was posted");
    assert.match(attach.payload.title, /unit-tests/);
    assert.match(attach.payload.title, /#12/);
    assert.match(attach.payload.text, /CircleCI run #12/);
    assert.match(attach.payload.text, /FAIL src\/login\.test\.ts/);
    assert.match(attach.payload.text, /npm test/);
    assert.equal(attach.payload.data.runId, "run-1");
    assert.equal(attach.payload.data.jobId, "job-1");
    assert.ok(attach.payload.url.includes("/workflows/workflow-1/jobs/7"));
  } finally {
    surface.dispose();
  }
});

test("rerun from failed sends is_from_failed and reports success", async () => {
  const surface = await boot({
    html: "panel/index.html",
    script: "panel/main.js",
    surface: "panel",
    answers: routes({
      "POST /api/v3/workflows/workflow-1/rerun": () => json(201, { data: { id: "workflow-2" } }),
    }),
    files: gitFiles,
  });
  try {
    clickByText(surface.doc, "#12");
    await surface.settle();
    clickByText(surface.doc, "Rerun failed");
    await surface.settle();

    const rerun = surface.requests.find((entry) => entry.path.endsWith("/rerun"));
    assert.ok(rerun, "the rerun reached the API");
    assert.equal(rerun.method, "POST");
    // The panel wired this button to "from failed", not to a full rerun.
    assert.deepEqual(JSON.parse(rerun.body ?? "null"), { is_from_failed: true });

    const toast = surface.calls.find(
      (entry) => entry.type === "toast" && entry.payload?.kind === "success",
    );
    assert.ok(toast, "a success toast was posted");
    assert.match(toast.payload.message, /Rerun started for build-and-test/);
  } finally {
    surface.dispose();
  }
});

test("the picker attaches the selected workflow", async () => {
  const surface = await boot({
    html: "panel/attach.html",
    script: "panel/attach.js",
    surface: "dialog",
    answers: routes(),
    files: gitFiles,
  });
  try {
    clickByText(surface.doc, "Attach");
    await surface.settle();
    const attach = surface.calls.find((entry) => entry.type === "attach");
    assert.ok(attach);
    // The picker focuses the chip on the workflow's first failing job.
    assert.match(attach.payload.title, /unit-tests/);
    assert.match(attach.payload.text, /build-and-test/);
    assert.ok(surface.calls.some((entry) => entry.type === "close"));
  } finally {
    surface.dispose();
  }
});

test("the background frame resolves /circleci 12 to a chip", async () => {
  const surface = await boot({
    html: "background/index.html",
    script: "background/main.js",
    surface: "background",
    answers: routes(),
    files: gitFiles,
  });
  try {
    const result = await surface.resolveCommand("circleci", "12");
    assert.ok(result, "the resolver answered");
    assert.ok(result.payload.item, "it returned a chip");
    assert.match(result.payload.item.title, /#12/);
    assert.match(result.payload.item.text, /CircleCI run #12/);
  } finally {
    surface.dispose();
  }
});

test("the background frame toasts the newest run for a session action", async () => {
  const surface = await boot({
    html: "background/index.html",
    script: "background/main.js",
    surface: "background",
    answers: routes(),
    files: gitFiles,
  });
  try {
    surface.send({
      channel: "openchamber.sdk",
      v: 1,
      type: "action",
      id: "action-1",
      payload: {
        kind: "session",
        action: "check-ci-status",
        sessionId: "session-1",
        sessionTitle: "Fix the build",
        directory: "/home/me/web",
      },
    });
    await surface.settle();
    const toast = surface.calls.find((entry) => entry.type === "toast");
    assert.ok(toast, "a toast was posted");
    assert.match(toast.payload.message, /#12/);
    assert.match(toast.payload.message, /Failed/);
  } finally {
    surface.dispose();
  }
});

/* -------------------------------------------------------------- UI kit rules */

function listText(surface) {
  return surface.doc.querySelector(".oc-sdk-list")?.textContent ?? "";
}

function twoRuns() {
  return routes({
    "GET /api/v3/runs": () =>
      json(200, {
        data: [
          run({ number: 12, current_outcome: "failed" }),
          run({ number: 11, current_outcome: "succeeded" }),
        ],
        page: { next: null },
      }),
  });
}

test("a filter tab repaints the list in place, without rebuilding the panel", async () => {
  const surface = await boot({
    html: "panel/index.html",
    script: "panel/main.js",
    surface: "panel",
    answers: twoRuns(),
    files: gitFiles,
  });
  try {
    assert.match(listText(surface), /#12/);
    assert.match(listText(surface), /#11/);
    const tablist = surface.doc.querySelector('[role="tablist"]');
    const tab = surface.doc.querySelector('[role="tab"][data-id="failed"]');
    assert.ok(tablist && tab, "the filter tabs are mounted");
    tab.click();
    await surface.settle();
    // The kit repaints its own tab buttons, but the surface must not rebuild
    // the panel around them: the tablist stays, and the rows filter in place.
    assert.equal(surface.doc.contains(tablist), true, "the tablist was not remounted");
    const selected = surface.doc.querySelector('[role="tab"][aria-selected="true"]');
    assert.equal(selected?.getAttribute("data-id"), "failed");
    assert.match(listText(surface), /#12/);
    assert.doesNotMatch(listText(surface), /#11/);
  } finally {
    surface.dispose();
  }
});

test("arrow keys move the filter and the kit's focus follows it", async () => {
  const surface = await boot({
    html: "panel/index.html",
    script: "panel/main.js",
    surface: "panel",
    answers: twoRuns(),
    files: gitFiles,
  });
  try {
    const tablist = surface.doc.querySelector('[role="tablist"]');
    const all = surface.doc.querySelector('[role="tab"][data-id="all"]');
    assert.ok(tablist && all);
    all.focus();
    tablist.dispatchEvent(
      new surface.win.KeyboardEvent("keydown", { key: "ArrowRight", bubbles: true }),
    );
    await surface.settle();
    const active = surface.doc.querySelector('[role="tab"][aria-selected="true"]');
    assert.equal(active?.getAttribute("data-id"), "failed");
    // The kit refocuses after onChange, so a keyboard user keeps their place.
    assert.equal(surface.doc.activeElement, active);
    assert.doesNotMatch(listText(surface), /#11/);
  } finally {
    surface.dispose();
  }
});

test("typing filters the runs and the clear button empties the field", async () => {
  const surface = await boot({
    html: "panel/page.html",
    script: "panel/page.js",
    surface: "page",
    answers: twoRuns(),
    files: gitFiles,
  });
  try {
    const input = surface.doc.querySelector("input.oc-sdk-input");
    assert.ok(input);
    input.value = "11";
    input.dispatchEvent(new surface.win.Event("input", { bubbles: true }));
    await surface.settle();
    assert.match(listText(surface), /#11/);
    assert.doesNotMatch(listText(surface), /#12/);

    const clear = surface.doc.querySelector(".oc-sdk-search-clear");
    assert.ok(clear);
    clear.click();
    await surface.settle();
    // The kit reports the clear and waits for update({ value }); both the
    // input and the rows must follow it.
    assert.equal(input.value, "");
    assert.match(listText(surface), /#12/);
    assert.match(listText(surface), /#11/);
  } finally {
    surface.dispose();
  }
});

test("Escape clears the search the same way the clear button does", async () => {
  const surface = await boot({
    html: "panel/page.html",
    script: "panel/page.js",
    surface: "page",
    answers: twoRuns(),
    files: gitFiles,
  });
  try {
    const input = surface.doc.querySelector("input.oc-sdk-input");
    assert.ok(input);
    input.value = "11";
    input.dispatchEvent(new surface.win.Event("input", { bubbles: true }));
    await surface.settle();
    input.dispatchEvent(new surface.win.KeyboardEvent("keydown", { key: "Escape", bubbles: true }));
    await surface.settle();
    assert.equal(input.value, "");
    assert.match(listText(surface), /#12/);
  } finally {
    surface.dispose();
  }
});

test("removing a control disposes the popup listeners an open menu holds", async () => {
  const surface = await boot({
    html: "panel/index.html",
    script: "panel/main.js",
    surface: "panel",
    answers: twoRuns(),
    files: gitFiles,
  });
  try {
    let added = 0;
    let removed = 0;
    const add = surface.win.addEventListener.bind(surface.win);
    const remove = surface.win.removeEventListener.bind(surface.win);
    surface.win.addEventListener = (...args) => {
      added += 1;
      return add(...args);
    };
    surface.win.removeEventListener = (...args) => {
      removed += 1;
      return remove(...args);
    };

    const trigger = surface.doc.querySelector(".oc-sdk-menu button");
    assert.ok(trigger, "the project menu is mounted");
    trigger.click();
    await surface.settle();
    assert.ok(added >= 2, "an open popup listens to resize and scroll");

    // Navigating away rebuilds the panel, which must dispose the open menu.
    const row = surface.doc.querySelector('[role="option"]');
    assert.ok(row, "a run row is mounted");
    row.click();
    await surface.settle();
    assert.equal(removed, added, "every window listener the popup added was removed");
  } finally {
    surface.dispose();
  }
});

/* ------------------------------------------------------------ onReady repeats */

test("a later onReady repaints the theme but does not refetch or remount", async () => {
  const surface = await boot({
    html: "panel/index.html",
    script: "panel/main.js",
    surface: "panel",
    answers: routes(),
    files: gitFiles,
  });
  try {
    const before = surface.requests.length;
    const menu = surface.doc.querySelector(".oc-sdk-menu");
    assert.ok(menu, "the panel rendered");

    // OpenChamber refreshes `ready` on theme flips and session changes.
    const dark = readyMessage({ surface: "panel" });
    dark.payload.theme = { mode: "dark", tokens: THEME_TOKENS };
    surface.send(dark);
    await surface.settle();

    assert.equal(surface.doc.documentElement.dataset.ocTheme, "dark");
    assert.equal(surface.requests.length, before, "no request was repeated");
    assert.equal(surface.doc.contains(menu), true, "the controls were not remounted");
  } finally {
    surface.dispose();
  }
});

test("losing the connection shows the connect screen without a request", async () => {
  const surface = await boot({
    html: "panel/index.html",
    script: "panel/main.js",
    surface: "panel",
    answers: routes(),
    files: gitFiles,
  });
  try {
    const before = surface.requests.length;
    surface.send({
      channel: "openchamber.sdk",
      v: 1,
      type: "connection",
      payload: { connection: { connected: false, account: "" } },
    });
    await surface.settle();
    assert.match(surface.text(), /Connect CircleCI/);
    assert.equal(surface.requests.length, before);
  } finally {
    surface.dispose();
  }
});

/* ------------------------------------------------------------ disconnect */

function openProjectMenu(surface) {
  const trigger = surface.doc.querySelector(".oc-sdk-menu button");
  assert.ok(trigger, "the project menu is mounted");
  trigger.click();
}

function pickMenuItem(surface, text) {
  const item = [...surface.doc.querySelectorAll('[role="menuitem"]')].find((node) =>
    (node.textContent ?? "").includes(text),
  );
  assert.ok(item, `menu item ${JSON.stringify(text)} is open`);
  item.click();
}

test("disconnect asks the host, keeps the runs, and points at the token card", async () => {
  const surface = await boot({
    html: "panel/index.html",
    script: "panel/main.js",
    surface: "panel",
    answers: routes(),
    files: gitFiles,
  });
  try {
    openProjectMenu(surface);
    pickMenuItem(surface, "Disconnect CircleCI");
    await surface.settle();

    assert.ok(
      surface.calls.some((entry) => entry.type === "oauth-disconnect"),
      "the host was asked to disconnect",
    );
    // The host has not said the connection is gone, so the runs stay on screen.
    assert.match(surface.text(), /#12/);
    assert.match(surface.text(), /Disconnect requested/);
    assert.match(surface.text(), /Settings → Integrations/);
    assert.doesNotMatch(surface.text(), /Connect CircleCI/);
  } finally {
    surface.dispose();
  }
});

test("a refused disconnect says why and still names the token card", async () => {
  const surface = await boot({
    html: "panel/index.html",
    script: "panel/main.js",
    surface: "panel",
    answers: routes(),
    files: gitFiles,
    hostErrors: {
      "oauth-disconnect": { code: "HOST_REJECTED", error: "Token guests cannot disconnect here." },
    },
  });
  try {
    openProjectMenu(surface);
    pickMenuItem(surface, "Disconnect CircleCI");
    await surface.settle();

    assert.match(surface.text(), /Token guests cannot disconnect here/);
    assert.match(surface.text(), /Settings → Integrations/);
    assert.match(surface.text(), /#12/, "a refusal does not clear the screen");
  } finally {
    surface.dispose();
  }
});

test("the connect screen appears only when the host reports the connection gone", async () => {
  const surface = await boot({
    html: "panel/index.html",
    script: "panel/main.js",
    surface: "panel",
    answers: routes(),
    files: gitFiles,
  });
  try {
    openProjectMenu(surface);
    pickMenuItem(surface, "Disconnect CircleCI");
    await surface.settle();
    assert.doesNotMatch(surface.text(), /Connect CircleCI/);

    surface.send({
      channel: "openchamber.sdk",
      v: 1,
      type: "connection",
      payload: { connection: { connected: false, account: "" } },
    });
    await surface.settle();

    assert.match(surface.text(), /Connect CircleCI/);
    assert.doesNotMatch(surface.text(), /#12/, "the account data was forgotten");
    assert.doesNotMatch(surface.text(), /Disconnect requested/, "the stale notice was dropped");
  } finally {
    surface.dispose();
  }
});

/* ------------------------------------------------------- /circleci arguments */

test("/circleci reports a run number the window does not contain", async () => {
  const surface = await boot({
    html: "background/index.html",
    script: "background/main.js",
    surface: "background",
    answers: routes(),
    files: gitFiles,
  });
  try {
    const result = await surface.resolveCommand("circleci", "95");
    assert.ok(result, "the resolver answered");
    assert.equal(result.payload.item, undefined, "no chip is attached");
    assert.match(result.payload.error, /no run #95/i);
    assert.match(result.payload.error, /80/);
  } finally {
    surface.dispose();
  }
});

test("/circleci refuses an argument it cannot parse instead of attaching the latest", async () => {
  const surface = await boot({
    html: "background/index.html",
    script: "background/main.js",
    surface: "background",
    answers: routes(),
    files: gitFiles,
  });
  try {
    const result = await surface.resolveCommand("circleci", "12a");
    assert.equal(result.payload.item, undefined);
    assert.match(result.payload.error, /Expected a run number or run id/);
    assert.match(result.payload.error, /12a/);
    assert.equal(
      surface.requests.some((entry) => entry.path === "/api/v3/runs"),
      false,
      "no run list was fetched for an unparseable argument",
    );
  } finally {
    surface.dispose();
  }
});

test("/circleci with no argument still attaches the newest run", async () => {
  const surface = await boot({
    html: "background/index.html",
    script: "background/main.js",
    surface: "background",
    answers: routes(),
    files: gitFiles,
  });
  try {
    const result = await surface.resolveCommand("circleci", "");
    assert.match(result.payload.item.title, /#12/);
  } finally {
    surface.dispose();
  }
});

/* ---------------------------------------------------------- workspace switch */

test("switching project cannot seed the trigger from the previous project's pipelines", async () => {
  let pipelineCalls = 0;
  const surface = await boot({
    html: "panel/index.html",
    script: "panel/main.js",
    surface: "panel",
    answers: routes({
      "GET /api/v3/orgs": () =>
        json(200, { data: [{ id: "org-1", attributes: { name: "acme" } }], page: { next: null } }),
      "GET /api/v3/projects": () =>
        json(200, {
          data: [
            project(),
            {
              id: "project-2",
              attributes: { name: "api" },
              references: { org: { id: "org-1", attributes: { name: "acme" } } },
            },
          ],
          page: { next: null },
        }),
      // The first project lists a pipeline; the second has none and its list fails.
      "GET /api/v3/pipelines": () => {
        pipelineCalls += 1;
        return pipelineCalls === 1
          ? json(200, { data: [{ id: "pipe-old" }], page: { next: null } })
          : json(500, { error: { type: "server_error", title: "boom" } });
      },
      "GET /api/v3/pipelines/pipe-old": () =>
        json(200, {
          data: {
            id: "pipe-old",
            attributes: { name: "Old pipeline", config: { file_path: ".circleci/config.yml" } },
          },
        }),
    }),
    files: gitFiles,
  });
  try {
    openProjectMenu(surface);
    pickMenuItem(surface, "Run a pipeline…");
    await surface.settle();
    assert.match(surface.text(), /Old pipeline/, "the first project's pipeline is shown");

    clickByText(surface.doc, "← Runs");
    await surface.settle();

    openProjectMenu(surface);
    pickMenuItem(surface, "Change project…");
    await surface.settle();
    const apiRow = [...surface.doc.querySelectorAll('[role="option"]')].find((row) =>
      (row.textContent ?? "").includes("acme/api"),
    );
    assert.ok(apiRow, "the second project is in the picker");
    apiRow.click();
    await surface.settle();

    openProjectMenu(surface);
    pickMenuItem(surface, "Run a pipeline…");
    await surface.settle();

    assert.doesNotMatch(surface.text(), /Old pipeline/, "the old project's list did not leak");
    assert.match(surface.text(), /lists no pipeline definition/);
  } finally {
    surface.dispose();
  }
});

/* ------------------------------------------------------- failed job listings */

const jobsServerError = () =>
  json(500, { error: { type: "server_error", detail: "the job log store is unavailable" } });

test("the page says a workflow's jobs could not be read instead of showing none", async () => {
  const surface = await boot({
    html: "panel/page.html",
    script: "panel/page.js",
    surface: "page",
    answers: routes({ "GET /api/v3/jobs": jobsServerError }),
    files: gitFiles,
  });
  try {
    assert.match(surface.text(), /Could not list this workflow's jobs/);
    assert.match(surface.text(), /job log store is unavailable/);
    assert.doesNotMatch(surface.text(), /No jobs listed/);
  } finally {
    surface.dispose();
  }
});

test("the picker says a workflow's jobs could not be read instead of looking empty", async () => {
  const surface = await boot({
    html: "panel/attach.html",
    script: "panel/attach.js",
    surface: "dialog",
    answers: routes({ "GET /api/v3/jobs": jobsServerError }),
    files: gitFiles,
  });
  try {
    assert.match(surface.text(), /Could not list this workflow's jobs/);
    assert.match(surface.text(), /job log store is unavailable/);
  } finally {
    surface.dispose();
  }
});

test("the picker's chip carries the failed job read to the agent", async () => {
  const surface = await boot({
    html: "panel/attach.html",
    script: "panel/attach.js",
    surface: "dialog",
    answers: routes({ "GET /api/v3/jobs": jobsServerError }),
    files: gitFiles,
  });
  try {
    clickExact(surface.doc, "Attach");
    await surface.settle();
    const attach = surface.calls.find((entry) => entry.type === "attach");
    assert.ok(attach, "a chip was attached");
    assert.match(attach.payload.text, /Job listing unavailable/);
    assert.match(attach.payload.text, /job log store is unavailable/);
  } finally {
    surface.dispose();
  }
});

test("the page's chip carries the failed job read to the agent", async () => {
  const surface = await boot({
    html: "panel/page.html",
    script: "panel/page.js",
    surface: "page",
    answers: routes({ "GET /api/v3/jobs": jobsServerError }),
    files: gitFiles,
  });
  try {
    clickExact(surface.doc, "Attach");
    await surface.settle();
    const attach = surface.calls.find((entry) => entry.type === "attach");
    assert.ok(attach, "a chip was attached");
    assert.match(attach.payload.text, /Job listing unavailable/);
  } finally {
    surface.dispose();
  }
});

/* ---------------------------------------------------- /circleci run-id errors */

const runId = "123e4567-e89b-12d3-a456-426614174000";

test("/circleci by run id surfaces a server error instead of claiming it is missing", async () => {
  const surface = await boot({
    html: "background/index.html",
    script: "background/main.js",
    surface: "background",
    answers: routes({
      [`GET /api/v3/runs/${runId}`]: () =>
        json(500, { error: { type: "server_error", detail: "CircleCI is down" } }),
    }),
    files: gitFiles,
  });
  try {
    const result = await surface.resolveCommand("circleci", runId);
    assert.equal(result.payload.item, undefined);
    assert.match(result.payload.error, /CircleCI is down/);
    assert.doesNotMatch(result.payload.error, /has no run/);
  } finally {
    surface.dispose();
  }
});

test("/circleci by run id still reports a genuine 404 as a missing run", async () => {
  const surface = await boot({
    html: "background/index.html",
    script: "background/main.js",
    surface: "background",
    answers: routes({
      [`GET /api/v3/runs/${runId}`]: () =>
        json(404, { error: { type: "not_found", title: "No run" } }),
    }),
    files: gitFiles,
  });
  try {
    const result = await surface.resolveCommand("circleci", runId);
    assert.equal(result.payload.item, undefined);
    assert.match(result.payload.error, /has no run/);
  } finally {
    surface.dispose();
  }
});
