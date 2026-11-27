"use client";

import { useRef, useState, type KeyboardEvent, type PointerEvent } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { testimonials } from "@/config/content";
import { gsap, useGSAP, MQ, EASE } from "@/lib/gsap";
import { SampleLabel } from "@/components/ui/Bits";
import { cn } from "@/lib/utils";
import { spring, project, VelocityTracker, type Spring } from "@/lib/spring";
import { haptic } from "@/lib/haptics";

const pad = (n: number) => String(n).padStart(2, "0");

/**
 * SC.09 — one big pull-quote at a time. Hard cuts between slides; buttons, arrow keys and (touch/pen) swipe.
 * The swipe tracks 1:1 from the grab point, projects the flick on release, and either carries the release
 * velocity out of frame (then the hard-cut wipe brings the next quote in) or springs back. No autoplay.
 */
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

  // ---- Swipe (apple-design: direct manipulation, interruptible springs, momentum projection) ----
  const track = useRef<HTMLDivElement>(null);
  const offset = useRef(0);
  const anim = useRef<Spring | null>(null);
  const drag = useRef<{ startX: number; startY: number; grabX: number; axis: "x" | "y" | null; vt: VelocityTracker } | null>(null);

  const setX = (x: number) => {
    offset.current = x;
    const el = track.current;
    if (!el) return;
    el.style.transform = x ? `translate3d(${x}px,0,0)` : "";
    // Large moving objects go semi-transparent while they travel.
    el.style.opacity = x ? String(1 - Math.min(Math.abs(x) / el.offsetWidth, 1) * 0.6) : "";
  };
  const reduced = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const onDown = (e: PointerEvent<HTMLDivElement>) => {
    if (e.pointerType === "mouse") return; // mice keep text selection; they have the arrows and keys
    anim.current?.stop(); // grab mid-flight: continue from the live position
    drag.current = { startX: e.clientX, startY: e.clientY, grabX: e.clientX - offset.current, axis: null, vt: new VelocityTracker() };
    drag.current.vt.add(e.clientX);
  };
  const onMove = (e: PointerEvent<HTMLDivElement>) => {
    const d = drag.current;
    if (!d) return;
    if (!d.axis) {
      const dx = e.clientX - d.startX;
      const dy = e.clientY - d.startY;
      if (Math.hypot(dx, dy) < 10) return; // hysteresis before committing to a direction
      d.axis = Math.abs(dx) > Math.abs(dy) ? "x" : "y";
      if (d.axis === "x") e.currentTarget.setPointerCapture(e.pointerId);
    }
    if (d.axis !== "x") return;
    d.vt.add(e.clientX);
    setX(e.clientX - d.grabX);
  };
  const onUp = () => {
    const d = drag.current;
    drag.current = null;
    if (!d || d.axis !== "x") {
      if (offset.current) settle(0, 0);
      return;
    }
    const v = d.vt.velocity;
    const w = track.current?.offsetWidth ?? 1;
    const landing = offset.current + project(v);
    if (Math.abs(landing) > w * 0.3) {
      const dir = landing < 0 ? 1 : -1;
      haptic("commit");
      if (reduced()) {
        setX(0);
        go(dir);
        return;
      }
      anim.current = spring({
        from: offset.current,
        to: -dir * w,
        velocity: v,
        response: 0.3,
        onUpdate: setX,
        onComplete: () => {
          setX(0);
          go(dir);
        },
      });
    } else settle(0, v);
  };
  const settle = (to: number, velocity: number) => {
    if (reduced()) return setX(to);
    anim.current = spring({ from: offset.current, to, velocity, response: 0.35, onUpdate: setX });
  };

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
      data-theme="wine"
      onKeyDown={onKey}
      className="theme-wine py-[clamp(6rem,12vw,11rem)]"
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
                <span key={k} className={cn("h-0.5 flex-1 transition-colors duration-500", k === i ? "bg-paper" : "bg-(--rule)")} />
              ))}
            </div>
            <div className="flex gap-2">
              <button type="button" onClick={() => go(-1)} aria-label="Previous testimonial" className="press grid size-12 place-items-center border border-(--rule) transition-colors hover:border-paper">
                <ArrowLeft aria-hidden="true" className="size-4" />
              </button>
              <button type="button" onClick={() => go(1)} aria-label="Next testimonial" className="press grid size-12 place-items-center border border-(--rule) transition-colors hover:border-paper">
                <ArrowRight aria-hidden="true" className="size-4" />
              </button>
            </div>
          </div>
        </div>

        <div
          ref={track}
          className="col-span-4 touch-pan-y md:col-span-9"
          aria-live="polite"
          onPointerDown={onDown}
          onPointerMove={onMove}
          onPointerUp={onUp}
          onPointerCancel={onUp}
        >
          <div key={i} role="group" aria-roledescription="slide" aria-label={`${i + 1} of ${n}`}>
          <figure>
            {t.isDemo && <SampleLabel className="text-mute-inv">Sample testimonial — replace with real client words</SampleLabel>}
            <blockquote data-quote className="mt-8 font-display text-[clamp(1.75rem,3.5vw,3.6rem)] font-medium leading-[1.12] tracking-[-0.025em]">
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
