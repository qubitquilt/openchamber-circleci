# OpenChamber extension for CircleCI

CircleCI inside OpenChamber: a rail panel that lists runs and drills into their workflows and jobs, an
attach picker behind the composer's `+` menu, a `/circleci` slash command, and a full-screen runs page.
A failing job's condensed output travels with the chip, so the agent starts from the real error.

## What you get

| Surface                 | How you reach it                            | What it does                                                                                                |
| ----------------------- | ------------------------------------------- | ----------------------------------------------------------------------------------------------------------- |
| Rail panel              | the CircleCI icon on the right-hand rail    | the project's runs, then a run's workflows, then a workflow's jobs, then a job's steps and condensed output |
| Attach picker           | `+` next to the chat box                    | runs on the left, the run's workflows on the right, Attach as a chip or start a worktree chat               |
| `CircleCI Runs` page    | Extension pages menu above the session list | runs and their workflows side by side, jobs inline, for a run with too many workflows to read in the rail   |
| `/circleci 123`         | the chat box                                | attaches that run as a chip without opening anything                                                        |
| `Check CircleCI status` | the `⋯` menu on a session                   | toasts the newest run for that session's project, without opening a window                                  |
| Badge on the rail icon  | —                                           | the number of failed runs in the list you last loaded                                                       |

Actions: approve or reject a hold, rerun a workflow (all jobs or only the failed ones), cancel a
workflow, fire a new run on a branch or tag, open anything in the CircleCI web app, attach a workflow or
a failed job to the chat, and start a worktree chat with the failure attached as its first message.

## Install

1. Run OpenChamber on web or desktop and open **Settings → Extensions**.
2. Paste the absolute path of this folder and click **Add**, then approve the capability list:
   `prompt`, `sessions`, `files` and the one network origin, `https://circleci.com`.
3. Open **Settings → Integrations**, find the **CircleCI** card, and paste a personal API token created at
   <https://app.circleci.com/settings/user/tokens>.
4. Click the CircleCI icon on the rail. The first time in a project it either works out which CircleCI
   project the repository belongs to, or asks you to pick one.

A folder install runs from this folder, so edit, `npm run build`, and reload. A Git install copies the
folder instead, so commit the built `panel/*.js` and `background/main.js` and bump `version` to ship an
update.

## Authentication: no local service, no token in the page

CircleCI API v3 requires `Authorization: Bearer <personal-api-token>` and accepts no other scheme, which
is exactly what OpenChamber sends for a `scheme: "bearer"` token integration. So the token lives in
OpenChamber's integration store, OpenChamber attaches it to every `host.request`, and this extension
never sees it. Nothing runs outside the sandbox; there is no local process.

Every feature call is API v3. CircleCI has no flat v3 user object, so the Integrations card shows the
extension name but not the account name; the panel asks `GET /api/v3/users?filter[user_id]=me` and shows
the login in its own header.

### Removing the token

The token is removed on the **CircleCI** card in **Settings → Integrations**. The panel's _Disconnect
CircleCI_ item asks the host to drop the connection, but the SDK documents that call for OAuth and Linear
tokens, not for a pasted token, so the panel does not assume it worked. The screen returns to the connect
state only when OpenChamber reports the connection gone; until then the panel says where to clear the card.

## Which CircleCI project

v3 keys everything by project UUID, and the project entity carries no slug, so this is a resolution step
rather than a lookup. In order:

1. A link already saved for this OpenChamber project directory.
2. The git remote in `.git/config` → `gh/owner/repo` (or `bb/owner/repo`) →
   `GET /api/v3/projects?filter[slug]=`. CircleCI's own documentation uses this slug form to resolve a
   project id.
3. The picker: every organization you belong to (`GET /api/v3/orgs`), then that organization's projects
   (`GET /api/v3/projects?filter[org_id]=`), pre-filtered by the detected `owner/repo`.

The choice is saved per directory in the extension's storage. The extension only ever **reads** two
files, `.git/config` and `.git/HEAD` (the second to prefill the branch in the run form); it never writes
one.

GitLab and GitHub App projects use `circleci/{numericOrgId}/{numericProjectId}` slugs that a git remote
cannot supply, so those land on the picker. A worktree's `.git` is a file pointing outside the project,
which would need the `filesystem` capability; those also land on the picker.

## Developing

```sh
npm ci
npm run check      # lint, format check, typecheck, manifest check, build, tests
npm run build      # rebuild the bundles OpenChamber loads
npm test           # builds the bundles, then runs the unit and surface suites
```

`test/surfaces.test.mjs` boots every built bundle in a jsdom iframe against a fake OpenChamber host
(`test/harness.mjs`): it pushes a `ready` context, answers `storage`, `request` and `file-read`, and
drives clicks and keys, so a surface that throws on mount, forgets to answer its first API call, or
leaves a control undisposed fails here. It also pins the UI kit contract: a filter tab repaints the list
without rebuilding the panel, an arrow key moves the filter and keeps focus, and clearing a search field
empties both the input and the rows.

OpenChamber never compiles TypeScript. The built bundles are what ship:

| Source                   | Built file           | Loaded by                                                   |
| ------------------------ | -------------------- | ----------------------------------------------------------- |
| `src/panel/main.ts`      | `panel/main.js`      | `panel/index.html`, the rail panel                          |
| `src/page/main.ts`       | `panel/page.js`      | `panel/page.html`, the full-screen page                     |
| `src/attach/main.ts`     | `panel/attach.js`    | `panel/attach.html`, the `+` picker                         |
| `src/background/main.ts` | `background/main.js` | `background/index.html`, `/circleci` and the session action |

`src/shared/` holds everything the surfaces share. `src/shared/client.ts` is the only file that knows a
CircleCI route, an envelope field or a wire name.

## API surface

All calls are under `https://circleci.com/api/v3`, made through `host.request`. CircleCI's token never
leaves OpenChamber.

| Call                 | Route                                                        |
| -------------------- | ------------------------------------------------------------ |
| `currentUser`        | `GET /users?filter[user_id]=me`                              |
| `listOrgs`           | `GET /orgs`                                                  |
| `findProjectBySlug`  | `GET /projects?filter[slug]=`                                |
| `listProjectsOfOrg`  | `GET /projects?filter[org_id]=`                              |
| `listPipelines`      | `GET /pipelines?filter[project_id]=`, then one detail per id |
| `listRuns`           | `GET /runs?filter[project_id]=`                              |
| `listMyRuns`         | `GET /runs?filter[user_id]=me`                               |
| `getRun`             | `GET /runs/{id}`                                             |
| `fireRun`            | `POST /runs`                                                 |
| `listWorkflows`      | `GET /workflows?filter[run_id]=`                             |
| `listJobs`           | `GET /jobs?filter[workflow_id]=`                             |
| `getJob`             | `GET /jobs/{id}`                                             |
| `condensedOutput`    | `GET /jobs/{id}/stdout/condensed`                            |
| `rerunWorkflow`      | `POST /workflows/{id}/rerun`                                 |
| `cancelWorkflow`     | `POST /workflows/{id}/cancel`                                |
| `approve` / `reject` | `POST /approvals/{id}/approve` / `reject`                    |

The rules that shaped the client:

- A collection is `{"data": [...], "page": {"next"}}`. `page.next` is an opaque cursor and goes back as
  `page[cursor]` **alone** — some routes reject a cursor sent next to a new `page[limit]`.
- Out-of-range `page[limit]` is a 400, not a clamp, so a bounded list retries once without the limit.
- `phase` and `outcome` are free strings in v3, not enums, so an unknown status renders as its own words
  in a neutral tone rather than a wrong colour.
- Only `GET` is retried. v3 warns a replayed `POST` can fire an action twice, so a timed-out rerun or
  trigger is reported, never resent.
- `host.request` exposes no response headers, so `Retry-After`, `ETag` and the `RateLimit` headers are
  unavailable. Rate limits therefore use a fixed backoff, and there are no conditional requests.

## Polling

Polling is state-driven, not a timer: a 30-second poll is armed only while a run, workflow or job on
screen may still move. An idle panel costs nothing. The frame is unloaded when the rail panel closes,
which is what stops the timer — the sandbox has no reliable visibility signal to lean on. The project
menu has **Pause auto-refresh**.

## Capabilities

The extension asks for `prompt`, `sessions` and `files`; `network` is added automatically because the
manifest declares an integration.

- `prompt` and `sessions` cover `host.attach`, `host.startSession` and `host.prompt`.
- `files` is `.git/config` and `.git/HEAD`, read only, to detect the repository and its branch.

## Limits

- **CircleCI Cloud only.** `integration.token.apiOrigin` is fixed at install, so CircleCI Server
  (self-hosted) would need a local service that holds the token and picks the origin at runtime.
- **GitHub App project links.** `app.circleci.com/pipelines/github/{owner}/{repo}/{n}` is right for
  GitHub OAuth projects; GitHub App projects use `circleci/{numericOrgId}/{numericProjectId}` and v3
  exposes only UUIDs. The panel shows the run number so it can still be found in the app.
- **`POST /runs/search` is not used.** Its schema demands `filter`, `order_by`, `page.cursor` and
  `page.limit` together, which reads like a trap.
- **No `contributes.links` or `providerLogos`.** OpenChamber documents both, but SDK 2.7.0's schema does
  not carry them, so the host would never see a declaration.
- **No webhook-driven notifications.** That needs a public endpoint or a long-running service.

## Security

The token stays in OpenChamber and never enters a page, `host.storage` or a chip. Every entry HTML
carries a `Content-Security-Policy` meta with `connect-src 'none'`: the surfaces make no direct network
call, and every CircleCI request is `host.request` postMessage. `host.request` paths are limited to the
one approved origin. Strings from CircleCI reach the page only as text — nothing sets `innerHTML` — and
job output is shown in a `<pre>`.

Report a vulnerability through the repository's issue tracker.
