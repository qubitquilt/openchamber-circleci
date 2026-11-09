import assert from "node:assert/strict";
import test from "node:test";

import {
  branchFromHead,
  directoryName,
  gitRemoteFromConfig,
  jobUrl,
  ownerRepo,
  parseGitRemote,
  projectUrl,
  runUrl,
  slugCandidates,
  webTarget,
  workflowUrl,
} from "../build/slug.mjs";

test("https remotes parse with and without .git", () => {
  assert.deepEqual(parseGitRemote("https://github.com/acme/web.git"), {
    host: "github.com",
    owner: "acme",
    repo: "web",
  });
  assert.deepEqual(parseGitRemote("https://github.com/acme/web"), {
    host: "github.com",
    owner: "acme",
    repo: "web",
  });
  assert.deepEqual(parseGitRemote("https://github.com/acme/web/"), {
    host: "github.com",
    owner: "acme",
    repo: "web",
  });
});

test("scp-style remotes parse", () => {
  assert.deepEqual(parseGitRemote("git@github.com:acme/web.git"), {
    host: "github.com",
    owner: "acme",
    repo: "web",
  });
});

test("ssh remotes parse", () => {
  assert.deepEqual(parseGitRemote("ssh://git@github.com/acme/web.git"), {
    host: "github.com",
    owner: "acme",
    repo: "web",
  });
});

test("a remote with no owner is refused", () => {
  assert.equal(parseGitRemote("https://github.com/acme"), null);
  assert.equal(parseGitRemote(""), null);
  assert.equal(parseGitRemote("not a url"), null);
});

test("GitLab nested groups keep the last two segments", () => {
  assert.deepEqual(parseGitRemote("https://gitlab.com/group/sub/repo.git"), {
    host: "gitlab.com",
    owner: "sub",
    repo: "repo",
  });
});

test("GitHub and Bitbucket produce a slug, GitLab does not", () => {
  assert.deepEqual(slugCandidates({ host: "github.com", owner: "acme", repo: "web" }), [
    "gh/acme/web",
  ]);
  assert.deepEqual(slugCandidates({ host: "bitbucket.org", owner: "acme", repo: "web" }), [
    "bb/acme/web",
  ]);
  assert.deepEqual(slugCandidates({ host: "gitlab.com", owner: "acme", repo: "web" }), []);
});

test("ownerRepo is the picker's matching key", () => {
  assert.equal(ownerRepo({ host: "github.com", owner: "acme", repo: "web" }), "acme/web");
});

test("web targets spell the provider out", () => {
  assert.deepEqual(webTarget({ host: "github.com", owner: "acme", repo: "web" }, "x", "y"), {
    segment: "github",
    owner: "acme",
    repo: "web",
  });
  assert.deepEqual(webTarget({ host: "bitbucket.org", owner: "acme", repo: "web" }, "x", "y"), {
    segment: "bitbucket",
    owner: "acme",
    repo: "web",
  });
});

test("no remote falls back to the project's own names, on github", () => {
  assert.deepEqual(webTarget(null, "acme", "web"), {
    segment: "github",
    owner: "acme",
    repo: "web",
  });
});

test("web urls follow the app's path shape", () => {
  const target = { segment: "github", owner: "acme", repo: "web" };
  assert.equal(projectUrl(target), "https://app.circleci.com/pipelines/github/acme/web");
  assert.equal(runUrl(target, 123), "https://app.circleci.com/pipelines/github/acme/web/123");
  assert.equal(
    workflowUrl(target, 123, "wf-1"),
    "https://app.circleci.com/pipelines/github/acme/web/123/workflows/wf-1",
  );
  assert.equal(
    jobUrl(target, 123, "wf-1", 456),
    "https://app.circleci.com/pipelines/github/acme/web/123/workflows/wf-1/jobs/456",
  );
});

test("the origin remote wins over another remote", () => {
  const config = [
    '[remote "upstream"]',
    "\turl = https://github.com/other/fork.git",
    '[remote "origin"]',
    "\turl = git@github.com:acme/web.git",
  ].join("\n");
  assert.equal(gitRemoteFromConfig(config), "git@github.com:acme/web.git");
});

test("without an origin remote the first url is used", () => {
  const config = ['[remote "upstream"]', "\turl = https://github.com/acme/web.git"].join("\n");
  assert.equal(gitRemoteFromConfig(config), "https://github.com/acme/web.git");
});

test("a config with no url yields null", () => {
  assert.equal(gitRemoteFromConfig("[core]\n\tbare = false"), null);
});

test("HEAD gives the branch, or null when detached", () => {
  assert.equal(branchFromHead("ref: refs/heads/main\n"), "main");
  assert.equal(branchFromHead("ref: refs/heads/feature/x\n"), "feature/x");
  assert.equal(branchFromHead("abcdef0123456789\n"), null);
});

test("directoryName lowercases the last segment", () => {
  assert.equal(directoryName("/home/me/Repo/"), "repo");
  assert.equal(directoryName("/home/me/Repo"), "repo");
});
