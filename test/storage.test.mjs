import assert from "node:assert/strict";
import test from "node:test";

import {
  DEFAULT_PREFERENCES,
  clearProject,
  directoryKey,
  hashString,
  loadPipelineCache,
  loadPreferences,
  loadProject,
  pipelinesKey,
  readPipelineCache,
  readPreferences,
  readProjectRecord,
  savePipelineCache,
  savePreferences,
  saveProject,
} from "../build/storage.mjs";

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

const project = {
  projectId: "project-1",
  projectName: "web",
  orgName: "acme",
  slug: "gh/acme/web",
  source: "detected",
};

test("a directory key stays inside the host's 128-character limit", () => {
  const long = `/home/me/${"x".repeat(300)}`;
  assert.ok(directoryKey(long).length < 128);
  assert.match(directoryKey(long), /^project:[0-9a-z]+$/);
});

test("hashString is stable", () => {
  assert.equal(hashString("/home/me/web"), hashString("/home/me/web"));
  assert.notEqual(hashString("/home/me/web"), hashString("/home/me/other"));
});

test("a project round-trips per directory", async () => {
  const storage = fakeStorage();
  await saveProject(storage, "/home/me/web", project);
  const loaded = await loadProject(storage, "/home/me/web");
  assert.equal(loaded.projectId, "project-1");
  assert.equal(loaded.projectName, "web");
  assert.equal(loaded.source, "detected");
  assert.equal(loaded.directory, "/home/me/web");
});

test("a value written for another directory is refused", async () => {
  const storage = fakeStorage();
  await storage.set(directoryKey("/home/me/web"), { ...project, directory: "/home/me/other" });
  assert.equal(await loadProject(storage, "/home/me/web"), null);
});

test("a corrupt project record is unset, not a crash", async () => {
  const storage = fakeStorage();
  await storage.set(directoryKey("/home/me/web"), { projectId: 42, projectName: null });
  assert.equal(await loadProject(storage, "/home/me/web"), null);
});

test("readProjectRecord drops an unknown source", () => {
  const record = readProjectRecord({
    projectId: "p",
    projectName: "web",
    orgName: "acme",
    directory: "/x",
    source: "something",
  });
  assert.equal(record.source, "picked");
});

test("clearing a link removes it", async () => {
  const storage = fakeStorage();
  await saveProject(storage, "/home/me/web", project);
  await clearProject(storage, "/home/me/web");
  assert.equal(await loadProject(storage, "/home/me/web"), null);
});

test("preferences default to auto-refresh on", async () => {
  const storage = fakeStorage();
  assert.deepEqual(await loadPreferences(storage), DEFAULT_PREFERENCES);
  assert.deepEqual(readPreferences("nonsense"), DEFAULT_PREFERENCES);
  assert.deepEqual(readPreferences({ autoRefresh: "no" }), DEFAULT_PREFERENCES);
});

test("preferences only accept a real false", async () => {
  const storage = fakeStorage();
  const saved = await savePreferences(storage, { autoRefresh: false });
  assert.equal(saved.autoRefresh, false);
  const loaded = await loadPreferences(storage);
  assert.equal(loaded.autoRefresh, false);
});

test("pipeline cache round-trips and refuses junk", async () => {
  const storage = fakeStorage();
  await savePipelineCache(storage, "project-1", [
    { id: "pipe-1", name: "main config", configPath: ".circleci/config.yml" },
  ]);
  const loaded = await loadPipelineCache(storage, "project-1");
  assert.equal(loaded[0].name, "main config");
  assert.equal(pipelinesKey("project-1"), "pipelines:project-1");
});

test("a corrupt pipeline cache is null", () => {
  assert.equal(readPipelineCache({}), null);
  assert.equal(readPipelineCache([{ id: 1 }]), null);
  assert.equal(readPipelineCache([]), null);
});
