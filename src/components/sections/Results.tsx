"use client";

import { useRef } from "react";
import { stats } from "@/config/content";
import { gsap, useDeferredGSAP, MQ, EASE } from "@/lib/gsap";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Placeholder } from "@/components/ui/Bits";

/* ---- Illustrative retention chart geometry (sqrt time axis so the hook is visible) ---- */
const W = 640;
const H = 360;
const X0 = 52;
const X1 = 620;
const Y0 = 318;
const Y1 = 18;
const x = (min: number) => X0 + Math.sqrt(min / 10) * (X1 - X0);
const y = (pct: number) => Y0 - (pct / 100) * (Y0 - Y1);
const typical: [number, number][] = [[0, 100], [0.08, 84], [0.25, 70], [0.5, 59], [1, 51], [2, 43], [4, 35], [6, 30], [8, 26], [10, 23]];
const ours: [number, number][] = [[0, 100], [0.08, 95], [0.25, 89], [0.5, 83], [1, 77], [2, 70], [4, 63], [6, 59], [6.5, 61], [8, 56], [10, 52]];

/** Catmull-Rom → cubic Bézier path through the points. */
function smooth(points: [number, number][]) {
  const p = points.map(([t, v]) => [x(t), y(v)] as const);
  let d = `M${p[0][0].toFixed(1)},${p[0][1].toFixed(1)}`;
  for (let i = 0; i < p.length - 1; i++) {
    const p0 = p[i - 1] ?? p[i];
    const p1 = p[i];
    const p2 = p[i + 1];
    const p3 = p[i + 2] ?? p2;
    const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
    const c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
    d += ` C${c1[0].toFixed(1)},${c1[1].toFixed(1)} ${c2[0].toFixed(1)},${c2[1].toFixed(1)} ${p2[0].toFixed(1)},${p2[1].toFixed(1)}`;
  }
  return d;
}
const OURS = smooth(ours);
const TYPICAL = smooth(typical);
const TICKS: [number, string][] = [[0, "0:00"], [0.5, "0:30"], [2, "2:00"], [5, "5:00"], [10, "10:00"]];

/** SC.08 — a "scopes" panel: counters (all placeholders) and an illustrative retention curve. */
export function Results() {
  const root = useRef<HTMLElement>(null);

  useDeferredGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(MQ.motion, () => {
        gsap.utils.toArray<HTMLElement>("[data-count]").forEach((el) => {
          const end = Number(el.dataset.count);
          const v = { n: 0 };
          el.textContent = "0";
          gsap.to(v, {
            n: end,
            duration: 1.6,
            ease: "power3.out",
            onUpdate: () => (el.textContent = String(Math.round(v.n))),
            scrollTrigger: { trigger: el, start: "top 88%", once: true },
          });
        });
        gsap.fromTo(
          "[data-plot]",
          { clipPath: "inset(0% 100% 0% 0%)" },
          { clipPath: "inset(0% 0% 0% 0%)", duration: 1.6, ease: EASE.cut, scrollTrigger: { trigger: "[data-plot]", start: "top 80%", once: true } },
        );
      });
    },
    root,
  );

  return (
    <section ref={root} id="results" aria-labelledby="results-title" data-scene="08" data-scene-label="Results" data-theme="paper" className="theme-paper py-[clamp(6rem,12vw,11rem)]">
      <SectionHeader
        id="results-title"
        scene="08"
        label="Results"
        title={
          <>
            Measured in minutes <em className="display-italic">watched.</em>
          </>
        }
        intro="The four numbers we report on for every client. Each one below is a placeholder until real figures go in."
      />

      <div className="grid-shell mt-14 md:mt-20">
        <div className="crop-marks relative col-span-4 grid p-px text-mute md:col-span-12 md:grid-cols-12">
          <dl className="grid grid-cols-2 border border-(--rule) text-ink md:col-span-6">
            {stats.map((s, i) => (
              <div
                key={s.label}
                className={`flex flex-col-reverse justify-end gap-3 p-5 md:p-7 ${i % 2 === 0 ? "border-r border-(--rule)" : ""} ${i < 2 ? "border-b border-(--rule)" : ""}`}
              >
                <dt className="flex flex-col items-start gap-3">
                  <span className="text-sm leading-snug text-(--fg-mute)">{s.label}</span>
                  {s.isPlaceholder && <Placeholder align={i % 2 ? "right" : "left"} />}
                </dt>
                <dd className="font-mono text-[clamp(2.5rem,6vw,5.5rem)] font-light leading-none tracking-[-0.04em] tnum">
                  <span data-count={s.value}>{s.value}</span>
                  <span className="text-[0.5em] text-(--fg-mute)">{s.suffix}</span>
                </dd>
              </div>
            ))}
          </dl>

          <figure className="border border-t-0 border-(--rule) p-5 text-ink md:col-span-6 md:border-l-0 md:border-t md:p-7">
            <div className="meta flex flex-wrap items-center justify-between gap-3">
              <span>Audience retention</span>
              <span className="flex items-center gap-4 text-(--fg-mute)">
                <span className="flex items-center gap-2">
                  <span className="h-0.5 w-5 bg-ink" aria-hidden="true" /> Cut for retention
                </span>
                <span className="flex items-center gap-2">
                  <span className="h-0 w-5 border-t border-dashed border-mute" aria-hidden="true" /> Typical edit
                </span>
              </span>
            </div>
            <div className="relative mt-5" style={{ aspectRatio: `${W} / ${H}` }}>
              <svg viewBox={`0 0 ${W} ${H}`} className="absolute inset-0 h-full w-full" aria-hidden="true">
                {[0, 25, 50, 75, 100].map((v) => (
                  <g key={v}>
                    <line x1={X0} x2={X1} y1={y(v)} y2={y(v)} className="stroke-ink/10" />
                    <text x={X0 - 10} y={y(v) + 4} textAnchor="end" className="fill-mute font-mono text-[11px]">
                      {v}%
                    </text>
                  </g>
                ))}
                {TICKS.map(([t, l]) => (
                  <text key={l} x={x(t)} y={H - 2} textAnchor="middle" className="fill-mute font-mono text-[11px]">
                    {l}
                  </text>
                ))}
                <line x1={x(5 / 60)} x2={x(5 / 60)} y1={Y1} y2={Y0} className="stroke-signal" strokeDasharray="3 4" />
                <text x={x(5 / 60) + 6} y={Y1 + 12} className="fill-ink font-mono text-[11px]">
                  HOOK 0:05
                </text>
              </svg>
              <div data-plot className="absolute inset-0">
                <svg viewBox={`0 0 ${W} ${H}`} className="h-full w-full" aria-hidden="true">
                  <path d={`${OURS} L${X1},${Y0} L${X0},${Y0} Z`} className="fill-ink/[0.06]" />
                  <path d={TYPICAL} fill="none" className="stroke-mute" strokeWidth="1.5" strokeDasharray="5 5" />
                  <path d={OURS} fill="none" className="stroke-ink" strokeWidth="2.25" strokeLinejoin="round" />
                  <circle cx={x(6.5)} cy={y(61)} r="4" className="fill-signal" />
                  <text x={x(6.5) - 8} y={y(61) - 12} textAnchor="end" className="fill-ink font-mono text-[11px]">
                    PAYOFF
                  </text>
                </svg>
              </div>
            </div>
            <figcaption className="meta mt-4 text-(--fg-mute)">Illustrative curve, not client data.</figcaption>
          </figure>
        </div>
      </div>
    </section>
  );
}
