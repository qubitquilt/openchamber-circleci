/**
 * Status, duration and time formatting.
 *
 * CircleCI v3 declares `phase` and `outcome` as free strings, not enums, and
 * says new values are added without a version change. So every lookup here is
 * a total map with a fallback: an unknown status renders as its own words in a
 * neutral tone, never as a wrong colour.
 */
import type { Job, Run, Tone, Workflow } from "./types";

export interface Status {
  /** Human words for the badge. */
  label: string;
  tone: Tone;
  /** True while CircleCI may still move it, which is what drives polling. */
  active: boolean;
}

/** Outcomes that mean "this will not change without someone acting". */
const TERMINAL = new Set([
  "succeeded",
  "success",
  "failed",
  "failing",
  "errored",
  "error",
  "canceled",
  "cancelled",
  "not_run",
  "not_running",
  "unauthorized",
  "timedout",
  "timed_out",
  "infrastructure_fail",
  "retried",
]);

const LABELS: Record<string, string> = {
  succeeded: "Success",
  success: "Success",
  failed: "Failed",
  failing: "Failing",
  errored: "Errored",
  error: "Errored",
  canceled: "Canceled",
  cancelled: "Canceled",
  not_run: "Not run",
  not_running: "Not running",
  unauthorized: "Unauthorized",
  on_hold: "On hold",
  blocked: "Blocked",
  waiting: "Waiting",
  timedout: "Timed out",
  timed_out: "Timed out",
  infrastructure_fail: "Infrastructure fail",
  retried: "Retried",
  queued: "Queued",
  running: "Running",
  started: "Running",
  pending: "Pending",
  ended: "Finished",
};

function toneFor(key: string): Tone | null {
  if (["succeeded", "success"].includes(key)) return "success";
  if (
    [
      "failed",
      "failing",
      "errored",
      "error",
      "timedout",
      "timed_out",
      "infrastructure_fail",
      "unauthorized",
    ].includes(key)
  ) {
    return "error";
  }
  if (["queued", "running", "started", "pending"].includes(key)) return "info";
  if (["on_hold", "blocked", "waiting"].includes(key)) return "warning";
  if (["canceled", "cancelled", "not_run", "not_running", "retried", "ended"].includes(key)) {
    return "neutral";
  }
  return null;
}

function titleCase(key: string): string {
  if (!key) return "Unknown";
  const words = key.replace(/_/g, " ").trim();
  return words.charAt(0).toUpperCase() + words.slice(1);
}

export function statusOf(
  phase: string | null | undefined,
  outcome: string | null | undefined,
): Status {
  const out = (outcome ?? "").toLowerCase();
  const ph = (phase ?? "").toLowerCase();
  const key = out || ph;
  const tone = toneFor(out) ?? toneFor(ph) ?? "neutral";
  const active = out ? !TERMINAL.has(out) : !TERMINAL.has(ph) && ph !== "ended";
  return { label: LABELS[key] ?? titleCase(key), tone, active };
}

export function runStatus(run: Run): Status {
  return statusOf(run.phase, run.outcome);
}

export function workflowStatus(workflow: Workflow): Status {
  return statusOf(workflow.phase, workflow.outcome);
}

export function jobStatus(job: Job): Status {
  return statusOf(job.phase, job.outcome);
}

export function isFailure(outcome: string | null | undefined): boolean {
  const value = (outcome ?? "").toLowerCase();
  return [
    "failed",
    "failing",
    "errored",
    "error",
    "timedout",
    "timed_out",
    "infrastructure_fail",
  ].includes(value);
}

export function failedJobs(jobs: Job[]): Job[] {
  return jobs.filter((job) => isFailure(job.outcome));
}

/** True while any of the given statuses may still move. */
export function anyActive(statuses: Status[]): boolean {
  return statuses.some((status) => status.active);
}

export function duration(start: string | null, end: string | null, now = Date.now()): string {
  if (!start) return "";
  const from = Date.parse(start);
  if (!Number.isFinite(from)) return "";
  const to = end ? Date.parse(end) : now;
  if (!Number.isFinite(to) || to < from) return "";
  const seconds = Math.round((to - from) / 1000);
  if (seconds < 60) return `${seconds}s`;
  const minutes = Math.floor(seconds / 60);
  const rest = seconds % 60;
  if (minutes < 60) return rest > 0 ? `${minutes}m ${rest}s` : `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  const remainder = minutes % 60;
  return remainder > 0 ? `${hours}h ${remainder}m` : `${hours}h`;
}

export function relativeTime(iso: string | null, now = Date.now()): string {
  if (!iso) return "";
  const time = Date.parse(iso);
  if (!Number.isFinite(time)) return "";
  const seconds = Math.round((now - time) / 1000);
  if (seconds < 45) return "just now";
  const minutes = Math.round(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.round(hours / 24);
  if (days < 7) return `${days}d ago`;
  const date = new Date(time);
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

export function shortSha(revision: string | null): string {
  if (!revision) return "";
  return revision.slice(0, 8);
}

/** The branch a run built, or its tag when it built one. */
export function refLabel(run: Run): string {
  return run.branch ?? run.tag ?? "detached";
}

export function plural(count: number, one: string, many: string = `${one}s`): string {
  return `${count} ${count === 1 ? one : many}`;
}
