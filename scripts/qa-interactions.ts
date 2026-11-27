/**
 * Hands-on interaction checks (headless): lightbox, filters, mobile menu focus trap, accordion,
 * carousel keys, form validation + "not configured" state, and the contact API responses.
 *
 *   npm run qa:interact            # against http://localhost:3100
 */
import { chromium, type Page } from "playwright";
import { projects } from "../src/config/projects";

const SHORTS = projects.filter((p) => p.categories.includes("Shorts")).length;
const [FIRST, SECOND] = projects;

const BASE = process.env.QA_URL ?? "http://localhost:3100";
let pass = 0;
let fail = 0;
const check = (name: string, ok: boolean, detail = "") => {
  if (ok) pass++;
  else fail++;
  console.log(`${ok ? "PASS" : "FAIL"}  ${name}${detail ? `  — ${detail}` : ""}`);
};
const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));
const activeLabel = (page: Page) =>
  page.evaluate(() => {
    const el = document.activeElement as HTMLElement | null;
    return el ? `${el.tagName.toLowerCase()}:${(el.getAttribute("aria-label") || el.textContent || "").trim().slice(0, 40)}` : "none";
  });

async function main() {
  const browser = await chromium.launch({ channel: "chrome" });
  const init = { content: "window.__name = (f) => f; " };

  // ---------- Desktop ----------
  const desk = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  await desk.addInitScript(init);
  const page = await desk.newPage();
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  page.on("console", (m) => {
    // The deliberate submit against the unconfigured backend returns 503; the browser logs it.
    if (m.type() === "error" && !m.location().url.includes("/api/contact")) errors.push(m.text());
  });
  await page.goto(BASE + "/", { waitUntil: "networkidle" });

  // Filters re-flow the grid (FLIP) and update the live count.
  await page.locator("#work").scrollIntoViewIfNeeded();
  await page.getByRole("button", { name: /^Shorts/ }).click();
  await wait(1200);
  const visibleCards = await page.locator("#work li[data-flip-id]:not([data-hidden='true'])").count();
  check(`filter 'Shorts' shows ${SHORTS} card(s)`, visibleCards === SHORTS, `${visibleCards} visible`);
  check("filter button is pressed", (await page.getByRole("button", { name: /^Shorts/ }).getAttribute("aria-pressed")) === "true");
  await page.getByRole("button", { name: /^All/ }).click();
  await wait(1200);
  check(`filter 'All' restores ${projects.length} cards`, (await page.locator("#work li[data-flip-id]:not([data-hidden='true'])").count()) === projects.length);

  // Lightbox: opens as a dialog, arrow keys step, Escape closes and focus returns.
  const opener = page.getByRole("button", { name: FIRST.title, exact: true });
  await opener.click();
  const dialog = page.getByRole("dialog");
  await dialog.waitFor({ timeout: 5000 });
  check("lightbox opens as a modal dialog", (await dialog.getAttribute("aria-modal")) === "true");
  await page.keyboard.press("ArrowRight");
  await wait(300);
  check("ArrowRight steps to the next project", (await dialog.locator("h2").textContent())?.includes(SECOND.title) ?? false);
  for (let i = 0; i < 12; i++) await page.keyboard.press("Tab");
  check("focus stays inside the lightbox", await page.evaluate(() => !!document.activeElement?.closest("[role='dialog']")), await activeLabel(page));
  await page.keyboard.press("Escape");
  await wait(300);
  check("Escape closes the lightbox", (await page.getByRole("dialog").count()) === 0);
  check("focus returns to the card", (await activeLabel(page)).includes(FIRST.title), await activeLabel(page));

  // Accordion
  const faqBtn = page.getByRole("button", { name: "What's the turnaround?" });
  await faqBtn.scrollIntoViewIfNeeded();
  await faqBtn.click();
  check("FAQ item expands", (await faqBtn.getAttribute("aria-expanded")) === "true");

  // Testimonials carousel via keyboard
  const next = page.getByRole("button", { name: "Next testimonial" });
  await next.scrollIntoViewIfNeeded();
  await next.focus();
  await page.keyboard.press("ArrowRight");
  await wait(300);
  check("carousel moves with the arrow key", (await page.locator("#testimonials [aria-roledescription='slide']").getAttribute("aria-label")) === "2 of 3");

  // Raw → final slider by keyboard
  const slider = page.getByRole("slider").first();
  await slider.scrollIntoViewIfNeeded();
  await slider.focus();
  await page.keyboard.press("End");
  check("comparison slider responds to End", (await slider.getAttribute("aria-valuenow")) === "100");

  // Form: empty submit shows inline errors and focuses the first invalid field.
  const form = page.locator("#start form");
  await form.scrollIntoViewIfNeeded();
  await page.waitForSelector("#start form", { timeout: 8000 });
  await form.getByRole("button", { name: /Send the brief/ }).click();
  await wait(200);
  check("empty submit marks fields invalid", (await form.locator("[aria-invalid='true']").count()) >= 4);
  check("first invalid field is focused", (await page.evaluate(() => document.activeElement?.id)) === "end-name");
  await form.getByLabel("Name").fill("Test Person");
  await form.getByLabel("Email").fill("test@example.com");
  await form.getByLabel("Service").selectOption({ index: 1 });
  await form.getByLabel("The project").fill("A twelve minute documentary episode that needs a story edit and a grade.");
  await form.getByRole("button", { name: /Send the brief/ }).click();
  const status = form.locator("[role='status']");
  await wait(1500);
  const statusText = (await status.textContent()) ?? "";
  check("unconfigured backend never shows success", !/received|thanks/i.test(statusText) && /isn.t (configured|connected)/i.test(statusText), statusText.slice(0, 90));

  check("no runtime errors on the home page", errors.length === 0, errors.slice(0, 2).join(" | "));
  await desk.close();

  // ---------- Mobile menu ----------
  const mob = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
  await mob.addInitScript(init);
  const m = await mob.newPage();
  await m.goto(BASE + "/", { waitUntil: "networkidle" });
  await m.getByRole("button", { name: "Menu" }).click();
  const menu = m.getByRole("dialog", { name: "Menu" });
  await menu.waitFor();
  check("mobile menu opens", await menu.isVisible());
  for (let i = 0; i < 15; i++) await m.keyboard.press("Tab");
  check("menu traps focus", await m.evaluate(() => !!document.activeElement?.closest("#mobile-menu")), await activeLabel(m));
  await m.keyboard.press("Escape");
  await wait(300);
  check("Escape closes the menu", (await m.getByRole("dialog", { name: "Menu" }).count()) === 0);
  check("focus returns to the Menu button", (await activeLabel(m)).includes("Menu"));
  await mob.close();

  // ---------- API ----------
  const api = await browser.newContext();
  const post = (body: unknown) => api.request.post(BASE + "/api/contact", { data: body, failOnStatusCode: false });
  const bad = await post({ name: "", email: "nope" });
  check("API rejects invalid input with 400", bad.status() === 400);
  const good = await post({ name: "Test Person", email: "test@example.com", service: "Colour grading", message: "A short brand film that needs a grade and a mix.", budget: "", company: "" });
  const goodJson = (await good.json().catch(() => ({}))) as { error?: string };
  check("API without env vars answers 503 not_configured", good.status() === 503 && goodJson.error === "not_configured", `${good.status()} ${JSON.stringify(goodJson)}`);
  const bot = await post({ name: "Bot", email: "bot@example.com", service: "Colour grading", message: "Buy cheap followers now, best price, click here.", company: "spam.example" });
  check("API rejects a filled honeypot", bot.status() === 400);
  await api.close();

  await browser.close();
  console.log(`\nInteraction summary: ${pass} passed, ${fail} failed`);
  process.exitCode = fail ? 1 : 0;
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
