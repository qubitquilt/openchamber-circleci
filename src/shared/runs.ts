/**
 * The run list's one definition of "matches", shared by the rail panel, the
 * full-screen page and the attach picker.
 *
 * These were three near-identical copies, which drifted: the panel matched on
 * a different haystack from the page, and the filter ids were cast in each
 * surface. One module means one predicate for the tests to cover.
 */
import { isFailure, refLabel, shortSha, statusOf } from "./format";
import type { Run } from "./types";

export const RUN_FILTERS = ["all", "failed", "running"] as const;
export type RunFilter = (typeof RUN_FILTERS)[number];

/** The filter tabs report their own id; an unknown one falls back to "all". */
export function parseRunFilter(value: string): RunFilter {
  return (RUN_FILTERS as readonly string[]).includes(value) ? (value as RunFilter) : "all";
}

/** One haystack for the filter box, so no surface matches a different set of fields. */
function runHaystack(run: Run): string {
  return [
    `#${run.number}`,
    refLabel(run),
    shortSha(run.revision),
    run.commitSubject ?? "",
    run.pipelineName ?? "",
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

/**
 * The `running` tab means "may still move", not "phase is literally running":
 * a run on hold or blocked is still a run the user is waiting on, and it is
 * what arms polling. The predicate name says `active` for that reason.
 */
export function runMatches(run: Run, filter: RunFilter, search = ""): boolean {
  if (filter === "failed" && !isFailure(run.outcome)) return false;
  if (filter === "running" && !statusOf(run.phase, run.outcome).active) return false;
  const needle = search.trim().toLowerCase();
  return needle === "" || runHaystack(run).includes(needle);
}

export function filterRuns(runs: Run[], filter: RunFilter, search = ""): Run[] {
  return runs.filter((run) => runMatches(run, filter, search));
}

interface Activity {
  phase: string;
  outcome: string | null;
}

/**
 * True while any run, workflow or job may still move, which is what arms
 * polling. "Active" rather than "running": on-hold and blocked count.
 */
export function anyActive(items: Activity[]): boolean {
  return items.some((item) => statusOf(item.phase, item.outcome).active);
}
