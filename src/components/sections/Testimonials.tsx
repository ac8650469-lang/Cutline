"use client";

import { useRef, useState, type KeyboardEvent } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { testimonials } from "@/config/content";
import { gsap, useGSAP, MQ, EASE } from "@/lib/gsap";
import { SampleLabel } from "@/components/ui/Bits";
import { cn } from "@/lib/utils";

const pad = (n: number) => String(n).padStart(2, "0");

/** SC.09 — one big pull-quote at a time. Hard cuts between slides; buttons and arrow keys. No autoplay. */
export function Testimonials() {
  const root = useRef<HTMLElement>(null);
  const changed = useRef(false);
  const [i, setI] = useState(0);
  const n = testimonials.length;
  const t = testimonials[i];
  const go = (d: number) => setI((v) => (v + d + n) % n);

  useGSAP(
    () => {
      if (!changed.current) {
        changed.current = true;
        return;
      }
      const mm = gsap.matchMedia();
      mm.add(MQ.motion, () => {
        gsap.fromTo("[data-quote]", { clipPath: "inset(0% 100% 0% 0%)" }, { clipPath: "inset(0% 0% 0% 0%)", duration: 0.8, ease: EASE.cut });
        gsap.fromTo("[data-attrib]", { opacity: 0 }, { opacity: 1, duration: 0.5, delay: 0.35 });
      });
    },
    { scope: root, dependencies: [i], revertOnUpdate: false },
  );

  const onKey = (e: KeyboardEvent<HTMLElement>) => {
    if (e.key === "ArrowRight") go(1);
    if (e.key === "ArrowLeft") go(-1);
  };

  return (
    <section
      ref={root}
      id="testimonials"
      aria-roledescription="carousel"
      aria-label="Client testimonials"
      data-scene="09"
      data-scene-label="Word of mouth"
      data-theme="ink"
      onKeyDown={onKey}
      className="theme-ink py-[clamp(6rem,12vw,11rem)]"
    >
      <div className="grid-shell gap-y-10">
        <div className="col-span-4 flex flex-col justify-between gap-8 md:col-span-3">
          <h2 className="meta flex items-center gap-4 text-mute-inv">
            <span className="text-paper">SC.09</span>
            <span className="h-px w-10 bg-(--rule)" aria-hidden="true" />
            <span>Word of mouth</span>
          </h2>
          <div className="flex flex-col gap-5">
            <p className="meta tnum">
              {pad(i + 1)} <span className="text-mute-inv">/ {pad(n)}</span>
            </p>
            <div className="flex gap-1" aria-hidden="true">
              {testimonials.map((_, k) => (
                <span key={k} className={cn("h-0.5 flex-1 transition-colors duration-500", k === i ? "bg-signal" : "bg-(--rule)")} />
              ))}
            </div>
            <div className="flex gap-2">
              <button type="button" onClick={() => go(-1)} aria-label="Previous testimonial" className="grid size-12 place-items-center border border-(--rule) transition-colors hover:border-paper">
                <ArrowLeft aria-hidden="true" className="size-4" />
              </button>
              <button type="button" onClick={() => go(1)} aria-label="Next testimonial" className="grid size-12 place-items-center border border-(--rule) transition-colors hover:border-paper">
                <ArrowRight aria-hidden="true" className="size-4" />
              </button>
            </div>
          </div>
        </div>

        <div className="col-span-4 md:col-span-9" aria-live="polite">
          <div key={i} role="group" aria-roledescription="slide" aria-label={`${i + 1} of ${n}`}>
          <figure>
            {t.isDemo && <SampleLabel className="text-mute-inv">Sample testimonial — replace with real client words</SampleLabel>}
            <blockquote data-quote className="mt-8 font-display text-[clamp(2.1rem,5vw,5.5rem)] leading-[1.04] tracking-[-0.015em]">
              <p>
                <span aria-hidden="true" className="text-mute-inv">
                  “
                </span>
                {t.quote}
                <span aria-hidden="true" className="text-mute-inv">
                  ”
                </span>
              </p>
            </blockquote>
            <figcaption data-attrib className="mt-10 flex items-center gap-4">
              <span className="meta grid size-14 shrink-0 place-items-center border border-dashed border-(--rule) text-mute-inv" title="Portrait or brand mark slot">
                {t.mark}
              </span>
              <span className="flex flex-col gap-1">
                <span>{t.name}</span>
                <span className="meta text-mute-inv">{t.role}</span>
              </span>
            </figcaption>
          </figure>
          </div>
        </div>
      </div>
    </section>
  );
}
