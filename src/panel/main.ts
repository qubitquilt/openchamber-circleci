import type { HostReadyContext } from "@openchamber/sdk";

import { createCircleCIClient } from "../shared/client";
import { attachChip, promptAbout, startSessionFrom } from "../shared/actions";
import { readChipData, type ChipSource } from "../shared/chips";
import {
  detectCurrentWork,
  scopeLabel,
  scopeNote,
  scopeOf,
  type CurrentWork,
} from "../shared/current-work";
import { clear, el, metaRow } from "../shared/dom";
import { describeError, isDisconnected } from "../shared/errors";
import {
  prMeta,
  refLabel,
  relativeTime,
  shortSha,
  statusOf,
  isFailure,
  duration,
} from "../shared/format";
import { host, notify, readProjectFile, request } from "../shared/host";
import { createPoller } from "../shared/poll";
import {
  anyActive,
  filterRuns,
  parseRunFilter,
  scopeFound,
  scopeRuns,
  type RunFilter,
} from "../shared/runs";
import { installStyles } from "../shared/styles";
import {
  approveJob as requestApprove,
  cancelWorkflow as requestCancel,
  rejectJob as requestReject,
  rerunWorkflow as requestRerun,
  rerunWorkflows as requestRerunBatch,
} from "../shared/workflow-actions";
import { loadPreferences, savePreferences, type StorageLike } from "../shared/storage";
import type { ChipData, Job, JobDetail, Preferences, Run, Workflow } from "../shared/types";
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
import { createProjectPicker } from "./picker";
import { createTriggerForm } from "./trigger";

/**
 * The rail panel.
 *
 * A drill-down: runs, then a run's workflows, then a workflow's jobs, then a
 * job's steps and its condensed output. Every level keeps its own back button
 * and every action is performed one level down from the thing it acts on.
 *
 * Polling is state-driven: a timer is armed only while something on the screen
 * may still move, so an idle panel costs nothing.
 */

const root = document.querySelector<HTMLElement>("#root");
if (!root) throw new Error("CircleCI panel is missing its #root element.");

const client = createCircleCIClient(request);
const storage: StorageLike = host.storage;

const POLL_MS = 30_000;

/**
 * The runs list and its filter tabs, mounted once per visit to the runs view.
 *
 * The kit's tabs report a change and wait for `update({ activeId })`; they do
 * not commit it. Remounting the whole view on every filter click would drop the
 * keyboard focus the tabs just moved, so the tabs and the list stay alive and a
 * filter change repaints the rows in place.
 */
interface RunsView {
  tabs: ReturnType<typeof mountTabs>;
  list: ReturnType<typeof mountList>;
  paint: () => void;
}

let runsView: RunsView | null = null;

interface PanelState {
  ready: HostReadyContext | null;
  connected: boolean;
  account: string;
  booted: boolean;
  workspace: Workspace | null;
  override: Workspace | null;
  directory: string | null;
  runs: Run[];
  runsNext: string | null;
  filter: RunFilter;
  search: string;
  /** The branch and PRs this directory's work is on; null hides the scope toggle. */
  currentWork: CurrentWork | null;
  scopeOn: boolean;
  selectedRun: Run | null;
  workflows: Workflow[];
  selectedWorkflow: Workflow | null;
  jobs: Job[];
  selectedJob: Job | null;
  jobDetail: JobDetail | null;
  jobOutput: string | null;
  /** Why the open workflow's jobs are missing, when CircleCI refused the read. */
  jobsError: string | null;
  preferences: Preferences;
  loading: boolean;
  error: string | null;
  toast: string | null;
  /** What the last Disconnect attempt reported, and where the token really lives. */
  disconnectNotice: string | null;
}

const state: PanelState = {
  ready: null,
  connected: false,
  account: "CircleCI",
  booted: false,
  workspace: null,
  override: null,
  directory: null,
  runs: [],
  runsNext: null,
  filter: "all",
  search: "",
  currentWork: null,
  scopeOn: false,
  selectedRun: null,
  workflows: [],
  selectedWorkflow: null,
  jobs: [],
  selectedJob: null,
  jobDetail: null,
  jobOutput: null,
  jobsError: null,
  preferences: { autoRefresh: true },
  loading: true,
  error: null,
  toast: null,
  disconnectNotice: null,
};

/** A newer load always wins, so a slow answer never paints over a newer one. */
let renderToken = 0;

function activeWorkspace(): Workspace | null {
  return state.override ?? state.workspace;
}

/**
 * The trigger form and the project picker own their own state. The panel gives
 * them the project, the file reader and a repaint; they hand back a started run
 * or a chosen project. Splitting them keeps a form or picker change away from
 * the run drill-down.
 */
const picker = createProjectPicker({
  client,
  storage,
  readProjectFile,
  directory: () => state.directory,
  notify,
  repaint: render,
  canCancel: () => Boolean(state.workspace),
  onCancel: async () => {
    state.override = null;
    render();
    await loadRuns({ more: false });
  },
  onPicked: async (workspace) => {
    forgetProjectData();
    state.workspace = workspace;
    state.currentWork = await detectCurrentWork({
      directory: state.directory,
      session: state.ready?.session ?? null,
      readFile: readProjectFile,
      host,
    });
    render();
    await loadRuns({ more: false });
  },
  onDisconnected: () => {
    state.connected = false;
  },
});

const trigger = createTriggerForm({
  client,
  storage,
  readProjectFile,
  directory: () => state.directory,
  workspace: activeWorkspace,
  notify,
  repaint: render,
  onStarted: () => loadRuns({ more: false }),
});

/* ------------------------------------------------------------------- data */

async function boot(): Promise<void> {
  render();
  state.preferences = await loadPreferences(storage);
  if (!state.connected) {
    // No token yet: the connect screen is the whole state, and asking CircleCI
    // anything would only produce a 401.
    state.loading = false;
    render();
    return;
  }
  try {
    // v3 has no flat user field, so the account label is fetched here rather
    // than read from an integration account card.
    const user = await client.currentUser();
    state.account = user.login;
  } catch {
    // The header keeps "CircleCI" when the token cannot read its own user.
  }
  await resolveAndLoad();
}

/**
 * Resolve the open directory to its project, then load its runs. Boot and a
 * directory switch arrive with the same question: which project is this, and
 * what does it build.
 */
async function resolveAndLoad(): Promise<void> {
  const directory = state.directory;
  const token = ++renderToken;
  if (!state.connected || !directory) {
    state.loading = false;
    render();
    return;
  }
  try {
    const workspace = await resolveWorkspace(client, storage, directory, readProjectFile);
    if (token !== renderToken) return;
    state.workspace = workspace;
    if (!workspace) {
      state.loading = false;
      render();
      void picker.open();
      return;
    }
    // A detection for the previous directory may resolve after the switch:
    // only the token-owning load may write the result, or stale branch/PR data
    // would scope the new directory's runs.
    const work = await detectCurrentWork({
      directory: state.directory,
      session: state.ready?.session ?? null,
      readFile: readProjectFile,
      host,
    });
    if (token !== renderToken) return;
    state.currentWork = work;
    await loadRuns();
  } catch (error) {
    if (token !== renderToken) return;
    state.loading = false;
    state.error = describeError(error);
    if (isDisconnected(error)) state.connected = false;
    render();
  }
}

async function loadRuns(options: { more?: boolean; openScoped?: boolean } = {}): Promise<void> {
  const workspace = activeWorkspace();
  if (!workspace) return;
  const token = ++renderToken;
  const scope = state.scopeOn ? scopeOf(state.currentWork) : null;
  if (!options.more) {
    state.loading = true;
    state.error = null;
    render();
  }
  try {
    // A scope's reach is whole pages: every fresh scoped load walks until one
    // run matches, or a refreshed scoped list would drop runs a deeper page
    // held. Refreshes while scoped cost at most MAX_PAGES GETs; unscoped and
    // "Load more" stay single-page.
    const page =
      scope && !options.more
        ? await client.listRunsUntil(workspace.link.projectId, scopeFound(scope))
        : await client.listRuns(
            workspace.link.projectId,
            options.more ? (state.runsNext ?? undefined) : undefined,
          );
    if (token !== renderToken) return;
    state.runs = options.more ? [...state.runs, ...page.items] : page.items;
    state.runsNext = page.next;
    state.loading = false;
    updateBadge();
  } catch (error) {
    if (token !== renderToken) return;
    state.loading = false;
    state.error = describeError(error);
    if (isDisconnected(error)) state.connected = false;
  }
  render();
  schedulePoll();
  if (options.openScoped && scope) {
    // Runs sort newest first, so the first scoped one is the newest — and the
    // walk stopped because it exists.
    const newest = scopeRuns(state.runs, scope)[0];
    if (newest && !state.selectedRun) await openRun(newest);
  }
}

async function loadWorkflows(): Promise<void> {
  const run = state.selectedRun;
  if (!run) return;
  const token = ++renderToken;
  state.loading = true;
  state.error = null;
  render();
  try {
    const page = await client.listWorkflows(run.id);
    if (token !== renderToken) return;
    state.workflows = page.items;
    state.loading = false;
  } catch (error) {
    if (token !== renderToken) return;
    state.loading = false;
    state.error = describeError(error);
  }
  render();
  schedulePoll();
}

async function loadJobs(): Promise<void> {
  const workflow = state.selectedWorkflow;
  if (!workflow) return;
  const token = ++renderToken;
  state.loading = true;
  state.error = null;
  render();
  try {
    const page = await client.listJobs(workflow.id);
    if (token !== renderToken) return;
    state.jobs = page.items;
    state.jobsError = null;
    state.loading = false;
  } catch (error) {
    if (token !== renderToken) return;
    state.loading = false;
    // The previous list is no longer what the error describes; drop it so the
    // chip cannot mix stale jobs with a "Job listing unavailable" line.
    state.jobs = [];
    state.jobsError = describeError(error);
    state.error = state.jobsError;
  }
  render();
  schedulePoll();
}

async function loadJobDetail(): Promise<void> {
  const job = state.selectedJob;
  if (!job) return;
  const token = ++renderToken;
  state.loading = true;
  state.error = null;
  render();
  try {
    const detail = await client.getJob(job.id);
    if (token !== renderToken) return;
    state.jobDetail = detail;
    const failing = detail.steps.find((step) => isFailure(step.outcome));
    state.jobOutput = null;
    if (failing) {
      try {
        const output = await client.condensedOutput(job.id, failing.num, 0);
        if (token === renderToken && output.trim()) state.jobOutput = output;
      } catch {
        // A job whose log cannot be read still shows its steps and errors.
      }
    }
    state.loading = false;
  } catch (error) {
    if (token !== renderToken) return;
    state.loading = false;
    state.error = describeError(error);
  }
  render();
  schedulePoll();
}

async function refreshCurrent(quiet = false): Promise<void> {
  if (!quiet) state.toast = null;
  if (state.selectedJob) return loadJobDetail();
  if (state.selectedWorkflow) return loadJobs();
  if (state.selectedRun) return loadWorkflows();
  return loadRuns({ more: false });
}

/* -------------------------------------------------------------- navigation */

async function openRun(run: Run): Promise<void> {
  state.toast = null;
  state.selectedRun = run;
  state.workflows = [];
  state.selectedWorkflow = null;
  state.jobs = [];
  state.selectedJob = null;
  state.jobDetail = null;
  state.jobOutput = null;
  render();
  await loadWorkflows();
}

async function openWorkflow(workflow: Workflow): Promise<void> {
  state.selectedWorkflow = workflow;
  state.jobs = [];
  state.jobsError = null;
  state.selectedJob = null;
  state.jobDetail = null;
  state.jobOutput = null;
  render();
  await loadJobs();
}

async function openJob(job: Job): Promise<void> {
  state.selectedJob = job;
  state.jobDetail = null;
  state.jobOutput = null;
  render();
  await loadJobDetail();
}

function backToRuns(): void {
  state.toast = null;
  state.selectedRun = null;
  state.workflows = [];
  state.selectedWorkflow = null;
  state.jobs = [];
  state.selectedJob = null;
  state.jobDetail = null;
  state.jobOutput = null;
  render();
  void loadRuns({ more: false });
}

function backToWorkflows(): void {
  state.selectedWorkflow = null;
  state.jobs = [];
  state.selectedJob = null;
  state.jobDetail = null;
  state.jobOutput = null;
  render();
  void loadWorkflows();
}

function backToJobs(): void {
  state.selectedJob = null;
  state.jobDetail = null;
  state.jobOutput = null;
  render();
  void loadJobs();
}

/**
 * The scope toggle is a navigation-level change: on means loading as deep as
 * it takes to find this branch's runs and opening the newest one, off means
 * back to the runs list. Both change what the panel shows outright, so this
 * re-renders instead of repainting rows.
 */
async function toggleScope(): Promise<void> {
  state.scopeOn = !state.scopeOn;
  if (!state.scopeOn) return backToRuns();
  state.toast = null;
  state.selectedRun = null;
  state.workflows = [];
  state.selectedWorkflow = null;
  state.jobs = [];
  state.selectedJob = null;
  state.jobDetail = null;
  state.jobOutput = null;
  await loadRuns({ openScoped: true });
}

/* ------------------------------------------------------------------ chips */

function sourceFor(options: {
  workflow?: Workflow | null;
  job?: Job | null;
  detail?: JobDetail | null;
  output?: string | null;
}): ChipSource | null {
  const workspace = activeWorkspace();
  const run = state.selectedRun;
  if (!workspace || !run) return null;
  return {
    workspace,
    run,
    workflow: options.workflow ?? state.selectedWorkflow,
    job: options.job ?? state.selectedJob,
    jobs: state.jobs,
    jobsError: state.jobsError,
    detail: options.detail ?? state.jobDetail,
    output: options.output ?? state.jobOutput,
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

async function promptFix(source: ChipSource | null): Promise<void> {
  if (!source) return;
  try {
    await promptAbout(source);
    await notify("success", "Sent to the open chat.");
  } catch (error) {
    await notify("error", describeError(error));
  }
}

/* ----------------------------------------------------------------- actions */

async function rerun(workflow: Workflow, fromFailed: boolean): Promise<void> {
  if (await requestRerun(client, workflow, { fromFailed }, notify)) await loadJobs();
}

/**
 * Rerun every workflow of the open run. CircleCI reruns a workflow, not a run,
 * so the shared batch helper loops: only failed ones for "from failed", every
 * one otherwise, with one aggregate report.
 */
async function rerunAll(fromFailed: boolean): Promise<void> {
  const targets = fromFailed
    ? state.workflows.filter((workflow) => isFailure(workflow.outcome))
    : state.workflows;
  const result = await requestRerunBatch(client, targets, { fromFailed }, notify);
  if (result.started > 0) await loadWorkflows();
}

async function cancel(workflow: Workflow): Promise<void> {
  if (await requestCancel(client, workflow, notify)) await loadJobs();
}

async function approveHold(job: Job): Promise<void> {
  if (await requestApprove(client, job, notify)) await loadJobs();
}

async function rejectHold(job: Job): Promise<void> {
  if (await requestReject(client, job, notify)) await loadJobs();
}

async function onMenu(id: string): Promise<void> {
  switch (id) {
    case "refresh":
      await refreshCurrent();
      return;
    case "trigger":
      await trigger.open();
      return;
    case "choose":
      state.override = null;
      await picker.open();
      return;
    case "revert":
      state.override = null;
      state.selectedRun = null;
      state.workflows = [];
      state.selectedWorkflow = null;
      state.jobs = [];
      state.selectedJob = null;
      state.jobDetail = null;
      state.jobOutput = null;
      trigger.reset();
      render();
      await loadRuns({ more: false });
      return;
    case "pause":
    case "resume":
      state.preferences = await savePreferences(storage, {
        autoRefresh: id === "resume",
      });
      render();
      schedulePoll();
      return;
    case "disconnect":
      await requestDisconnect();
      return;
    default:
      return;
  }
}

/* ----------------------------------------------------------------- polling */

function viewIsActive(): boolean {
  if (state.selectedJob) return anyActive([state.selectedJob]);
  if (state.selectedWorkflow) return anyActive(state.jobs);
  if (state.selectedRun) return anyActive(state.workflows);
  return anyActive(state.runs);
}

const poller = createPoller({
  delayMs: POLL_MS,
  enabled: () => state.preferences.autoRefresh,
  active: viewIsActive,
  onTick: () => void refreshCurrent(true),
});

function schedulePoll(): void {
  poller.arm();
}

function updateBadge(): void {
  const failed = state.runs.filter((run) => isFailure(run.outcome)).length;
  void host.setBadge(failed > 0 ? failed : null).catch(() => undefined);
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
  if (!state.directory) {
    renderNoProject();
    return;
  }
  if (picker.isOpen()) {
    picker.render(root as HTMLElement);
    return;
  }
  if (!activeWorkspace()) {
    renderNoProject();
    return;
  }
  if (trigger.isOpen()) {
    trigger.render(root as HTMLElement);
    return;
  }
  if (state.selectedJob) {
    renderJob();
    return;
  }
  if (state.selectedWorkflow) {
    renderJobs();
    return;
  }
  if (state.selectedRun) {
    renderWorkflows();
    return;
  }
  renderRuns();
}

function renderConnect(): void {
  const holder = el("div");
  root?.append(holder);
  mountEmpty(holder, {
    title: "Connect CircleCI",
    body: "Create a personal API token in CircleCI, then paste it on the CircleCI card in Settings → Integrations. Tokens stay in OpenChamber; this extension never sees one.",
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
    title: "No project open",
    body: "Open a project in OpenChamber. This extension maps that project to a CircleCI project the first time it runs.",
  });
}

function renderToolbar(): { tabs: ReturnType<typeof mountTabs> } {
  const workspace = activeWorkspace();
  const head = el("div", { className: "row" });

  const projectHolder = el("div", { style: "flex:1; min-width:0;" });
  const label = workspace ? `${workspace.link.orgName}/${workspace.link.projectName}` : "CircleCI";
  const items: Array<{ id: string; label: string; destructive?: boolean } | { separator: true }> = [
    { id: "refresh", label: "Refresh" },
    { id: "trigger", label: "Run a pipeline…" },
    { id: "choose", label: "Change project…" },
  ];
  if (state.override) {
    items.push({ id: "revert", label: "Back to this repository's project" });
  }
  items.push(
    { separator: true },
    state.preferences.autoRefresh
      ? { id: "pause", label: "Pause auto-refresh" }
      : { id: "resume", label: "Resume auto-refresh" },
    { separator: true },
    { id: "disconnect", label: "Disconnect CircleCI", destructive: true },
  );
  mountMenu(projectHolder, {
    label,
    size: "sm",
    variant: "ghost",
    items,
    onSelect: (id) => void onMenu(id),
  });
  head.append(projectHolder);

  if (state.account) {
    head.append(el("span", { className: "account muted", text: state.account }));
  }
  root?.append(head);

  const bar = el("div", { className: "toolbar" });
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
  bar.append(tabsHolder);
  bar.append(el("span", { className: "spacer" }));

  const refreshHolder = el("div");
  mountButton(refreshHolder, {
    label: "Refresh",
    size: "sm",
    variant: "ghost",
    loading: state.loading,
    onClick: () => void refreshCurrent(),
  });
  bar.append(refreshHolder);
  root?.append(bar);

  const filterRow = el("div", { className: "filter-row" });
  const searchHolder = el("div", { style: "flex:1; min-width:0;" });
  filterRow.append(searchHolder);
  if (state.currentWork) {
    const scopeHolder = el("div");
    scopeHolder.append(scopePill());
    filterRow.append(scopeHolder);
  }
  root?.append(filterRow);

  // The kit never commits a typed or cleared value: it reports the change and
  // waits for `update({ value })`, so Escape and the clear button need it too.
  let search: ReturnType<typeof mountSearchField> | null = null;
  search = mountSearchField(searchHolder, {
    value: state.search,
    label: "Filter runs",
    placeholder: "Filter by branch, commit, PR or number",
    onChange: (value) => {
      state.search = value;
      search?.update({ value });
      runsView?.paint();
    },
  });

  return { tabs };
}

/**
 * The scope toggle. The kit's button has no active look, so the variant
 * carries it: filled while scoped, outline while not.
 */
function scopePill(): HTMLElement {
  const holder = el("div");
  mountButton(holder, {
    label: scopeLabel(state.currentWork),
    size: "sm",
    variant: state.scopeOn ? "default" : "outline",
    onClick: () => void toggleScope(),
  });
  return holder;
}

/**
 * Where a pasted token is removed. The SDK documents `oauthDisconnect` as
 * dropping OAuth or Linear tokens; it does not say it clears a token guest's
 * pasted token. The card in Settings is the reliable place.
 */
const REMOVE_TOKEN_HINT =
  "To remove the token, open Settings → Integrations and clear the CircleCI card.";

/**
 * Ask the host to drop the connection, then wait for it to say so. The screen
 * changes only when `onConnection` reports the connection gone; a call that
 * returns is not evidence the token is gone.
 */
async function requestDisconnect(): Promise<void> {
  try {
    await host.oauthDisconnect();
    state.disconnectNotice = `Disconnect requested. ${REMOVE_TOKEN_HINT}`;
  } catch (error) {
    state.disconnectNotice = `${describeError(error)} ${REMOVE_TOKEN_HINT}`;
  }
  render();
}

/**
 * Forget everything tied to the current project link: filters, scope,
 * search and the drill-down. Keeps the connection, the account and the
 * preferences, so a switched or re-picked project starts from one clean
 * load of its own runs.
 */
function forgetProjectData(): void {
  state.scopeOn = false;
  state.search = "";
  state.filter = "all";
  state.currentWork = null;
  state.workspace = null;
  state.override = null;
  state.runs = [];
  state.runsNext = null;
  state.selectedRun = null;
  state.workflows = [];
  state.selectedWorkflow = null;
  state.jobs = [];
  state.selectedJob = null;
  state.jobDetail = null;
  state.jobOutput = null;
  state.jobsError = null;
  trigger.reset();
  picker.reset();
  state.toast = null;
  state.error = null;
  updateBadge();
}

/** Forget everything tied to the account, so a later reconnect starts from a clean load. */
function forgetAccountData(): void {
  forgetProjectData();
  state.disconnectNotice = null;
}

function noticeLine(): void {
  if (state.disconnectNotice) {
    root?.append(el("p", { className: "notice" }, state.disconnectNotice));
  }
  if (state.error) {
    const holder = el("div");
    root?.append(holder);
    mountBanner(holder, {
      tone: "error",
      title: "CircleCI",
      body: state.error,
      action: { label: "Retry", onClick: () => void refreshCurrent() },
    });
  }
  if (state.toast) {
    // A second line for the last action, because a host toast can be missed
    // when the panel is in the rail.
    root?.append(el("p", { className: "notice" }, state.toast));
  }
}

function filteredRuns(): Run[] {
  return filterRuns(
    state.runs,
    state.filter,
    state.search,
    state.scopeOn ? scopeOf(state.currentWork) : undefined,
  );
}

function runRows() {
  return filteredRuns().map((run) => {
    const status = statusOf(run.phase, run.outcome);
    return {
      id: run.id,
      leading: `#${run.number}`,
      title: refLabel(run),
      ...(run.commitSubject ? { subtitle: run.commitSubject } : {}),
      meta: [relativeTime(run.createdAt), prMeta(run)].filter(Boolean).join(" · "),
      badge: { label: status.label, tone: status.tone },
    };
  });
}

function runsEmptyText(): string {
  if (state.runs.length === 0) {
    return "No runs yet. Push a commit, or start one from the project menu.";
  }
  if (state.scopeOn) {
    const scope = scopeOf(state.currentWork);
    const withPrs = Boolean(scope.branch) && scope.prNumbers.length > 0;
    const what = scope.branch
      ? `runs on ${scope.branch}${withPrs ? " or its pull requests" : ""}`
      : "runs for the linked pull requests";
    return `No ${what} in the loaded pages yet. Load more runs or turn the scope off.`;
  }
  return "No run matches this filter.";
}

function renderRuns(): void {
  const { tabs } = renderToolbar();
  const note = state.scopeOn ? scopeNote(state.currentWork) : null;
  if (note) root?.append(el("p", { className: "muted scope-note", text: note }));
  noticeLine();
  if (state.loading && state.runs.length === 0) {
    root?.append(spinnerHolder("Loading runs"));
    return;
  }
  const listHolder = el("div", { className: "scroll" });
  root?.append(listHolder);
  const list = mountList(listHolder, {
    items: runRows(),
    emptyText: runsEmptyText(),
    ariaLabel: "CircleCI runs",
    onSelect: (id) => {
      const run = state.runs.find((entry) => entry.id === id);
      if (run) void openRun(run);
    },
  });
  runsView = {
    tabs,
    list,
    paint: () => list.update({ items: runRows(), emptyText: runsEmptyText() }),
  };
  if (state.runsNext) {
    const more = el("div", { className: "load-more" });
    mountButton(more, {
      label: "Load more runs",
      size: "sm",
      variant: "ghost",
      onClick: () => void loadRuns({ more: true }),
    });
    root?.append(more);
  }
}

function renderRunHead(run: Run): HTMLElement {
  const workspace = activeWorkspace();
  const head = el("div", { className: "detail-head" });

  const top = el("div", { className: "row" });
  const back = el("div");
  mountButton(back, { label: "← Runs", variant: "ghost", size: "sm", onClick: backToRuns });
  top.append(back);
  top.append(el("span", { className: "spacer" }));
  top.append(badgeEl(run.phase, run.outcome));
  head.append(top);

  head.append(el("div", { className: "detail-title" }, `#${run.number} ${refLabel(run)}`));
  const pieces: string[] = [];
  if (run.revision) pieces.push(shortSha(run.revision));
  if (run.commitSubject) pieces.push(run.commitSubject);
  if (run.pipelineName) pieces.push(run.pipelineName);
  pieces.push(relativeTime(run.createdAt));
  head.append(el("div", { className: "detail-sub" }, pieces.filter(Boolean).join(" · ")));

  if (run.errors.length > 0) {
    head.append(
      providerNotice(
        run.errors.map((error) => `${error.type}: ${error.message}`).join(" · "),
        "notice error-text",
      ),
    );
  }

  const actions = el("div", { className: "detail-actions" });
  const rerunHolder = el("div");
  mountMenu(rerunHolder, {
    label: "Rerun",
    size: "sm",
    items: [
      { id: "failed", label: "Rerun from failed" },
      { id: "all", label: "Rerun every workflow" },
    ],
    onSelect: (id) => void rerunAll(id === "failed"),
  });
  actions.append(rerunHolder);

  // The PR link is the URL CircleCI itself reports on the run; nothing is
  // guessed from a bare host name.
  const pr = run.pullRequests?.[0];
  if (pr?.url) {
    const prHolder = el("div");
    mountButton(prHolder, {
      label: `Open PR #${pr.number}`,
      size: "sm",
      variant: "outline",
      onClick: () => openUrl(pr.url),
    });
    actions.append(prHolder);
  }

  const open = el("div");
  mountButton(open, {
    label: "Open in CircleCI",
    size: "sm",
    variant: "ghost",
    onClick: () => openUrl(workspace ? runUrl(workspace.target, run.number) : null),
  });
  actions.append(open);

  const attachButton = el("div");
  mountButton(attachButton, {
    label: "Attach",
    size: "sm",
    variant: "outline",
    onClick: () => void attach(sourceFor({ workflow: null, job: null })),
  });
  actions.append(attachButton);
  head.append(actions);
  return head;
}

function jobRow(options: {
  name: string;
  meta: string;
  phase: string;
  outcome: string | null;
  onOpen: () => void;
  actions: Array<{
    label: string;
    onClick: () => void;
    variant?: "default" | "secondary" | "outline" | "ghost" | "destructive";
    size?: "default" | "sm" | "xs";
  }>;
}): HTMLElement {
  const row = el("div", { className: "job-row" });
  const head = el("div", { className: "job-row-head" });
  const name = el("button", {
    className: "job-row-name",
    text: options.name,
    title: options.name,
    style:
      "background:none;border:0;padding:0;color:inherit;font:inherit;text-align:left;cursor:pointer;",
  });
  name.addEventListener("click", options.onOpen);
  head.append(name);
  if (options.meta) head.append(el("span", { className: "job-row-meta", text: options.meta }));
  head.append(badgeEl(options.phase, options.outcome));
  row.append(head);
  if (options.actions.length > 0) {
    const actions = el("div", { className: "job-row-actions" });
    for (const action of options.actions) {
      const holder = el("div");
      mountButton(holder, {
        label: action.label,
        size: action.size ?? "xs",
        variant: action.variant ?? "ghost",
        onClick: action.onClick,
      });
      actions.append(holder);
    }
    row.append(actions);
  }
  return row;
}

function renderWorkflows(): void {
  const run = state.selectedRun;
  if (!run) return renderRuns();
  root?.append(renderRunHead(run));
  noticeLine();

  if (state.loading && state.workflows.length === 0) {
    root?.append(spinnerHolder("Loading workflows"));
    return;
  }
  if (state.workflows.length === 0) {
    const holder = el("div");
    root?.append(holder);
    mountEmpty(holder, {
      title: "No workflows",
      body: "This run produced no workflows. A configuration error is shown above when CircleCI reported one.",
    });
    return;
  }

  const body = el("div", { className: "scroll" });
  root?.append(body);
  for (const workflow of state.workflows) {
    const status = statusOf(workflow.phase, workflow.outcome);
    const actions: Array<{
      label: string;
      onClick: () => void;
      variant?: "default" | "secondary" | "outline" | "ghost" | "destructive";
      size?: "default" | "sm" | "xs";
    }> = [
      { label: "Jobs", onClick: () => void openWorkflow(workflow), variant: "outline" },
      { label: "Rerun failed", onClick: () => void rerun(workflow, true) },
    ];
    if (status.active) {
      actions.push({ label: "Cancel", onClick: () => void cancel(workflow), variant: "ghost" });
    }
    actions.push({
      label: "Open",
      onClick: () => {
        const workspace = activeWorkspace();
        if (workspace) openUrl(workflowUrl(workspace.target, run.number, workflow.id));
      },
    });
    body.append(
      jobRow({
        name: workflow.name,
        meta: duration(workflow.createdAt, workflow.endedAt),
        phase: workflow.phase,
        outcome: workflow.outcome,
        onOpen: () => void openWorkflow(workflow),
        actions,
      }),
    );
  }
}

function renderJobs(): void {
  const workflow = state.selectedWorkflow;
  const run = state.selectedRun;
  if (!workflow || !run) return renderWorkflows();

  const head = el("div", { className: "detail-head" });
  const top = el("div", { className: "row" });
  const back = el("div");
  mountButton(back, {
    label: "← Workflows",
    variant: "ghost",
    size: "sm",
    onClick: backToWorkflows,
  });
  top.append(back);
  top.append(el("span", { className: "spacer" }));
  top.append(badgeEl(workflow.phase, workflow.outcome));
  head.append(top);
  head.append(el("div", { className: "detail-title" }, workflow.name));
  head.append(
    el(
      "div",
      { className: "detail-sub" },
      `Run #${run.number} · ${duration(workflow.createdAt, workflow.endedAt) || "no duration"}`,
    ),
  );
  const actions = el("div", { className: "detail-actions" });
  const rerunHolder = el("div");
  mountMenu(rerunHolder, {
    label: "Rerun",
    size: "sm",
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
      size: "sm",
      variant: "ghost",
      onClick: () => void cancel(workflow),
    });
    actions.append(cancelHolder);
  }
  const attachHolder = el("div");
  mountButton(attachHolder, {
    label: "Attach workflow",
    size: "sm",
    variant: "outline",
    onClick: () => void attach(sourceFor({ workflow, job: null })),
  });
  actions.append(attachHolder);
  head.append(actions);
  root?.append(head);
  noticeLine();

  if (state.loading && state.jobs.length === 0) {
    root?.append(spinnerHolder("Loading jobs"));
    return;
  }
  if (state.jobs.length === 0) {
    const holder = el("div");
    root?.append(holder);
    mountEmpty(holder, { title: "No jobs", body: "This workflow lists no jobs yet." });
    return;
  }

  const body = el("div", { className: "scroll" });
  root?.append(body);
  for (const job of state.jobs) {
    const isApproval = job.type.toLowerCase() === "approval";
    const status = statusOf(job.phase, job.outcome);
    const actions: Array<{
      label: string;
      onClick: () => void;
      variant?: "default" | "secondary" | "outline" | "ghost" | "destructive";
      size?: "default" | "sm" | "xs";
    }> = [];
    if (isApproval && status.active) {
      actions.push({
        label: "Approve",
        onClick: () => void approveHold(job),
        variant: "default",
      });
      actions.push({
        label: "Reject",
        onClick: () => void rejectHold(job),
        variant: "ghost",
      });
    }
    actions.push({ label: "Details", onClick: () => void openJob(job), variant: "outline" });
    if (isFailure(job.outcome)) {
      actions.push({
        label: "Attach failure",
        onClick: () => void attach(sourceFor({ workflow, job, detail: null, output: null })),
      });
      actions.push({
        label: "Fix with agent",
        onClick: () => void startSession(sourceFor({ workflow, job, detail: null, output: null })),
      });
    }
    body.append(
      jobRow({
        name: job.name,
        meta: [job.number > 0 ? `#${job.number}` : "", duration(job.startedAt, job.endedAt)]
          .filter(Boolean)
          .join(" · "),
        phase: job.phase,
        outcome: job.outcome,
        onOpen: () => void openJob(job),
        actions,
      }),
    );
  }
}

function renderJob(): void {
  const job = state.selectedJob;
  const workflow = state.selectedWorkflow;
  const run = state.selectedRun;
  if (!job) return renderJobs();

  const head = el("div", { className: "detail-head" });
  const top = el("div", { className: "row" });
  const back = el("div");
  mountButton(back, { label: "← Jobs", variant: "ghost", size: "sm", onClick: backToJobs });
  top.append(back);
  top.append(el("span", { className: "spacer" }));
  top.append(badgeEl(job.phase, job.outcome));
  head.append(top);
  head.append(el("div", { className: "detail-title" }, job.name));
  head.append(
    el(
      "div",
      { className: "detail-sub" },
      [`#${job.number}`, job.type, duration(job.startedAt, job.endedAt)]
        .filter(Boolean)
        .join(" · "),
    ),
  );

  const actions = el("div", { className: "detail-actions" });
  const attachHolder = el("div");
  mountButton(attachHolder, {
    label: "Attach to chat",
    size: "sm",
    variant: "outline",
    onClick: () => void attach(sourceFor({ workflow, job })),
  });
  actions.append(attachHolder);
  const sessionHolder = el("div");
  mountButton(sessionHolder, {
    label: "Start a chat",
    size: "sm",
    onClick: () => void startSession(sourceFor({ workflow, job })),
  });
  actions.append(sessionHolder);
  const promptHolder = el("div");
  mountButton(promptHolder, {
    label: "Send to current chat",
    size: "sm",
    variant: "ghost",
    onClick: () => void promptFix(sourceFor({ workflow, job })),
  });
  actions.append(promptHolder);
  const workspace = activeWorkspace();
  const open = el("div");
  mountButton(open, {
    label: "Open in CircleCI",
    size: "sm",
    variant: "ghost",
    onClick: () => {
      if (workspace && workflow) {
        openUrl(jobUrl(workspace.target, run?.number ?? 0, workflow.id, job.number));
      }
    },
  });
  actions.append(open);
  head.append(actions);
  root?.append(head);
  noticeLine();

  const body = el("div", { className: "scroll" });
  root?.append(body);

  if (state.loading && !state.jobDetail) {
    body.append(spinnerHolder("Loading job"));
    return;
  }
  const detail = state.jobDetail;
  if (!detail) return;

  const meta = el("div", { className: "meta-grid" });
  const rows = [
    metaRow("Job", `#${detail.number}`),
    metaRow("Type", detail.type),
    metaRow("Started", detail.startedAt ? relativeTime(detail.startedAt) : null),
    metaRow("Duration", duration(detail.startedAt, detail.endedAt) || null),
    metaRow("Executions", detail.steps.length > 0 ? `${detail.parallelExecutions} parallel` : null),
  ];
  for (const row of rows) if (row) meta.append(row);
  if (meta.childElementCount > 0) body.append(meta);

  if (detail.errors.length > 0) {
    const section = el("div", { className: "section" });
    section.append(el("div", { className: "section-title" }, "Errors"));
    for (const error of detail.errors) {
      section.append(providerNotice(`${error.type}: ${error.message}`, "notice error-text"));
    }
    body.append(section);
  }
  if (detail.warnings.length > 0) {
    const section = el("div", { className: "section" });
    section.append(el("div", { className: "section-title" }, "Warnings"));
    for (const warning of detail.warnings) {
      section.append(providerNotice(`${warning.type}: ${warning.message}`, "notice"));
    }
    body.append(section);
  }

  if (detail.steps.length > 0) {
    const section = el("div", { className: "section" });
    section.append(el("div", { className: "section-title" }, "Steps"));
    for (const step of detail.steps) {
      const row = el("div", { className: "job-row" });
      const line = el("div", { className: "job-row-head" });
      line.append(el("span", { className: "job-row-name" }, `${step.num}. ${step.name}`));
      if (step.exitCode !== null && step.exitCode !== 0) {
        line.append(el("span", { className: "job-row-meta" }, `exit ${step.exitCode}`));
      }
      line.append(badgeEl(step.phase, step.outcome));
      row.append(line);
      if (step.command) {
        row.append(el("pre", { className: "output", style: "max-height:120px;" }, step.command));
      }
      section.append(row);
    }
    body.append(section);
  }

  if (state.jobOutput) {
    const section = el("div", { className: "section" });
    section.append(el("div", { className: "section-title" }, "Condensed output"));
    section.append(el("pre", { className: "output" }, state.jobOutput));
    body.append(section);
  } else if (isFailure(detail.outcome)) {
    body.append(
      el(
        "p",
        { className: "notice" },
        "CircleCI returned no condensed output for this job. The steps above and the errors are still attached with the chip.",
      ),
    );
  }
}

/* ---------------------------------------------------------------- lifecycle */

function firstReady(ctx: HostReadyContext): void {
  state.ready = ctx;
  state.booted = true;
  state.connected = ctx.connection.connected;
  state.account = ctx.connection.account || "CircleCI";
  // The SDK's onDirectory replays the ready directory right after this
  // handler returns, so the directory must be recorded synchronously here —
  // before boot's first await — or the replay would look like a switch.
  state.directory = ctx.directory;
  void boot();
}

host.onReady((ctx) => {
  applyTheme(ctx);
  installStyles();
  state.ready = ctx;
  if (!state.booted) firstReady(ctx);
});

host.onConnection((connection) => {
  const was = state.connected;
  state.connected = connection.connected;
  if (connection.account) state.account = connection.account;
  if (connection.connected && !was) {
    void boot();
    return;
  }
  if (!connection.connected && was) {
    forgetAccountData();
    render();
  }
});

/**
 * The user switched the open project while the panel was open. A stale list
 * of another repository is worse than none, so this re-resolves the new
 * directory exactly like a boot: a fresh link, branch detection and load.
 */
async function onDirectoryChanged(directory: string | null): Promise<void> {
  if (directory === state.directory) return;
  state.directory = directory;
  if (state.ready) state.ready = { ...state.ready, directory };
  forgetProjectData();
  state.loading = true;
  render();
  await resolveAndLoad();
}

host.onDirectory((directory) => {
  if (!state.booted) return;
  void onDirectoryChanged(directory);
});

/** A chip click lands here with the data it was attached with. */
host.onItem((item) => {
  if (!item || !("providerId" in item)) return;
  const data = readChipData(item.data);
  if (!data) return;
  void openFromChip(data);
});

async function openFromChip(data: ChipData): Promise<void> {
  const workspace = activeWorkspace();
  if (workspace && workspace.link.projectId !== data.projectId) {
    trigger.reset();
    state.override = {
      directory: state.directory ?? "",
      repo: null,
      target: { segment: "github", owner: data.orgName || "project", repo: data.projectName },
      link: {
        projectId: data.projectId,
        projectName: data.projectName,
        orgName: data.orgName,
        slug: null,
        source: "picked",
        directory: state.directory ?? "",
      },
    };
    render();
  }
  try {
    const run = await client.getRun(data.runId);
    await openRun(run);
    const workflow = data.workflowId
      ? state.workflows.find((entry) => entry.id === data.workflowId)
      : undefined;
    if (workflow) {
      await openWorkflow(workflow);
      const job = data.jobId ? state.jobs.find((entry) => entry.id === data.jobId) : undefined;
      if (job) await openJob(job);
    }
  } catch (error) {
    state.error = describeError(error);
    render();
  }
}
