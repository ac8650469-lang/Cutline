"use client";

import { useRef, useState, type KeyboardEvent } from "react";
import { capabilities } from "@/config/content";
import { gsap, useGSAP, MQ, EASE } from "@/lib/gsap";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { BeforeAfter } from "@/components/media/BeforeAfter";
import { cn } from "@/lib/utils";

/** SC.05 — raw → final. Tabs per craft; each tab is its own comparison. */
export function Capabilities() {
  const root = useRef<HTMLElement>(null);
  const tabs = useRef<Array<HTMLButtonElement | null>>([]);
  const [index, setIndex] = useState(0);
  const tab = capabilities[index];

  const changed = useRef(false);

  // Each tab change (not the first render) is a hard horizontal wipe on the media and the copy.
  useGSAP(
    () => {
      if (!changed.current) {
        changed.current = true;
        return;
      }
      const mm = gsap.matchMedia();
      mm.add(MQ.motion, () => {
        gsap.fromTo(
          "[data-tab-wipe]",
          { clipPath: "inset(0% 100% 0% 0%)" },
          { clipPath: "inset(0% 0% 0% 0%)", duration: 0.8, ease: EASE.cut, stagger: 0.08 },
        );
      });
    },
    { scope: root, dependencies: [index], revertOnUpdate: false },
  );

  const onKey = (e: KeyboardEvent<HTMLDivElement>) => {
    const last = capabilities.length - 1;
    const next =
      e.key === "ArrowRight" ? (index === last ? 0 : index + 1) : e.key === "ArrowLeft" ? (index === 0 ? last : index - 1) : e.key === "Home" ? 0 : e.key === "End" ? last : null;
    if (next === null) return;
    e.preventDefault();
    setIndex(next);
    tabs.current[next]?.focus();
  };

  return (
    <section
      ref={root}
      id="raw-to-final"
      aria-labelledby="caps-title"
      data-scene="05"
      data-scene-label="Raw to final"
      data-theme="paper"
      className="theme-paper-2 py-[clamp(6rem,12vw,11rem)]"
    >
      <SectionHeader
        id="caps-title"
        scene="05"
        label="Raw → final"
        title={
          <>
            Raw in. <em className="display-italic">Final out.</em>
          </>
        }
        intro="Drag the divider. Left is what arrives on the drive, right is what leaves the edit suite."
      />

      <div className="grid-shell mt-12 gap-y-8 md:mt-16">
        <div className="col-span-4 md:col-span-8">
          <div role="tablist" aria-label="Craft areas" onKeyDown={onKey} className="mb-4 flex flex-wrap gap-1">
            {capabilities.map((c, i) => (
              <button
                key={c.id}
                ref={(el) => {
                  tabs.current[i] = el;
                }}
                type="button"
                role="tab"
                id={`cap-tab-${c.id}`}
                aria-selected={i === index}
                aria-controls="cap-panel"
                tabIndex={i === index ? 0 : -1}
                onClick={() => setIndex(i)}
                className={cn(
                  "meta inline-flex min-h-11 items-center gap-2 border px-4 transition-colors duration-300",
                  i === index ? "border-wine bg-wine text-paper" : "border-(--rule) hover:border-wine",
                )}
              >
                <span className={i === index ? "text-mute-inv" : "text-(--fg-mute)"}>0{i + 1}</span>
                {c.label}
              </button>
            ))}
          </div>
          <div id="cap-panel" role="tabpanel" aria-labelledby={`cap-tab-${tab.id}`}>
            <div data-tab-wipe>
              <BeforeAfter key={tab.id} tab={tab} />
            </div>
            <p className="meta mt-3 text-(--fg-mute)">{tab.note}</p>
          </div>
        </div>

        <div data-tab-wipe className="col-span-4 flex flex-col gap-6 md:col-span-4 md:pt-15">
          <h3 className="font-display text-h3">{tab.title}</h3>
          <p className="leading-relaxed text-(--fg-mute)">{tab.body}</p>
          <div className="border-t border-(--rule) pt-4">
            <p className="meta">What to look for</p>
            <p className="mt-2 leading-relaxed text-(--fg-mute)">{tab.lookFor}</p>
          </div>
        </div>
      </div>
    </section>
  );
}
