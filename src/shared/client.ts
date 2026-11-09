/**
 * The CircleCI API v3 client.
 *
 * This is the only module that knows a CircleCI route, an envelope field or a
 * wire name. Every surface goes through it, and it takes a `RequestFn` rather
 * than the host, so the whole route table and every parser can be exercised
 * under `node --test` with a stub.
 *
 * v3 rules this file encodes:
 *
 * - Every call is under `/api/v3` and authenticated with the bearer token the
 *   host attaches; nothing here touches a credential.
 * - A collection is `{"data": [...], "page": {"next", "prev"}}`. `page.next`
 *   is an opaque cursor: it goes back as `page[cursor]` **alone**, because
 *   some routes reject a cursor sent next to a new `page[limit]`.
 * - Out-of-range `page[limit]` is a 400, not a clamp, so a 400 on a bounded
 *   list is retried once without the limit.
 * - An error is a single `{"error": {type, id, title, detail}}`.
 * - Only `GET` may be retried. v3 warns that a replayed `POST` can fire an
 *   action twice, so a timed-out rerun or trigger is reported, never resent.
 */
import type {
  Job,
  JobDetail,
  JobStep,
  Org,
  Page,
  PipelineDefinition,
  Project,
  Run,
  RunError,
  RunWarning,
  User,
  Workflow,
} from "./types";

export type HttpMethod = "GET" | "POST";
export type QueryValue = string | number | undefined | null;

/** Exactly the shape `host.request` accepts, so it can be passed straight in. */
export interface RequestInput {
  method: HttpMethod;
  path: string;
  query?: Record<string, string>;
  body?: string;
}

export interface RequestResult {
  status: number;
  body: string;
}

export type RequestFn = (input: RequestInput) => Promise<RequestResult>;

/** An error CircleCI reported, or a status whose body could not be read. */
export class CircleCIError extends Error {
  readonly status: number;
  readonly code: string;

  constructor(status: number, code: string, message: string) {
    super(message);
    this.name = "CircleCIError";
    this.status = status;
    this.code = code;
  }
}

const API_PREFIX = "/api/v3";

/** Documented `page[limit]` ceilings. Over them is a 400, so they are not guessed upward. */
export const RUN_PAGE_LIMIT = 20;
export const WORKFLOW_PAGE_LIMIT = 20;
export const PROJECT_PAGE_LIMIT = 50;
export const PIPELINE_PAGE_LIMIT = 50;
/** How far a paginated walk goes before handing the next cursor back to the caller. */
export const MAX_PAGES = 4;
/** Runs a numeric `/circleci` lookup can see before it reports "not found". */
export const RUN_SEARCH_WINDOW = MAX_PAGES * RUN_PAGE_LIMIT;

/** GET retries on 429 and gateway timeouts, with a fixed backoff because `host.request` hides `Retry-After`. */
const RETRY_DELAYS_MS = [1000, 2500];

/* ------------------------------------------------------------------ parsing */

type Obj = Record<string, unknown>;

const asObject = (value: unknown): Obj =>
  typeof value === "object" && value !== null ? (value as Obj) : {};
const asArray = (value: unknown): unknown[] => (Array.isArray(value) ? value : []);
const asString = (value: unknown): string | null =>
  typeof value === "string" && value.length > 0 ? value : null;
const asNumber = (value: unknown): number | null =>
  typeof value === "number" && Number.isFinite(value) ? value : null;

function readErrors(value: unknown): RunError[] {
  return asArray(value).map((entry) => {
    const item = asObject(entry);
    return { type: asString(item.type) ?? "unknown", message: asString(item.message) ?? "" };
  });
}

function readWarnings(value: unknown): RunWarning[] {
  return asArray(value).map((entry) => {
    const item = asObject(entry);
    return {
      type: asString(item.type) ?? "unknown",
      message: asString(item.message) ?? "",
      description: asString(item.description),
      url: asString(item.url),
    };
  });
}

export function readRun(value: unknown): Run {
  const data = asObject(value);
  const attributes = asObject(data.attributes);
  const references = asObject(data.references);
  const event = asObject(references.event);
  const eventAttributes = asObject(event.attributes);
  const vcs = asObject(eventAttributes.vcs);
  const commit = asObject(vcs.commit);
  const pipeline = asObject(references.pipeline);
  const trigger = asObject(references.trigger);
  const triggerAttributes = asObject(trigger.attributes);
  return {
    id: asString(data.id) ?? "",
    number: asNumber(attributes.number) ?? 0,
    phase: asString(attributes.phase) ?? "unknown",
    outcome: asString(attributes.current_outcome),
    createdAt: asString(attributes.created_at) ?? "",
    branch: asString(vcs.branch),
    tag: asString(vcs.tag),
    revision: asString(vcs.revision),
    commitSubject: asString(commit.subject),
    commitUrl: asString(commit.url),
    pipelineName: asString(asObject(pipeline.attributes).name),
    trigger:
      asString(triggerAttributes.name) ??
      asString(asObject(triggerAttributes.event_source).type) ??
      asString(eventAttributes.type),
    errors: readErrors(attributes.errors),
    warnings: readWarnings(attributes.warnings),
  };
}

export function readWorkflow(value: unknown): Workflow {
  const data = asObject(value);
  const attributes = asObject(data.attributes);
  const autoRerun = asObject(attributes.auto_rerun);
  return {
    id: asString(data.id) ?? "",
    name: asString(attributes.name) ?? "Workflow",
    phase: asString(attributes.phase) ?? "unknown",
    outcome: asString(attributes.current_outcome) ?? asString(attributes.outcome),
    createdAt: asString(attributes.created_at),
    endedAt: asString(attributes.ended_at),
    tag: asString(attributes.tag),
    autoRerunNumber: asNumber(autoRerun.number),
  };
}

export function readJob(value: unknown): Job {
  const data = asObject(value);
  const attributes = asObject(data.attributes);
  return {
    id: asString(data.id) ?? "",
    name: asString(attributes.name) ?? "Job",
    number: asNumber(attributes.number) ?? 0,
    type: asString(attributes.type) ?? "build",
    phase: asString(attributes.phase) ?? "unknown",
    outcome: asString(attributes.outcome),
    startedAt: asString(attributes.started_at),
    endedAt: asString(attributes.ended_at),
  };
}

function readStep(value: unknown): JobStep {
  const step = asObject(value);
  return {
    num: asNumber(step.num) ?? 0,
    name: asString(step.name) ?? "Step",
    type: asString(step.type) ?? "run",
    phase: asString(step.phase) ?? "unknown",
    outcome: asString(step.outcome),
    exitCode: asNumber(step.exit_code),
    command: asString(step.command),
    startedAt: asString(step.started_at),
    endedAt: asString(step.ended_at),
  };
}

export function readJobDetail(value: unknown): JobDetail {
  const base = readJob(value);
  const attributes = asObject(asObject(value).attributes);
  const executions = asArray(attributes.parallel_executions).map(asObject);
  const steps = executions.length > 0 ? asArray(executions[0]?.steps).map(readStep) : [];
  return {
    ...base,
    errors: readErrors(attributes.errors),
    warnings: readWarnings(attributes.warnings),
    steps,
    parallelExecutions: executions.length,
  };
}

export function readProject(value: unknown): Project {
  const data = asObject(value);
  const attributes = asObject(data.attributes);
  const org = asObject(asObject(data.references).org);
  return {
    id: asString(data.id) ?? "",
    name: asString(attributes.name) ?? "Project",
    orgId: asString(org.id) ?? "",
    orgName: asString(asObject(org.attributes).name) ?? "",
  };
}

export function readOrg(value: unknown): Org {
  const data = asObject(value);
  const attributes = asObject(data.attributes);
  return {
    id: asString(data.id) ?? "",
    name: asString(attributes.name) ?? "Organization",
    vcsProvider: asString(asObject(attributes.vcs).provider),
  };
}

export function readPipeline(value: unknown): PipelineDefinition {
  const data = asObject(value);
  const attributes = asObject(data.attributes);
  const config = asObject(attributes.config);
  return {
    id: asString(data.id) ?? "",
    name: asString(attributes.name) ?? "Pipeline",
    configPath: asString(config.file_path) ?? "",
  };
}

export function readUser(value: unknown): User {
  const data = asObject(value);
  const attributes = asObject(data.attributes);
  return {
    id: asString(data.id) ?? "",
    login: asString(attributes.login) ?? "CircleCI account",
    name: asString(attributes.name),
    avatarUrl: asString(attributes.avatar_url),
  };
}

/* --------------------------------------------------------------- transport */

interface CallInput {
  method: HttpMethod;
  path: string;
  query?: Record<string, QueryValue>;
  body?: unknown;
}

function buildQuery(
  query: Record<string, QueryValue> | undefined,
): Record<string, string> | undefined {
  if (!query) return undefined;
  const params: Record<string, string> = {};
  for (const [key, value] of Object.entries(query)) {
    if (value === undefined || value === null || value === "") continue;
    params[key] = String(value);
  }
  return Object.keys(params).length > 0 ? params : undefined;
}

function parseJson(body: string): unknown {
  if (!body) return undefined;
  try {
    return JSON.parse(body) as unknown;
  } catch {
    return undefined;
  }
}

function describeStatus(status: number): string {
  if (status === 401) return "CircleCI refused the token. Replace it in Settings → Integrations.";
  if (status === 403) return "This token cannot see that resource.";
  if (status === 404) return "CircleCI could not find that resource.";
  if (status === 429) return "CircleCI is rate limiting this token. Try again shortly.";
  if (status >= 500) return "CircleCI answered with a server error.";
  return `CircleCI answered ${status}.`;
}

function errorFrom(status: number, parsed: unknown, _raw: string): CircleCIError {
  const error = asObject(asObject(parsed).error);
  const message =
    asString(error.detail) ??
    asString(error.title) ??
    asString(error.type) ??
    describeStatus(status);
  return new CircleCIError(status, asString(error.type) ?? `HTTP_${status}`, message);
}

/** A 429 or a gateway timeout on an idempotent GET is worth one more try. */
function shouldRetry(status: number, method: HttpMethod): boolean {
  if (method !== "GET") return false;
  return status === 429 || status === 502 || status === 503 || status === 504;
}

function sleep(ms: number): Promise<void> {
  return new Promise((done) => setTimeout(done, ms));
}

export interface CircleCIClient {
  currentUser(): Promise<User>;
  listOrgs(): Promise<Org[]>;
  findProjectBySlug(slug: string): Promise<Project | null>;
  listProjectsOfOrg(orgId: string): Promise<Page<Project>>;
  listPipelines(projectId: string): Promise<PipelineDefinition[]>;
  listRuns(projectId: string, cursor?: string): Promise<Page<Run>>;
  listMyRuns(cursor?: string): Promise<Page<Run>>;
  getRun(runId: string): Promise<Run>;
  findRunByNumber(projectId: string, number: number): Promise<Run | null>;
  fireRun(input: { projectId: string; pipelineId: string; branch: string }): Promise<string>;
  listWorkflows(runId: string, cursor?: string): Promise<Page<Workflow>>;
  listJobs(workflowId: string, cursor?: string): Promise<Page<Job>>;
  getJob(jobId: string): Promise<JobDetail>;
  /** The condensed stdout of one failing step, or "" when CircleCI has none. */
  condensedOutput(jobId: string, stepNum: number, execution?: number): Promise<string>;
  rerunWorkflow(workflowId: string, fromFailed: boolean): Promise<string>;
  cancelWorkflow(workflowId: string): Promise<void>;
  approve(approvalId: string): Promise<void>;
  reject(approvalId: string): Promise<void>;
}

export function createCircleCIClient(request: RequestFn): CircleCIClient {
  async function send(input: CallInput, parse: (body: string) => unknown): Promise<unknown> {
    const query = buildQuery(input.query);
    let attempt = 0;
    for (;;) {
      const result = await request({
        method: input.method,
        path: API_PREFIX + input.path,
        ...(query ? { query } : {}),
        ...(input.body === undefined ? {} : { body: JSON.stringify(input.body) }),
      });
      if (result.status >= 400) {
        if (shouldRetry(result.status, input.method) && attempt < RETRY_DELAYS_MS.length) {
          await sleep(RETRY_DELAYS_MS[attempt] ?? 2500);
          attempt += 1;
          continue;
        }
        throw errorFrom(result.status, parseJson(result.body), result.body);
      }
      return parse(result.body);
    }
  }

  const call = (input: CallInput) => send(input, parseJson);
  /** Endpoints that answer with a log rather than JSON keep the body as text. */
  const callText = (input: CallInput) => send(input, (body) => body);

  /** One page. `cursor` takes the next page; a cursor always travels alone. */
  async function fetchPage<T>(
    path: string,
    scope: Record<string, QueryValue>,
    limit: number,
    parse: (value: unknown) => T,
    cursor?: string,
  ): Promise<Page<T>> {
    const query: Record<string, QueryValue> = cursor
      ? { ...scope, "page[cursor]": cursor }
      : { ...scope, "page[limit]": limit };
    let parsed: unknown;
    try {
      parsed = await call({ method: "GET", path, query });
    } catch (error) {
      // Out-of-range limits are a 400, not a clamp. One retry without it.
      if (!cursor && error instanceof CircleCIError && error.status === 400) {
        parsed = await call({ method: "GET", path, query: { ...scope } });
      } else {
        throw error;
      }
    }
    return {
      items: asArray(asObject(parsed).data).map(parse),
      next: asString(asObject(asObject(parsed).page).next),
    };
  }

  /** Walk up to `maxPages`, for a list a surface wants whole (orgs, projects). */
  async function walk<T>(
    path: string,
    scope: Record<string, QueryValue>,
    limit: number,
    parse: (value: unknown) => T,
    maxPages: number,
  ): Promise<Page<T>> {
    const items: T[] = [];
    let cursor: string | undefined;
    let next: string | null = null;
    for (let page = 0; page < maxPages; page += 1) {
      const result = await fetchPage(path, scope, limit, parse, cursor);
      items.push(...result.items);
      next = result.next;
      if (!next) break;
      cursor = next;
    }
    return { items, next };
  }

  return {
    currentUser: async () => {
      const parsed = await call({
        method: "GET",
        path: "/users",
        query: { "filter[user_id]": "me" },
      });
      const first = asArray(asObject(parsed).data)[0];
      if (!first) throw new CircleCIError(200, "EMPTY_USER", "CircleCI returned no user.");
      return readUser(first);
    },

    listOrgs: async () => {
      const page = await walk("/orgs", {}, PROJECT_PAGE_LIMIT, readOrg, MAX_PAGES);
      return page.items;
    },

    findProjectBySlug: async (slug: string) => {
      const parsed = await call({
        method: "GET",
        path: "/projects",
        query: { "filter[slug]": slug },
      });
      const first = asArray(asObject(parsed).data)[0];
      return first ? readProject(first) : null;
    },

    listProjectsOfOrg: (orgId: string) =>
      walk("/projects", { "filter[org_id]": orgId }, PROJECT_PAGE_LIMIT, readProject, MAX_PAGES),

    listPipelines: async (projectId: string) => {
      const page = await walk(
        "/pipelines",
        { "filter[project_id]": projectId },
        PIPELINE_PAGE_LIMIT,
        readPipeline,
        1,
      );
      const definitions: PipelineDefinition[] = [];
      for (const definition of page.items) {
        if (!definition.id) continue;
        try {
          const parsed = await call({
            method: "GET",
            path: `/pipelines/${encodeURIComponent(definition.id)}`,
            query: { "filter[project_id]": projectId },
          });
          definitions.push(readPipeline(asObject(parsed).data));
        } catch {
          // The listing gives only ids; a detail that fails keeps a usable stub.
          definitions.push({ ...definition, name: "Pipeline config" });
        }
      }
      return definitions;
    },

    listRuns: (projectId: string, cursor?: string) =>
      fetchPage("/runs", { "filter[project_id]": projectId }, RUN_PAGE_LIMIT, readRun, cursor),

    listMyRuns: (cursor?: string) =>
      fetchPage("/runs", { "filter[user_id]": "me" }, RUN_PAGE_LIMIT, readRun, cursor),

    getRun: async (runId: string) => {
      const parsed = await call({ method: "GET", path: `/runs/${encodeURIComponent(runId)}` });
      return readRun(asObject(parsed).data);
    },

    findRunByNumber: async (projectId: string, number: number) => {
      let cursor: string | undefined;
      for (let page = 0; page < MAX_PAGES; page += 1) {
        const runs = await fetchPage(
          "/runs",
          { "filter[project_id]": projectId },
          RUN_PAGE_LIMIT,
          readRun,
          cursor,
        );
        const match = runs.items.find((run) => run.number === number);
        if (match) return match;
        if (!runs.next) return null;
        cursor = runs.next;
      }
      return null;
    },

    fireRun: async (input) => {
      const parsed = await call({
        method: "POST",
        path: "/runs",
        query: { "filter[project_id]": input.projectId },
        body: {
          data: {
            attributes: { checkout: { branch: input.branch } },
            references: { pipeline: { id: input.pipelineId } },
          },
        },
      });
      const id = asString(asObject(asObject(parsed).data).id);
      if (!id) {
        throw new CircleCIError(201, "NO_RUN_ID", "CircleCI accepted the run but returned no id.");
      }
      return id;
    },

    listWorkflows: (runId: string, cursor?: string) =>
      fetchPage(
        "/workflows",
        { "filter[run_id]": runId },
        WORKFLOW_PAGE_LIMIT,
        readWorkflow,
        cursor,
      ),

    listJobs: (workflowId: string, cursor?: string) =>
      cursor
        ? fetchPage(
            "/jobs",
            { "filter[workflow_id]": workflowId },
            WORKFLOW_PAGE_LIMIT,
            readJob,
            cursor,
          )
        : walk(
            "/jobs",
            { "filter[workflow_id]": workflowId },
            WORKFLOW_PAGE_LIMIT,
            readJob,
            MAX_PAGES,
          ),

    getJob: async (jobId: string) => {
      const parsed = await call({ method: "GET", path: `/jobs/${encodeURIComponent(jobId)}` });
      return readJobDetail(asObject(parsed).data);
    },

    condensedOutput: async (jobId: string, stepNum: number, execution = 0) =>
      callText({
        method: "GET",
        path: `/jobs/${encodeURIComponent(jobId)}/stdout/condensed`,
        query: { "filter[execution]": execution, "filter[step_num]": stepNum },
      }).then((body) => (typeof body === "string" ? body : "")),

    rerunWorkflow: async (workflowId: string, fromFailed: boolean) => {
      const parsed = await call({
        method: "POST",
        path: `/workflows/${encodeURIComponent(workflowId)}/rerun`,
        body: fromFailed ? { is_from_failed: true } : undefined,
      });
      return asString(asObject(asObject(parsed).data).id) ?? "";
    },

    cancelWorkflow: async (workflowId: string) => {
      await call({ method: "POST", path: `/workflows/${encodeURIComponent(workflowId)}/cancel` });
    },

    approve: async (approvalId: string) => {
      await call({ method: "POST", path: `/approvals/${encodeURIComponent(approvalId)}/approve` });
    },

    reject: async (approvalId: string) => {
      await call({ method: "POST", path: `/approvals/${encodeURIComponent(approvalId)}/reject` });
    },
  };
}
