import type { HostReadyContext } from "@openchamber/sdk";

import { createCircleCIClient } from "../shared/client";
import { attachChip, startSessionFrom } from "../shared/actions";
import type { ChipSource } from "../shared/chips";
import { clear, el } from "../shared/dom";
import { describeError, isDisconnected } from "../shared/errors";
import { duration, isFailure, refLabel, relativeTime, shortSha, statusOf } from "../shared/format";
import { host, notify, readProjectFile, request } from "../shared/host";
import { createPoller } from "../shared/poll";
import { anyActive, filterRuns, parseRunFilter, type RunFilter } from "../shared/runs";
import { installStyles } from "../shared/styles";
import {
  cancelWorkflow as requestCancel,
  decideApproval as requestApproval,
  rerunWorkflow as requestRerun,
} from "../shared/workflow-actions";
import { loadPreferences, savePreferences, type StorageLike } from "../shared/storage";
import type { Job, Preferences, Run, Workflow } from "../shared/types";
import {
  applyTheme,
  badgeEl,
  disposeMounted,
  mountBanner,
  mountButton,
  mountEmpty,
  mountList,
  mountMenu,
  mountSearchField,
  mountTabs,
  openUrl,
  providerNotice,
  spinnerHolder,
} from "../shared/ui";
import { resolveWorkspace, type Workspace } from "../shared/workspace";
import { jobUrl, runUrl, workflowUrl } from "../shared/slug";

/**
 * The full-screen page.
 *
 * Same three levels as the rail panel, laid out wide: runs on the left, the
 * selected run's workflows on the right with their jobs inline. It is worth
 * opening when a run has several workflows and the rail panel would need too
 * much scrolling.
 */

const root = document.querySelector<HTMLElement>("#root");
if (!root) throw new Error("CircleCI page is missing its #root element.");

const client = createCircleCIClient(request);
const storage: StorageLike = host.storage;

const POLL_MS = 30_000;

/**
 * The runs list and its filter tabs, mounted once per render of the left
 * column. A filter or search change repaints the rows through these handles
 * instead of remounting, which is what keeps the tabs' keyboard focus.
 */
interface RunsView {
  tabs: ReturnType<typeof mountTabs>;
  paint: () => void;
}

let runsView: RunsView | null = null;

interface PageState {
  ready: HostReadyContext | null;
  connected: boolean;
  booted: boolean;
  workspace: Workspace | null;
  directory: string | null;
  runs: Run[];
  runsNext: string | null;
  filter: RunFilter;
  search: string;
  selectedRun: Run | null;
  workflows: Workflow[];
  jobs: Record<string, Job[]>;
  /** Why a workflow's job list is missing, when CircleCI refused the read. */
  jobErrors: Record<string, string>;
  preferences: Preferences;
  loading: boolean;
  loadingDetail: boolean;
  error: string | null;
}

const state: PageState = {
  ready: null,
  connected: false,
  booted: false,
  workspace: null,
  directory: null,
  runs: [],
  runsNext: null,
  filter: "all",
  search: "",
  selectedRun: null,
  workflows: [],
  jobs: {},
  jobErrors: {},
  preferences: { autoRefresh: true },
  loading: true,
  loadingDetail: false,
  error: null,
};

let renderToken = 0;

/* ------------------------------------------------------------------- data */

async function boot(): Promise<void> {
  render();
  state.preferences = await loadPreferences(storage);
  state.directory = state.ready?.directory ?? null;
  if (!state.connected) {
    state.loading = false;
    render();
    return;
  }
  if (!state.directory) {
    state.loading = false;
    render();
    return;
  }
  try {
    state.workspace = await resolveWorkspace(client, storage, state.directory, readProjectFile);
    if (!state.workspace) {
      state.loading = false;
      render();
      return;
    }
    await loadRuns();
  } catch (error) {
    state.loading = false;
    state.error = describeError(error);
    if (isDisconnected(error)) state.connected = false;
    render();
  }
}

async function loadRuns(): Promise<void> {
  const workspace = state.workspace;
  if (!workspace) return;
  const token = ++renderToken;
  state.loading = true;
  state.error = null;
  render();
  try {
    const page = await client.listRuns(workspace.link.projectId);
    if (token !== renderToken) return;
    state.runs = page.items;
    state.runsNext = page.next;
    state.loading = false;
    const failed = state.runs.filter((run) => isFailure(run.outcome)).length;
    void host.setBadge(failed > 0 ? failed : null).catch(() => undefined);
    if (state.selectedRun) {
      const refreshed = state.runs.find((run) => run.id === state.selectedRun?.id);
      if (refreshed) state.selectedRun = refreshed;
    }
    if (!state.selectedRun && page.items[0]) {
      // The wide layout has room for both columns; land on the newest run.
      await selectRun(page.items[0]);
      return;
    }
  } catch (error) {
    if (token !== renderToken) return;
    state.loading = false;
    state.error = describeError(error);
    if (isDisconnected(error)) state.connected = false;
  }
  render();
  schedulePoll();
}

async function selectRun(run: Run): Promise<void> {
  const token = ++renderToken;
  state.selectedRun = run;
  state.workflows = [];
  state.jobs = {};
  state.loadingDetail = true;
  render();
  try {
    const workflows = await client.listWorkflows(run.id);
    if (token !== renderToken) return;
    state.workflows = workflows.items;
    state.jobErrors = {};
    const results = await Promise.allSettled(
      workflows.items.map((workflow) => client.listJobs(workflow.id)),
    );
    if (token !== renderToken) return;
    for (const [index, result] of results.entries()) {
      const workflow = workflows.items[index];
      if (!workflow) continue;
      if (result.status === "fulfilled") {
        state.jobs[workflow.id] = result.value.items;
      } else {
        // Keep the reason: a failed read is not the same as zero jobs.
        state.jobs[workflow.id] = [];
        state.jobErrors[workflow.id] = describeError(result.reason);
      }
    }
    state.loadingDetail = false;
  } catch (error) {
    if (token !== renderToken) return;
    state.loadingDetail = false;
    state.error = describeError(error);
  }
  render();
  schedulePoll();
}

async function refreshDetail(): Promise<void> {
  if (state.selectedRun) return selectRun(state.selectedRun);
  return loadRuns();
}

/* ----------------------------------------------------------------- actions */

function sourceFor(options: {
  workflow?: Workflow | null;
  job?: Job | null;
  jobs?: Job[];
}): ChipSource | null {
  const workspace = state.workspace;
  const run = state.selectedRun;
  if (!workspace || !run) return null;
  const workflow = options.workflow ?? null;
  return {
    workspace,
    run,
    workflow,
    job: options.job ?? null,
    jobs: options.jobs ?? (workflow ? (state.jobs[workflow.id] ?? []) : []),
    detail: null,
    output: null,
  };
}

async function attach(source: ChipSource | null): Promise<void> {
  if (!source) return;
  try {
    await attachChip(source);
    await notify("success", "Attached to the chat box.");
  } catch (error) {
    await notify("error", describeError(error));
  }
}

async function startSession(source: ChipSource | null): Promise<void> {
  if (!source) return;
  try {
    await startSessionFrom(source);
    await notify("success", "Started a worktree chat for this build.");
  } catch (error) {
    await notify("error", describeError(error));
  }
}

async function rerun(workflow: Workflow, fromFailed: boolean): Promise<void> {
  if (await requestRerun(client, workflow, fromFailed, notify)) await refreshDetail();
}

async function cancel(workflow: Workflow): Promise<void> {
  if (await requestCancel(client, workflow, notify)) await refreshDetail();
}

async function decideApproval(job: Job, approve: boolean): Promise<void> {
  if (await requestApproval(client, job, approve, notify)) await refreshDetail();
}

/* ----------------------------------------------------------------- polling */

function viewIsActive(): boolean {
  if (state.selectedRun) return anyActive(state.workflows);
  return anyActive(state.runs);
}

const poller = createPoller({
  delayMs: POLL_MS,
  enabled: () => state.preferences.autoRefresh,
  active: viewIsActive,
  onTick: () => void refreshDetail(),
});

function schedulePoll(): void {
  poller.arm();
}

/* ------------------------------------------------------------------ render */

function render(): void {
  disposeMounted();
  runsView = null;
  clear(root as HTMLElement);
  if (!state.connected) {
    renderConnect();
    return;
  }
  if (!state.directory || !state.workspace) {
    renderNoProject();
    return;
  }
  renderToolbar();
  if (state.error) {
    const holder = el("div");
    root?.append(holder);
    mountBanner(holder, {
      tone: "error",
      title: "CircleCI",
      body: state.error,
      action: { label: "Retry", onClick: () => void refreshDetail() },
    });
  }
  const columns = el("div", { className: "page-columns" });
  columns.append(renderRunColumn());
  columns.append(renderDetailColumn());
  root?.append(columns);
}

function renderConnect(): void {
  const holder = el("div");
  root?.append(holder);
  mountEmpty(holder, {
    title: "Connect CircleCI",
    body: "Create a personal API token in CircleCI, then paste it on the CircleCI card in Settings → Integrations. The token stays in OpenChamber.",
    action: {
      label: "Open CircleCI tokens",
      onClick: () => openUrl("https://app.circleci.com/settings/user/tokens"),
    },
  });
}

function renderNoProject(): void {
  const holder = el("div");
  root?.append(holder);
  mountEmpty(holder, {
    title: state.directory && !state.workspace ? "No CircleCI project yet" : "No project open",
    body:
      state.directory && !state.workspace
        ? "Open the CircleCI panel once to choose which CircleCI project this repository maps to."
        : "Open a project in OpenChamber, then open the CircleCI panel to map it.",
  });
}

function renderToolbar(): void {
  const workspace = state.workspace;
  const bar = el("div", { className: "toolbar" });
  const projectHolder = el("div", { style: "flex:1; min-width:0;" });
  mountMenu(projectHolder, {
    label: workspace ? `${workspace.link.orgName}/${workspace.link.projectName}` : "CircleCI",
    size: "sm",
    variant: "ghost",
    items: [
      { id: "refresh", label: "Refresh" },
      { separator: true },
      state.preferences.autoRefresh
        ? { id: "pause", label: "Pause auto-refresh" }
        : { id: "resume", label: "Resume auto-refresh" },
    ],
    onSelect: (id) => {
      if (id === "refresh") void refreshDetail();
      if (id === "pause" || id === "resume") {
        void savePreferences(storage, { autoRefresh: id === "resume" }).then((preferences) => {
          state.preferences = preferences;
          render();
          schedulePoll();
        });
      }
    },
  });
  bar.append(projectHolder);
  if (workspace) {
    const open = el("div");
    mountButton(open, {
      label: "Project in CircleCI",
      size: "sm",
      variant: "outline",
      onClick: () =>
        openUrl(
          `https://app.circleci.com/pipelines/${workspace.target.segment}/${workspace.target.owner}/${workspace.target.repo}`,
        ),
    });
    bar.append(open);
  }
  root?.append(bar);
}

function filteredRuns(): Run[] {
  return filterRuns(state.runs, state.filter, state.search);
}

function renderRunColumn(): HTMLElement {
  const column = el("div", { className: "column" });

  const tabsHolder = el("div");
  const tabs = mountTabs(tabsHolder, {
    items: [
      { id: "all", label: "All" },
      { id: "failed", label: "Failed" },
      { id: "running", label: "Running" },
    ],
    activeId: state.filter,
    onChange: (id) => {
      state.filter = parseRunFilter(id);
      tabs.update({ activeId: state.filter });
      runsView?.paint();
    },
  });
  column.append(tabsHolder);

  const searchHolder = el("div");
  column.append(searchHolder);

  const listHolder = el("div", { className: "scroll" });
  column.append(listHolder);

  const runItems = () =>
    filteredRuns().map((run) => {
      const status = statusOf(run.phase, run.outcome);
      return {
        id: run.id,
        leading: `#${run.number}`,
        title: refLabel(run),
        ...(run.commitSubject ? { subtitle: run.commitSubject } : {}),
        meta: relativeTime(run.createdAt),
        badge: { label: status.label, tone: status.tone },
      };
    });
  const emptyText = () =>
    state.runs.length === 0 ? "No runs yet. Push a commit." : "No run matches this filter.";

  if (state.loading && state.runs.length === 0) {
    listHolder.append(spinnerHolder("Loading runs"));
    return column;
  }

  const list = mountList(listHolder, {
    items: runItems(),
    emptyText: emptyText(),
    selectedId: state.selectedRun?.id ?? null,
    ariaLabel: "CircleCI runs",
    onSelect: (id) => {
      const run = state.runs.find((entry) => entry.id === id);
      if (run) void selectRun(run);
    },
  });
  // The kit never commits a typed or cleared value: it reports the change and
  // waits for `update({ value })`, so Escape and the clear button need it too.
  let search: ReturnType<typeof mountSearchField> | null = null;
  search = mountSearchField(searchHolder, {
    value: state.search,
    label: "Filter runs",
    placeholder: "Filter by branch, commit or number",
    onChange: (value) => {
      state.search = value;
      search?.update({ value });
      runsView?.paint();
    },
  });
  runsView = {
    tabs,
    paint: () => list.update({ items: runItems(), emptyText: emptyText() }),
  };

  if (state.runsNext) {
    const more = el("div", { className: "load-more" });
    mountButton(more, {
      label: "Load more",
      size: "sm",
      variant: "ghost",
      onClick: () => void loadMore(),
    });
    column.append(more);
  }
  return column;
}

async function loadMore(): Promise<void> {
  const workspace = state.workspace;
  if (!workspace || !state.runsNext) return;
  try {
    const page = await client.listRuns(workspace.link.projectId, state.runsNext);
    state.runs = [...state.runs, ...page.items];
    state.runsNext = page.next;
    render();
  } catch (error) {
    await notify("error", describeError(error));
  }
}

function renderDetailColumn(): HTMLElement {
  const column = el("div", { className: "column" });
  const run = state.selectedRun;
  if (!run) {
    const empty = el("div");
    column.append(empty);
    mountEmpty(empty, {
      title: "Pick a run",
      body: "Choose a run on the left to see its workflows and jobs.",
    });
    return column;
  }

  const head = el("div", { className: "detail-head" });
  head.append(el("div", { className: "badge-line" }, badgeEl(run.phase, run.outcome)));
  head.append(el("div", { className: "detail-title" }, `#${run.number} ${refLabel(run)}`));
  const pieces: string[] = [];
  if (run.revision) pieces.push(shortSha(run.revision));
  if (run.commitSubject) pieces.push(run.commitSubject);
  pieces.push(relativeTime(run.createdAt));
  head.append(el("div", { className: "detail-sub" }, pieces.filter(Boolean).join(" · ")));
  const actions = el("div", { className: "detail-actions" });
  const open = el("div");
  mountButton(open, {
    label: "Open in CircleCI",
    size: "sm",
    variant: "ghost",
    onClick: () => openUrl(state.workspace ? runUrl(state.workspace.target, run.number) : null),
  });
  actions.append(open);
  const attachRun = el("div");
  mountButton(attachRun, {
    label: "Attach run",
    size: "sm",
    variant: "outline",
    onClick: () => void attach(sourceFor({ workflow: null, job: null, jobs: [] })),
  });
  actions.append(attachRun);
  head.append(actions);
  if (run.errors.length > 0) {
    head.append(
      providerNotice(
        run.errors.map((error) => `${error.type}: ${error.message}`).join(" · "),
        "notice error-text",
      ),
    );
  }
  column.append(head);

  const scroll = el("div", { className: "scroll" });
  column.append(scroll);
  if (state.loadingDetail) {
    scroll.append(spinnerHolder("Loading workflows"));
    return column;
  }
  if (state.workflows.length === 0) {
    const empty = el("div");
    scroll.append(empty);
    mountEmpty(empty, { title: "No workflows", body: "This run produced no workflows." });
    return column;
  }
  for (const workflow of state.workflows) {
    scroll.append(renderWorkflow(workflow, run));
  }
  return column;
}

function renderWorkflow(workflow: Workflow, run: Run): HTMLElement {
  const section = el("div", { className: "section" });
  const head = el("div", { className: "section-head" });
  head.append(el("span", { className: "section-title" }, workflow.name));
  head.append(el("span", { className: "spacer" }));
  head.append(el("span", { className: "muted" }, duration(workflow.createdAt, workflow.endedAt)));
  head.append(badgeEl(workflow.phase, workflow.outcome));
  section.append(head);

  const actions = el("div", { className: "job-row-actions" });
  const rerunHolder = el("div");
  mountMenu(rerunHolder, {
    label: "Rerun",
    size: "xs",
    variant: "ghost",
    items: [
      { id: "failed", label: "Rerun from failed" },
      { id: "all", label: "Rerun every job" },
    ],
    onSelect: (id) => void rerun(workflow, id === "failed"),
  });
  actions.append(rerunHolder);
  if (statusOf(workflow.phase, workflow.outcome).active) {
    const cancelHolder = el("div");
    mountButton(cancelHolder, {
      label: "Cancel",
      size: "xs",
      variant: "ghost",
      onClick: () => void cancel(workflow),
    });
    actions.append(cancelHolder);
  }
  const attachHolder = el("div");
  mountButton(attachHolder, {
    label: "Attach",
    size: "xs",
    variant: "outline",
    onClick: () => void attach(sourceFor({ workflow })),
  });
  actions.append(attachHolder);
  const openHolder = el("div");
  mountButton(openHolder, {
    label: "Open",
    size: "xs",
    variant: "ghost",
    onClick: () =>
      openUrl(
        state.workspace ? workflowUrl(state.workspace.target, run.number, workflow.id) : null,
      ),
  });
  actions.append(openHolder);
  section.append(actions);

  const jobFailure = state.jobErrors[workflow.id];
  if (jobFailure) {
    section.append(
      providerNotice(`Could not list this workflow's jobs: ${jobFailure}`, "notice error-text"),
    );
    return section;
  }
  const jobs = state.jobs[workflow.id] ?? [];
  if (jobs.length === 0) {
    section.append(el("p", { className: "notice" }, "No jobs listed."));
    return section;
  }
  for (const job of jobs) {
    const isApproval = job.type.toLowerCase() === "approval";
    const status = statusOf(job.phase, job.outcome);
    const row = el("div", { className: "job-row" });
    const line = el("div", { className: "job-row-head" });
    line.append(el("span", { className: "job-row-name" }, job.name));
    line.append(
      el(
        "span",
        { className: "job-row-meta" },
        [job.number > 0 ? `#${job.number}` : "", duration(job.startedAt, job.endedAt)]
          .filter(Boolean)
          .join(" · "),
      ),
    );
    line.append(badgeEl(job.phase, job.outcome));
    row.append(line);

    const jobActions = el("div", { className: "job-row-actions" });
    if (isApproval && status.active) {
      const approve = el("div");
      mountButton(approve, {
        label: "Approve",
        size: "xs",
        onClick: () => void decideApproval(job, true),
      });
      jobActions.append(approve);
      const reject = el("div");
      mountButton(reject, {
        label: "Reject",
        size: "xs",
        variant: "ghost",
        onClick: () => void decideApproval(job, false),
      });
      jobActions.append(reject);
    }
    if (isFailure(job.outcome)) {
      const attachJob = el("div");
      mountButton(attachJob, {
        label: "Attach failure",
        size: "xs",
        variant: "outline",
        onClick: () => void attach(sourceFor({ workflow, job })),
      });
      jobActions.append(attachJob);
      const fix = el("div");
      mountButton(fix, {
        label: "Fix with agent",
        size: "xs",
        variant: "ghost",
        onClick: () => void startSession(sourceFor({ workflow, job })),
      });
      jobActions.append(fix);
    }
    const openJob = el("div");
    mountButton(openJob, {
      label: "Open",
      size: "xs",
      variant: "ghost",
      onClick: () => {
        if (state.workspace) {
          openUrl(jobUrl(state.workspace.target, run.number, workflow.id, job.number));
        }
      },
    });
    jobActions.append(openJob);
    if (jobActions.childElementCount > 0) row.append(jobActions);
    section.append(row);
  }
  return section;
}

/* ---------------------------------------------------------------- lifecycle */

host.onReady((ctx) => {
  applyTheme(ctx);
  installStyles();
  state.ready = ctx;
  if (state.booted) return;
  state.booted = true;
  state.connected = ctx.connection.connected;
  void boot();
});

host.onConnection((connection) => {
  const was = state.connected;
  state.connected = connection.connected;
  if (connection.connected && !was) void boot();
  if (!connection.connected && was) render();
});
