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
 * The file read is injected rather than imported, so the git parsing paths can
 * be tested without the SDK host. There is no cache: a branch or remote change
 * is seen the next time a surface asks, instead of living for the iframe.
 */
import type { CircleCIClient } from "./client";
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

/** The only file read workspace detection needs; the host supplies it in the app. */
export type ReadProjectFile = (path: string) => Promise<{ content: string }>;

function workspaceOf(
  directory: string,
  link: StoredProjectRecord,
  repo: RepoRef | null,
): Workspace {
  return { directory, link, repo, target: webTarget(repo, link.orgName, link.projectName) };
}

export async function detectRepo(readFile: ReadProjectFile): Promise<RepoRef | null> {
  try {
    const config = await readFile(".git/config");
    const remote = gitRemoteFromConfig(config.content);
    return remote ? parseGitRemote(remote) : null;
  } catch {
    // No `.git/config` in this project: the picker is the way in.
    return null;
  }
}

/** The branch the open project is on, used to prefill a trigger. */
export async function detectBranch(readFile: ReadProjectFile): Promise<string | null> {
  try {
    const head = await readFile(".git/HEAD");
    return branchFromHead(head.content);
  } catch {
    return null;
  }
}

export async function resolveWorkspace(
  client: CircleCIClient,
  storage: StorageLike,
  directory: string,
  readFile: ReadProjectFile,
): Promise<Workspace | null> {
  const stored = await loadProject(storage, directory);
  if (stored) return workspaceOf(directory, stored, await detectRepo(readFile));

  const repo = await detectRepo(readFile);
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
      return workspaceOf(
        directory,
        {
          projectId: project.id,
          projectName: project.name,
          orgName: project.orgName,
          slug,
          source: "detected",
          directory,
        },
        repo,
      );
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
  const slug = repo ? (slugCandidates(repo)[0] ?? null) : null;
  await saveProject(storage, directory, {
    projectId: project.id,
    projectName: project.name,
    orgName: project.orgName,
    slug,
    source: "picked",
  });
  return workspaceOf(
    directory,
    {
      projectId: project.id,
      projectName: project.name,
      orgName: project.orgName,
      slug,
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
