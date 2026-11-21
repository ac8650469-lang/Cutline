"use client";

import { useRef } from "react";
import { site } from "@/config/site";
import { gsap, useGSAP, EASE } from "@/lib/gsap";

export const INTRO_EVENT = "cutline:intro";

/**
 * First-visit loader (≤1.2s): the wordmark is cut on while a frame counter runs 00→24, then the
 * whole card wipes up into the hero. Visibility is decided before paint by the boot script
 * (html.intro); repeat visits and reduced-motion users never see it. It never waits on assets.
 */
export function Loader() {
  const root = useRef<HTMLDivElement>(null);
  const count = useRef<HTMLSpanElement>(null);

  useGSAP(
    () => {
      const html = document.documentElement;
      if (!html.classList.contains("intro")) return;
      const done = () => {
        html.classList.remove("intro");
        try {
          sessionStorage.setItem("cutline:intro", "1");
        } catch {
          /* storage blocked: the loader simply shows again next visit */
        }
        window.dispatchEvent(new Event(INTRO_EVENT));
      };
      const frame = { n: 0 };
      gsap
        .timeline({ onComplete: done })
        .fromTo("[data-loader-word]", { clipPath: "inset(0% 100% 0% 0%)" }, { clipPath: "inset(0% 0% 0% 0%)", duration: 0.5, ease: EASE.cut }, 0)
        .to(
          frame,
          {
            n: 24,
            duration: 0.72,
            ease: "none",
            onUpdate: () => {
              if (count.current) count.current.textContent = String(Math.round(frame.n)).padStart(2, "0");
            },
          },
          0,
        )
        .to(root.current, { clipPath: "inset(0% 0% 100% 0%)", duration: 0.42, ease: EASE.cut }, 0.74);
    },
    { scope: root },
  );

  return (
    <div
      id="loader"
      ref={root}
      aria-hidden="true"
      className="theme-ink fixed inset-0 z-[99] flex-col justify-between p-[var(--margin)]"
    >
      <div className="meta flex justify-between text-mute-inv">
        <span>Reel 01</span>
        <span>24 fps</span>
      </div>
      <div className="crop-marks relative mx-auto px-[4vw] py-[2vw] text-mute-inv">
        <span data-loader-word className="block font-display text-[clamp(4rem,16vw,15rem)] leading-[0.9] tracking-[-0.03em] text-paper">
          {site.name}
        </span>
      </div>
      <div className="meta flex items-center justify-between text-mute-inv">
        <span className="flex items-center gap-2">
          <span className="size-2 rounded-full bg-signal" /> Rec
        </span>
        <span className="tnum text-paper">
          FR <span ref={count}>00</span>/24
        </span>
      </div>
    </div>
  );
}
