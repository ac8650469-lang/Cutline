@AGENTS.md

# Cutline site — working rules

Source of truth: `DESIGN.md` (concept, tokens, section table, copy) and `PROGRESS.md` (phase checklist,
decisions). After a compaction, re-read those two files, not the codebase.

## Stack
Next.js 16 App Router (Turbopack, `cacheComponents`), React 19, TypeScript strict, Tailwind v4,
GSAP + ScrollTrigger + SplitText + Flip via `@gsap/react`, Lenis, lucide-react, zod. Playwright (dev, uses
installed Chrome via `channel: "chrome"`).

## Commands
- `npm run dev` — dev server (run in background, never stream logs into context)
- `npm run build 2>&1 | tail -40` and `npm run lint`
- `npm run qa` — Playwright QA across 6 viewports (needs a running server on :3000)
- `bash scripts/encode-media.sh <source-dir>` — re-encode demo media into `public/media/demo/`
- `node scripts/contrast.mjs` — check token contrast ratios

## Folder rules
- `src/config/*` holds every piece of content. Components never hard-code copy that a client would change.
- `src/components/ui` primitives, `sections` page sections, `media` video components, `src/lib` hooks + GSAP setup.
- Media: `public/media/demo/<id>.mp4|.webm|.jpg|.avif`. Real work goes in `public/media/real/`.

## Do not
- Add another animation library (no Framer Motion, no Three.js), or component kits.
- Use raw hex values in components — tokens only (`bg-ink`, `text-mute`, `var(--signal)`).
- Animate anything except `transform`, `opacity`, `clip-path` (FAQ height uses grid rows).
- Use `new Date()` / `Math.random()` during render (cacheComponents prerender errors) — use effects.
- Use `usePathname`/`useSearchParams` in the root layout tree without a Suspense boundary.
- Fake a success state in the contact form, or remove Demo / placeholder labels while `isDemo` is true.
- Put signal (`#FF4D1C`) text on paper — it fails contrast. Signal is graphic-only on light grounds.
- Read `node_modules/`, `.next/`, lockfiles, or binary media.
