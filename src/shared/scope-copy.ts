/**
 * The scope toggle's user-facing words, kept apart from the detection that
 * feeds it: a copy change and a host/git change land in different files.
 */
import type { CurrentWork } from "./current-work";

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
