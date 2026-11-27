/**
 * Visual + functional QA across the six brief viewports.
 *
 *   npm run qa                      # against http://localhost:3100 (npm run build && npm run start -- -p 3100)
 *   QA_URL=http://localhost:3000 npm run qa
 *   QA_REDUCED=1 npm run qa         # emulate prefers-reduced-motion
 *   QA_SHOTS=0 npm run qa           # checks only, no screenshots
 *   QA_VP=1440,390 npm run qa       # subset of viewports (by width)
 *
 * Uses the installed Chrome (channel "chrome"), so no Playwright browser download is needed.
 * Prints one line per check and a pass/fail summary; screenshots go to qa/<viewport>/.
 */
import { chromium, type Page } from "playwright";
import { mkdirSync, writeFileSync } from "node:fs";

const BASE = process.env.QA_URL ?? "http://localhost:3100";
const SHOTS = process.env.QA_SHOTS !== "0";
const REDUCED = process.env.QA_REDUCED === "1";
const ALL: [number, number][] = [
  [1920, 1080],
  [1440, 900],
  [1024, 768],
  [768, 1024],
  [390, 844],
  [360, 740],
];
const only = process.env.QA_VP?.split(",").map(Number);
const VIEWPORTS = only ? ALL.filter(([w]) => only.includes(w)) : ALL;
const PAGES = ["/", "/contact", "/work/old-money-portland", "/this-clip-does-not-exist"];

type Row = { vp: string; page: string; check: string; ok: boolean; detail?: string };
const rows: Row[] = [];
const record = (vp: string, page: string, check: string, ok: boolean, detail?: string) => {
  rows.push({ vp, page, check, ok, detail });
  console.log(`${ok ? "PASS" : "FAIL"}  ${vp.padEnd(9)} ${page.padEnd(28)} ${check}${detail ? `  — ${detail}` : ""}`);
};

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function scrollThrough(page: Page) {
  await page.evaluate(async () => {
    const step = Math.round(window.innerHeight * 0.7);
    for (let y = 0; y < document.documentElement.scrollHeight; y += step) {
      window.scrollTo(0, y);
      await new Promise((r) => setTimeout(r, 90));
    }
    window.scrollTo(0, 0);
  });
  await wait(400);
}

/** Scroll so that `selector` sits at the top, plus `progress` of its scrollable (pinned) length. */
async function shot(page: Page, dir: string, name: string, selector: string, progress = 0) {
  const ok = await page.evaluate(
    ({ selector, progress }) => {
      const el = document.querySelector<HTMLElement>(selector);
      if (!el) return false;
      const top = el.getBoundingClientRect().top + window.scrollY;
      const extra = Math.max(0, el.offsetHeight - window.innerHeight) * progress;
      window.scrollTo(0, Math.round(top + extra));
      return true;
    },
    { selector, progress },
  );
  if (!ok) return;
  await wait(1300);
  await page.screenshot({ path: `${dir}/${name}.png` });
}

async function checks(page: Page, vp: string, path: string, consoleMsgs: string[], failed: string[]) {
  const r = await page.evaluate(() => {
    // clientWidth, not innerWidth: on mobile emulation an overflowing page widens innerWidth too.
    const vw = document.documentElement.clientWidth;
    const overflow = Math.max(document.documentElement.scrollWidth, window.innerWidth) - vw;
    const offenders = overflow > 1
      ? Array.from(document.querySelectorAll<HTMLElement>("body *"))
          .filter((el) => {
            const b = el.getBoundingClientRect();
            return b.width > 0 && b.right > vw + 1 && getComputedStyle(el).position !== "fixed";
          })
          .slice(0, 4)
          .map((el) => `${el.tagName.toLowerCase()}.${String(el.className).split(" ").slice(0, 2).join(".")}`)
      : [];
    const imgs = Array.from(document.images);
    const videos = Array.from(document.querySelectorAll("video"));
    const named = (el: Element) =>
      !!(el.getAttribute("aria-label") || el.getAttribute("aria-labelledby") || el.getAttribute("title") || el.textContent?.trim() || el.querySelector("img[alt]:not([alt=''])"));
    const unnamed = Array.from(document.querySelectorAll("a[href], button")).filter((el) => (el as HTMLElement).offsetParent !== null && !named(el));
    const ids = Array.from(document.querySelectorAll("[id]")).map((e) => e.id);
    const dupIds = ids.filter((id, i) => ids.indexOf(id) !== i);
    return {
      overflow,
      offenders,
      h1: document.querySelectorAll("h1").length,
      imgNoAlt: imgs.filter((i) => !i.hasAttribute("alt")).length,
      imgNoDims: imgs.filter((i) => !i.getAttribute("width") || !i.getAttribute("height")).map((i) => i.src.split("/").pop()),
      videoNoDims: videos.filter((v) => !v.getAttribute("width") || !v.getAttribute("height")).length,
      unnamed: unnamed.slice(0, 3).map((e) => e.outerHTML.slice(0, 80)),
      dupIds: [...new Set(dupIds)].slice(0, 5),
      lang: document.documentElement.lang,
      title: document.title,
    };
  });
  record(vp, path, "no horizontal overflow", r.overflow <= 1, r.overflow > 1 ? `${r.overflow}px · ${r.offenders.join(", ")}` : undefined);
  record(vp, path, "exactly one h1", r.h1 === 1, `found ${r.h1}`);
  record(vp, path, "images have alt", r.imgNoAlt === 0, r.imgNoAlt ? `${r.imgNoAlt} missing` : undefined);
  record(vp, path, "images have width/height", r.imgNoDims.length === 0, r.imgNoDims.slice(0, 3).join(", ") || undefined);
  record(vp, path, "videos have width/height", r.videoNoDims === 0, r.videoNoDims ? `${r.videoNoDims} missing` : undefined);
  record(vp, path, "links/buttons have names", r.unnamed.length === 0, r.unnamed.join(" | ") || undefined);
  record(vp, path, "no duplicate ids", r.dupIds.length === 0, r.dupIds.join(", ") || undefined);
  record(vp, path, "console clean", consoleMsgs.length === 0, consoleMsgs.slice(0, 3).join(" | ") || undefined);
  record(vp, path, "no failed requests", failed.length === 0, failed.slice(0, 3).join(" | ") || undefined);
}

async function main() {
  const browser = await chromium.launch({ channel: "chrome" });
  for (const [w, h] of VIEWPORTS) {
    const vp = `${w}x${h}`;
    const dir = `qa/${REDUCED ? "rm-" : ""}${vp}`;
    if (SHOTS) mkdirSync(dir, { recursive: true });
    const ctx = await browser.newContext({
      viewport: { width: w, height: h },
      reducedMotion: REDUCED ? "reduce" : "no-preference",
      isMobile: w < 768,
      hasTouch: w < 768,
    });
    // tsx/esbuild wraps named functions with __name(); give evaluated code a no-op version.
    await ctx.addInitScript({ content: "window.__name = (f) => f; " });

    for (const path of PAGES) {
      const page = await ctx.newPage();
      const consoleMsgs: string[] = [];
      const failed: string[] = [];
      const is404 = path.includes("does-not-exist");
      page.on("console", (m) => {
        if (m.type() !== "error" && m.type() !== "warning") return;
        if (is404 && m.text().includes("404")) return; // the expected 404 document itself
        consoleMsgs.push(`${m.type()}: ${m.text().slice(0, 160)}`);
      });
      page.on("pageerror", (e) => consoleMsgs.push(`pageerror: ${e.message.slice(0, 160)}`));
      page.on("requestfailed", (req) => {
        const err = req.failure()?.errorText ?? "";
        if (err.includes("ERR_ABORTED") && /\.(mp4|webm)(\?|$)/.test(req.url())) return; // media range requests cancelled on pause
        failed.push(`${err} ${req.url().replace(BASE, "")}`);
      });
      page.on("response", (res) => {
        if (res.status() >= 400 && !(is404 && res.url() === BASE + path)) failed.push(`${res.status()} ${res.url().replace(BASE, "")}`);
      });

      await page.goto(BASE + path, { waitUntil: "networkidle" });
      await wait(600);
      await scrollThrough(page);
      await checks(page, vp, path, consoleMsgs, failed);

      if (SHOTS && path === "/") {
        await shot(page, dir, "01-hero", "#top", 0);
        await shot(page, dir, "02-hero-mid", "#top", 0.3);
        await shot(page, dir, "03-reel", "#top", 0.85);
        await shot(page, dir, "04-work", "#work", 0);
        await page.evaluate(() => window.scrollBy(0, window.innerHeight * 0.9));
        await wait(1300);
        await page.screenshot({ path: `${dir}/05-work-grid.png` });
        await shot(page, dir, "06-services", "#services", 0);
        await shot(page, dir, "07-raw-final", "#raw-to-final", 0);
        await shot(page, dir, "08-principles", "#principles", 0);
        await shot(page, dir, "09-workflow", "#workflow", 0.15);
        await shot(page, dir, "10-workflow-late", "#workflow", 0.7);
        await shot(page, dir, "11-results", "#results", 0);
        await shot(page, dir, "12-testimonials", "#testimonials", 0);
        await shot(page, dir, "13-faq", "#faq", 0);
        await shot(page, dir, "14-endcard", "#start", 0);
        await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
        await wait(1200);
        await page.screenshot({ path: `${dir}/15-footer.png` });
      } else if (SHOTS) {
        const name = path === "/contact" ? "20-contact" : is404 ? "22-404" : "21-case-study";
        await page.evaluate(() => window.scrollTo(0, 0));
        await wait(900);
        await page.screenshot({ path: `${dir}/${name}.png` });
      }
      await page.close();
    }
    await ctx.close();
  }
  await browser.close();

  const failedRows = rows.filter((r) => !r.ok);
  mkdirSync("qa", { recursive: true });
  writeFileSync("qa/report.json", JSON.stringify(rows, null, 2));
  console.log(`\nQA summary: ${rows.length - failedRows.length} passed, ${failedRows.length} failed (${rows.length} checks)${REDUCED ? " [reduced motion]" : ""}`);
  process.exitCode = failedRows.length ? 1 : 0;
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
