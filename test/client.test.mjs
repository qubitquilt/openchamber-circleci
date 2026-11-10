import assert from "node:assert/strict";
import test from "node:test";

import { CircleCIError, createCircleCIClient, RUN_PAGE_LIMIT } from "../build/client.mjs";
import { loadPipelineCache, savePipelineCache } from "../build/storage.mjs";

/** A transport that records calls and answers from a route table. */
function transport(routes) {
  const calls = [];
  const fn = async (input) => {
    calls.push(input);
    const key = `${input.method} ${input.path}`;
    const handler = routes[key];
    if (!handler) throw new Error(`unexpected route ${key}`);
    return handler(input, calls.length);
  };
  return { fn, calls };
}

const json = (status, payload) => ({ status, body: JSON.stringify(payload) });
const ok = (payload) => json(200, payload);

function runItem(overrides = {}) {
  return {
    id: "run-1",
    attributes: {
      number: 12,
      phase: "ended",
      current_outcome: "failed",
      created_at: "2026-01-01T00:00:00Z",
      errors: [],
      warnings: [],
      ...overrides,
    },
    references: {
      event: {
        attributes: {
          type: "webhook",
          vcs: {
            branch: "main",
            revision: "abcdef0123456789",
            commit: { subject: "Fix the thing", url: "https://github.com/acme/web/commit/abc" },
          },
        },
      },
      pipeline: { id: "pipe-1", attributes: { name: "main config" } },
      trigger: { id: "trigger-1", attributes: { name: "webhook" } },
    },
  };
}

test("currentUser reads the first v3 user", async () => {
  const { fn, calls } = transport({
    "GET /api/v3/users": () =>
      ok({ data: [{ id: "user-1", attributes: { login: "ada", name: "Ada", avatar_url: "" } }] }),
  });
  const client = createCircleCIClient(fn);
  const user = await client.currentUser();
  assert.equal(user.login, "ada");
  assert.deepEqual(calls[0].query, { "filter[user_id]": "me" });
});

test("a run is read from the v3 envelope", async () => {
  const { fn } = transport({
    "GET /api/v3/runs/run-1": () => ok({ data: runItem() }),
  });
  const client = createCircleCIClient(fn);
  const run = await client.getRun("run-1");
  assert.equal(run.number, 12);
  assert.equal(run.outcome, "failed");
  assert.equal(run.branch, "main");
  assert.equal(run.commitSubject, "Fix the thing");
  assert.equal(run.pipelineName, "main config");
  assert.equal(run.trigger, "webhook");
});

test("a run keeps the pull requests its event reports, dropping malformed ones", async () => {
  const item = runItem();
  item.references.event.attributes.vcs.pull_requests = [
    { number: 31, url: "https://github.com/acme/web/pull/31" },
    { number: 0 },
    { number: "x", url: "https://github.com/acme/web/pull/32" },
    { url: "https://github.com/acme/web/pull/33" },
  ];
  const { fn } = transport({ "GET /api/v3/runs/run-1": () => ok({ data: item }) });
  const client = createCircleCIClient(fn);
  const run = await client.getRun("run-1");
  assert.deepEqual(run.pullRequests, [{ number: 31, url: "https://github.com/acme/web/pull/31" }]);
});

test("a run with no vcs block reads, with no pull requests", async () => {
  const item = runItem();
  // The event stays; only its vcs block is absent, which is the shape the
  // run parser must tolerate without dropping the run.
  delete item.references.event.attributes.vcs;
  const { fn } = transport({ "GET /api/v3/runs/run-1": () => ok({ data: item }) });
  const client = createCircleCIClient(fn);
  const run = await client.getRun("run-1");
  assert.deepEqual(run.pullRequests, []);
});

test("listRunsUntil stops as soon as a run satisfies the predicate", async () => {
  const { fn, calls } = transport({
    "GET /api/v3/runs": () => ok({ data: [runItem()], page: { next: "c1" } }),
  });
  const client = createCircleCIClient(fn);
  const page = await client.listRunsUntil("project-1", (runs) => runs.length >= 1);
  assert.equal(page.items.length, 1);
  // A stopped walk still reports where it left off, so "Load more" continues.
  assert.equal(page.next, "c1");
  assert.equal(calls.length, 1);
});

test("listRunsUntil keeps walking while the predicate fails", async () => {
  const { fn, calls } = transport({
    "GET /api/v3/runs": (_input, count) => {
      const item = runItem();
      item.id = `run-${count}`;
      // The predicate looks for this branch, met on the third page only.
      item.references.event.attributes.vcs.branch = count < 3 ? `page-${count}` : "mine";
      return ok({ data: [item], page: { next: count < 3 ? `c${count}` : "more" } });
    },
  });
  const client = createCircleCIClient(fn);
  const page = await client.listRunsUntil("project-1", (runs) =>
    runs.some((run) => run.branch === "mine"),
  );
  assert.deepEqual(
    page.items.map((run) => run.id),
    ["run-1", "run-2", "run-3"],
  );
  assert.equal(page.next, "more");
  assert.equal(calls.length, 3);
  assert.equal(calls[1].query["page[cursor]"], "c1");
  assert.equal(calls[2].query["page[cursor]"], "c2");
});

test("listRunsUntil honours an explicit page budget", async () => {
  const { fn, calls } = transport({
    "GET /api/v3/runs": () => ok({ data: [runItem()], page: { next: "again" } }),
  });
  const client = createCircleCIClient(fn);
  await client.listRunsUntil("project-1", () => false, 2);
  assert.equal(calls.length, 2);
});

test("the first run page asks for the documented limit", async () => {
  const { fn, calls } = transport({
    "GET /api/v3/runs": () => ok({ data: [runItem()], page: { next: "cursor-1", prev: null } }),
  });
  const client = createCircleCIClient(fn);
  const page = await client.listRuns("project-1");
  assert.equal(page.items.length, 1);
  assert.equal(page.next, "cursor-1");
  assert.equal(calls[0].query["page[limit]"], String(RUN_PAGE_LIMIT));
  assert.equal(calls[0].query["filter[project_id]"], "project-1");
});

test("a cursor travels alone, with no limit beside it", async () => {
  const { fn, calls } = transport({
    "GET /api/v3/runs": () => ok({ data: [runItem()], page: { next: null, prev: null } }),
  });
  const client = createCircleCIClient(fn);
  await client.listRuns("project-1", "cursor-1");
  assert.equal(calls[0].query["page[cursor]"], "cursor-1");
  assert.equal(calls[0].query["page[limit]"], undefined);
});

test("an out-of-range limit is retried without it", async () => {
  const { fn, calls } = transport({
    "GET /api/v3/runs": (_input, count) =>
      count === 1
        ? json(400, { error: { type: "bad_request", title: "limit out of range" } })
        : ok({ data: [runItem()], page: { next: null } }),
  });
  const client = createCircleCIClient(fn);
  const page = await client.listRuns("project-1");
  assert.equal(page.items.length, 1);
  assert.equal(calls.length, 2);
  assert.equal(calls[1].query["page[limit]"], undefined);
});

test("an error detail becomes the message", async () => {
  const { fn } = transport({
    "GET /api/v3/runs/run-1": () =>
      json(404, {
        error: { type: "not_found", title: "No run", detail: "Run run-1 does not exist." },
      }),
  });
  const client = createCircleCIClient(fn);
  await assert.rejects(client.getRun("run-1"), (error) => {
    assert.ok(error instanceof CircleCIError);
    assert.equal(error.status, 404);
    assert.equal(error.code, "not_found");
    assert.equal(error.message, "Run run-1 does not exist.");
    return true;
  });
});

test("a 401 explains what to do", async () => {
  const { fn } = transport({
    "GET /api/v3/runs": () => ({ status: 401, body: "" }),
  });
  const client = createCircleCIClient(fn);
  await assert.rejects(client.listRuns("project-1"), (error) => {
    assert.match(error.message, /Settings → Integrations/);
    return true;
  });
});

test("a POST is never replayed, even on a 429", async () => {
  const { fn, calls } = transport({
    "POST /api/v3/workflows/wf-1/rerun": () => ({
      status: 429,
      body: JSON.stringify({ error: { type: "rate_limited", title: "slow down" } }),
    }),
  });
  const client = createCircleCIClient(fn);
  await assert.rejects(client.rerunWorkflow("wf-1", true));
  assert.equal(calls.length, 1);
});

test("a GET is retried once after a 429", async () => {
  const { fn, calls } = transport({
    "GET /api/v3/runs/run-1": (_input, count) =>
      count === 1 ? { status: 429, body: "" } : ok({ data: runItem() }),
  });
  const client = createCircleCIClient(fn);
  const run = await client.getRun("run-1");
  assert.equal(run.number, 12);
  assert.equal(calls.length, 2);
});

test("rerun from failed sends the documented body", async () => {
  const { fn, calls } = transport({
    "POST /api/v3/workflows/wf-1/rerun": () => json(201, { data: { id: "wf-2" } }),
  });
  const client = createCircleCIClient(fn);
  const id = await client.rerunWorkflow("wf-1", true);
  assert.equal(id, "wf-2");
  assert.deepEqual(JSON.parse(calls[0].body), { is_from_failed: true });
});

test("rerun all sends no body", async () => {
  const { fn, calls } = transport({
    "POST /api/v3/workflows/wf-1/rerun": () => json(201, { data: { id: "wf-2" } }),
  });
  const client = createCircleCIClient(fn);
  await client.rerunWorkflow("wf-1", false);
  assert.equal(calls[0].body, undefined);
});

test("cancel is a POST with no body and no parsed answer", async () => {
  const { fn, calls } = transport({
    "POST /api/v3/workflows/wf-1/cancel": () => ({
      status: 202,
      body: JSON.stringify({ data: { id: "wf-1" } }),
    }),
  });
  const client = createCircleCIClient(fn);
  await client.cancelWorkflow("wf-1");
  assert.equal(calls[0].method, "POST");
  assert.equal(calls[0].body, undefined);
});

test("approve and reject accept an empty 204", async () => {
  const { fn } = transport({
    "POST /api/v3/approvals/a-1/approve": () => ({ status: 204, body: "" }),
    "POST /api/v3/approvals/a-1/reject": () => ({ status: 204, body: "" }),
  });
  const client = createCircleCIClient(fn);
  await client.approve("a-1");
  await client.reject("a-1");
});

test("fireRun sends the checkout branch and pipeline reference", async () => {
  const { fn, calls } = transport({
    "POST /api/v3/runs": () => json(201, { data: { id: "run-9" } }),
  });
  const client = createCircleCIClient(fn);
  const id = await client.fireRun({ projectId: "project-1", pipelineId: "pipe-1", branch: "main" });
  assert.equal(id, "run-9");
  assert.equal(calls[0].query["filter[project_id]"], "project-1");
  assert.deepEqual(JSON.parse(calls[0].body), {
    data: {
      attributes: { checkout: { branch: "main" } },
      references: { pipeline: { id: "pipe-1" } },
    },
  });
});

test("jobs in a workflow are parsed from the collection", async () => {
  const { fn } = transport({
    "GET /api/v3/jobs": () =>
      ok({
        data: [
          {
            id: "job-1",
            attributes: {
              name: "unit-tests",
              number: 7,
              phase: "ended",
              outcome: "failed",
              type: "build",
            },
          },
        ],
        page: { next: null },
      }),
  });
  const client = createCircleCIClient(fn);
  const page = await client.listJobs("wf-1");
  assert.equal(page.items[0].name, "unit-tests");
  assert.equal(page.items[0].number, 7);
});

test("a job detail reads steps out of the first parallel execution", async () => {
  const { fn } = transport({
    "GET /api/v3/jobs/job-1": () =>
      ok({
        data: {
          id: "job-1",
          attributes: {
            name: "unit-tests",
            number: 7,
            phase: "ended",
            outcome: "failed",
            type: "build",
            errors: [{ type: "config", message: "boom" }],
            parallel_executions: [
              {
                steps: [
                  {
                    num: 1,
                    name: "Checkout",
                    type: "checkout",
                    phase: "ended",
                    outcome: "success",
                  },
                  {
                    num: 2,
                    name: "Run tests",
                    type: "run",
                    phase: "ended",
                    outcome: "failed",
                    exit_code: 1,
                    command: "npm test",
                  },
                ],
              },
            ],
          },
        },
      }),
  });
  const client = createCircleCIClient(fn);
  const detail = await client.getJob("job-1");
  assert.equal(detail.errors[0].message, "boom");
  assert.equal(detail.steps.length, 2);
  assert.equal(detail.steps[1].exitCode, 1);
  assert.equal(detail.steps[1].command, "npm test");
  assert.equal(detail.parallelExecutions, 1);
});

test("condensed output keeps the raw body", async () => {
  const { fn, calls } = transport({
    "GET /api/v3/jobs/job-1/stdout/condensed": () => ({
      status: 200,
      body: "FAIL src/app.test.ts",
    }),
  });
  const client = createCircleCIClient(fn);
  const output = await client.condensedOutput("job-1", 2, 0);
  assert.equal(output, "FAIL src/app.test.ts");
  assert.equal(calls[0].query["filter[step_num]"], "2");
  assert.equal(calls[0].query["filter[execution]"], "0");
});

test("condensed output tolerates a 204", async () => {
  const { fn } = transport({
    "GET /api/v3/jobs/job-1/stdout/condensed": () => ({ status: 204, body: "" }),
  });
  const client = createCircleCIClient(fn);
  assert.equal(await client.condensedOutput("job-1", 2), "");
});

test("projects are listed by org and keep the org name", async () => {
  const { fn } = transport({
    "GET /api/v3/projects": () =>
      ok({
        data: [
          {
            id: "project-1",
            attributes: { name: "web" },
            references: { org: { id: "org-1", attributes: { name: "acme" } } },
          },
        ],
        page: { next: null },
      }),
  });
  const client = createCircleCIClient(fn);
  const page = await client.listProjectsOfOrg("org-1");
  assert.equal(page.items[0].name, "web");
  assert.equal(page.items[0].orgName, "acme");
});

test("a slug resolves to a single project", async () => {
  const { fn, calls } = transport({
    "GET /api/v3/projects": () =>
      ok({
        data: [
          {
            id: "project-1",
            attributes: { name: "web" },
            references: { org: { id: "org-1", attributes: { name: "acme" } } },
          },
        ],
      }),
  });
  const client = createCircleCIClient(fn);
  const project = await client.findProjectBySlug("gh/acme/web");
  assert.equal(project.id, "project-1");
  assert.equal(calls[0].query["filter[slug]"], "gh/acme/web");
});

test("a slug that matches nothing is null, not an error", async () => {
  const { fn } = transport({ "GET /api/v3/projects": () => ok({ data: [] }) });
  const client = createCircleCIClient(fn);
  assert.equal(await client.findProjectBySlug("gh/acme/web"), null);
});

test("findRunByNumber walks pages until it sees the number", async () => {
  const first = runItem({ number: 20 });
  const second = runItem({ number: 19 });
  const { fn, calls } = transport({
    "GET /api/v3/runs": (input, count) => {
      if (count === 1) return ok({ data: [first], page: { next: "c1" } });
      if (count === 2) return ok({ data: [second], page: { next: null } });
      throw new Error("too far");
    },
  });
  const client = createCircleCIClient(fn);
  const run = await client.findRunByNumber("project-1", 19);
  assert.equal(run.number, 19);
  assert.equal(calls[1].query["page[cursor]"], "c1");
});

test("findRunByNumber gives up after the page budget", async () => {
  const { fn } = transport({
    "GET /api/v3/runs": () => ok({ data: [runItem({ number: 20 })], page: { next: "again" } }),
  });
  const client = createCircleCIClient(fn);
  assert.equal(await client.findRunByNumber("project-1", 999), null);
});

/* ------------------------------------------------------- composition paths */

test("a 400 on page one retries without a limit, then pages with the cursor alone", async () => {
  const calls = [];
  const fn = async (input) => {
    calls.push(input);
    if (calls.length === 1) {
      return json(400, { error: { type: "bad_request", title: "limit out of range" } });
    }
    if (calls.length === 2) return ok({ data: [runItem({ number: 20 })], page: { next: "c1" } });
    return ok({ data: [runItem({ number: 19 })], page: { next: null } });
  };
  const client = createCircleCIClient(fn);
  const run = await client.findRunByNumber("project-1", 19);
  assert.equal(run.number, 19);
  assert.equal(calls.length, 3);
  // First attempt: the documented limit.
  assert.equal(calls[0].query["page[limit]"], String(RUN_PAGE_LIMIT));
  // The 400 retry: no limit, still no cursor.
  assert.equal(calls[1].query["page[limit]"], undefined);
  assert.equal(calls[1].query["page[cursor]"], undefined);
  // The page the retry returned: its cursor travels alone.
  assert.equal(calls[2].query["page[cursor]"], "c1");
  assert.equal(calls[2].query["page[limit]"], undefined);
});

test("a failed pipeline detail keeps a stub and survives the cache round trip", async () => {
  const fn = async (input) => {
    if (input.path === "/api/v3/pipelines") {
      return ok({ data: [{ id: "pipe-1" }, { id: "pipe-2" }] });
    }
    if (input.path === "/api/v3/pipelines/pipe-1") {
      return ok({
        data: {
          id: "pipe-1",
          attributes: { name: "main config", config: { file_path: ".circleci/config.yml" } },
        },
      });
    }
    return json(404, { error: { type: "not_found", title: "No pipeline" } });
  };
  const client = createCircleCIClient(fn);
  const definitions = await client.listPipelines("project-1");
  assert.equal(definitions.length, 2);
  assert.equal(definitions[0].name, "main config");
  assert.equal(definitions[0].configPath, ".circleci/config.yml");
  assert.equal(definitions[1].name, "Pipeline config");

  // The panel writes exactly this shape through the cache; it must come back.
  const map = new Map();
  const storage = {
    async get(key) {
      return map.get(key);
    },
    async set(key, value) {
      map.set(key, value);
    },
    async delete(key) {
      map.delete(key);
    },
  };
  await savePipelineCache(storage, "project-1", definitions);
  const cached = await loadPipelineCache(storage, "project-1");
  assert.equal(cached.length, 2);
  assert.equal(cached[1].name, "Pipeline config");
});
