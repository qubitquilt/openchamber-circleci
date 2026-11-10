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
  via: "head" | "worktree" | null;
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
    worktrees: Array<{ directory: string; branch: string }>;
  }>;
  listSessions(projectId: string): Promise<{
    sessions: Array<{
      id: string;
      links?: Array<{ url: string; kind: "issue" | "change" }>;
    }>;
  }>;
}

export interface CurrentWorkInput {
  directory: string;
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

function worktreeBranch(
  worktrees: Array<{ directory: string; branch: string }>,
  directory: string,
): string | null {
  const match = worktrees.find(
    (worktree) => worktree.directory === directory && worktree.branch.length > 0,
  );
  return match?.branch ?? null;
}

export async function currentWork(input: CurrentWorkInput): Promise<CurrentWork | null> {
  let branch: string | null = null;
  let via: CurrentWork["via"] = null;

  try {
    const head = await input.readFile(".git/HEAD");
    branch = branchFromHead(head.content);
    if (branch) via = "head";
  } catch {
    // A worktree's `.git` is a file, so `.git/HEAD` is simply absent; the
    // branch comes from the host's worktree list below.
  }

  let projectId: string | null = null;
  if (input.session || !branch) {
    try {
      projectId = projectForDirectory((await input.host.listProjects()).projects, input.directory);
    } catch {
      // Without the project list there is no worktree branch and no PR lookup.
    }
  }

  if (projectId && !branch) {
    try {
      branch = worktreeBranch(
        (await input.host.listWorktrees(projectId)).worktrees,
        input.directory,
      );
      if (branch) via = "worktree";
    } catch {
      // A host without worktree data cannot scope either; the toggle stays hidden.
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
  return { branch, via, prNumbers };
}

/** The scope a detection turns into: everything when nothing was detected. */
export function scopeOf(work: CurrentWork | null): RunScope {
  if (!work) return EMPTY_SCOPE;
  return { branch: work.branch, prNumbers: work.prNumbers };
}
