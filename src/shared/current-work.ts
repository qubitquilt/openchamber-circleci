/**
 * The CircleCI work this OpenChamber directory is on.
 *
 * "Which runs are mine?" needs two ingredients, and v3 supplies neither as a
 * server-side filter, so both are detected locally:
 *
 * - The branch. A normal checkout answers in `.git/HEAD`. A worktree's `.git`
 *   is a file pointing outside the project, so `.git/HEAD` does not exist
 *   there; instead the host is asked for the open project's worktrees — the
 *   `sessions` capability it already granted covers `listWorktrees`, and it
 *   knows the branch each worktree is on.
 * - The pull requests. The current session's links of kind `change` carry the
 *   PR the work is under review in. Their numbers are matched against the
 *   `pull_requests` block CircleCI reports on every run, so a run is found by
 *   PR even when its branch field differs from the local one.
 *
 * Every step degrades to its own null and nothing here throws: a directory
 * whose branch and PRs cannot be learned gets no scope toggle instead of a
 * wrong one. There is no cache — a branch or PR change is seen the next time
 * a surface asks.
 */
import { branchFromHead } from "./slug";
import { EMPTY_SCOPE, type RunScope } from "./runs";
import type { ReadProjectFile } from "./workspace";

export interface CurrentWork {
  branch: string | null;
  /** How `branch` was learned: `.git/HEAD` or the host's worktree list. */
  branchSource: "head" | "worktree" | null;
  /** PR numbers linked to the current session, in link order. */
  prNumbers: number[];
}

/**
 * The host workspace calls the detection needs, structurally: the SDK's
 * `host.listProjects` / `listWorktrees` / `listSessions` satisfy it, and a
 * fake satisfies it in tests without the SDK host.
 */
export interface WorktreeHost {
  listProjects(): Promise<{ projects: Array<{ id: string; directory: string }> }>;
  listWorktrees(projectId: string): Promise<{
    /** `branch` is null (or empty) for a detached worktree. */
    worktrees: Array<{ directory: string; branch: string | null }>;
  }>;
  listSessions(projectId: string): Promise<{
    sessions: Array<{
      id: string;
      links?: Array<{ url: string; kind: "issue" | "change" }>;
    }>;
  }>;
}

export interface CurrentWorkInput {
  directory: string | null;
  /** The open session, from `ready.session`; PR links need it. */
  session: { id: string } | null;
  readFile: ReadProjectFile;
  host: WorktreeHost;
}

/** `/pull/12` (GitHub), `/pull-requests/12` (Bitbucket), `/merge_requests/12` (GitLab) → 12. */
export function prNumberFromLink(url: string): number | null {
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== "https:" && parsed.protocol !== "http:") return null;
    const match = /\/(pull|pull-requests|merge_requests)\/(\d+)/.exec(parsed.pathname);
    const number = match ? Number.parseInt(match[2] ?? "", 10) : Number.NaN;
    return Number.isInteger(number) && number > 0 ? number : null;
  } catch {
    return null;
  }
}

/** True when `directory` is `root` itself or inside it, so a worktree finds its project. */
function coversDirectory(root: string, directory: string): boolean {
  if (!root) return false;
  return directory === root || directory.startsWith(root.endsWith("/") ? root : `${root}/`);
}

function projectForDirectory(
  projects: Array<{ id: string; directory: string }>,
  directory: string,
): string | null {
  return projects.find((project) => coversDirectory(project.directory, directory))?.id ?? null;
}

interface ProjectWorktree {
  /** True when the project's worktree list contains this exact directory. */
  owns: boolean;
  /** The branch that worktree is on, or null when it is detached. */
  branch: string | null;
  /** True when the host refused this project's worktree list. */
  failed: boolean;
}

/** One worktree list, answering "not owned" and "host failed" differently. */
async function readWorktree(
  input: CurrentWorkInput,
  projectId: string,
  directory: string,
): Promise<ProjectWorktree> {
  try {
    const worktrees = (await input.host.listWorktrees(projectId)).worktrees;
    const match = worktrees.find((worktree) => worktree.directory === directory);
    if (!match) return { owns: false, branch: null, failed: false };
    return {
      owns: true,
      branch: typeof match.branch === "string" && match.branch.length > 0 ? match.branch : null,
      failed: false,
    };
  } catch {
    return { owns: false, branch: null, failed: true };
  }
}

/** The worktree of `directory` inside one project's worktree list. */
async function worktreeInProject(
  input: CurrentWorkInput,
  projectId: string,
  directory: string,
): Promise<ProjectWorktree> {
  const first = await readWorktree(input, projectId, directory);
  // A refused read is not the same as "not owned": retry once for a transient
  // host failure before letting another project answer.
  return first.failed ? readWorktree(input, projectId, directory) : first;
}

/** The detection steps. May reject; `detectCurrentWork` is the surface entry point. */
async function detect(input: CurrentWorkInput): Promise<CurrentWork | null> {
  const directory = input.directory;
  if (!directory) return null;

  let branch: string | null = null;
  let branchSource: CurrentWork["branchSource"] = null;

  try {
    const head = await input.readFile(".git/HEAD");
    branch = branchFromHead(head.content);
    if (branch) branchSource = "head";
  } catch {
    // A worktree's `.git` is a file, so `.git/HEAD` is simply absent; the
    // branch comes from the host's worktree list below.
  }

  let projects: Array<{ id: string; directory: string }> | null = null;
  if (input.session || !branch) {
    try {
      projects = (await input.host.listProjects()).projects;
    } catch {
      // Without the project list there is no worktree branch and no PR lookup.
    }
  }

  let projectId = projects ? projectForDirectory(projects, directory) : null;

  if (!branch && projects) {
    // A worktree can sit outside its project's registered directory — a
    // sibling, or under a separate worktrees root — where the path no longer
    // spells out the project. The host still knows the relation, so ask each
    // project's worktree list, starting with the one the path named. A
    // detached worktree owns its directory without naming a branch; the
    // project still matters, because it holds the session's PR links.
    const ordered = projectId
      ? [projectId, ...projects.filter((project) => project.id !== projectId).map((p) => p.id)]
      : projects.map((project) => project.id);
    for (const candidate of ordered) {
      const worktree = await worktreeInProject(input, candidate, directory);
      if (worktree.failed || !worktree.owns) continue;
      projectId = candidate;
      if (worktree.branch) {
        branch = worktree.branch;
        branchSource = "worktree";
      }
      break;
    }
  }

  let prNumbers: number[] = [];
  if (projectId && input.session) {
    try {
      const sessions = await input.host.listSessions(projectId);
      const current = sessions.sessions.find((session) => session.id === input.session?.id);
      prNumbers = (current?.links ?? [])
        .filter((link) => link.kind === "change")
        .map((link) => prNumberFromLink(link.url))
        .filter((number): number is number => number !== null);
    } catch {
      // Session links are optional context; their absence leaves branch-only scoping.
    }
  }

  if (!branch && prNumbers.length === 0) return null;
  return { branch, branchSource, prNumbers };
}

/**
 * The one detection entry point surfaces use: any unexpected failure is
 * flattened to "nothing detected", so a half-built scope never reaches a
 * render.
 */
export async function detectCurrentWork(input: CurrentWorkInput): Promise<CurrentWork | null> {
  try {
    return await detect(input);
  } catch {
    return null;
  }
}

/** The scope a detection turns into: everything when nothing was detected. */
export function scopeOf(work: CurrentWork | null): RunScope {
  if (!work) return EMPTY_SCOPE;
  return { branch: work.branch, prNumbers: work.prNumbers };
}

/** The scope toggle's own words. Callers render it only with a detection. */
export function scopeLabel(work: CurrentWork): string {
  return work.branch ? "This branch" : "My pull requests";
}

/** One muted line naming what the scope keeps, so the toggle is never ambiguous. */
export function scopeNote(work: CurrentWork | null): string | null {
  if (!work) return null;
  const { branch, prNumbers } = work;
  const prs = prNumbers.map((number) => `#${number}`).join(", ");
  if (branch && prNumbers.length > 0) return `Runs on ${branch} and PR ${prs}`;
  if (branch) return `Runs on ${branch}`;
  return prNumbers.length > 0 ? `Runs for PR ${prs}` : null;
}
