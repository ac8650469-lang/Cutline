// Checks WCAG contrast for the token pairs the design actually uses.  node scripts/contrast.mjs
import { readFileSync } from "node:fs";

const css = readFileSync(new URL("../src/styles/tokens.css", import.meta.url), "utf8");
const token = (name) => {
  const m = css.match(new RegExp(`--color-${name}:\\s*(#[0-9a-fA-F]{6})`));
  if (!m) throw new Error(`token ${name} not found`);
  return m[1];
};
const lum = (hex) => {
  const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255).map((c) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};
const ratio = (a, b) => {
  const [x, y] = [lum(token(a)), lum(token(b))].sort((m, n) => n - m);
  return (x + 0.05) / (y + 0.05);
};

// [foreground, background, minimum, usage]
const pairs = [
  ["ink", "paper", 4.5, "body text"],
  ["mute", "paper", 4.5, "secondary text"],
  ["mute", "paper-2", 4.5, "secondary text on log panels"],
  ["ink", "paper-2", 4.5, "body on log panels"],
  ["paper", "ink", 4.5, "body text on ink"],
  ["mute-inv", "ink", 4.5, "secondary text on ink"],
  ["mute-inv", "ink-2", 4.5, "secondary text on dark panels"],
  ["signal", "paper", 4.5, "accent text on paper"],
  ["paper", "signal", 4.5, "button hover fills, cursor label, caption highlight"],
  ["signal-bright", "ink", 4.5, "accent text on ink"],
  ["paper", "wine", 4.5, "404 page"],
  ["log", "paper", 3, "unfilled principle words (large text only)"],
  ["signal", "ink", 3, "graphic only — never small text on ink (use signal-bright)"],
];

let fail = 0;
for (const [fg, bg, min, use] of pairs) {
  const r = ratio(fg, bg);
  const ok = r >= min;
  const graphicOnly = use.startsWith("graphic only");
  if (!ok && !graphicOnly) fail++;
  console.log(`${ok ? "PASS" : graphicOnly ? "NOTE" : "FAIL"}  ${fg.padEnd(9)} on ${bg.padEnd(8)} ${r.toFixed(2).padStart(5)}:1  (min ${min})  ${use}`);
}
console.log(fail ? `\n${fail} pair(s) below target` : "\nAll text pairs meet their targets.");
process.exitCode = fail ? 1 : 0;
