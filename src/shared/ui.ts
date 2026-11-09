/**
 * The UI kit, tracked.
 *
 * Every surface rebuilds its DOM when its state changes, which means it removes
 * controls rather than updating them. The kit asks a caller to `dispose()` a
 * control it removes: a menu or select disposes an open popup, and that popup
 * holds window `resize`/`scroll` and document `pointerdown` listeners until it
 * closes. This module mounts the same controls under the same names, keeps
 * their handles, and `disposeMounted()` runs at the top of every render.
 *
 * The tracker is module-scoped because each surface is its own bundle and its
 * own iframe, so one list belongs to exactly one surface.
 */
import type { HostReadyContext } from "@openchamber/sdk";
import * as kit from "@openchamber/sdk/ui";

import { statusOf } from "./format";
import { host } from "./host";

/** The props of a kit mount, derived from its signature so no type drifts. */
type PropsOf<F> = F extends (root: Element, props: infer P) => unknown ? P : never;

type Tracked = { dispose: () => void };

const handles: Tracked[] = [];

function track<H extends Tracked>(handle: H): H {
  handles.push(handle);
  return handle;
}

/** Dispose every control mounted since the last render, then forget it. */
export function disposeMounted(): void {
  for (const handle of handles.splice(0)) {
    try {
      handle.dispose();
    } catch {
      // A control whose node is already gone has nothing left to release.
    }
  }
}

/* --------------------------------------------------------------- controls */

export const mountButton = (root: Element, props: PropsOf<typeof kit.mountButton>) =>
  track(kit.mountButton(root, props));

export const mountTextField = (root: Element, props: PropsOf<typeof kit.mountTextField>) =>
  track(kit.mountTextField(root, props));

export const mountSearchField = (root: Element, props: PropsOf<typeof kit.mountSearchField>) =>
  track(kit.mountSearchField(root, props));

export const mountSelect = (root: Element, props: PropsOf<typeof kit.mountSelect>) =>
  track(kit.mountSelect(root, props));

export const mountTabs = (root: Element, props: PropsOf<typeof kit.mountTabs>) =>
  track(kit.mountTabs(root, props));

export const mountBadge = (root: Element, props: PropsOf<typeof kit.mountBadge>) =>
  track(kit.mountBadge(root, props));

export const mountList = (root: Element, props: PropsOf<typeof kit.mountList>) =>
  track(kit.mountList(root, props));

export const mountEmpty = (root: Element, props: PropsOf<typeof kit.mountEmpty>) =>
  track(kit.mountEmpty(root, props));

export const mountSpinner = (root: Element, props?: PropsOf<typeof kit.mountSpinner>) =>
  track(kit.mountSpinner(root, props));

export const mountBanner = (root: Element, props: PropsOf<typeof kit.mountBanner>) =>
  track(kit.mountBanner(root, props));

export const mountMenu = (root: Element, props: PropsOf<typeof kit.mountMenu>) =>
  track(kit.mountMenu(root, props));

export const mountText = (root: Element, props: PropsOf<typeof kit.mountText>) =>
  track(kit.mountText(root, props));

export const mountSeparator = (root: Element, props?: PropsOf<typeof kit.mountSeparator>) =>
  track(kit.mountSeparator(root, props));

/* ----------------------------------------------------------------- pieces */

/**
 * A line of CircleCI's own prose: an error or a warning. It goes through the
 * kit's text control, which keeps it plain text but turns a markdown-style
 * link into a real one and hands the click to the host.
 */
export function providerNotice(text: string, className = "notice"): HTMLElement {
  const holder = document.createElement("div");
  holder.className = className;
  mountText(holder, { text, onOpenUrl: openUrl });
  return holder;
}

/** A block that shows a phase/outcome as the host's own badge. */
export function badgeEl(phase: string, outcome: string | null): HTMLElement {
  const holder = document.createElement("span");
  const status = statusOf(phase, outcome);
  mountBadge(holder, { label: status.label, tone: status.tone });
  return holder;
}

/** A centred loading ring that fills the space it is given. */
export function spinnerHolder(label: string): HTMLElement {
  const holder = document.createElement("div");
  holder.setAttribute("style", "flex:1; display:flex; align-items:center; justify-content:center;");
  mountSpinner(holder, { label });
  return holder;
}

/** Paint the host theme onto the frame root. Called on every `onReady`. */
export function applyTheme(ctx: HostReadyContext): void {
  kit.applyHostReady(ctx, document.documentElement);
  document.body.dataset.theme = ctx.theme.mode;
  document.body.dataset.surface = ctx.surface;
}

/** Open a link the way the host allows: only http(s), only through the host. */
export function openUrl(url: string | null): void {
  if (!url) return;
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== "https:" && parsed.protocol !== "http:") return;
  } catch {
    return;
  }
  void host.openUrl(url).catch(() => undefined);
}
