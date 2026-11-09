/**
 * Git remotes, CircleCI project slugs, and the web URLs CircleCI uses.
 *
 * CircleCI addresses a repository two different ways:
 *
 * - The API slug `vcs/org/repo` (`gh/acme/web`, `bb/acme/web`), which
 *   `GET /api/v3/projects?filter[slug]=` resolves to a project UUID.
 * - The web app path `app.circleci.com/pipelines/github/acme/web/123`, which
 *   spells the provider out and carries the run number.
 *
 * GitHub App and GitLab projects get `circleci/{numericOrgId}/{numericProjectId}`
 * API slugs and `circleci` web segments. Neither id is derivable from a git
 * remote, and v3 exposes only UUIDs, so those projects are resolved through the
 * picker instead of guessed here.
 */

export interface RepoRef {
  host: string;
  owner: string;
  repo: string;
}

export interface WebTarget {
  /** `github`, `bitbucket` or `gitlab` — the segment the web app uses. */
  segment: string;
  owner: string;
  repo: string;
}

const HOST_SEGMENTS: Record<string, string> = {
  "github.com": "github",
  "www.github.com": "github",
  "bitbucket.org": "bitbucket",
  "www.bitbucket.org": "bitbucket",
  "gitlab.com": "gitlab",
  "www.gitlab.com": "gitlab",
};

/** Parse `https://…`, `ssh://…` or `git@host:owner/repo` into its parts. */
export function parseGitRemote(url: string): RepoRef | null {
  let raw = url.trim();
  if (!raw) return null;

  // scp-like syntax: git@github.com:owner/repo.git (no scheme, colon before path).
  const scp = /^(?:[A-Za-z0-9_.-]+@)?([A-Za-z0-9.-]+):([^/]+)\/([^/]+)$/.exec(raw);
  if (scp && !raw.includes("://")) {
    raw = `https://${scp[1]}/${scp[2]}/${scp[3]}`;
  }

  let parsed: URL;
  try {
    parsed = new URL(raw);
  } catch {
    return null;
  }

  const host = parsed.hostname.toLowerCase();
  if (!host) return null;

  const segments = parsed.pathname
    .replace(/^\/+/, "")
    .replace(/\/+$/, "")
    .replace(/\.git$/i, "")
    .split("/")
    .filter(Boolean);
  if (segments.length < 2) return null;

  const owner = segments[segments.length - 2] ?? "";
  const repo = segments[segments.length - 1] ?? "";
  if (!owner || !repo) return null;
  return { host, owner, repo };
}

/** The API slugs worth trying for this remote. Empty means "use the picker". */
export function slugCandidates(ref: RepoRef): string[] {
  if (ref.host === "github.com" || ref.host === "www.github.com") {
    return [`gh/${ref.owner}/${ref.repo}`];
  }
  if (ref.host === "bitbucket.org" || ref.host === "www.bitbucket.org") {
    return [`bb/${ref.owner}/${ref.repo}`];
  }
  // GitLab and GitHub App projects use `circleci/{orgId}/{projectId}` ids that
  // a remote cannot supply, so there is no slug to try.
  return [];
}

/** `owner/repo`, used to match a remote against the project picker. */
export function ownerRepo(ref: RepoRef): string {
  return `${ref.owner}/${ref.repo}`;
}

export function webTarget(
  ref: RepoRef | null,
  fallbackOwner: string,
  fallbackRepo: string,
): WebTarget {
  const segment = (ref && HOST_SEGMENTS[ref.host]) || "github";
  return {
    segment,
    owner: ref?.owner ?? fallbackOwner,
    repo: ref?.repo ?? fallbackRepo,
  };
}

export function projectUrl(target: WebTarget): string {
  return `https://app.circleci.com/pipelines/${target.segment}/${target.owner}/${target.repo}`;
}

export function runUrl(target: WebTarget, runNumber: number): string {
  return `${projectUrl(target)}/${runNumber}`;
}

export function workflowUrl(target: WebTarget, runNumber: number, workflowId: string): string {
  return `${runUrl(target, runNumber)}/workflows/${workflowId}`;
}

export function jobUrl(
  target: WebTarget,
  runNumber: number,
  workflowId: string,
  jobNumber: number,
): string {
  return `${workflowUrl(target, runNumber, workflowId)}/jobs/${jobNumber}`;
}

/** The last path segment of a directory, used to spot a matching project name. */
export function directoryName(path: string): string {
  const trimmed = path.replace(/\/+$/, "");
  const parts = trimmed.split("/");
  return (parts[parts.length - 1] ?? "").toLowerCase();
}

/**
 * The remote URL out of a `.git/config`. `[remote "origin"]` wins; otherwise
 * the first `url` in any remote, because a clone whose default remote is
 * named something else still names the repository.
 */
export function gitRemoteFromConfig(config: string): string | null {
  let originUrl: string | null = null;
  let firstUrl: string | null = null;
  let section = "";
  for (const raw of config.split(/\r?\n/)) {
    const line = raw.trim();
    if (!line || line.startsWith("#") || line.startsWith(";")) continue;
    const header = /^\[([^\]]+)\]$/.exec(line);
    if (header) {
      section = (header[1] ?? "").trim().toLowerCase();
      continue;
    }
    const value = /^url\s*=\s*(.*)$/i.exec(line);
    if (!value) continue;
    const url = (value[1] ?? "").trim();
    if (!url) continue;
    if (firstUrl === null) firstUrl = url;
    if (/remote\s+"origin"/i.test(section) || /remote\s+'origin'/i.test(section)) {
      originUrl = url;
    }
  }
  return originUrl ?? firstUrl;
}

/** The branch out of a `.git/HEAD`, or null for a detached head. */
export function branchFromHead(head: string): string | null {
  const match = /^ref:\s*refs\/heads\/(.+)$/m.exec(head.trim());
  if (!match) return null;
  const branch = (match[1] ?? "").trim();
  return branch || null;
}
