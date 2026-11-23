@AGENTS.md

# Arteniq Creative site — working rules

Source of truth: `DESIGN.md` (concept, tokens, section table, copy) and `PROGRESS.md` (phase checklist,
decisions). After a compaction, re-read those two files, not the codebase.

## Stack
Next.js 16 App Router (Turbopack, `cacheComponents`), React 19, TypeScript strict, Tailwind v4,
GSAP + ScrollTrigger via `@gsap/react` (SplitText/Flip through `loadSplitText()`/`loadFlip()` only), Lenis
(fine pointers only), lucide-react, zod. Playwright (dev, uses installed Chrome via `channel: "chrome"`).
Below-the-fold animation setup goes through `useDeferredGSAP` (src/lib/gsap.ts), not plain `useGSAP`.

## Commands
- `npm run dev` — dev server (run in background, never stream logs into context)
- `npm run build 2>&1 | tail -40` and `npm run lint`
- `npm run qa` / `npm run qa:interact` — Playwright QA (needs `npm run start -- -p 3100` running)
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
- Put signal (`#D0103F`) small text on ink — it fails contrast (3.8:1). Use `signal-bright` for accent text on ink;
  signal is fine as text on paper and as a fill under paper text.
- Hard-code button or emphasis colours — use the theme roles (`--btn-*`, `--accent`) so all three grounds work.
- Redraw the brand mark by hand in components — always use `<Logo />` (src/components/ui/Logo.tsx).
- Read `node_modules/`, `.next/`, lockfiles, or binary media.
