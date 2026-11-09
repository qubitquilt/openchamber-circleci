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

export interface StartSessionOptions {
  /** Default true: a build fix belongs in its own worktree. */
  worktree?: boolean;
  /** Default "open": the new chat is what the user wants to see. */
  navigation?: "preserve" | "open";
}

/** Start a fresh chat with this chip and a first message. */
export async function startSessionFrom(
  source: ChipSource,
  options: StartSessionOptions = {},
): Promise<void> {
  await host.startSession({
    ...attachRequest(source),
    worktree: options.worktree ?? true,
    navigation: options.navigation ?? "open",
  });
}

export interface PromptOptions {
  /** Default true. False puts the text in the composer without sending it. */
  send?: boolean;
}

/** Put the failure in the open chat, sending it by default. */
export async function promptAbout(source: ChipSource, options: PromptOptions = {}): Promise<void> {
  await host.prompt({ text: chipPrompt(source), send: options.send ?? true });
}
