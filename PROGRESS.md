# PROGRESS

## Phases
- [x] 1. Audit — empty folder; scaffolded Next 16.4.6 (App Router, React 19.3, Tailwind 4.3, Turbopack,
      `cacheComponents` + `partialPrefetching` on). Node 22, ffmpeg 9 (gyan full build), Chrome + Edge present.
- [x] 2. Creative direction — DESIGN.md
- [ ] 3. Foundation — tokens, fonts, providers, primitives, nav, cursor, config, media pipeline
- [ ] 4. Sections
- [ ] 5. QA + critique round 1
- [ ] 6. Refine round 2 + Lighthouse
- [ ] 7. README hand-off

## Decisions log
- Working name "Cutline" (the brief's own example) instead of rendering `{{AGENCY_NAME}}` in a 14rem
  wordmark. All §0 values live in `src/config/site.ts`, each marked as placeholder.
- Research done from prior knowledge of reference sites (no live browsing) to keep context lean.
- Demo footage: 12 clips from Mixkit (free licence), 720p sources → reel is encoded at 720p, not 1080p.
  ffmpeg `drawtext` segfaults on this machine (fontconfig) → no burned-in text; captions are DOM overlays.
- Kept scaffold defaults (`cacheComponents`). Consequences: no `new Date()`/`Math.random()` during
  render (clock + year set in effects); `usePathname` avoided in the shared layout.
- Contact form uses Resend's REST API via `fetch` (no SDK dependency).
- No WebGL: grain is CSS. No Framer Motion. Single engine = GSAP (ScrollTrigger, SplitText, Flip).
- Pinned sections use CSS `position: sticky` + scrubbed ScrollTrigger (robust with Lenis).
- User chose to stay on the checked-out branch (no feature branch).

## Open issues
- (none yet)
