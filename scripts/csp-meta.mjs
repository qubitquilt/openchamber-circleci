/**
 * The canonical Content-Security-Policy meta tag for every entry HTML.
 *
 * `scripts/check-manifest.mjs` parses the meta out of each entry and asserts
 * the directives below. The build fails when an entry drifts, so a future
 * surface can't ship without a CSP and silently open the door to an injected
 * script or a remote image.
 *
 * `script-src 'self'`: bundles ship as `panel/*.js` and `background/*.js`,
 * loaded from the same origin. `'wasm-unsafe-eval'` is added when the SDK
 * needs it; today it does not.
 *
 * `style-src 'self' 'unsafe-inline'`: the host writes its variables onto the
 * root and the entry HTMLs carry a small inline `<style>`. Tightening this
 * means moving the inline rules into `SHARED_CSS`.
 *
 * `img-src data: https:`: this extension ships no remote image, but the rule
 * stays for a future one; `data:` covers anything inline.
 *
 * `connect-src 'none'`: every CircleCI call is `host.request`, which is
 * postMessage, not `fetch`. The host's own frame policy already restricts the
 * network; this is the stricter of the two and states the intent.
 *
 * `base-uri 'none'`, `form-action 'none'`: the surfaces have no `<base>` and
 * no forms; refusing both stops a misnested HTML block from quietly
 * re-pointing relative URLs.
 *
 * `frame-ancestors *`: OpenChamber embeds these surfaces; we do not pick the
 * ancestor.
 *
 * The literal:
 *
 *   <meta http-equiv="Content-Security-Policy" content="default-src 'none'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src data: https:; connect-src 'none'; base-uri 'none'; form-action 'none'; frame-ancestors *">
 */
export const CSP_DIRECTIVES = [
  "default-src 'none'",
  "script-src 'self'",
  "style-src 'self' 'unsafe-inline'",
  "img-src data: https:",
  "connect-src 'none'",
  "base-uri 'none'",
  "form-action 'none'",
  "frame-ancestors *",
].join("; ");
