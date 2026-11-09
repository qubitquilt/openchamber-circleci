/**
 * Which CircleCI project an OpenChamber project belongs to.
 *
 * v3 keys everything by project UUID, so this is the step that turns a local
 * directory into one. The order is:
 *
 * 1. A link already saved for this directory.
 * 2. The git remote, read from `.git/config`, tried as an API slug
 *    (`gh/owner/repo`, `bb/owner/repo`) against `GET /api/v3/projects?filter[slug]=`.
 * 3. Nothing — the caller opens the project picker (orgs, then projects), and
 *    the user's choice is saved.
 *
 * Nothing here is fatal. A repository with no readable `.git/config` (a
 * worktree's `.git` is a file pointing outside the project, which would need
 * the `filesystem` capability) simply lands on the picker.
 */
import type { CircleCIClient } from "./client";
import { host } from "./host";
import {
  branchFromHead,
  gitRemoteFromConfig,
  ownerRepo,
  parseGitRemote,
  slugCandidates,
  webTarget,
  type RepoRef,
  type WebTarget,
} from "./slug";
import { loadProject, saveProject, type StorageLike, type StoredProjectRecord } from "./storage";
import type { Project } from "./types";

export interface Workspace {
  directory: string;
  link: StoredProjectRecord;
  repo: RepoRef | null;
  target: WebTarget;
}

/** Reading a file per render would be wasteful; the answer cannot change mid-frame. */
const repoCache = new Map<string, RepoRef | null>();
const branchCache = new Map<string, string | null>();

function workspaceOf(
  directory: string,
  link: StoredProjectRecord,
  repo: RepoRef | null,
): Workspace {
  return { directory, link, repo, target: webTarget(repo, link.orgName, link.projectName) };
}

export async function detectRepo(directory: string): Promise<RepoRef | null> {
  if (repoCache.has(directory)) return repoCache.get(directory) ?? null;
  let repo: RepoRef | null = null;
  try {
    const config = await host.readFile(".git/config");
    const remote = gitRemoteFromConfig(config.content);
    repo = remote ? parseGitRemote(remote) : null;
  } catch {
    // No `.git/config` in this project: the picker is the way in.
    repo = null;
  }
  repoCache.set(directory, repo);
  return repo;
}

/** The branch the open project is on, used to prefill a trigger. */
export async function detectBranch(directory: string): Promise<string | null> {
  if (branchCache.has(directory)) return branchCache.get(directory) ?? null;
  let branch: string | null = null;
  try {
    const head = await host.readFile(".git/HEAD");
    branch = branchFromHead(head.content);
  } catch {
    branch = null;
  }
  branchCache.set(directory, branch);
  return branch;
}

export async function resolveWorkspace(
  client: CircleCIClient,
  storage: StorageLike,
  directory: string,
): Promise<Workspace | null> {
  const stored = await loadProject(storage, directory);
  if (stored) return workspaceOf(directory, stored, await detectRepo(directory));

  const repo = await detectRepo(directory);
  if (!repo) return null;

  for (const slug of slugCandidates(repo)) {
    try {
      const project = await client.findProjectBySlug(slug);
      if (!project || !project.id) continue;
      await saveProject(storage, directory, {
        projectId: project.id,
        projectName: project.name,
        orgName: project.orgName,
        slug,
        source: "detected",
      });
      const link: StoredProjectRecord = {
        projectId: project.id,
        projectName: project.name,
        orgName: project.orgName,
        slug,
        source: "detected",
        directory,
      };
      return workspaceOf(directory, link, repo);
    } catch {
      // A slug that misses or a token without access to it: try the next form.
    }
  }
  return null;
}

export async function linkProject(
  storage: StorageLike,
  directory: string,
  project: Project,
  repo: RepoRef | null,
): Promise<Workspace> {
  await saveProject(storage, directory, {
    projectId: project.id,
    projectName: project.name,
    orgName: project.orgName,
    slug: repo ? (slugCandidates(repo)[0] ?? null) : null,
    source: "picked",
  });
  return workspaceOf(
    directory,
    {
      projectId: project.id,
      projectName: project.name,
      orgName: project.orgName,
      slug: repo ? (slugCandidates(repo)[0] ?? null) : null,
      source: "picked",
      directory,
    },
    repo,
  );
}

/** What the picker pre-filters on: `owner/repo` from the detected remote. */
export function repoHint(repo: RepoRef | null): string | null {
  return repo ? ownerRepo(repo) : null;
}
