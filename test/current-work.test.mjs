import assert from "node:assert/strict";
import test from "node:test";

import { detectCurrentWork as currentWork, prNumberFromLink } from "../build/current-work.mjs";

/** A file reader over a fixed table; missing paths fail like the host does. */
function readFileOf(files) {
  return async (path) => {
    if (!(path in files)) throw new Error(`NOT_FOUND: ${path}`);
    return { content: files[path] };
  };
}

/** A fake host workspace: projects, and worktrees/sessions keyed by project id. */
function hostOf(data) {
  return {
    listProjects: async () => ({
      kind: "projects",
      state: "ready",
      projects: data.projects ?? [],
    }),
    listWorktrees: async (projectId) => ({
      kind: "worktrees",
      projectId,
      state: "ready",
      worktrees: data.worktrees?.[projectId] ?? [],
    }),
    listSessions: async (projectId) => ({
      kind: "sessions",
      projectId,
      state: "ready",
      coverage: [],
      sessions: data.sessions?.[projectId] ?? [],
    }),
  };
}

const LINKS = [
  { url: "https://github.com/acme/web/pull/31", kind: "change" },
  // An issue link whose URL looks like a PR: only the kind may exclude it.
  { url: "https://github.com/acme/web/pull/41", kind: "issue" },
  { url: "https://github.com/acme/web/issues/8", kind: "issue" },
  { url: "https://gitlab.com/acme/web/-/merge_requests/9", kind: "change" },
  { url: "https://bitbucket.org/acme/web/pull-requests/7", kind: "change" },
  { url: "mailto:broken@acme", kind: "change" },
];

test("a normal checkout answers from .git/HEAD", async () => {
  const work = await currentWork({
    directory: "/repo",
    session: null,
    readFile: readFileOf({ ".git/HEAD": "ref: refs/heads/fix-login\n" }),
    host: hostOf({ projects: [{ id: "p-1", directory: "/repo" }] }),
  });
  assert.deepEqual(work, { branch: "fix-login", branchSource: "head", prNumbers: [] });
});

test("a worktree answers from the host's worktree list, under its project or a descendant", async () => {
  for (const directory of ["/repo", "/repo/.worktrees/fix-login"]) {
    const work = await currentWork({
      directory,
      session: null,
      readFile: readFileOf({}),
      host: hostOf({
        projects: [{ id: "p-1", directory: "/repo" }],
        worktrees: {
          "p-1": [
            { directory, branch: "fix-login" },
            { directory: "/other", branch: "no" },
          ],
        },
      }),
    });
    assert.deepEqual(
      work,
      { branch: "fix-login", branchSource: "worktree", prNumbers: [] },
      directory,
    );
  }
});

test("the worktree branch comes only from the matching worktree, and unlisted directories stay null", async () => {
  const work = await currentWork({
    directory: "/repo/.worktrees/nope",
    session: null,
    readFile: readFileOf({}),
    host: hostOf({
      projects: [{ id: "p-1", directory: "/repo" }],
      worktrees: { "p-1": [{ directory: "/repo/.worktrees/real", branch: "real" }] },
    }),
  });
  assert.equal(work, null);
});

test("PR numbers come from this session's links of kind change, in order", async () => {
  const work = await currentWork({
    directory: "/repo",
    session: { id: "s-1" },
    readFile: readFileOf({ ".git/HEAD": "ref: refs/heads/main\n" }),
    host: hostOf({
      projects: [{ id: "p-1", directory: "/repo" }],
      sessions: {
        "p-1": [
          { id: "s-1", links: LINKS },
          { id: "s-2", links: [{ url: "https://github.com/acme/web/pull/99", kind: "change" }] },
        ],
      },
    }),
  });
  assert.deepEqual(work, { branch: "main", branchSource: "head", prNumbers: [31, 9, 7] });
});

test("a worktree outside its project's directory still finds its project", async () => {
  const work = await currentWork({
    directory: "/worktrees/fix",
    session: { id: "s-1" },
    readFile: readFileOf({}),
    host: hostOf({
      projects: [
        { id: "p-1", directory: "/repo" },
        { id: "p-2", directory: "/other" },
      ],
      worktrees: {
        "p-1": [{ directory: "/repo/.worktrees/a", branch: "a" }],
        "p-2": [{ directory: "/worktrees/fix", branch: "fix" }],
      },
      sessions: {
        "p-2": [
          { id: "s-1", links: [{ url: "https://github.com/acme/web/pull/31", kind: "change" }] },
        ],
      },
    }),
  });
  // The branch and the PR lookup both come from the discovered project.
  assert.deepEqual(work, { branch: "fix", branchSource: "worktree", prNumbers: [31] });
});

test("a link URL is picked apart by provider", () => {
  assert.equal(prNumberFromLink("https://github.com/acme/web/pull/31"), 31);
  assert.equal(prNumberFromLink("https://bitbucket.org/acme/web/pull-requests/7"), 7);
  assert.equal(prNumberFromLink("https://gitlab.com/acme/web/-/merge_requests/9"), 9);
  assert.equal(prNumberFromLink("https://github.com/acme/web/issues/8"), null);
  assert.equal(prNumberFromLink("https://github.com/acme/web/pull/nope"), null);
  assert.equal(prNumberFromLink("ftp://github.com/acme/web/pull/31"), null);
  assert.equal(prNumberFromLink("not a url"), null);
});

test("a directory with no detectable branch or PR is null, not an empty scope", async () => {
  const work = await currentWork({
    directory: "/repo",
    session: null,
    readFile: readFileOf({}),
    host: hostOf({ projects: [{ id: "p-1", directory: "/elsewhere" }] }),
  });
  assert.equal(work, null);
});

test("a host that refuses the workspace calls degrades to null", async () => {
  const host = {
    listProjects: async () => {
      throw new Error("NOT_GRANTED");
    },
    listWorktrees: async () => {
      throw new Error("NOT_GRANTED");
    },
    listSessions: async () => {
      throw new Error("NOT_GRANTED");
    },
  };
  const work = await currentWork({
    directory: "/repo/.worktrees/x",
    session: { id: "s-1" },
    readFile: readFileOf({}),
    host,
  });
  assert.equal(work, null);
});

test("a PR lookup failing keeps the branch-only scope", async () => {
  const calls = [];
  const host = {
    listProjects: async () => {
      calls.push("projects");
      return { kind: "projects", state: "ready", projects: [{ id: "p-1", directory: "/repo" }] };
    },
    listWorktrees: async () => ({
      kind: "worktrees",
      projectId: "p-1",
      state: "ready",
      worktrees: [],
    }),
    listSessions: async () => {
      calls.push("sessions");
      throw new Error("NOT_GRANTED");
    },
  };
  const work = await currentWork({
    directory: "/repo",
    session: { id: "s-1" },
    readFile: readFileOf({ ".git/HEAD": "ref: refs/heads/main\n" }),
    host,
  });
  assert.deepEqual(work, { branch: "main", branchSource: "head", prNumbers: [] });
  // The failed lookup was attempted, not skipped: only its result is absent.
  assert.deepEqual(calls, ["projects", "sessions"]);
});

test("an external detached worktree still finds its project's session pull requests", async () => {
  const work = await currentWork({
    directory: "/worktrees/detached",
    session: { id: "s-1" },
    readFile: readFileOf({}),
    host: hostOf({
      projects: [{ id: "p-1", directory: "/repo" }],
      worktrees: { "p-1": [{ directory: "/worktrees/detached", branch: "" }] },
      sessions: {
        "p-1": [
          { id: "s-1", links: [{ url: "https://github.com/acme/web/pull/31", kind: "change" }] },
        ],
      },
    }),
  });
  // No branch, but the project owns the directory and supplies PR scope.
  assert.deepEqual(work, { branch: null, branchSource: null, prNumbers: [31] });
});
