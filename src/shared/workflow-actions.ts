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

/** Rerun a workflow, from failed or whole. True when CircleCI accepted it. */
export async function rerunWorkflow(
  client: CircleCIClient,
  workflow: Workflow,
  fromFailed: boolean,
  notify: Notify,
): Promise<boolean> {
  try {
    await client.rerunWorkflow(workflow.id, fromFailed);
    await notify("success", `Rerun started for ${workflow.name}.`);
    return true;
  } catch (error) {
    await notify("error", describeError(error));
    return false;
  }
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

/** Approve or reject a hold. True when CircleCI accepted it. */
export async function decideApproval(
  client: CircleCIClient,
  job: Job,
  approve: boolean,
  notify: Notify,
): Promise<boolean> {
  try {
    if (approve) await client.approve(job.id);
    else await client.reject(job.id);
    await notify("success", approve ? `Approved ${job.name}.` : `Rejected ${job.name}.`);
    return true;
  } catch (error) {
    await notify("error", describeError(error));
    return false;
  }
}
