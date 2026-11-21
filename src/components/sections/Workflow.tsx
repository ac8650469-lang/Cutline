"use client";

import { useMemo, useRef, useState } from "react";
import { workflow } from "@/config/content";
import { gsap, ScrollTrigger, useGSAP, MQ, EASE } from "@/lib/gsap";
import { scrollToTarget } from "@/lib/smooth-scroll";
import { seeded } from "@/lib/utils";
import { cn } from "@/lib/utils";

const pad = (n: number) => String(n).padStart(2, "0");
const TOTAL = workflow.reduce((s, w) => s + w.weight, 0);
/** Cumulative clip boundaries as fractions of the sequence. */
const EDGES = workflow.reduce<number[]>((acc, w) => [...acc, acc[acc.length - 1] + w.weight / TOTAL], [0]);
const wave = (() => {
  const r = seeded(24);
  return Array.from({ length: 140 }, (_, i) => 0.25 + 0.55 * Math.abs(Math.sin(i / 4.3)) * (0.5 + r() * 0.5));
})();

function Inspector({ index }: { index: number }) {
  const w = workflow[index];
  return (
    <div data-insp className="flex flex-col gap-5">
      <p className="meta flex items-center gap-3 text-mute-inv">
        <span className="size-2 bg-signal" aria-hidden="true" />
        Clip {pad(index + 1)} / {pad(workflow.length)}
      </p>
      <h3 className="font-display text-h2">{w.title}</h3>
      <p className="max-w-[46ch] text-lead leading-relaxed text-paper/85">{w.body}</p>
      <dl className="meta grid grid-cols-2 gap-6 border-t border-(--rule) pt-4">
        <div>
          <dt className="text-mute-inv">Typical duration</dt>
          <dd className="mt-1.5">{w.duration}</dd>
        </div>
        <div>
          <dt className="text-mute-inv">You provide</dt>
          <dd className="mt-1.5 normal-case tracking-normal">{w.provide}</dd>
        </div>
      </dl>
    </div>
  );
}

/** SC.07 — the process drawn as an edit timeline. A playhead scrubs it as you scroll (pinned, desktop). */
export function Workflow() {
  const root = useRef<HTMLElement>(null);
  const [active, setActive] = useState(0);
  const activeRef = useRef(0);
  const changed = useRef(false);
  const rulerMarks = useMemo(() => Array.from({ length: 8 }, (_, i) => `Day ${pad(i * 2)}`), []);

  useGSAP(
    () => {
      const el = root.current;
      if (!el) return;
      const mm = gsap.matchMedia();
      mm.add(`${MQ.motion} and ${MQ.desktop}`, () => {
        const track = el.querySelector<HTMLElement>("[data-track]");
        const head = el.querySelector<HTMLElement>("[data-head]");
        const tc = el.querySelector<HTMLElement>("[data-wf-tc]");
        if (!track || !head) return;
        const setX = gsap.quickSetter(head, "x", "px");
        ScrollTrigger.create({
          trigger: el,
          start: "top top",
          end: "bottom bottom",
          onUpdate: (self) => {
            const p = self.progress;
            setX(p * track.clientWidth);
            if (tc) tc.textContent = `Day ${pad(Math.round(p * 14))} · ${Math.round(p * 100)}%`;
            const k = EDGES.findIndex((e) => e > p);
            const next = k === -1 ? workflow.length - 1 : Math.max(0, k - 1);
            if (next !== activeRef.current) {
              activeRef.current = next;
              setActive(next);
            }
          },
          onRefresh: (self) => setX(self.progress * track.clientWidth),
        });
      });
      mm.add(MQ.motion, () => {
        gsap.fromTo(
          "[data-vline]",
          { scaleY: 0 },
          { scaleY: 1, ease: "none", scrollTrigger: { trigger: "[data-vlist]", start: "top 65%", end: "bottom 65%", scrub: true } },
        );
      });
    },
    { scope: root },
  );

  // Inspector content cuts in with a wipe each time the playhead crosses into a new clip.
  useGSAP(
    () => {
      if (!changed.current) {
        changed.current = true;
        return;
      }
      const mm = gsap.matchMedia();
      mm.add(MQ.motion, () => {
        gsap.fromTo("[data-insp]", { clipPath: "inset(0% 100% 0% 0%)" }, { clipPath: "inset(0% 0% 0% 0%)", duration: 0.55, ease: EASE.cut });
      });
    },
    { scope: root, dependencies: [active], revertOnUpdate: false },
  );

  const jumpTo = (i: number) => {
    const el = root.current;
    if (!el) return;
    const mid = (EDGES[i] + EDGES[i + 1]) / 2;
    const top = el.getBoundingClientRect().top + window.scrollY;
    scrollToTarget(top + mid * (el.offsetHeight - window.innerHeight), { duration: 1 });
  };

  return (
    <section
      ref={root}
      id="workflow"
      aria-label="Workflow"
      data-scene="07"
      data-scene-label="Workflow"
      data-theme="ink"
      className="theme-ink relative md:motion-safe:h-[340svh]"
    >
      {/* Desktop: pinned NLE timeline */}
      <div className="sticky top-0 hidden h-svh md:motion-safe:block">
        <div className="flex h-full flex-col justify-between gap-6 pb-[var(--margin)] pt-[calc(var(--nav-h)+1rem)]">
          <div className="grid-shell gap-y-6">
            <div className="col-span-5 flex flex-col gap-5">
              <p className="meta flex items-center gap-4 text-mute-inv">
                <span className="text-paper">SC.07</span>
                <span className="h-px w-16 bg-(--rule)" aria-hidden="true" />
                <span>Workflow</span>
              </p>
              <h2 className="font-display text-h2 lg:text-[clamp(3rem,6vw,6.5rem)] lg:leading-[0.9]">
                How a project <em className="display-italic">runs.</em>
              </h2>
              <p className="max-w-[34ch] text-mute-inv">Six clips on one sequence. Scroll to move the playhead, or pick a clip.</p>
            </div>
            <div className="col-span-6 col-start-7 min-h-[16rem]" aria-live="polite">
              <Inspector index={active} />
            </div>
          </div>

          <div className="mx-[var(--margin)] border border-(--rule) bg-ink-2">
            <div className="meta flex items-center justify-between border-b border-(--rule) px-4 py-2.5 text-micro text-mute-inv">
              <span>Sequence 01 · Project workflow · 24 fps</span>
              <span data-wf-tc className="tnum text-paper">
                Day 00 · 0%
              </span>
            </div>
            <div className="grid grid-cols-[3rem_1fr]">
              <div className="meta flex flex-col border-r border-(--rule) text-micro text-mute-inv">
                <span className="h-7 border-b border-(--rule)" />
                <span className="flex h-20 items-center justify-center border-b border-(--rule)">V1</span>
                <span className="flex h-12 items-center justify-center">A1</span>
              </div>
              <div data-track className="relative">
                <div className="ruler meta relative flex h-7 items-end justify-between border-b border-(--rule) px-1 pb-1 text-micro text-mute-inv [color:var(--rule)]">
                  {rulerMarks.map((m) => (
                    <span key={m} className="text-mute-inv">
                      {m}
                    </span>
                  ))}
                </div>
                <ol className="flex h-20 gap-px border-b border-(--rule) p-1.5">
                  {workflow.map((w, i) => (
                    <li key={w.id} style={{ flex: `${w.weight} 1 0%` }} className="min-w-0">
                      <button
                        type="button"
                        onClick={() => jumpTo(i)}
                        aria-current={i === active ? "step" : undefined}
                        aria-label={`Clip ${i + 1}: ${w.title}`}
                        className={cn(
                          "flex h-full w-full flex-col justify-between overflow-hidden border px-2 py-1.5 text-left transition-colors duration-300",
                          i === active
                            ? "border-paper bg-paper text-ink"
                            : i < active
                              ? "border-paper/30 bg-paper/10 text-paper"
                              : "border-(--rule) text-mute-inv hover:border-paper/50",
                        )}
                      >
                        <span className="meta text-micro">{pad(i + 1)}</span>
                        <span className="truncate text-sm font-medium">{w.title}</span>
                      </button>
                    </li>
                  ))}
                </ol>
                <svg viewBox="0 0 560 48" preserveAspectRatio="none" className="h-12 w-full" aria-hidden="true">
                  {wave.map((v, i) => (
                    <rect key={i} x={i * 4} y={24 - v * 20} width="2" height={v * 40} className="fill-mute-inv/40" />
                  ))}
                </svg>
                <span data-head aria-hidden="true" className="pointer-events-none absolute -top-px bottom-0 left-0 w-px bg-signal">
                  <span className="absolute -left-[5px] top-0 block size-[11px] bg-signal [clip-path:polygon(0_0,100%_0,100%_55%,50%_100%,0_55%)]" />
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile and reduced motion: vertical timeline, no pinning */}
      <div className="py-[clamp(5rem,12vw,9rem)] md:motion-safe:hidden">
        <div className="shell flex flex-col gap-5">
          <p className="meta flex items-center gap-4 text-mute-inv">
            <span className="text-paper">SC.07</span>
            <span className="h-px w-16 bg-(--rule)" aria-hidden="true" />
            <span>Workflow</span>
          </p>
          <h2 className="font-display text-h2">
            How a project <em className="display-italic">runs.</em>
          </h2>
        </div>
        <ol data-vlist className="shell relative mt-12">
          <span aria-hidden="true" className="absolute bottom-0 left-[calc(var(--margin)+5px)] top-0 w-px bg-(--rule)" />
          <span data-vline aria-hidden="true" className="absolute bottom-0 left-[calc(var(--margin)+5px)] top-0 w-px origin-top bg-signal" />
          {workflow.map((w, i) => (
            <li key={w.id} className="relative pb-12 pl-9 last:pb-0">
              <span aria-hidden="true" className="absolute left-0 top-1.5 size-[11px] border border-paper bg-ink" />
              <p className="meta text-mute-inv">
                {pad(i + 1)} · {w.duration}
              </p>
              <h3 className="mt-2 font-display text-h3">{w.title}</h3>
              <p className="mt-3 max-w-[48ch] leading-relaxed text-paper/85">{w.body}</p>
              <p className="meta mt-3 text-mute-inv">
                You provide: <span className="normal-case tracking-normal text-paper">{w.provide}</span>
              </p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
