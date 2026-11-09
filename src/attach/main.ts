import type { HostReadyContext } from "@openchamber/sdk";

import { createCircleCIClient } from "../shared/client";
import { attachChip, startSessionFrom, type ChipSource } from "../shared/chips";
import { clear, el } from "../shared/dom";
import { describeError, isDisconnected } from "../shared/errors";
import { duration, isFailure, refLabel, relativeTime, statusOf } from "../shared/format";
import { host, request } from "../shared/host";
import { installStyles } from "../shared/styles";
import type { StorageLike } from "../shared/storage";
import type { Job, Run, Workflow } from "../shared/types";
import {
  applyTheme,
  badgeEl,
  disposeMounted,
  mountBanner,
  mountButton,
  mountEmpty,
  mountList,
  mountSearchField,
  mountTabs,
  spinnerHolder,
} from "../shared/ui";
import { resolveWorkspace, type Workspace } from "../shared/workspace";

/**
 * The `+` menu picker.
 *
 * Runs on the left, the selected run's workflows on the right, a workflow row
 * to select and a footer to attach or start a chat. CircleCI has no
 * "list my workflows" call, so the picker is run-scoped: it lists runs, then
 * asks for that run's workflows and jobs.
 */

const root = document.querySelector<HTMLElement>("#root");
if (!root) throw new Error("CircleCI picker is missing its #root element.");

const client = createCircleCIClient(request);
const storage: StorageLike = host.storage;

type RunFilter = "all" | "failed" | "running";

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

interface PickerState {
  ready: HostReadyContext | null;
  connected: boolean;
  booted: boolean;
  workspace: Workspace | null;
  directory: string | null;
  runs: Run[];
  filter: RunFilter;
  search: string;
  selectedRun: Run | null;
  workflows: Workflow[];
  jobs: Record<string, Job[]>;
  selectedWorkflowId: string | null;
  loading: boolean;
  loadingDetail: boolean;
  error: string | null;
  busy: boolean;
}

const state: PickerState = {
  ready: null,
  connected: false,
  booted: false,
  workspace: null,
  directory: null,
  runs: [],
  filter: "all",
  search: "",
  selectedRun: null,
  workflows: [],
  jobs: {},
  selectedWorkflowId: null,
  loading: true,
  loadingDetail: false,
  error: null,
  busy: false,
};

let renderToken = 0;

async function boot(): Promise<void> {
  render();
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
    state.workspace = await resolveWorkspace(client, storage, state.directory);
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
    state.loading = false;
    const preferred =
      page.items.find((run) => isFailure(run.outcome)) ??
      page.items.find((run) => statusOf(run.phase, run.outcome).active) ??
      page.items[0];
    if (preferred) await selectRun(preferred);
    else render();
  } catch (error) {
    if (token !== renderToken) return;
    state.loading = false;
    state.error = describeError(error);
    if (isDisconnected(error)) state.connected = false;
    render();
  }
}

async function selectRun(run: Run): Promise<void> {
  const token = ++renderToken;
  state.selectedRun = run;
  state.workflows = [];
  state.jobs = {};
  state.selectedWorkflowId = null;
  state.loadingDetail = true;
  render();
  try {
    const workflows = await client.listWorkflows(run.id);
    if (token !== renderToken) return;
    state.workflows = workflows.items;
    const results = await Promise.allSettled(
      workflows.items.map((workflow) => client.listJobs(workflow.id)),
    );
    if (token !== renderToken) return;
    for (const [index, result] of results.entries()) {
      const workflow = workflows.items[index];
      if (!workflow) continue;
      state.jobs[workflow.id] = result.status === "fulfilled" ? result.value.items : [];
    }
    const failing = workflows.items.find((workflow) => isFailure(workflow.outcome));
    setSelection(failing ?? workflows.items[0] ?? null);
  } catch (error) {
    if (token !== renderToken) return;
    state.error = describeError(error);
  }
  state.loadingDetail = false;
  render();
}

function setSelection(workflow: Workflow | null): void {
  state.selectedWorkflowId = workflow?.id ?? null;
}

/* Attach the selected workflow, or the first failing job inside it. */
function source(): ChipSource | null {
  const workspace = state.workspace;
  const run = state.selectedRun;
  const workflow = state.workflows.find((entry) => entry.id === state.selectedWorkflowId) ?? null;
  if (!workspace || !run) return null;
  const jobs = workflow ? (state.jobs[workflow.id] ?? []) : [];
  const job = workflow ? (jobs.find((entry) => isFailure(entry.outcome)) ?? null) : null;
  return { workspace, run, workflow, job, jobs, detail: null, output: null };
}

async function attach(): Promise<void> {
  const picked = source();
  if (!picked) return;
  state.busy = true;
  render();
  try {
    await attachChip(picked);
    await host.close();
  } catch (error) {
    state.busy = false;
    state.error = describeError(error);
    render();
  }
}

async function startChat(): Promise<void> {
  const picked = source();
  if (!picked) return;
  state.busy = true;
  render();
  try {
    await startSessionFrom(picked);
    await host.close();
  } catch (error) {
    state.busy = false;
    state.error = describeError(error);
    render();
  }
}

function filteredRuns(): Run[] {
  const needle = state.search.trim().toLowerCase();
  return state.runs.filter((run) => {
    if (state.filter === "failed" && !isFailure(run.outcome)) return false;
    if (state.filter === "running" && !statusOf(run.phase, run.outcome).active) return false;
    if (!needle) return true;
    return `#${run.number} ${refLabel(run)} ${run.commitSubject ?? ""}`
      .toLowerCase()
      .includes(needle);
  });
}

function render(): void {
  disposeMounted();
  runsView = null;
  clear(root as HTMLElement);
  if (!state.connected) {
    const holder = el("div");
    root?.append(holder);
    mountEmpty(holder, {
      title: "Connect CircleCI",
      body: "Add a personal API token on the CircleCI card in Settings → Integrations, then open this picker again.",
      action: { label: "Close", onClick: () => void host.close() },
    });
    return;
  }
  if (!state.directory) {
    const holder = el("div");
    root?.append(holder);
    mountEmpty(holder, {
      title: "No project open",
      body: "Open a project in OpenChamber first.",
      action: { label: "Close", onClick: () => void host.close() },
    });
    return;
  }
  if (!state.workspace) {
    const holder = el("div");
    root?.append(holder);
    mountEmpty(holder, {
      title: "Choose a CircleCI project",
      body: "Open the CircleCI panel once to choose which CircleCI project this repository maps to. This picker then shares that choice.",
      action: { label: "Close", onClick: () => void host.close() },
    });
    return;
  }

  if (state.error) {
    const holder = el("div");
    root?.append(holder);
    mountBanner(holder, {
      tone: "error",
      title: "CircleCI",
      body: state.error,
      action: { label: "Retry", onClick: () => void loadRuns() },
    });
  }

  const columns = el("div", { className: "picker-columns" });
  columns.append(renderRunColumn());
  columns.append(renderPreviewColumn());
  root?.append(columns);
  root?.append(renderFooter());
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
      state.filter = id as RunFilter;
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
    state.runs.length === 0 ? "No runs yet. Push a commit first." : "No run matches this filter.";

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
  return column;
}

function renderPreviewColumn(): HTMLElement {
  const column = el("div", { className: "column" });
  const run = state.selectedRun;
  if (!run) {
    const empty = el("div");
    column.append(empty);
    mountEmpty(empty, { title: "Pick a run", body: "Choose a run on the left." });
    return column;
  }

  const head = el("div", { className: "detail-head" });
  head.append(el("div", { className: "badge-line" }, badgeEl(run.phase, run.outcome)));
  head.append(el("div", { className: "detail-title" }, `#${run.number} ${refLabel(run)}`));
  head.append(
    el(
      "div",
      { className: "detail-sub" },
      [run.commitSubject ?? "", run.branch ?? run.tag ?? "", relativeTime(run.createdAt)]
        .filter(Boolean)
        .join(" · "),
    ),
  );
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
    const selected = workflow.id === state.selectedWorkflowId;
    const row = el("div", { className: selected ? "job-row job-row-active" : "job-row" });
    const line = el("div", { className: "job-row-head" });
    const name = el("button", {
      className: "job-row-name",
      text: workflow.name,
      style:
        "background:none;border:0;padding:0;color:inherit;font:inherit;text-align:left;cursor:pointer;",
    });
    name.addEventListener("click", () => {
      setSelection(workflow);
      render();
    });
    line.append(name);
    line.append(
      el("span", { className: "job-row-meta" }, duration(workflow.createdAt, workflow.endedAt)),
    );
    line.append(badgeEl(workflow.phase, workflow.outcome));
    row.append(line);

    const jobs = state.jobs[workflow.id] ?? [];
    const failing = jobs.filter((job) => isFailure(job.outcome));
    if (failing.length > 0) {
      row.append(
        el("p", { className: "notice" }, `Failing: ${failing.map((job) => job.name).join(", ")}`),
      );
    } else if (jobs.length > 0) {
      row.append(el("p", { className: "notice" }, `${jobs.length} jobs`));
    }
    scroll.append(row);
  }
  return column;
}

function renderFooter(): HTMLElement {
  const footer = el("div", { className: "footer" });
  const picked = source();
  const workflowName = state.workflows.find((entry) => entry.id === state.selectedWorkflowId)?.name;
  footer.append(
    el(
      "span",
      {
        className: "muted",
        style: "flex:1; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;",
      },
      workflowName ? `Attaching ${workflowName}` : "Pick a workflow",
    ),
  );
  const closeHolder = el("div");
  mountButton(closeHolder, {
    label: "Close",
    size: "sm",
    variant: "ghost",
    onClick: () => void host.close(),
  });
  footer.append(closeHolder);
  const chatHolder = el("div");
  mountButton(chatHolder, {
    label: "Start a chat",
    size: "sm",
    variant: "outline",
    disabled: !picked || state.busy,
    onClick: () => void startChat(),
  });
  footer.append(chatHolder);
  const attachHolder = el("div");
  mountButton(attachHolder, {
    label: "Attach",
    size: "sm",
    disabled: !picked || state.busy,
    loading: state.busy,
    onClick: () => void attach(),
  });
  footer.append(attachHolder);
  return footer;
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
