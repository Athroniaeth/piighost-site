/** Entity colouring, shared byte for byte by every piighost surface.
 *
 * Two facts travel on a detected value, and they use two different channels.
 *
 *   hue       which category the value belongs to. Assigned on first
 *             appearance and stable for a whole run, so the eye can follow one
 *             value from the input, to its placeholder, to the result.
 *
 * That is the whole of it. The intensity used to carry a second fact, whether
 * a value was still in clear or already masked, `valeur` pale against `jeton`
 * reinforced. That rule was retired on 22 September 2026: a value and its
 * placeholder now wear the same colour and the text alone says which is which.
 *
 * `jeton` is still generated and this site no longer asks for it. The two
 * levels stay in the contract because the hub and the local runner share this
 * file byte for byte. See brand/tokens/README.md in piighost-identite.
 *
 * Colours come from CSS classes, never from a `style` attribute: the
 * production CSP is `style-src 'self'` with no `unsafe-inline`. They are also
 * not Tailwind class strings, which had to be protected from the purger with
 * an `@source` directive; the hub records the day a .gitignore rule hid that
 * file and every chip rendered uncoloured.
 */

/** How many hues the palette holds. Eight, measured: at ten `DATE` and `ID`
 *  start to look alike, at twelve the greens merge. See entites.json. */
export const HUE_COUNT = 8;

/** Whether a value is still readable or has been replaced. */
export type ValueState = "valeur" | "jeton";

/** Parse a comma-separated labels field into a clean list: trimmed, no
 *  empties, deduplicated case-insensitively (first spelling wins). */
export function parseLabels(input: string): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const raw of input.split(",")) {
    const label = raw.trim();
    if (!label) continue;
    const key = label.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(label);
  }
  return out;
}

/** Assign a hue index to every label, by order of first appearance.
 *
 *  There are no fixed labels. `PERSON` is not pinned to a colour: what the
 *  mechanism has to guarantee is that two labels never share a hue inside one
 *  run, not that a screenshot taken last year matches this one. Past the
 *  eighth distinct label the palette cycles. */
export function assignHues(labels: string[]): Map<string, number> {
  const map = new Map<string, number>();
  let next = 0;
  for (const label of labels) {
    if (map.has(label)) continue;
    map.set(label, (next % HUE_COUNT) + 1);
    next++;
  }
  return map;
}

const pad = (hue: number) => String(hue).padStart(2, "0");

/** The class for a highlighted value: hue plus state. */
export function entityClass(hue: number, state: ValueState): string {
  return `entite-${pad(hue)}-${state}`;
}

/** The class for the solid dot used in result lists and charts. */
export function dotClass(hue: number): string {
  return `entite-${pad(hue)}-puce`;
}

/** Convenience: the class for a label, given an assignment map. */
export function classForLabel(
  label: string,
  hues: Map<string, number>,
  state: ValueState,
): string {
  return entityClass(hues.get(label) ?? 1, state);
}
