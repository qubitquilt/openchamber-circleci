import assert from "node:assert/strict";
import test from "node:test";

import {
  anyActive,
  duration,
  failedJobs,
  isFailure,
  refLabel,
  relativeTime,
  shortSha,
  statusOf,
} from "../build/format.mjs";

test("success outcomes are green and terminal", () => {
  const status = statusOf("ended", "succeeded");
  assert.equal(status.label, "Success");
  assert.equal(status.tone, "success");
  assert.equal(status.active, false);
});

test("a running phase without an outcome is active and blue", () => {
  const status = statusOf("started", null);
  assert.equal(status.label, "Running");
  assert.equal(status.tone, "info");
  assert.equal(status.active, true);
});

test("on hold keeps polling because a human can still move it", () => {
  const status = statusOf("running", "on_hold");
  assert.equal(status.label, "On hold");
  assert.equal(status.tone, "warning");
  assert.equal(status.active, true);
});

test("failure words are red and terminal", () => {
  for (const outcome of ["failed", "errored", "timedout", "infrastructure_fail"]) {
    const status = statusOf("ended", outcome);
    assert.equal(status.tone, "error", outcome);
    assert.equal(status.active, false, outcome);
  }
});

test("canceled and not_run are neutral", () => {
  assert.equal(statusOf("ended", "canceled").tone, "neutral");
  assert.equal(statusOf("ended", "not_run").tone, "neutral");
});

test("an unknown status is neutral, never a wrong colour", () => {
  const status = statusOf("mystery", "reticulating");
  assert.equal(status.tone, "neutral");
  assert.equal(status.label, "Reticulating");
});

test("an empty status reads as Unknown", () => {
  assert.equal(statusOf(null, null).label, "Unknown");
});

test("phase 'ended' with no outcome is not active", () => {
  assert.equal(statusOf("ended", null).active, false);
});

test("failure helpers agree with the tone map", () => {
  assert.equal(isFailure("failed"), true);
  assert.equal(isFailure("errored"), true);
  assert.equal(isFailure("success"), false);
  const jobs = [
    {
      id: "a",
      name: "a",
      number: 1,
      type: "build",
      phase: "ended",
      outcome: "failed",
      startedAt: null,
      endedAt: null,
    },
    {
      id: "b",
      name: "b",
      number: 2,
      type: "build",
      phase: "ended",
      outcome: "succeeded",
      startedAt: null,
      endedAt: null,
    },
  ];
  assert.equal(failedJobs(jobs).length, 1);
});

test("anyActive finds the one moving item", () => {
  assert.equal(anyActive([statusOf("ended", "succeeded"), statusOf("queued", null)]), true);
  assert.equal(anyActive([statusOf("ended", "succeeded"), statusOf("ended", "failed")]), false);
});

test("duration reads seconds, minutes and hours", () => {
  const start = "2026-01-01T00:00:00Z";
  assert.equal(duration(start, "2026-01-01T00:00:12Z"), "12s");
  assert.equal(duration(start, "2026-01-01T00:01:30Z"), "1m 30s");
  assert.equal(duration(start, "2026-01-01T00:10:00Z"), "10m");
  assert.equal(duration(start, "2026-01-01T02:05:00Z"), "2h 5m");
});

test("duration refuses a missing or backwards range", () => {
  assert.equal(duration(null, null), "");
  assert.equal(duration("nonsense", "2026-01-01T00:00:00Z"), "");
  assert.equal(duration("2026-01-02T00:00:00Z", "2026-01-01T00:00:00Z"), "");
});

test("relative time buckets the way the app does", () => {
  const now = Date.parse("2026-01-01T12:00:00Z");
  assert.equal(relativeTime("2026-01-01T11:59:40Z", now), "just now");
  assert.equal(relativeTime("2026-01-01T11:40:00Z", now), "20m ago");
  assert.equal(relativeTime("2026-01-01T09:00:00Z", now), "3h ago");
  assert.equal(relativeTime("2025-12-29T12:00:00Z", now), "3d ago");
  assert.equal(relativeTime(null, now), "");
});

test("shortSha keeps eight characters and tolerates a missing revision", () => {
  assert.equal(shortSha("abcdef0123456789"), "abcdef01");
  assert.equal(shortSha(null), "");
});

test("refLabel prefers the branch, then the tag", () => {
  const base = { branch: "main", tag: null };
  assert.equal(refLabel(base), "main");
  assert.equal(refLabel({ branch: null, tag: "v1.2.3" }), "v1.2.3");
  assert.equal(refLabel({ branch: null, tag: null }), "detached");
});
