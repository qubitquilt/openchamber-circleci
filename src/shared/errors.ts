/**
 * One line of text for any thrown value.
 *
 * A CircleCI answer, a host refusal (`HostRequestError`) and a plain bug read
 * differently to the user, so they are separated here instead of every surface
 * repeating the same `instanceof` ladder.
 */
import { HostRequestError } from "@openchamber/sdk";

import { CircleCIError } from "./client";

const HOST_MESSAGES: Record<string, string> = {
  DISCONNECTED: "CircleCI is not connected. Add a personal API token in Settings → Integrations.",
  NO_INTEGRATION:
    "This extension is not connected to CircleCI. Add a token in Settings → Integrations.",
  NOT_GRANTED: "OpenChamber has not granted this extension that permission.",
  HOST_TIMEOUT: "OpenChamber did not hear back from CircleCI in time.",
  HOST_UNAVAILABLE: "This page is not running inside OpenChamber.",
  NO_DIRECTORY: "Open a project in OpenChamber first.",
  NO_SESSION: "Open or create a chat first.",
  SESSION_BUSY: "That chat is still working. Try again when it is idle.",
  DISABLED: "This extension is paused in Settings → Extensions.",
  BAD_PATH: "OpenChamber refused that API path.",
};

export function describeError(error: unknown): string {
  if (error instanceof CircleCIError) return error.message;
  if (error instanceof HostRequestError) {
    return HOST_MESSAGES[error.code] ?? error.message;
  }
  if (error instanceof Error) return error.message;
  return String(error);
}

export function hostCode(error: unknown): string | null {
  return error instanceof HostRequestError ? error.code : null;
}

export function isDisconnected(error: unknown): boolean {
  const code = hostCode(error);
  return code === "DISCONNECTED" || code === "NO_INTEGRATION";
}
