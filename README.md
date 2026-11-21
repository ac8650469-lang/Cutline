# Cutline — editing studio website

An editing and post-production studio site built around one idea, **"The Cut"**: the page behaves like an edit
timeline. Timecode is the UI language, sections enter with hard wipes instead of fades, and media starts in a
flat "log" state and grades to full contrast as it reaches the centre of the screen.

- **Stack:** Next.js 16 (App Router, Turbopack, Cache Components) · React 19 · TypeScript (strict) · Tailwind CSS v4 ·
  GSAP + ScrollTrigger (SplitText and Flip load on demand) · Lenis (pointer devices only) · zod · lucide-react
- **Design system and section plan:** [`DESIGN.md`](DESIGN.md) · **build log and decisions:** [`PROGRESS.md`](PROGRESS.md)

> Everything you see is demo content: the footage is licensed stock, the projects, clients, statistics and
> testimonials are samples, and each is labelled as such on the page. See “Swap in real work” below.

## Setup

```bash
npm install
npm run dev            # http://localhost:3000
npm run build && npm run start   # production
npm run lint
```

Node 20+ (built on 22). `ffmpeg` is only needed to re-encode media.

## Contact form

The form posts to `POST /api/contact`, which validates with the same zod schema as the browser
(`src/lib/contact-schema.ts`) and sends the brief through [Resend](https://resend.com)'s REST API.

Create `.env.local`:

```bash
RESEND_API_KEY=re_xxxxxxxx          # required
CONTACT_TO_EMAIL=you@yourstudio.com # required — where briefs arrive
CONTACT_FROM_EMAIL="Cutline <briefs@yourdomain.com>"  # optional; a sender on a domain verified in Resend
```

Without `RESEND_API_KEY` and `CONTACT_TO_EMAIL` the API answers `503 { "error": "not_configured" }` and the form
says so (in development it names the missing variables). It never shows a success message unless Resend accepted
the email. Without `CONTACT_FROM_EMAIL` it uses Resend's test sender, which only delivers to your own Resend account
address. A hidden honeypot field rejects simple bots.

## Swap in real work

All content lives in `src/config/`. Components never hard-code client copy.

| What | Where |
|---|---|
| Studio name, email, WhatsApp, socials, city + time zone, site URL | `src/config/site.ts` (every value marked `PLACEHOLDER`) |
| Projects (work grid, lightbox, case studies, sitemap) | `src/config/projects.ts` |
| Services and budget ranges | `src/config/services.ts` |
| Raw → final tabs, principles, workflow, stats, testimonials, FAQ | `src/config/content.ts` |
| Hero / end-card lines, showreel files | `src/config/site.ts` → `hero`, `endCard`, `reel` |

- **Projects:** replace an entry, point `src` at your files (for example `/media/real/my-film.mp4`) and set
  `isDemo: false`. That removes its “Demo” tags. `aspect` (16:9, 9:16, 1:1, 21:9) drives the grid composition.
- **Statistics:** set real numbers in `stats` and `isPlaceholder: false` to remove the `[ADD REAL FIGURE]` labels.
- **Testimonials:** replace the quotes, names and `mark` (initials for the brand-mark slot), then set `isDemo: false`.
- **Showreel:** replace `reel.src` / `reel.mobile` (the mobile cut is 4:5) and write captions into
  `public/media/demo/reel.vtt` (or point `reel.captions` at your own file).
- **Raw → final:** each tab takes a `before` and `after` clip. The colour demo's “log” clip is simulated; use a
  real log/raw export if you have one.

## Media pipeline

`scripts/encode-media.sh` turns source clips into what the site serves: 6-second H.264 + VP9 preview loops with no
audio (most under 1 MB), AVIF + JPG posters, aspect crops (16:9, 21:9, 9:16, 1:1, 4:5), a simulated "log" version
for the grading demo, a jump-cut "fine cut" for the pacing demo, and a 14-second showreel montage cut to a 24 fps
rhythm.

```bash
bash scripts/encode-media.sh path/to/source-clips            # → public/media/demo
bash scripts/encode-media.sh path/to/masters public/media/real
```

Edit the table at the top of the `loop` calls (slug, source id, aspect, in-point, duration, crop position) to
point at your own clips. Demo footage credits and licence: `public/media/demo/CREDITS.md`.

Playback rules (`src/lib/video.ts`): videos load with `preload="none"` behind posters, start only after the page
is idle, at most two play at once, and nothing autoplays under `prefers-reduced-motion` or Save-Data. A pause
control in the nav stops all background video (WCAG 2.2.2).

## QA

```bash
npm run build && npm run start -- -p 3100   # in one terminal
npm run qa            # 6 viewports × 4 pages: overflow, h1, alt, media dimensions, names, duplicate ids, console, failed requests + screenshots in qa/
QA_REDUCED=1 npm run qa                     # same with prefers-reduced-motion
npm run qa:interact   # filters, lightbox focus/keys, menu focus trap, accordion, carousel, slider, form states, API
npm run contrast      # WCAG contrast for every token pair in use
npx lighthouse http://localhost:3100 --view
```

The QA scripts use your installed Chrome (`channel: "chrome"`), so no Playwright browser download is needed.

## Notes

- **Cache Components is on** (the Next 16 scaffold default). Don't call `new Date()` / `Math.random()` while
  rendering; the clock and year use `useSyncExternalStore`, and the generated waveforms use a seeded PRNG.
- Routes stay alive in the background between navigations, so dialogs close themselves when their page is hidden.
- Pinned sections (hero → reel, workflow) use CSS `position: sticky` with scrubbed ScrollTriggers.
- Fonts: Instrument Serif (display), Geist (text), Geist Mono (timecode/metadata), via `next/font`.
