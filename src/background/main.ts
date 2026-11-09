/**
 * The background frame.
 *
 * It answers two things the rail panel cannot, because the panel may be closed:
 *
 * - `/circleci <run number>` from the chat box: resolve the run and hand the
 *   host a chip, without opening a window.
 * - "Check CircleCI status" on a session: look up the latest run for that
 *   session's project and toast the result.
 *
 * Nothing here polls. A background frame that fetched on a timer would spend a
 * user's rate limit with no panel open, so it only acts when asked.
 */
import type { HostReadyContext } from "@openchamber/sdk";

import { createCircleCIClient, RUN_SEARCH_WINDOW } from "../shared/client";
import { attachRequest } from "../shared/actions";
import { refLabel, relativeTime, statusOf } from "../shared/format";
import { host, notify, readProjectFile, request } from "../shared/host";
import type { StorageLike } from "../shared/storage";
import type { Run } from "../shared/types";
import { resolveWorkspace, type Workspace } from "../shared/workspace";

const client = createCircleCIClient(request);
const storage: StorageLike = host.storage;

let resolved: HostReadyContext | null = null;
let resolveReady: ((ctx: HostReadyContext) => void) | null = null;
const ready = new Promise<HostReadyContext>((resolve) => {
  resolveReady = resolve;
});

host.onReady((ctx) => {
  if (resolved) return;
  resolved = ctx;
  resolveReady?.(ctx);
});

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

async function latestRun(workspace: Workspace): Promise<Run | null> {
  const page = await client.listRuns(workspace.link.projectId);
  return page.items[0] ?? null;
}

async function findRun(workspace: Workspace, argument: string): Promise<Run> {
  const trimmed = argument.trim();
  if (!trimmed) {
    const latest = await latestRun(workspace);
    if (!latest) throw new Error("CircleCI has no runs for this project yet.");
    return latest;
  }
  if (/^\d+$/.test(trimmed)) {
    const run = await client.findRunByNumber(workspace.link.projectId, Number(trimmed));
    if (!run) {
      throw new Error(
        `CircleCI has no run #${trimmed} in the most recent ${RUN_SEARCH_WINDOW} runs of this project.`,
      );
    }
    return run;
  }
  if (UUID.test(trimmed)) {
    try {
      return await client.getRun(trimmed);
    } catch {
      throw new Error(`CircleCI has no run ${trimmed}.`);
    }
  }
  throw new Error(`Expected a run number or run id after /circleci, not "${trimmed}".`);
}

/** `/circleci 123` or `/circleci <run id>`: attach the run as a chip. */
host.onResolve(async ({ command, args }) => {
  if (command !== "circleci") return null;
  const ctx = await ready;
  const directory = ctx.directory;
  if (!directory) throw new Error("Open a project in OpenChamber first.");
  const workspace = await resolveWorkspace(client, storage, directory, readProjectFile);
  if (!workspace) {
    throw new Error(
      "Open the CircleCI panel once to choose which CircleCI project this repository maps to.",
    );
  }
  const run = await findRun(workspace, args.trim());
  return attachRequest({
    workspace,
    run,
    workflow: null,
    job: null,
    jobs: [],
    detail: null,
    output: null,
  });
});

/** "Check CircleCI status" on a session: toast the newest run of its project. */
host.onAction(async (item) => {
  const directory = item.directory;
  if (!directory) throw new Error("This chat has no project directory.");
  const workspace = await resolveWorkspace(client, storage, directory, readProjectFile);
  if (!workspace) {
    await notify(
      "error",
      "Open the CircleCI panel once to choose which CircleCI project this repository maps to.",
    );
    return;
  }
  const run = await latestRun(workspace);
  if (!run) {
    await notify("info", "CircleCI has no runs for this project yet.");
    return;
  }
  const status = statusOf(run.phase, run.outcome);
  const kind = status.tone === "success" ? "success" : status.tone === "error" ? "error" : "info";
  await notify(
    kind,
    `CircleCI #${run.number} ${refLabel(run)}: ${status.label} · ${relativeTime(run.createdAt)}`,
  );
});
