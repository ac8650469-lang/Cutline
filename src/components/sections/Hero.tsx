"use client";

import { useLayoutEffect, useRef, useState, type CSSProperties } from "react";
import { ArrowRight, Play } from "lucide-react";
import { hero, reel } from "@/config/site";
import { gsap, ScrollTrigger, useGSAP, MQ } from "@/lib/gsap";
import { useIsDesktop } from "@/lib/hooks";
import { MediaFrame } from "@/components/ui/MediaFrame";
import { Button } from "@/components/ui/Button";
import { RecDot } from "@/components/ui/Bits";
import dynamic from "next/dynamic";

// The player is only needed once someone asks for it.
const ShowreelModal = dynamic(() => import("@/components/media/ShowreelModal").then((m) => m.ShowreelModal), { ssr: false });

const line = (i: number) => ({ "--i": i }) as CSSProperties;

type Box = { x: number; y: number; w: number; h: number };

/** Position of `el` inside `ancestor`, ignoring transforms (walks the offsetParent chain). */
function offsetWithin(el: HTMLElement, ancestor: HTMLElement): Box {
  let x = 0;
  let y = 0;
  let node: HTMLElement | null = el;
  while (node && node !== ancestor) {
    x += node.offsetLeft;
    y += node.offsetTop;
    node = node.offsetParent as HTMLElement | null;
  }
  return { x, y, w: el.offsetWidth, h: el.offsetHeight };
}

/**
 * SC.01 + SC.02. The reel frame sits inside the headline like a clip on a timeline. Scrolling
 * (a sticky, ~150vh pinned stretch) cuts the type away and grows the frame into a full-bleed,
 * letterboxed program monitor. Clicking the frame at any point opens the full player.
 */
export function Hero() {
  const root = useRef<HTMLElement>(null);
  const [reelOpen, setReelOpen] = useState(false);
  const desktop = useIsDesktop();

  useGSAP(
    () => {
      const el = root.current;
      if (!el) return;
      const q = <T extends HTMLElement = HTMLElement>(s: string) => el.querySelector<T>(s);
      const stage = q("[data-hero-stage]");
      const frame = q("[data-hero-frame]");
      if (!stage || !frame) return;

      const mm = gsap.matchMedia();
      mm.add({ motion: MQ.motion, desktop: MQ.desktop }, (ctx) => {
        const { motion, desktop: isDesktop } = ctx.conditions as { motion: boolean; desktop: boolean };
        const slot = q(isDesktop ? "[data-slot-d]" : "[data-slot-m]");
        if (!slot) return;
        const ar = isDesktop ? 16 / 9 : 4 / 5;
        const barMin = isDesktop ? 56 : 64;
        let box: Box = offsetWithin(slot, stage);

        const target = () => {
          const W = stage.clientWidth;
          const H = stage.clientHeight;
          let w = W;
          let h = W / ar;
          if (h > H - barMin * 2) {
            h = H - barMin * 2;
            w = h * ar;
          }
          return {
            s: w / Math.max(box.w, 1),
            x: (W - w) / 2 + w / 2 - (box.x + box.w / 2),
            y: (H - h) / 2 + h / 2 - (box.y + box.h / 2),
            bar: (H - h) / 2,
          };
        };

        const place = () => {
          box = offsetWithin(slot, stage);
          gsap.set(frame, { left: box.x, top: box.y, width: box.w, height: box.h });
          stage.style.setProperty("--bar", `${target().bar}px`);
          frame.dataset.placed = "true";
        };
        place();
        ScrollTrigger.addEventListener("refreshInit", place);
        document.fonts?.ready.then(() => ScrollTrigger.refresh());

        if (!motion) {
          return () => ScrollTrigger.removeEventListener("refreshInit", place);
        }

        // The intro (line masks + frame splice) is CSS — see globals.css "Hero intro".
        // --- Scroll: cut the type away, grow the frame, close the letterbox ---
        gsap
          .timeline({
            defaults: { ease: "none" },
            scrollTrigger: { trigger: el, start: "top top", end: "bottom bottom", scrub: true, invalidateOnRefresh: true },
          })
          .to(frame, { x: () => target().x, y: () => target().y, scale: () => target().s, ease: "power2.inOut", duration: 0.55 }, 0)
          .to("[data-l1]", { xPercent: -30, opacity: 0, ease: "power2.in", duration: 0.32 }, 0.02)
          .to("[data-l3]", { xPercent: 30, opacity: 0, ease: "power2.in", duration: 0.32 }, 0.02)
          .to("[data-l2-word]", { yPercent: -40, opacity: 0, ease: "power2.in", duration: 0.22 }, 0)
          .to("[data-crop]", { opacity: 0, duration: 0.1 }, 0)
          .to("[data-hero-out]", { opacity: 0, y: (i: number) => (i === 0 ? -16 : 16), duration: 0.16 }, 0)
          .fromTo("[data-letterbox]", { clipPath: "inset(50% 0% 50% 0%)" }, { clipPath: "inset(0% 0% 0% 0%)", ease: "power3.inOut", duration: 0.34 }, 0.02)
          .to("[data-reel-ui]", { opacity: 1, duration: 0.12 }, 0.5)
          .to({}, { duration: 0.33 });

        const ruler = q("[data-ruler]");
        if (ruler) {
          gsap.fromTo(
            "[data-playhead]",
            { x: 0 },
            {
              x: () => ruler.clientWidth,
              ease: "none",
              scrollTrigger: { trigger: el, start: "top top", end: () => `+=${window.innerHeight * 0.45}`, scrub: true, invalidateOnRefresh: true },
            },
          );
        }

        return () => ScrollTrigger.removeEventListener("refreshInit", place);
      });
    },
    { scope: root },
  );

  // Close the player if this route is hidden (cacheComponents keeps it alive in the background).
  useLayoutEffect(() => () => setReelOpen(false), []);

  const media = desktop ? reel.src : reel.mobile;

  return (
    <>
      <section
        ref={root}
        id="top"
        aria-labelledby="hero-title"
        data-scene="01"
        data-scene-label="Opening"
        data-theme="paper"
        className="theme-paper relative h-[250svh] motion-reduce:h-auto"
      >
        <div data-hero-stage className="sticky top-0 h-svh overflow-hidden motion-reduce:relative">
          <div data-letterbox aria-hidden="true" className="absolute inset-0 bg-ink [clip-path:inset(50%_0_50%_0)]" />

          <div className="relative z-10 flex h-full flex-col pb-5 pt-[calc(var(--nav-h)+0.75rem)] md:pb-8">
            <div data-hero-out className="grid-shell">
              <p className="meta col-span-4 flex items-center justify-between gap-4 md:col-span-12">
                <span className="flex items-center gap-2">
                  <RecDot /> Rec <span className="text-(--fg-mute)">A001_C024</span>
                </span>
                <span className="hidden text-(--fg-mute) sm:inline">{hero.meta.join(" · ")}</span>
              </p>
            </div>

            <h1 id="hero-title" className="shell my-auto font-display text-[20.5vw] leading-[0.86] tracking-[-0.025em] md:text-hero">
              <span data-hero-line className="block overflow-clip pb-[0.07em]">
                <span className="block" style={line(0)}>
                  <span data-l1 className="block">
                    {hero.lines[0]}
                  </span>
                </span>
              </span>{" "}
              <span data-hero-line className="block overflow-clip pb-[0.07em]">
                <span className="flex items-center md:pl-[0.9em]" style={line(1)}>
                  <span data-l2-word className="block">
                    {hero.lines[1]}
                  </span>
                  <span data-slot-d aria-hidden="true" className="relative ml-[0.2em] hidden aspect-video h-[0.66em] md:inline-block">
                    <span data-crop className="absolute -inset-2">
                      <span data-hero-fade className="crop-marks absolute inset-0 text-(--fg-mute)" />
                    </span>
                  </span>
                </span>
              </span>{" "}
              <span data-hero-line className="block overflow-clip pb-[0.07em]">
                <span className="block text-right" style={line(2)}>
                  <span data-l3 className="display-italic inline-block">
                    {hero.lines[2].replace(/\.$/, "")}
                    <span className="vh">.</span>
                    <span
                      aria-hidden="true"
                      className="ml-[0.04em] inline-block size-[0.13em] rounded-full bg-signal motion-safe:animate-blink"
                    />
                  </span>
                </span>
              </span>
            </h1>

            <div className="grid-shell md:hidden">
              {/* Height-led so short phones keep the CTAs on screen; always exactly 4:5. */}
              <span data-slot-m aria-hidden="true" className="col-span-2 col-start-3 mb-4 block aspect-[4/5] h-[min(24svh,calc((100vw-2*var(--margin))*0.62))] w-auto justify-self-end" />
            </div>

            <div data-hero-out className="grid-shell items-end gap-y-5">
              <p className="col-span-4 max-w-[42ch] text-[0.975rem] leading-relaxed text-(--fg-mute) md:col-span-5 md:text-lead lg:col-span-4">
                {hero.support}
              </p>
              <div className="col-span-4 flex flex-wrap items-center gap-3 md:col-span-4 md:col-start-6 lg:col-start-6">
                <Button href="/contact" magnetic icon={<ArrowRight aria-hidden="true" className="size-4" />}>
                  Start a project
                </Button>
                <Button variant="secondary" onClick={() => setReelOpen(true)} icon={<Play aria-hidden="true" className="size-3.5" />} cursor="Play">
                  Watch the reel
                </Button>
              </div>
              <div className="col-span-3 col-start-10 hidden flex-col gap-2 md:flex" aria-hidden="true">
                <div className="meta flex justify-between text-(--fg-mute)">
                  <span>Scroll to play</span>
                  <span>{reel.duration}</span>
                </div>
                <div data-ruler className="ruler relative h-4 text-(--rule)">
                  <span data-playhead className="absolute inset-y-0 left-0 block">
                    <span className="absolute -top-1.5 bottom-0 left-0 block w-px bg-signal motion-safe:animate-[nudge_2.4s_var(--ease-cut)_infinite]">
                      <span className="absolute -left-[4.5px] -top-0.5 block size-2.5 bg-signal [clip-path:polygon(0_0,100%_0,50%_100%)]" />
                    </span>
                  </span>
                </div>
              </div>
            </div>
          </div>

          <button
            type="button"
            data-hero-frame
            data-cursor="Play"
            onClick={() => setReelOpen(true)}
            aria-label="Play the showreel (opens the player)"
            className="absolute bottom-[24%] right-[var(--margin)] z-20 block aspect-video w-[40vw] origin-center md:w-[22vw]"
          >
            <MediaFrame key={desktop ? "d" : "m"} src={media} mobileSrc={reel.mobile} fill label="Showreel montage, demo edit" priority playback="inview" />
          </button>

          <div data-reel-ui aria-hidden="true" className="pointer-events-none absolute inset-0 z-30 text-paper opacity-0">
            <div className="meta absolute inset-x-0 top-0 flex h-(--bar,56px) items-end justify-between px-[var(--margin)] pb-3">
              <span className="flex items-center gap-2">
                <RecDot /> SC.02 · {reel.title}
              </span>
              <span className="hidden md:inline">Click to play · {reel.duration}</span>
            </div>
            <div className="meta absolute inset-x-0 bottom-0 flex h-(--bar,56px) items-start justify-between gap-6 px-[var(--margin)] pt-3 text-mute-inv">
              <span>{reel.note}</span>
              <span className="hidden md:inline">{desktop ? "16:9" : "4:5"} · 24 fps · H.264</span>
            </div>
          </div>
        </div>

        {/* Marks the reel stretch for the nav (scene label + dark theme). */}
        <div aria-hidden="true" data-scene="02" data-scene-label="Reel" data-theme="ink" className="pointer-events-none absolute inset-x-0 bottom-0 top-[78svh] motion-reduce:hidden" />
      </section>

      {/* Reduced motion: no pinning, the reel is a plain block. */}
      <div className="theme-ink hidden py-12 motion-reduce:block">
        <div className="shell">
          <button type="button" onClick={() => setReelOpen(true)} className="relative block w-full" aria-label="Play the showreel (opens the player)">
            <MediaFrame src={reel.src} aspect="16 / 9" label="Showreel montage, demo edit" playback="none" />
            <span className="meta absolute bottom-4 left-4 flex items-center gap-2 bg-ink px-3 py-2 text-paper">
              <Play aria-hidden="true" className="size-3.5" /> Play the showreel · {reel.duration}
            </span>
          </button>
        </div>
      </div>

      {reelOpen && <ShowreelModal open onClose={() => setReelOpen(false)} />}
    </>
  );
}
