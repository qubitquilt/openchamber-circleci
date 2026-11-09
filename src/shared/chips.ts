/**
 * How a CircleCI run becomes something the chat understands.
 *
 * A chip is what the agent reads: `text` carries the project, the run, the
 * branch and the failing work, so the model does not have to fetch it again.
 * `data` carries the ids the panel needs to reopen the same view, and never
 * reaches the model. Every field has a host limit, so each builder clamps:
 * title 200, text and serialized data 16000, url 2000, id 128.
 *
 * Nothing here imports the host or a vendor type: the builders are pure, and
 * `actions.ts` is the thin wrapper that talks to OpenChamber. That keeps the
 * chip text, the data round trip and the limits testable under `node --test`.
 */
import { isFailure, refLabel, shortSha, statusOf } from "./format";
import { jobUrl, runUrl, workflowUrl } from "./slug";
import type { ChipData, Job, JobDetail, Run, Workflow } from "./types";
import type { Workspace } from "./workspace";

/** Matches `contributes.panel.id`, which is what OpenChamber groups chips by. */
export const PROVIDER_ID = "circleci";

const TEXT_LIMIT = 16_000;
const TITLE_LIMIT = 200;
const CHIP_URL_LIMIT = 2_000;

export interface ChipSource {
  workspace: Workspace;
  run: Run;
  workflow: Workflow | null;
  job: Job | null;
  /** The selected workflow's jobs, when the surface has loaded them. */
  jobs: Job[];
  detail: JobDetail | null;
  /** Condensed stdout of the failing step, when one was fetched. */
  output: string | null;
}

/** The JSON value shape a chip's `data` must satisfy. */
export type Json = null | string | number | boolean | Json[] | { [key: string]: Json };

function clamp(text: string, limit: number): string {
  if (text.length <= limit) return text;
  return `${text.slice(0, limit - 20)}\n… (truncated)`;
}

function statusWords(value: { phase: string; outcome: string | null }): string {
  return statusOf(value.phase, value.outcome).label.toLowerCase();
}

/**
 * The chip's `data`, built as an object literal so the compiler checks it
 * against the JSON shape instead of a cast hiding a non-serializable field.
 */
export function chipDataJson(source: ChipSource): Json {
  const { workspace, run, workflow, job } = source;
  return {
    projectId: workspace.link.projectId,
    projectName: workspace.link.projectName,
    orgName: workspace.link.orgName,
    runId: run.id,
    runNumber: run.number,
    branch: run.branch,
    workflowId: workflow?.id ?? null,
    workflowName: workflow?.name ?? null,
    jobId: job?.id ?? null,
    jobName: job?.name ?? null,
  };
}

function asText(value: unknown): string | null {
  return typeof value === "string" && value.length > 0 ? value : null;
}

/** Read back what `chipDataJson` wrote, or null when the payload is not ours. */
export function readChipData(value: unknown): ChipData | null {
  if (typeof value !== "object" || value === null || Array.isArray(value)) return null;
  const record = value as Record<string, unknown>;
  const projectId = asText(record.projectId);
  const projectName = asText(record.projectName);
  // A project whose org name the API did not return is stored as "", so the
  // org name is blank-but-valid here; requiring it would refuse a chip we wrote.
  const orgName = asText(record.orgName) ?? "";
  const runId = asText(record.runId);
  const runNumber =
    typeof record.runNumber === "number" && Number.isFinite(record.runNumber)
      ? record.runNumber
      : null;
  if (!projectId || !projectName || !runId || runNumber === null) return null;
  return {
    projectId,
    projectName,
    orgName,
    runId,
    runNumber,
    branch: asText(record.branch),
    workflowId: asText(record.workflowId),
    workflowName: asText(record.workflowName),
    jobId: asText(record.jobId),
    jobName: asText(record.jobName),
  };
}

export function chipId(source: ChipSource): string {
  const workflow = source.workflow?.id ?? "run";
  const job = source.job?.id ?? "";
  return `${source.run.id}:${workflow}:${job}`;
}

export function chipTitle(source: ChipSource): string {
  const { run, workflow, job } = source;
  const target = job?.name ?? workflow?.name ?? `run #${run.number}`;
  const state = job
    ? statusWords({ phase: job.phase, outcome: job.outcome })
    : workflow
      ? statusWords(workflow)
      : statusWords({ phase: run.phase, outcome: run.outcome });
  return clamp(`${target} ${state} in CircleCI run #${run.number}`, TITLE_LIMIT);
}

export function chipUrl(source: ChipSource): string {
  const { workspace, run, workflow, job } = source;
  if (workflow && job && job.number > 0) {
    return jobUrl(workspace.target, run.number, workflow.id, job.number).slice(0, CHIP_URL_LIMIT);
  }
  if (workflow) {
    return workflowUrl(workspace.target, run.number, workflow.id).slice(0, CHIP_URL_LIMIT);
  }
  return runUrl(workspace.target, run.number).slice(0, CHIP_URL_LIMIT);
}

export function chipText(source: ChipSource): string {
  const { workspace, run, workflow, job, jobs, detail, output } = source;
  const lines: string[] = [];
  lines.push(
    `CircleCI run #${run.number} on ${workspace.link.orgName}/${workspace.link.projectName}`,
  );
  lines.push(`Status: ${statusWords({ phase: run.phase, outcome: run.outcome })}`);
  if (run.pipelineName) lines.push(`Pipeline: ${run.pipelineName}`);
  lines.push(`Ref: ${refLabel(run)}${run.revision ? ` at ${shortSha(run.revision)}` : ""}`);
  if (run.commitSubject) lines.push(`Commit: ${run.commitSubject}`);
  lines.push(`URL: ${chipUrl(source)}`);

  const failing = jobs.filter((entry) => isFailure(entry.outcome));
  if (workflow) {
    lines.push("");
    lines.push(`Workflow ${workflow.name} (${statusWords(workflow)})`);
    if (failing.length > 0) {
      lines.push("Failing jobs:");
      for (const entry of failing) lines.push(`- ${entry.name} (#${entry.number})`);
    }
    const other = jobs.filter((entry) => !failing.includes(entry));
    if (other.length > 0) {
      lines.push("Other jobs:");
      for (const entry of other) {
        lines.push(
          `- ${entry.name}: ${statusWords({ phase: entry.phase, outcome: entry.outcome })}`,
        );
      }
    }
  }

  if (job && detail) {
    lines.push("");
    lines.push(`Job ${detail.name} (#${detail.number})`);
    if (detail.errors.length > 0) {
      lines.push("Errors:");
      for (const error of detail.errors) lines.push(`- ${error.type}: ${error.message}`);
    }
    const failingSteps = detail.steps.filter((step) => step.outcome === "failed");
    if (failingSteps.length > 0) {
      lines.push("Failed steps:");
      for (const step of failingSteps) {
        lines.push(
          `- step ${step.num} "${step.name}"${step.exitCode !== null ? ` (exit ${step.exitCode})` : ""}`,
        );
        if (step.command) lines.push(`  command: ${step.command}`);
      }
    }
  }

  if (output && output.trim()) {
    lines.push("");
    lines.push("Condensed output:");
    lines.push(output.trim());
  }

  return clamp(lines.join("\n"), TEXT_LIMIT);
}

/** The first message a "fix this" session gets. */
export function chipPrompt(source: ChipSource): string {
  return clamp(`Investigate and fix this CircleCI failure.\n\n${chipText(source)}`, TEXT_LIMIT);
}
