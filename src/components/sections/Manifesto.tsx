"use client";

import { useRef } from "react";
import { principles } from "@/config/content";
import { gsap, useDeferredGSAP, MQ } from "@/lib/gsap";
import { MediaFrame } from "@/components/ui/MediaFrame";

/**
 * SC.06 — a typographic manifesto. Each word exists twice: a muted base (the real, readable text)
 * and an ink copy on top that is wiped on, word by word, as the line scrolls past.
 */
export function Manifesto() {
  const root = useRef<HTMLElement>(null);

  useDeferredGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(MQ.motion, () => {
        gsap.utils.toArray<HTMLElement>("[data-principle]").forEach((p) => {
          gsap.fromTo(
            p.querySelectorAll("[data-ink]"),
            { clipPath: "inset(0% 100% 0% 0%)" },
            {
              clipPath: "inset(0% 0% 0% 0%)",
              ease: "none",
              duration: 0.3,
              stagger: 0.12,
              scrollTrigger: { trigger: p, start: "top 82%", end: "bottom 48%", scrub: true },
            },
          );
        });
      });
    },
    root,
  );

  return (
    <section
      ref={root}
      id="principles"
      aria-labelledby="principles-title"
      data-scene="06"
      data-scene-label="Principles"
      data-theme="paper"
      className="theme-paper py-[clamp(6rem,12vw,11rem)]"
    >
      <div className="grid-shell">
        <h2 id="principles-title" className="meta col-span-4 flex items-center gap-4 text-(--fg-mute) md:col-span-12">
          <span className="text-(--fg)">SC.06</span>
          <span data-rule aria-hidden="true" className="h-px flex-1 bg-(--rule)" />
          <span>Principles · why us</span>
        </h2>

        <ol className="col-span-4 mt-14 grid gap-[clamp(3.5rem,7vw,7rem)] md:col-span-11 md:col-start-2 md:mt-20">
          {principles.map((tokens, i) => (
            <li key={i} data-principle className="grid gap-3 md:grid-cols-[5.5rem_1fr]">
              <span className="meta pt-[0.9em] text-(--fg-mute)">P.0{i + 1}</span>
              <p className="font-display text-[clamp(2.25rem,5.2vw,5.5rem)] leading-[1.06] tracking-[-0.015em] text-log">
                {tokens.map((t, j) =>
                  typeof t === "string" ? (
                    <span key={j}>
                      <span className="relative inline-block">
                        {t}
                        <span data-ink aria-hidden="true" className="absolute inset-0 text-wine">
                          {t}
                        </span>
                      </span>{" "}
                    </span>
                  ) : (
                    <span key={j}>
                      <span className="relative mx-[0.06em] inline-block h-[0.74em] w-[1.32em] overflow-hidden align-[-0.04em]">
                        <MediaFrame as="span" fill src={t.media} label={t.label} playback="inview" />
                      </span>{" "}
                    </span>
                  ),
                )}
              </p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
