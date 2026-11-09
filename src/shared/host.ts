import { connectHost } from "@openchamber/sdk";

import type { RequestFn } from "./client";

/**
 * One host client per iframe. Every surface (rail panel, full-screen page,
 * attach dialog, background frame) gets its own sandbox, so this module is
 * imported once per bundle and never shared across surfaces.
 */
export const host = connectHost();

/**
 * The only outbound path the surfaces have. The host joins the path to the
 * `apiOrigin` declared in the manifest and attaches the bearer token, so no
 * page ever holds a CircleCI credential.
 */
export const request: RequestFn = async (input) =>
  host.request({
    method: input.method,
    path: input.path,
    ...(input.query ? { query: input.query } : {}),
    ...(input.body === undefined ? {} : { body: input.body }),
  });

/**
 * A toast that never fails its caller. A refused toast is not a reason to
 * break the action that produced it, and each surface also keeps its own
 * visible line for the rail.
 */
export async function notify(kind: "info" | "success" | "error", message: string): Promise<void> {
  try {
    await host.toast({ kind, message });
  } catch {
    // Nothing to do: the action already happened, and the surface keeps a line.
  }
}

/** The open project's files, shaped the way `workspace.ts` consumes them. */
export function readProjectFile(path: string): Promise<{ content: string }> {
  return host.readFile(path);
}
