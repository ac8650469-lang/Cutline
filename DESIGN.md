# DESIGN — Cutline (working name)

## 1. Concept: "The Cut" — twenty-four decisions a second

Film runs at 24 frames a second, and every frame is kept or cut on purpose. The site behaves like an
edit: the page is a timeline, sections are scenes, and moving between them is a cut, never a fade.

- **Timecode is the UI language.** The nav runs a live `HH:MM:SS:FF` timecode driven by scroll, plus the
  current scene (`SC.04 SERVICES`). Media carries monospace metadata (fps, aspect, codec).
- **The cut is the signature transition.** Headers enter with a hard horizontal wipe; media frames open
  with a split-frame "splice" (clip-path from the centre line). Both use the in-out cut easing.
- **Log → graded.** Media sits in a flat "log" state (desaturated, lifted blacks) and grades to full
  contrast as it reaches the centre of the viewport. The before/after idea *is* the page, and it costs
  only an opacity tween on two overlay layers (saturation-blend + lift).
- **Film grammar as decoration:** letterbox bars, crop marks, safe-area guides, a frame counter loader,
  a "Media offline" 404, a "rewind" back-to-top. Used sparingly.

Why keep the default concept: it comes straight from the craft, it scales to every element (cursor,
copy, loader, 404) and it gives one memorable motion idea instead of a pile of effects.

## 2. Tokens (source: `src/styles/tokens.css`)

| Token | Value | Use | Contrast (checked by `scripts/contrast.mjs`) |
|---|---|---|---|
| `paper` | `#EDE8DF` | base | ink on paper 15.8:1 |
| `paper-2` | `#E2DCD1` | "flat/log" panels | mute on paper-2 5.0:1 |
| `ink` | `#0E0E0C` | inverse base, text | paper on ink 15.8:1 |
| `ink-2` | `#1A1A17` | dark panels (NLE UI) | mute-inv on ink-2 6.5:1 |
| `mute` | `#5F5A51` | secondary text on paper | 5.6:1 |
| `mute-inv` | `#A29D93` | secondary text on ink | 7.2:1 |
| `signal` | `#FF4D1C` | tally/REC accent, < 5% | 5.8:1 on ink, ink on signal 5.8:1. **Never text on paper** (2.7:1) |
| `log` | `#857F76` | log overlays; unfilled principle words | 3.25:1 on paper, large text only |

Type (3 roles, `next/font/google`, self-hosted, swap):
- **Display — Instrument Serif** (400, roman + italic). Narrow, high-contrast, cinematic at huge sizes; the
  italic carries emphasis ("*a second.*"). Hero `max(4.5rem, min(17vw, (100svh − 300px) / 2.7))` so the
  whole opening composition always fits one screen; tracking −0.025em.
  (First built in Fraunces; switched because its two variable files cost ~145 KB before first paint and held
  mobile LCP back. Instrument Serif is ~41 KB for both styles.)
- **Text — Geist** for body and UI.
- **Mono — Geist Mono** for timecode, labels, metadata. Uppercase, tracking 0.08em, tabular numbers.

Fluid scale: hero / display `clamp(3.25rem,9vw,10rem)` / h2 `clamp(2.5rem,5.6vw,5.75rem)` / h3
`clamp(1.6rem,2.6vw,2.5rem)` / lead `clamp(1.125rem,1.4vw,1.375rem)` / body 1rem / meta 0.75rem.
Spacing on a 4/8px scale. Grid: 12 columns desktop, 4 mobile; margin `clamp(16px,3.5vw,56px)`,
gutter `clamp(12px,1.6vw,24px)`. Asymmetry: copy sits in columns 2–8, media runs past the right edge.

Motion: durations `fast .25 / base .6 / slow 1.1 / cinematic 1.6s`; easings `expo-out
cubic-bezier(.16,1,.3,1)` for entrances, `cut cubic-bezier(.76,0,.24,1)` for wipes; stagger .04s/char,
.08s/word-line. Only `transform`, `opacity`, `clip-path` animate. Nothing moves without a reason.

## 3. Section plan (no two adjacent sections share a layout type)

| # | Section | Ground | Layout type | Signature interaction |
|---|---|---|---|---|
| 1 | Nav | paper/ink auto | bar | live scroll timecode + scene label; hides on scroll down |
| 2 | Hero | paper | typographic composition, frame set inside the headline | line masks; inline frame grows |
| 3 | Showreel | ink | pinned full-bleed letterbox (sticky, ~150vh) | frame scales to 16:9, opens player |
| 4 | Selected work | paper | mixed-aspect editorial grid (16:9 / 9:16 / 1:1 / 21:9) | FLIP filter, hover preview, lightbox |
| 5 | Services | ink | typographic index list | row expands 4 lines; floating preview follows cursor |
| 6 | Raw → final | paper-2 | split-screen comparator + tabs | drag divider over synced videos |
| 7 | Principles | paper | full-width text flow with inline media | words fill mute → ink on scroll |
| 8 | Workflow | ink | horizontal NLE timeline (pinned) / vertical on mobile | playhead scrubs, clips expand |
| 9 | Results | paper | "scopes" panel: counters + retention graph | counters, curve draws on |
| 10 | Testimonials | ink | single giant pull-quote | hard-cut carousel, keyboard |
| 11 | FAQ | paper | sticky title + accordion column | height via grid rows |
| 12 | End card | ink | full-screen statement + call-sheet form | hero type returns; magnetic CTA |
| 13 | Footer | ink | giant wordmark + columns | local time, "rewind" to top |

Motion is different per section on purpose: masks (hero), scale (reel), splice (work), rules drawing
(services), wipe (raw→final), scrub-fill (principles), playhead (workflow), counters (results), hard cut
(testimonials), height (FAQ).

WebGL: deliberately **not used**. Film grain is a CSS-animated SVG noise texture on the reel only.

## 4. Copy deck (voice: a director, not a marketer — short, specific, craft words)

**Hero.** Meta: `REC · SC.01 OPENING · 24 FPS · 2.39:1`. H1: "Twenty-four decisions *a second.*"
Support: "Cutline is an editing and post studio for channels, brands and filmmakers. We cut for
retention, grade for mood and mix until the room goes quiet." CTAs: "Start a project" / "Watch the reel".
Scroll cue: timeline ruler with a scrubbing playhead, "Scroll to play".

**Reel.** Bars: "Showreel — demo edit" / "Cut from licensed stock (Mixkit). Replace with your reel."

**Work.** "Cut, graded, delivered." Note: "Demo projects · sample footage". Filters: All, YouTube, Shorts,
Reels, Cinematic, Commercial, Brand, Podcast, Social, Promo.

**Services.** "What we cut." Long-form YouTube · Shorts & Reels · Commercials & brand films · Podcast &
interview · Colour grading · Sound design & mix · Motion graphics & captions. Each: what it is /
problem it solves / who it's for / why it matters (see `config/services.ts`).

**Raw → final.** "Raw in. Final out." Tabs: Colour / Pacing / Sound / Captions (copy in config).

**Principles.** 1 "We cut for the second watch — the one where people notice what they felt the first
time." 2 "Retention isn't a trick. We earn the next ten seconds, every ten seconds." 3 "Colour is a point
of view and sound is half the picture." 4 "One editor owns your project from first assembly to final
export. No hand-offs, no drift." 5 "We'll tell you what to cut. Then we'll cut it."

**Workflow.** "How a project runs." Consultation → Brief → Assets → Edit & post → Revisions → Delivery.

**Results.** "Measured in minutes watched." Four counters, all `[ADD REAL FIGURE]`. Retention graph
labelled "Illustrative curve — not client data".

**Testimonials.** Three sample quotes, labelled "Sample testimonial — replace with real client words".

**FAQ.** Pricing, revisions, turnaround, deliverables & formats, project files, tools, rights.

**End card.** "Send us the footage. *We'll find the film.*" + "Start a project", email, WhatsApp, form.

**404.** "Media offline." — "This clip was moved, renamed or never made it to the timeline."

## 5. Research notes (techniques, not looks)

Drawn from known award-level studio sites (post houses, editorial agencies, Awwwards SOTD patterns):
1. Type-as-mask / frame-in-headline instead of video-behind-text heroes.
2. One pinned "hero → full-bleed reel" expansion, then normal scroll.
3. Mixed-aspect grids with captions/metadata used as filler in the gaps.
4. Index-list services with cursor-following preview media.
5. Scroll-scrubbed text fill for manifesto copy.
6. Monospace metadata and timecode as a consistent secondary voice.
7. A tiny, skippable loader that becomes the first frame of the hero.
