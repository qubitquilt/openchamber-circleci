import assert from "node:assert/strict";
import test from "node:test";

import { detectBranch, detectRepo, linkProject, resolveWorkspace } from "../build/workspace.mjs";
import { directoryKey, loadProject } from "../build/storage.mjs";

function fakeStorage(initial = {}) {
  const map = new Map(Object.entries(initial));
  return {
    map,
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
}

/** A stub file reader: the map is the whole project, a miss throws like the host. */
function files(map) {
  return async (path) => {
    if (!(path in map)) throw new Error(`${path} is missing`);
    return { content: map[path] };
  };
}

const gitConfig = '[remote "origin"]\n\turl = git@github.com:acme/web.git\n';

test("detectRepo reads and parses .git/config", async () => {
  const repo = await detectRepo(files({ ".git/config": gitConfig }));
  assert.deepEqual(repo, { host: "github.com", owner: "acme", repo: "web" });
});

test("detectRepo is null when the file cannot be read", async () => {
  assert.equal(await detectRepo(files({})), null);
  const failing = async () => {
    throw new Error("DENIED");
  };
  assert.equal(await detectRepo(failing), null);
});

test("detectRepo is null when the config names no remote", async () => {
  assert.equal(await detectRepo(files({ ".git/config": "[core]\n\tbare = false\n" })), null);
});

test("detectBranch reads HEAD and refuses a detached head", async () => {
  assert.equal(await detectBranch(files({ ".git/HEAD": "ref: refs/heads/main\n" })), "main");
  assert.equal(await detectBranch(files({ ".git/HEAD": "abcdef0123\n" })), null);
  assert.equal(await detectBranch(files({})), null);
});

test("a saved picker link is returned without asking CircleCI", async () => {
  const storage = fakeStorage();
  let lookups = 0;
  const client = {
    async findProjectBySlug() {
      lookups += 1;
      return null;
    },
  };
  await linkProject(storage, "/work/web", { id: "project-1", name: "web", orgName: "acme" }, null);

  const workspace = await resolveWorkspace(client, storage, "/work/web", files({}));
  assert.equal(workspace?.link.projectId, "project-1");
  assert.equal(workspace?.link.source, "picked");
  assert.equal(lookups, 0);
  // The saved target still knows its owner, so web URLs work after a reopen.
  assert.deepEqual(workspace?.target, { segment: "github", owner: "acme", repo: "web" });
});

test("a link written for another directory falls through and is replaced", async () => {
  const storage = fakeStorage();
  // Same key, but the record says it belongs to a different project directory.
  await storage.set(directoryKey("/work/web"), {
    projectId: "stale",
    projectName: "old",
    orgName: "old",
    slug: null,
    source: "picked",
    directory: "/work/other",
  });
  const client = {
    async findProjectBySlug(slug) {
      assert.equal(slug, "gh/acme/web");
      return { id: "project-2", name: "web", orgName: "acme" };
    },
  };

  const workspace = await resolveWorkspace(
    client,
    storage,
    "/work/web",
    files({ ".git/config": gitConfig }),
  );
  assert.equal(workspace?.link.projectId, "project-2");
  assert.equal(workspace?.link.source, "detected");
  // The fresh lookup overwrote the stale record.
  const saved = await loadProject(storage, "/work/web");
  assert.equal(saved?.projectId, "project-2");
});

test("a remote that resolves nothing leaves the picker to decide", async () => {
  const storage = fakeStorage();
  const client = {
    async findProjectBySlug() {
      return null;
    },
  };
  assert.equal(
    await resolveWorkspace(client, storage, "/work/web", files({ ".git/config": gitConfig })),
    null,
  );
});

test("a slug lookup that throws is not a workspace", async () => {
  const storage = fakeStorage();
  const client = {
    async findProjectBySlug() {
      throw new Error("403 Forbidden");
    },
  };
  assert.equal(
    await resolveWorkspace(client, storage, "/work/web", files({ ".git/config": gitConfig })),
    null,
  );
});

test("no readable remote means no CircleCI call at all", async () => {
  const storage = fakeStorage();
  let lookups = 0;
  const client = {
    async findProjectBySlug() {
      lookups += 1;
      return null;
    },
  };
  assert.equal(await resolveWorkspace(client, storage, "/work/web", files({})), null);
  assert.equal(lookups, 0);
});
