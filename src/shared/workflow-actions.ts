/**
 * The CircleCI actions every surface offers.
 *
 * The rail panel and the full-screen page differ only in what they refresh
 * afterwards, so each wrapper reports and returns whether the call landed; the
 * caller refreshes. One module means a rerun cannot report success on one
 * surface and an error on the other, and the messages cannot drift.
 */
import type { CircleCIClient } from "./client";
import { describeError } from "./errors";
import type { Job, Workflow } from "./types";

export type Notify = (kind: "info" | "success" | "error", message: string) => Promise<void>;

export interface RerunOptions {
  /** CircleCI reruns only the failed jobs and their dependents. */
  fromFailed: boolean;
}

/** Rerun a workflow. True when CircleCI accepted it. */
export async function rerunWorkflow(
  client: CircleCIClient,
  workflow: Workflow,
  options: RerunOptions,
  notify: Notify,
): Promise<boolean> {
  try {
    await client.rerunWorkflow(workflow.id, options.fromFailed);
    await notify("success", `Rerun started for ${workflow.name}.`);
    return true;
  } catch (error) {
    await notify("error", describeError(error));
    return false;
  }
}

export interface BatchResult {
  started: number;
  failed: number;
}

/**
 * Rerun several workflows with one aggregate report, which is what a run's
 * "Rerun" menu needs. A single-workflow rerun uses `rerunWorkflow` instead.
 */
export async function rerunWorkflows(
  client: CircleCIClient,
  workflows: Workflow[],
  options: RerunOptions,
  notify: Notify,
): Promise<BatchResult> {
  if (workflows.length === 0) {
    await notify(
      "info",
      options.fromFailed ? "No failed workflow to rerun." : "This run has no workflows to rerun.",
    );
    return { started: 0, failed: 0 };
  }
  let started = 0;
  let failed = 0;
  for (const workflow of workflows) {
    try {
      await client.rerunWorkflow(workflow.id, options.fromFailed);
      started += 1;
    } catch {
      failed += 1;
    }
  }
  if (started > 0) {
    await notify("success", `Started ${started} rerun${started === 1 ? "" : "s"}.`);
  }
  if (failed > 0) {
    await notify("error", `${failed} rerun${failed === 1 ? "" : "s"} could not be started.`);
  }
  return { started, failed };
}

/** Request cancellation. True when CircleCI accepted it. */
export async function cancelWorkflow(
  client: CircleCIClient,
  workflow: Workflow,
  notify: Notify,
): Promise<boolean> {
  try {
    await client.cancelWorkflow(workflow.id);
    await notify("success", `Cancellation requested for ${workflow.name}.`);
    return true;
  } catch (error) {
    await notify("error", describeError(error));
    return false;
  }
}

/** Approve a hold. True when CircleCI accepted it. */
export async function approveJob(
  client: CircleCIClient,
  job: Job,
  notify: Notify,
): Promise<boolean> {
  try {
    await client.approve(job.id);
    await notify("success", `Approved ${job.name}.`);
    return true;
  } catch (error) {
    await notify("error", describeError(error));
    return false;
  }
}

/** Reject a hold. True when CircleCI accepted it. */
export async function rejectJob(
  client: CircleCIClient,
  job: Job,
  notify: Notify,
): Promise<boolean> {
  try {
    await client.reject(job.id);
    await notify("success", `Rejected ${job.name}.`);
    return true;
  } catch (error) {
    await notify("error", describeError(error));
    return false;
  }
}
