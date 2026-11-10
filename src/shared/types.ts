/**
 * The shapes this extension reads, and the shapes it turns them into.
 *
 * CircleCI API v3 answers every call with `{"data": ...}` and every collection
 * with `{"data": [...], "page": {"next", "prev"}}`. The wire types below are
 * the subset of each entity this extension actually reads; v3 promises to add
 * fields without a version change, so every parser tolerates missing ones.
 */

export type Tone = "neutral" | "primary" | "success" | "warning" | "error" | "info";

/* -------------------------------------------------------------------- users */

export interface User {
  id: string;
  login: string;
  name: string | null;
  avatarUrl: string | null;
}

/* ------------------------------------------------------- orgs and projects */

export interface Org {
  id: string;
  name: string;
  vcsProvider: string | null;
}

export interface Project {
  id: string;
  name: string;
  orgId: string;
  orgName: string;
}

export interface PipelineDefinition {
  id: string;
  name: string;
  configPath: string;
}

/* --------------------------------------------------------------- runs */

export interface RunError {
  type: string;
  message: string;
}

/** One pull request a run's event carries, as CircleCI reports it. */
export interface RunPR {
  number: number;
  url: string | null;
}

export interface RunWarning {
  type: string;
  message: string;
  description: string | null;
  url: string | null;
}

export interface Run {
  id: string;
  number: number;
  phase: string;
  /** `current_outcome` in the API: reruns can change it, so it is never final. */
  outcome: string | null;
  createdAt: string;
  branch: string | null;
  tag: string | null;
  revision: string | null;
  commitSubject: string | null;
  commitUrl: string | null;
  pipelineName: string | null;
  trigger: string | null;
  /** Pull requests the run's vcs event reports; usually none or one. */
  pullRequests: RunPR[];
  errors: RunError[];
  warnings: RunWarning[];
}

/* ----------------------------------------------------------- workflows */

export interface Workflow {
  id: string;
  name: string;
  phase: string;
  outcome: string | null;
  createdAt: string | null;
  endedAt: string | null;
  tag: string | null;
  autoRerunNumber: number | null;
}

/* ---------------------------------------------------------------- jobs */

export interface Job {
  id: string;
  name: string;
  number: number;
  type: string;
  phase: string;
  outcome: string | null;
  startedAt: string | null;
  endedAt: string | null;
}

export interface JobStep {
  num: number;
  name: string;
  type: string;
  phase: string;
  outcome: string | null;
  exitCode: number | null;
  command: string | null;
  startedAt: string | null;
  endedAt: string | null;
}

export interface JobDetail extends Job {
  errors: RunError[];
  warnings: RunWarning[];
  steps: JobStep[];
  parallelExecutions: number;
}

/* --------------------------------------------------------------- paging */

export interface Page<T> {
  items: T[];
  /** Opaque cursor for the next page, or null on the last page. */
  next: string | null;
}

/* ------------------------------------------------------------- storage */

export interface StoredProject {
  projectId: string;
  projectName: string;
  orgName: string;
  slug: string | null;
  source: "detected" | "picked";
}

export interface Preferences {
  /** Poll only while something is running, unless the user turns polling off. */
  autoRefresh: boolean;
}

/* ------------------------------------------------------------ chip data */

/**
 * What an attached chip remembers. `ctx.item.data` comes back unchanged when
 * the user clicks the chip, so the panel can reopen the exact run.
 */
export interface ChipData {
  projectId: string;
  projectName: string;
  orgName: string;
  runId: string;
  runNumber: number;
  branch: string | null;
  workflowId: string | null;
  workflowName: string | null;
  jobId: string | null;
  jobName: string | null;
}
