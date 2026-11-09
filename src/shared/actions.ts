/**
 * The host side of a chip.
 *
 * Kept apart from `chips.ts` so the text, the data round trip and the limits
 * are pure and testable, and the only module that needs the OpenChamber SDK is
 * this thin wrapper.
 */
import type { AttachIssueRequest } from "@openchamber/sdk";

import {
  PROVIDER_ID,
  chipDataJson,
  chipId,
  chipPrompt,
  chipText,
  chipTitle,
  chipUrl,
  type ChipSource,
} from "./chips";
import { host } from "./host";

export type { ChipSource } from "./chips";

/** The one request every attach path uses: chip, worktree chat, and `/circleci`. */
export function attachRequest(source: ChipSource): AttachIssueRequest {
  return {
    providerId: PROVIDER_ID,
    id: chipId(source).slice(0, 128),
    title: chipTitle(source),
    url: chipUrl(source),
    kind: "issue",
    text: chipText(source),
    data: chipDataJson(source),
  };
}

/** Attach as a chip on the composer. Replaces whatever chip is there. */
export async function attachChip(source: ChipSource): Promise<void> {
  await host.attach(attachRequest(source));
}

/** Start a fresh chat in a worktree, with this chip and a first message. */
export async function startSessionFrom(source: ChipSource): Promise<void> {
  await host.startSession({
    ...attachRequest(source),
    worktree: true,
    navigation: "open",
  });
}

/** Ask the open chat to look at this failure without attaching anything. */
export async function promptAbout(source: ChipSource): Promise<void> {
  await host.prompt({ text: chipPrompt(source), send: true });
}
