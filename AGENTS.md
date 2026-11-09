# Working in this repository

An OpenChamber extension for CircleCI. Read `README.md` first for what ships and how it is installed.

## The one rule

**OpenChamber never compiles this code.** It loads the built `.js` files as they sit on disk. A change to
`src/` is invisible until `npm run build` runs, and a change that is not committed never reaches a Git or
zip install. Run `npm run check`, which lints, format-checks, typechecks, checks the manifest, builds and
tests.

## Layout

```
src/shared/     code every surface shares: the API client (`client.ts`), the wire and view types
                (`types.ts`), status/time formatting (`format.ts`), git remotes and web URLs (`slug.ts`),
                storage and its sanitizers (`storage.ts`), project resolution (`workspace.ts`), chip
                builders (`chips.ts`), the stylesheet (`styles.ts`), the DOM helper (`dom.ts`), error
                text (`errors.ts`) and the host client (`host.ts`)
src/panel/      the rail panel        -> panel/main.js
src/page/       the full-screen page  -> panel/page.js
src/attach/     the + picker          -> panel/attach.js
src/background/ the resolver frame    -> background/main.js
panel/*.html    one entry per surface, each loading its own built bundle
test/           node:test suites for the pure logic
scripts/        the manifest check and the canonical CSP
```

`src/shared/client.ts`, `format.ts`, `slug.ts` and `storage.ts` must stay free of DOM work at import time
so they can be bundled for `npm test` and run under Node. `test/harness.mjs` boots the real built bundles
in a jsdom iframe against a fake host, so it catches a surface that throws on mount.

## Conventions

- A surface talks to CircleCI only through `src/shared/client.ts`. The transport is `host.request`, which
  the host points at the manifest's `apiOrigin` and authenticates. Never reach for `fetch`: the sandbox
  has no network.
- Render with `@openchamber/sdk/ui` first. Reach for `src/shared/dom.ts` `el()` only for layout the kit
  has no block for, and style it with the host's own variables so light and dark both follow the app.
- Every async paint takes a render token and drops its result when a newer load started. The panel, the
  page, the picker and the background frame all load independently and would otherwise overwrite each
  other.
- Errors from the API surface as a banner or a toast, never as a silent blank screen. `describeError()`
  turns any thrown value into one line of text.
- Status never lies. v3 declares `phase` and `outcome` as free strings, so unfamiliar values render in
  their own words in a neutral tone, never as a guessed green or red.
- Polling is armed only while something on screen may move. A background frame never polls.

## UI kit rules

- `applyHostReady` runs on **every** `onReady`, because the user can switch the theme while a panel is
  open. Mounting happens once, guarded by a `booted` flag.
- Every control is mounted through `src/shared/ui.ts`, which keeps the handle. `render()` calls
  `disposeMounted()` before it clears the root: the kit asks a caller to dispose a control it removes,
  and an open menu or select holds window `resize`/`scroll` listeners until it closes.
- Tabs, selects and text/search fields never commit their own value. Each `onChange` stores it in state
  and calls `update({ value })` on the handle — for a search field that is also what makes Escape and
  the clear button work, because the control only reports the clear.
- The runs list and its filter tabs are mounted once per visit and repainted through their handles
  (`runsView.paint()`), so a filter click does not rebuild the panel around the tab the user is on. The
  kit refocuses the active tab after `onChange`, which is what keeps arrow-key navigation working.
- Provider prose (errors and warnings) goes through `providerNotice`, which mounts the kit's text control
  and hands markdown-style links to `host.openUrl`. Every other string from CircleCI is plain
  `textContent`: no `innerHTML`, and no link guessed from a bare URL.
- No kit control is restyled. Custom CSS only adds layout classes (`.job-row`, `.meta-grid`, `.notice`)
  and uses the host's variables, including `--error-text` for tinted text.

## Trust boundaries

- **Inbound trust.** Everything from CircleCI is untrusted. Text reaches the page only through
  `textContent`, a UI kit control, or a `<pre>` built by `el()`. There is deliberately no HTML-string
  entry point.
- **Outbound trust.** A surface's only egress is `host.request`, limited to `https://circleci.com/api/v3`.
  `src/shared/client.ts` is the route table; a new call belongs there and nowhere else.
- **Credential trust.** The token lives in OpenChamber's integration store. It never reaches a page, a
  chip, `host.storage` or a log line.
- **File trust.** `files` exists for `.git/config` and `.git/HEAD`. Read them, never write. A path outside
  the open project would need the `filesystem` capability, which this extension does not ask for.
- **Storage trust.** Reads pass through a sanitizer in `src/shared/storage.ts`. The project link records
  the directory it was written for, so a hash collision is detected instead of showing another
  repository's pipelines. A new key needs a sanitizer and a test.
- **POST trust.** Only `GET` is retried. A `POST` that times out may have succeeded, and rerunning or
  firing again would duplicate the action.

## Before calling a task done

```sh
npm run check
```

Then load the folder in **Settings → Extensions**, connect a token, and confirm each surface: the panel
resolves the project and lists runs, a run drills into workflows and jobs, a hold can be approved, a
workflow can be rerun from failed and cancelled, a run can be fired on a branch, a failed job attaches
with its output, a worktree chat starts from it, the `+` picker attaches, the page renders, `/circleci
123` attaches, and the session action toasts. Report which of those you exercised.
