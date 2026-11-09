/**
 * The smallest possible DOM helper.
 *
 * Nothing in this extension sets `innerHTML`. Text from CircleCI is untrusted,
 * so it reaches the page only through `textContent`, a UI kit control, or a
 * `<pre>` this module builds. There is deliberately no HTML-string entry point
 * to reach for later.
 */

export interface ElementProps {
  className?: string;
  /** Text content. Never HTML. */
  text?: string;
  title?: string;
  /** Inline style, limited to what layout needs. */
  style?: string;
  role?: string;
  ariaLabel?: string;
}

export type Child = Node | string | null | undefined | false;

export function el<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  props: ElementProps = {},
  ...children: Child[]
): HTMLElementTagNameMap[K] {
  const node = document.createElement(tag);
  if (props.className) node.className = props.className;
  if (props.text !== undefined) node.textContent = props.text;
  if (props.title) node.title = props.title;
  if (props.style) node.setAttribute("style", props.style);
  if (props.role) node.setAttribute("role", props.role);
  if (props.ariaLabel) node.setAttribute("aria-label", props.ariaLabel);
  for (const child of children) {
    if (child === null || child === undefined || child === false) continue;
    node.append(typeof child === "string" ? document.createTextNode(child) : child);
  }
  return node;
}

export function clear(node: Element): void {
  while (node.firstChild) node.removeChild(node.firstChild);
}

/** A layout row: `label` on the left in muted text, `value` on the right. */
export function metaRow(label: string, value: string | null | undefined): HTMLElement | null {
  if (!value) return null;
  return el(
    "div",
    { className: "meta-row" },
    el("span", { className: "meta-label", text: label }),
    el("span", { className: "meta-value", text: value }),
  );
}

/** A `<pre>` that wraps long lines instead of scrolling sideways. */
export function preformatted(text: string): HTMLElement {
  return el("pre", { className: "output" }, text);
}
