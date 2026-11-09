import assert from "node:assert/strict";
import test from "node:test";

import {
  approveJob,
  cancelWorkflow,
  rejectJob,
  rerunWorkflow,
  rerunWorkflows,
} from "../build/workflow-actions.mjs";

function recorder() {
  const calls = [];
  return {
    calls,
    notify: async (kind, message) => {
      calls.push({ kind, message });
    },
  };
}

const workflow = { id: "wf-1", name: "build-and-test" };
const otherWorkflow = { id: "wf-2", name: "deploy" };
const job = { id: "job-1", name: "deploy-approval" };

test("a rerun reports success and returns true", async () => {
  const { notify, calls } = recorder();
  const seen = [];
  const client = {
    async rerunWorkflow(id, fromFailed) {
      seen.push({ id, fromFailed });
    },
  };
  assert.equal(await rerunWorkflow(client, workflow, { fromFailed: true }, notify), true);
  assert.deepEqual(seen, [{ id: "wf-1", fromFailed: true }]);
  assert.deepEqual(calls, [{ kind: "success", message: "Rerun started for build-and-test." }]);
});

test("a failed rerun reports the API message and returns false", async () => {
  const { notify, calls } = recorder();
  const client = {
    async rerunWorkflow() {
      throw new Error("This token cannot see that resource.");
    },
  };
  assert.equal(await rerunWorkflow(client, workflow, { fromFailed: false }, notify), false);
  assert.deepEqual(calls, [{ kind: "error", message: "This token cannot see that resource." }]);
});

test("a cancel reports its own action", async () => {
  const { notify, calls } = recorder();
  const client = { cancelWorkflow: async () => undefined };
  assert.equal(await cancelWorkflow(client, workflow, notify), true);
  assert.deepEqual(calls, [
    { kind: "success", message: "Cancellation requested for build-and-test." },
  ]);
});

test("approve and reject are separate, self-describing calls", async () => {
  const approved = recorder();
  const rejected = recorder();
  const seen = [];
  const client = {
    async approve(id) {
      seen.push(`approve:${id}`);
    },
    async reject(id) {
      seen.push(`reject:${id}`);
    },
  };
  assert.equal(await approveJob(client, job, approved.notify), true);
  assert.equal(await rejectJob(client, job, rejected.notify), true);
  assert.deepEqual(seen, ["approve:job-1", "reject:job-1"]);
  assert.deepEqual(approved.calls, [{ kind: "success", message: "Approved deploy-approval." }]);
  assert.deepEqual(rejected.calls, [{ kind: "success", message: "Rejected deploy-approval." }]);
});

test("a failed approval reports the error and does not claim success", async () => {
  const { notify, calls } = recorder();
  const client = {
    async approve() {
      throw new Error("CircleCI is rate limiting this token.");
    },
  };
  assert.equal(await approveJob(client, job, notify), false);
  assert.deepEqual(calls, [{ kind: "error", message: "CircleCI is rate limiting this token." }]);
});

test("a batch rerun reports one aggregate result", async () => {
  const { notify, calls } = recorder();
  let count = 0;
  const client = {
    async rerunWorkflow() {
      count += 1;
      if (count === 2) throw new Error("nope");
    },
  };
  const result = await rerunWorkflows(
    client,
    [workflow, otherWorkflow],
    { fromFailed: true },
    notify,
  );
  assert.deepEqual(result, { started: 1, failed: 1 });
  assert.deepEqual(calls, [
    { kind: "success", message: "Started 1 rerun." },
    { kind: "error", message: "1 rerun could not be started." },
  ]);
});

test("a batch rerun with nothing to do says so, without a success claim", async () => {
  const { notify, calls } = recorder();
  const client = { rerunWorkflow: async () => undefined };
  const fromFailed = await rerunWorkflows(client, [], { fromFailed: true }, notify);
  assert.deepEqual(fromFailed, { started: 0, failed: 0 });
  assert.deepEqual(calls, [{ kind: "info", message: "No failed workflow to rerun." }]);

  const whenEmpty = recorder();
  await rerunWorkflows(client, [], { fromFailed: false }, whenEmpty.notify);
  assert.deepEqual(whenEmpty.calls, [
    { kind: "info", message: "This run has no workflows to rerun." },
  ]);
});

test("a batch rerun where every call fails reports only the failure", async () => {
  const { notify, calls } = recorder();
  const client = {
    async rerunWorkflow() {
      throw new Error("boom");
    },
  };
  const result = await rerunWorkflows(client, [workflow], { fromFailed: false }, notify);
  assert.deepEqual(result, { started: 0, failed: 1 });
  assert.deepEqual(calls, [{ kind: "error", message: "1 rerun could not be started." }]);
});
