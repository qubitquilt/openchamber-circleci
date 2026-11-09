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
