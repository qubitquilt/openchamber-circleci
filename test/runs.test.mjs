import assert from "node:assert/strict";
import test from "node:test";

import {
  RUN_FILTERS,
  anyRunning,
  filterRuns,
  parseRunFilter,
  runHaystack,
  runMatches,
} from "../build/runs.mjs";

function run(overrides = {}) {
  return {
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
    ...overrides,
  };
}

test("the filter ids are the ones the tabs render", () => {
  assert.deepEqual([...RUN_FILTERS], ["all", "failed", "running"]);
  assert.equal(parseRunFilter("failed"), "failed");
  assert.equal(parseRunFilter("running"), "running");
  assert.equal(parseRunFilter("all"), "all");
});

test("an unknown filter id falls back to all instead of being cast", () => {
  assert.equal(parseRunFilter("sideways"), "all");
  assert.equal(parseRunFilter(""), "all");
});

test("the failed filter keeps only failure outcomes", () => {
  const runs = [run(), run({ id: "run-2", outcome: "succeeded" })];
  assert.deepEqual(
    filterRuns(runs, "failed").map((entry) => entry.id),
    ["run-1"],
  );
});

test("the running filter keeps only runs that may still move", () => {
  const runs = [
    run({ id: "run-1", phase: "started", outcome: null }),
    run({ id: "run-2", phase: "ended", outcome: "succeeded" }),
    run({ id: "run-3", phase: "running", outcome: "on_hold" }),
  ];
  assert.deepEqual(
    filterRuns(runs, "running").map((entry) => entry.id),
    ["run-1", "run-3"],
  );
});

test("search matches the number, branch, sha and commit subject", () => {
  for (const needle of ["#12", "main", "abcdef01", "login"]) {
    assert.equal(runMatches(run(), "all", needle), true, needle);
  }
  assert.equal(runMatches(run(), "all", "no-such-thing"), false);
});

test("search composes with a filter rather than replacing it", () => {
  const runs = [
    run({ id: "run-1" }),
    run({ id: "run-2", outcome: "succeeded", commitSubject: "ship it" }),
  ];
  assert.deepEqual(
    filterRuns(runs, "failed", "ship").map((entry) => entry.id),
    [],
  );
  assert.deepEqual(
    filterRuns(runs, "failed", "login").map((entry) => entry.id),
    ["run-1"],
  );
});

test("the haystack is lowercased and includes the pipeline name", () => {
  assert.match(runHaystack(run()), /main config/);
  assert.equal(runHaystack(run()), runHaystack(run()).toLowerCase());
});

test("anyRunning is true only while something can still move", () => {
  assert.equal(anyRunning([{ phase: "ended", outcome: "succeeded" }]), false);
  assert.equal(anyRunning([{ phase: "queued", outcome: null }]), true);
  assert.equal(anyRunning([{ phase: "ended", outcome: "on_hold" }]), true);
  assert.equal(anyRunning([]), false);
});
