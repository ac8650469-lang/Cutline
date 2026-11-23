"use client";

import { useRef, useState } from "react";
import { Plus } from "lucide-react";
import { services } from "@/config/services";
import { gsap, useDeferredGSAP, MQ, EASE } from "@/lib/gsap";
import { useFinePointer } from "@/lib/hooks";
import { MediaFrame } from "@/components/ui/MediaFrame";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { cn } from "@/lib/utils";

const pad = (n: number) => String(n).padStart(2, "0");
const FIELDS = [
  ["what", "What it is"],
  ["problem", "Problem it solves"],
  ["who", "Who it’s for"],
  ["why", "Why it matters"],
] as const;

/** SC.04 — an index, not cards. Hover a row for a floating preview; open it for four lines of detail. */
export function Services() {
  const root = useRef<HTMLElement>(null);
  const preview = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState<string | null>(null);
  const [hover, setHover] = useState<string | null>(null);
  const fine = useFinePointer();

  useDeferredGSAP(
    () => {
      const el = root.current;
      const pv = preview.current;
      if (!el) return;
      const mm = gsap.matchMedia();
      mm.add(MQ.fine, () => {
        if (!pv) return;
        const xTo = gsap.quickTo(pv, "x", { duration: 0.7, ease: "expo.out" });
        const yTo = gsap.quickTo(pv, "y", { duration: 0.7, ease: "expo.out" });
        const move = (e: PointerEvent) => {
          const r = el.getBoundingClientRect();
          xTo(e.clientX - r.left);
          yTo(e.clientY - r.top);
        };
        el.addEventListener("pointermove", move);
        return () => el.removeEventListener("pointermove", move);
      });
      mm.add(MQ.motion, () => {
        gsap.to("[data-row-rule]", {
          scaleX: 1,
          duration: 1.1,
          ease: EASE.cut,
          stagger: 0.07,
          scrollTrigger: { trigger: "[data-service-list]", start: "top 82%", once: true },
        });
      });
    },
    root,
  );

  return (
    <section
      ref={root}
      id="services"
      aria-labelledby="services-title"
      data-scene="04"
      data-scene-label="Services"
      data-theme="ink"
      className="theme-ink relative overflow-clip py-[clamp(6rem,12vw,11rem)]"
    >
      <SectionHeader
        id="services-title"
        scene="04"
        label="Services"
        title={
          <>
            What we <em className="display-italic">cut.</em>
          </>
        }
        intro="Seven crafts, one team. Open a row for what it is, who it's for and why it matters."
      />

      <ul data-service-list className="shell mt-14 md:mt-20" onPointerLeave={() => setHover(null)}>
        {services.map((s, i) => {
          const isOpen = open === s.id;
          const dim = fine && hover !== null && hover !== s.id;
          return (
            <li key={s.id} className="relative" onPointerEnter={fine ? () => setHover(s.id) : undefined}>
              <span data-rule data-row-rule aria-hidden="true" className="absolute inset-x-0 top-0 h-px bg-(--rule)" />
              <h3>
                <button
                  type="button"
                  id={`svc-btn-${s.id}`}
                  aria-expanded={isOpen}
                  aria-controls={`svc-${s.id}`}
                  data-cursor={isOpen ? "Close" : "Open"}
                  onClick={() => setOpen(isOpen ? null : s.id)}
                  className="group/row grid w-full grid-cols-[2.25rem_1fr_auto] items-baseline gap-x-4 py-5 text-left md:grid-cols-[4rem_1fr_14rem_2rem] md:py-7"
                >
                  <span className="meta text-(--fg-mute)">{pad(i + 1)}</span>
                  <span
                    className={cn(
                      "font-display text-[clamp(2.15rem,6.2vw,6.25rem)] leading-[0.95] tracking-[-0.02em] transition-[translate,opacity] duration-500 ease-out-expo group-hover/row:translate-x-3",
                      dim && "opacity-35",
                    )}
                  >
                    {s.title}
                  </span>
                  <span className={cn("meta hidden text-(--fg-mute) transition-opacity duration-500 md:block", dim && "opacity-35")}>
                    {s.formats}
                  </span>
                  <Plus
                    aria-hidden="true"
                    className={cn("size-5 self-center justify-self-end transition-transform duration-500 ease-cut", isOpen && "rotate-45")}
                  />
                </button>
              </h3>
              <div
                id={`svc-${s.id}`}
                role="region"
                aria-labelledby={`svc-btn-${s.id}`}
                className="acc-panel"
                data-open={isOpen}
                inert={!isOpen}
              >
                <div>
                  <div className="grid gap-6 pb-10 md:grid-cols-[4rem_1fr] md:gap-x-4">
                    {!fine && (
                      <MediaFrame
                        src={s.preview}
                        aspect="16 / 9"
                        label={`${s.title} preview (demo footage)`}
                        playback={isOpen ? "inview" : "none"}
                        className="md:col-start-2"
                      />
                    )}
                    <dl className="grid gap-6 sm:grid-cols-2 md:col-start-2 lg:grid-cols-4">
                      {FIELDS.map(([key, label]) => (
                        <div key={key} className="border-t border-(--rule) pt-3">
                          <dt className="meta text-signal-bright">{label}</dt>
                          <dd className="mt-2 max-w-[34ch] leading-relaxed text-paper/90">{s[key]}</dd>
                        </div>
                      ))}
                    </dl>
                  </div>
                </div>
              </div>
            </li>
          );
        })}
        <li aria-hidden="true" className="relative h-px">
          <span data-rule data-row-rule className="absolute inset-x-0 top-0 h-px bg-(--rule)" />
        </li>
      </ul>

      {/* Floating preview (pointer devices only) */}
      {fine && (
        <div
          ref={preview}
          aria-hidden="true"
          className={cn(
            "pointer-events-none absolute left-0 top-0 z-20 hidden w-[clamp(220px,22vw,340px)] -translate-x-1/2 -translate-y-1/2 transition-opacity duration-300 md:block",
            hover ? "opacity-100" : "opacity-0",
          )}
        >
          <div className="relative aspect-[4/3]">
            {services.map((s) => (
              <div
                key={s.id}
                className={cn(
                  "absolute inset-0 transition-[clip-path] duration-500 ease-cut",
                  hover === s.id ? "[clip-path:inset(0_0_0_0)]" : "[clip-path:inset(50%_0_50%_0)]",
                )}
              >
                <MediaFrame src={s.preview} fill label="" playback="controlled" active={hover === s.id} />
              </div>
            ))}
            <span className="meta absolute -bottom-6 left-0 text-micro text-mute-inv">
              {services.find((s) => s.id === hover)?.formats ?? ""}
            </span>
          </div>
        </div>
      )}
    </section>
  );
}
