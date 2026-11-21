import type { Aspect, Project } from "@/config/projects";

export type Slot = {
  /** Desktop (12 columns): explicit row + column, and vertical alignment inside the row. */
  row: number;
  start: number;
  span: number;
  align: "start" | "end";
  /** Mobile (4 columns). */
  mStart: number;
  mSpan: number;
};

/** Preferred desktop width (in columns) per aspect. Tall and square pieces stay narrow on purpose. */
const WIDTH: Record<Aspect, number> = { "16:9": 7, "1:1": 4, "9:16": 3, "21:9": 11 };

/**
 * Editorial composition for any filtered set. Items are paired into rows that alternate
 * heavy-left / heavy-right; 21:9 pieces take a row of their own; the shorter item of a pair is
 * bottom-aligned so rows stagger. Rows are explicit, so FLIP reflows are predictable.
 */
export function composeWork(items: Project[]): Slot[] {
  const out: Slot[] = [];
  let side = 0;
  let row = 1;
  let mobileSide = 0;
  const mobile = (a: Aspect) => {
    if (a === "16:9" || a === "21:9") return { mStart: 1, mSpan: 4 };
    const s = mobileSide;
    mobileSide ^= 1;
    return { mStart: s ? 2 : 1, mSpan: 3 };
  };

  for (let i = 0; i < items.length; ) {
    const a = items[i];
    const b = items[i + 1];

    if (a.aspect === "21:9") {
      out.push({ row, start: side ? 2 : 1, span: 11, align: "start", ...mobile(a.aspect) });
      side ^= 1;
      row++;
      i++;
      continue;
    }

    if (b && b.aspect !== "21:9") {
      let wa = WIDTH[a.aspect];
      let wb = WIDTH[b.aspect];
      while (wa + wb > 11) {
        if (wa >= wb) wa--;
        else wb--;
      }
      if (side === 0) {
        out.push({ row, start: 1, span: wa, align: "start", ...mobile(a.aspect) });
        out.push({ row, start: 13 - wb, span: wb, align: "end", ...mobile(b.aspect) });
      } else {
        // Mirror the row: first item on the right, second on the left (DOM order is unchanged).
        out.push({ row, start: 13 - wa, span: wa, align: "end", ...mobile(a.aspect) });
        out.push({ row, start: 2, span: wb, align: "start", ...mobile(b.aspect) });
      }
      side ^= 1;
      row++;
      i += 2;
      continue;
    }

    const w = Math.min(WIDTH[a.aspect] + 1, 8);
    out.push({ row, start: side ? 13 - w : 2, span: w, align: "start", ...mobile(a.aspect) });
    side ^= 1;
    row++;
    i++;
  }
  return out;
}
