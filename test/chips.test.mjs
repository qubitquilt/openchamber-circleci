import assert from "node:assert/strict";
import test from "node:test";

import {
  chipDataJson,
  chipId,
  chipPrompt,
  chipText,
  chipTitle,
  chipUrl,
  readChipData,
} from "../build/chips.mjs";

const workspace = {
  directory: "/work/web",
  link: {
    projectId: "project-1",
    projectName: "web",
    orgName: "acme",
    slug: "gh/acme/web",
    source: "detected",
    directory: "/work/web",
  },
  repo: { host: "github.com", owner: "acme", repo: "web" },
  target: { segment: "github", owner: "acme", repo: "web" },
};

const run = {
  id: "run-1",
  number: 12,
  phase: "ended",
  outcome: "failed",
  createdAt: "2026-01-01T00:00:00Z",
  branch: "main",
  tag: null,
  revision: "abcdef0123456789",
  commitSubject: "Fix the login form",
  commitUrl: null,
  pipelineName: "main config",
  trigger: "webhook",
  errors: [],
  warnings: [],
};

const workflow = {
  id: "workflow-1",
  name: "build-and-test",
  phase: "ended",
  outcome: "failed",
  createdAt: "2026-01-01T00:00:00Z",
  endedAt: "2026-01-01T00:05:00Z",
  tag: null,
  autoRerunNumber: null,
};

const failingJob = {
  id: "job-1",
  name: "unit-tests",
  number: 7,
  type: "build",
  phase: "ended",
  outcome: "failed",
  startedAt: null,
  endedAt: null,
};

const passingJob = { ...failingJob, id: "job-2", name: "lint", number: 8, outcome: "succeeded" };

const detail = {
  ...failingJob,
  errors: [{ type: "config", message: "npm test exited 1" }],
  warnings: [],
  steps: [
    {
      num: 1,
      name: "Checkout",
      type: "checkout",
      phase: "ended",
      outcome: "succeeded",
      exitCode: null,
      command: null,
      startedAt: null,
      endedAt: null,
    },
    {
      num: 2,
      name: "Run tests",
      type: "run",
      phase: "ended",
      outcome: "failed",
      exitCode: 1,
      command: "npm test",
      startedAt: null,
      endedAt: null,
    },
  ],
  parallelExecutions: 1,
};

function source(overrides = {}) {
  return {
    workspace,
    run,
    workflow,
    job: failingJob,
    jobs: [failingJob, passingJob],
    detail,
    output: "FAIL src/login.test.ts",
    ...overrides,
  };
}

test("a job chip names the job, its status and the run", () => {
  assert.equal(chipTitle(source()), "unit-tests failed in CircleCI run #12");
});

test("a workflow chip falls back to the workflow name", () => {
  assert.equal(
    chipTitle(source({ job: null, detail: null, output: null })),
    "build-and-test failed in CircleCI run #12",
  );
  assert.equal(
    chipTitle(source({ workflow: null, job: null, detail: null, output: null })),
    "run #12 failed in CircleCI run #12",
  );
});

test("the chip id is unique per job and stable across a reread", () => {
  assert.equal(chipId(source()), "run-1:workflow-1:job-1");
  assert.equal(chipId(source({ job: null })), "run-1:workflow-1:");
  assert.equal(chipId(source({ workflow: null, job: null })), "run-1:run:");
});

test("a job chip links to the job, a workflow chip to the workflow", () => {
  assert.equal(
    chipUrl(source()),
    "https://app.circleci.com/pipelines/github/acme/web/12/workflows/workflow-1/jobs/7",
  );
  assert.equal(
    chipUrl(source({ job: null })),
    "https://app.circleci.com/pipelines/github/acme/web/12/workflows/workflow-1",
  );
  assert.equal(
    chipUrl(source({ workflow: null, job: null })),
    "https://app.circleci.com/pipelines/github/acme/web/12",
  );
});

test("the chip text carries what the agent needs without another call", () => {
  const text = chipText(source());
  assert.match(text, /CircleCI run #12 on acme\/web/);
  assert.match(text, /Status: failed/);
  assert.match(text, /Pipeline: main config/);
  assert.match(text, /Ref: main at abcdef01/);
  assert.match(text, /Commit: Fix the login form/);
  assert.match(text, /Workflow build-and-test/);
  assert.match(text, /Failing jobs:\n- unit-tests \(#7\)/);
  assert.match(text, /Other jobs:\n- lint: success/);
  assert.match(text, /- config: npm test exited 1/);
  assert.match(text, /- step 2 "Run tests" \(exit 1\)/);
  assert.match(text, /command: npm test/);
  assert.match(text, /Condensed output:\nFAIL src\/login\.test\.ts/);
});

test("a workflow chip without jobs says so instead of inventing them", () => {
  const text = chipText(source({ job: null, jobs: [], detail: null, output: null }));
  assert.match(text, /Workflow build-and-test/);
  assert.doesNotMatch(text, /Failing jobs/);
  assert.doesNotMatch(text, /Condensed output/);
});

test("the text is clamped to the host limit and says it was truncated", () => {
  const huge = "x".repeat(20_000);
  const text = chipText(source({ output: huge }));
  assert.ok(text.length <= 16_000, `length ${text.length}`);
  assert.match(text, /truncated/);
});

test("the first message of a fix session is the chip text under a prompt", () => {
  const prompt = chipPrompt(source());
  assert.match(prompt, /^Investigate and fix this CircleCI failure\./);
  assert.match(prompt, /CI run #12/);
  assert.ok(prompt.length <= 16_000);
});

test("the chip data is JSON and round-trips through the reader", () => {
  const json = chipDataJson(source());
  assert.deepEqual(JSON.parse(JSON.stringify(json)), json);
  assert.deepEqual(readChipData(json), {
    projectId: "project-1",
    projectName: "web",
    orgName: "acme",
    runId: "run-1",
    runNumber: 12,
    branch: "main",
    workflowId: "workflow-1",
    workflowName: "build-and-test",
    jobId: "job-1",
    jobName: "unit-tests",
  });
});

test("a chip with no workflow or job still round-trips", () => {
  const json = chipDataJson(source({ workflow: null, job: null }));
  const data = readChipData(json);
  assert.equal(data.workflowId, null);
  assert.equal(data.jobId, null);
  assert.equal(data.runNumber, 12);
});

test("the chip reader refuses anything that is not its own payload", () => {
  assert.equal(readChipData(null), null);
  assert.equal(readChipData("run-1"), null);
  assert.equal(readChipData([]), null);
  assert.equal(readChipData({}), null);
  assert.equal(readChipData({ ...chipDataJson(source()), runNumber: "12" }), null);
  assert.equal(readChipData({ ...chipDataJson(source()), runId: "" }), null);
});
