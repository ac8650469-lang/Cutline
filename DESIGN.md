# DESIGN — Arteniq Creative

## 0. Design philosophy: Apple's, applied to "the cut"

The site follows the `apple-design` skill (`.agents/skills/apple-design`). The concept below supplies the
content and rhythm; the skill decides how everything *behaves*:
- **Familiar platform behaviour.** Native scrolling, the native cursor, system typography. Nothing replaces
  what the device already does well.
- **Response first.** No loader, no artificial waits; controls react on pointer-down; code for dialogs is
  fetched while idle so opening never waits on the network.
- **Things you can touch move like objects.** Springs (critically damped by default) from the live value,
  velocity handed over from the finger, momentum projected, rubber bands at the edges, interruptible always.
- **Spatial consistency.** Dialogs grow from what opened them and return there.
- **Materials for hierarchy.** Translucent nav, dimming blurred scrims, dark chips over media.
- **Restraint and accessibility.** Reduced motion, reduced transparency and increased contrast are honoured;
  no full-screen moving textures or endless oscillations.

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
- **Film grammar as decoration:** letterbox bars, crop marks, safe-area guides, a "Media offline" 404,
  a "rewind" back-to-top. Used sparingly. (The frame-counter loader and custom cursor were removed for
  the Apple pass: an artificial wait and a replaced system pointer both break §1 / §16 of the skill.)

Why keep the concept: it comes straight from the craft, it scales to every element (copy, 404,
timecode) and it gives one memorable motion idea instead of a pile of effects.

## 2. Tokens (source: `src/styles/tokens.css`)

Brand palette (Arteniq Creative): **Black `#000000` · Burgundy `#6D001A` · White `#FFFFFF`**, plus the crimson of
the logo's swoosh. Paper/ink keep their roles; they are now brand white and brand black.

| Token | Value | Use | Contrast (checked by `scripts/contrast.mjs`) |
|---|---|---|---|
| `paper` | `#FFFFFF` | base (brand white) | ink on paper 21:1 |
| `paper-2` | `#F8EEF0` | "flat/log" panels, white with a burgundy blush | mute on paper-2 5.0:1 |
| `ink` | `#000000` | inverse base, text (brand black) | paper on ink 21:1 |
| `ink-2` | `#140A0C` | dark panels (NLE UI), burgundy cast | mute-inv on ink-2 7.3:1 |
| `mute` | `#6B6567` | secondary text on paper | 5.7:1 |
| `mute-inv` | `#A39D9F` | secondary text on ink | 7.9:1 |
| `signal` | `#D0103F` | logo crimson: accent, < 5% | text on paper 5.5:1; paper on signal 5.5:1. **Graphic only on ink** (3.8:1) |
| `signal-bright` | `#FF4069` | small accent text on ink | 6.2:1 |
| `wine` | `#6D001A` | brand burgundy: third ground, primary buttons, emphasis on paper, ribbons | paper on wine 12.6:1; wine on paper 12.6:1 |
| `wine-mute` | `#EAB8C4` | secondary text on wine | 7.3:1 |
| `log` | `#8A8586` | log overlays; unfilled principle words | 3.6:1 on paper, large text only |

Three grounds, all brand colours: `theme-paper` (white), `theme-ink` (black), `theme-wine` (burgundy). Each sets
role variables — `--fg`, `--bg`, `--fg-mute`, `--rule`, `--focus`, `--accent` (emphasis text) and `--btn-bg/-fg/-hover`
(primary button). Primary buttons: burgundy on paper (crimson hover), white on ink (crimson hover), white on wine
(black hover). `theme-wine` re-points `mute-inv` → `wine-mute` and `signal` → `signal-bright` inside its scope so
components written for ink stay legible. The italic word in section titles (`em.display-italic`) takes `--accent`.
Burgundy on paper: hero "a second.", scene numbers, Principles fill, Results figures and curve, active filters/tabs.

Brand assets: `<Logo />` (`src/components/ui/Logo.tsx`) is the logo redrawn as SVG — `variant="wordmark"` (ARTENIQ
lockup, nav/loader/footer) or `"mark"` (the A). The A and letters take `currentColor`; the swoosh and Q tail are
always crimson. `brand-wave` (globals.css) paints the burgundy ribbons from the brand artwork as static gradients
on ink grounds (loader, footer, 404). Source artwork: `public/brand/`; favicon `src/app/icon.svg`; touch icon and
OG image are cut from the supplied artwork.

Type: **system faces only** (apple-design §15: "default to the platform's system font"). No web fonts.
- **Display + text — `system-ui`** (SF Pro on Apple devices, Segoe UI / Roboto elsewhere). Display weight 600;
  hierarchy from weight + size + leading together. Emphasis is colour (`--accent`), not italics.
- **Small labels (`meta`)** — system sans, 12px, weight 500, sentence case, +0.01em, tabular numbers.
- **Mono — `ui-monospace`** (SF Mono) only where code-like.
- Tracking is size-specific: hero −0.035em, display −0.03em, h2 −0.025em, h3 −0.015em, body 0, small +0.01em.
  Leading loosens as size drops: hero 0.96, display 1.0, h2 1.04, h3 1.14, body/lead 1.5.
- Hero `max(3.25rem, min(11.2vw, (100svh − 300px) / 3))` (15vw on phones) so the whole opening composition fits
  one screen and line 2 still holds its inline frame.

Fluid scale: hero / display `clamp(2.5rem,6.4vw,7rem)` / h2 `clamp(2.1rem,4.4vw,4.5rem)` / h3
`clamp(1.35rem,2.1vw,2rem)` / lead `clamp(1.125rem,1.35vw,1.3125rem)` / body 1rem / meta 0.75rem.
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
| 6 | Raw → final | paper-2 (blush) | split-screen comparator + tabs | drag divider over synced videos |
| 7 | Principles | paper | full-width text flow with inline media | words fill mute → ink on scroll |
| 8 | Workflow | ink | horizontal NLE timeline (pinned) / vertical on mobile | playhead scrubs, clips expand |
| 9 | Results | paper | "scopes" panel: counters + retention graph | counters, curve draws on |
| 10 | Testimonials | wine | single giant pull-quote | hard-cut carousel, keyboard |
| 11 | FAQ | paper | sticky title + accordion column | height via grid rows |
| 12 | End card | wine | full-screen statement + call-sheet form | hero type returns; magnetic CTA |
| 13 | Footer | ink | giant wordmark + columns | local time, "rewind" to top |

Motion is different per section on purpose: masks (hero), scale (reel), splice (work), rules drawing
(services), wipe (raw→final), scrub-fill (principles), playhead (workflow), counters (results), hard cut
(testimonials), height (FAQ).

Interaction feel (apple-design skill, adapted to "the cut"):
- **Press:** every button, chip, tab and card reacts on pointer-down (`scale` .97 / .985 for cards), instantly.
- **Nav material:** once the page leaves the top, a translucent layer (blur 20px, saturate 180%, tinted paper /
  ink / wine by ground) sits under the nav with a soft lower-edge fade instead of a divider. Solid under
  `prefers-reduced-transparency` and `prefers-contrast: more`.
- **Swipe (testimonials, touch/pen):** 10px hysteresis, then 1:1 tracking from the grab point; release velocity
  is projected (`project`, 0.99); past 30% of the width the quote carries its velocity out on a critically
  damped spring and the next one hard-cuts in, otherwise it springs back. Grabbable mid-flight. Reduced motion
  skips the springs.
- **Comparator:** grabbing within 24px of the divider keeps the grab offset; elsewhere it jumps to the pointer.
  Past either end it rubber-bands (`rubberband`) and springs home on release.
- **Dialogs (lightbox, showreel, phone menu) — `useAnchoredSheet` (src/lib/sheet.ts):** the surface grows out of
  the element that opened it (uniform scale + clip to the trigger's shape) on one critically damped spring
  (response 0.42s), over a dimming blurred scrim, and flies back on close — to the card of the project now
  showing. Modality, focus, scroll lock and sound end the moment closing starts. Touch: pull down from the top
  of the content to dismiss (10px hysteresis, 1:1, rubber band upward, projection > 22% of the viewport,
  velocity handed into the flight home). Reduced motion: opacity cross-fade. Re-opening mid-flight continues
  from the live value.
- **Haptics (`haptic()`, Vibration API where supported):** swipe commits, sheet dismissals, form success and
  form errors only.
- **Forms:** fields validate when you leave them (if filled); empty required fields wait for submit.
- **Springs:** closed-form solution, exact for any frame gap (a dropped frame skips ahead, never slow motion).
- Section entrances keep their hard wipes. Springs are for things a finger can move.

WebGL: deliberately **not used**. Film grain is a static SVG noise texture on the reel only (no full-viewport motion).

## 4. Copy deck (voice: a director, not a marketer — short, specific, craft words)

**Hero.** Meta: `REC · SC.01 OPENING · 24 FPS · 2.39:1`. H1: "Twenty-four decisions *a second.*"
Support: "Arteniq is an editing and post studio for channels, brands and filmmakers. We cut for
retention, grade for mood and mix until the room goes quiet." CTAs: "Start a project" / "Watch the reel".
Scroll cue: timeline ruler with a scrubbing playhead, "Scroll to play".

**Reel.** Bars: "Showreel" / "Cut from Arteniq client and personal work." (montage from public/media/real)

**Work.** "Cut, graded, delivered." 17 real projects (note shows only while any project is demo). Filters: All, YouTube, Real estate, Shorts,
Reels, Brand, Motion, Cinematic, Promo.

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
7. ~~A tiny loader~~ — removed: Apple design never makes people wait for decoration.
