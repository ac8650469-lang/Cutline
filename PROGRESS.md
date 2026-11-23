# PROGRESS

## Phases
- [x] 1. Audit — empty folder; scaffolded Next 16.4.6 (App Router, React 19.3, Tailwind 4.3, Turbopack,
      `cacheComponents` + `partialPrefetching` on). Node 22, ffmpeg 9 (gyan full build), Chrome + Edge present.
- [x] 2. Creative direction — DESIGN.md
- [x] 3. Foundation — tokens, fonts, providers, primitives, nav, cursor, config, media pipeline (17 encoded clips)
- [x] 4. Sections — hero/reel, work, services, raw→final, principles, workflow, results, testimonials, FAQ,
      end card, footer; /work/[slug], /contact, /api/contact, 404, OG image, sitemap, robots, JSON-LD
- [x] 5. QA + critique round 1 — fixed: mobile overflow (tooltips), footer wordmark size, letterbox lag in the
      hero→reel cut, sparse work grid (added briefs), duplicated hero meta
- [x] 6. Round 2 + Lighthouse — font switch, CSS intro, deferred animation setup, lazy chunks, custom player,
      focus-trap fixes. Final: mobile 90–91 / 100 / 100 / 100, desktop 99 / 100 / 100 / 100
- [x] 7. README hand-off

## QA status (production build)
- `npm run qa`: 216/216 checks across 6 viewports × 4 pages; same with reduced motion (216/216).
- `npm run qa:interact`: 22/22 (filters, lightbox, menu focus trap, accordion, carousel, slider, form, API).
- `npm run contrast`: all text pairs pass. `tsc`, `eslint`, `next build`: clean.

## Decisions log
- Working name "Cutline" (the brief's example) instead of rendering `{{AGENCY_NAME}}`; §0 values in
  `src/config/site.ts`, each marked PLACEHOLDER.
- Rebranded to **Arteniq Creative** from the client's artwork: palette black/burgundy/white + logo crimson
  (`#D0103F`). Logo redrawn as SVG (`<Logo />`) so it stays sharp and themes with currentColor; no extra web font.
  Signal moved from orange to crimson, so the contrast rule flipped: text on paper is fine, small text on ink
  uses `signal-bright`; text on signal fills is paper. 404 moved to the burgundy ground. OG image is now a
  static crop of the supplied lockup (`src/app/opengraph-image.jpg`). sessionStorage keys `cutline:*` → `arteniq:*`.
- Research from prior knowledge of reference sites (no live browsing) to keep context lean.
- Demo footage: 12 Mixkit clips (free licence). Sources are 720p, so the reel is 720p, not 1080p.
  ffmpeg `drawtext` segfaults here (fontconfig) → no burned-in text; captions are DOM overlays.
- Kept `cacheComponents`: no Date/Math.random in render; dialogs close when their route is hidden.
- Pinned sections = CSS sticky + scrubbed ScrollTrigger (robust with Lenis, no pin spacers).
- Display font Fraunces → Instrument Serif (−~105 KB before first paint; mobile Perf 85 → 90).
- Hero intro and loader are CSS keyframes (no hydration dependency); supporting copy is visible at first paint.
- Below-the-fold GSAP setup runs only when a section nears the viewport (`useDeferredGSAP`): TBT 280 → ~40 ms.
- Lenis only on fine pointers; touch keeps native scroll and no per-frame loop.
- SplitText, Flip, the contact form, lightbox and showreel player load on demand.
- Native video controls replaced by a custom bar: Chrome's controls swallow Escape/Tab inside dialogs.
- Contact form uses Resend's REST API via `fetch` (no SDK). No WebGL; no Framer Motion.
- User chose to stay on the checked-out branch.

## Open issues
- Mobile Lighthouse LCP is 3.5 s simulated (target < 2.5 s); observed LCP is ~0.2 s. The remainder is
  ~250 KB of framework + GSAP JS on simulated slow 4G. Next step if needed: server-render the static sections
  (Manifesto, Results, Workflow) as server components with small motion islands, or load GSAP after first paint.
- All content is demo/placeholder until replaced (see README → Swap in real work).
- The project's `.claude/settings.json` denies reading `node_modules/**`, which also blocks the bundled Next docs
  that AGENTS.md points to; narrow it to code files if you want agents to read those docs.
