"use client";

import { useRef, type ReactNode } from "react";
import { gsap, useDeferredGSAP, MQ, EASE, DUR } from "@/lib/gsap";
import { cn } from "@/lib/utils";

type Props = {
  scene: string;
  label: string;
  title: ReactNode;
  intro?: ReactNode;
  aside?: ReactNode;
  id?: string;
  className?: string;
};

/** Scene number + rule + title. The title enters with the signature hard wipe, led by a signal bar. */
export function SectionHeader({ scene, label, title, intro, aside, id, className }: Props) {
  const root = useRef<HTMLElement>(null);

  useDeferredGSAP(
    () => {
      const el = root.current;
      if (!el) return;
      const mm = gsap.matchMedia();
      mm.add(MQ.motion, () => {
        const title = el.querySelector<HTMLElement>("[data-cut]");
        const bar = el.querySelector<HTMLElement>("[data-wipe-bar]");
        const rule = el.querySelector<HTMLElement>("[data-rule]");
        const tl = gsap.timeline({ scrollTrigger: { trigger: el, start: "top 82%", once: true } });
        if (rule) tl.to(rule, { scaleX: 1, duration: DUR.slow, ease: EASE.cut }, 0);
        if (title) {
          tl.fromTo(
            title,
            { clipPath: "inset(0% 100% 0% 0%)" },
            { clipPath: "inset(0% 0% 0% 0%)", duration: DUR.slow, ease: EASE.cut },
            0.15,
          );
          if (bar) {
            tl.fromTo(bar, { x: 0, opacity: 1 }, { x: () => title.offsetWidth, duration: DUR.slow, ease: EASE.cut }, 0.15).to(
              bar,
              { opacity: 0, duration: DUR.fast },
            );
          }
        }
      });
    },
    root,
  );

  return (
    <header ref={root} className={cn("grid-shell gap-y-6", className)}>
      <p className="meta col-span-4 flex items-center gap-4 text-(--fg-mute) md:col-span-12">
        <span className="text-(--accent)">SC.{scene}</span>
        <span data-rule aria-hidden="true" className="h-px flex-1 bg-(--rule)" />
        <span>{label}</span>
      </p>
      <div className="relative col-span-4 md:col-span-9">
        <h2 id={id} data-cut className="font-display text-h2 md:text-display">
          {title}
        </h2>
        <span data-wipe-bar aria-hidden="true" className="absolute inset-y-0 left-0 w-0.5 bg-signal opacity-0" />
      </div>
      {(intro || aside) && (
        <div className="col-span-4 flex flex-col gap-4 self-end md:col-span-3 md:pb-3">
          {intro && <p className="max-w-[36ch] text-(--fg-mute)">{intro}</p>}
          {aside}
        </div>
      )}
    </header>
  );
}
