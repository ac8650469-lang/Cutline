"use client";

import { useEffect, useLayoutEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import { categories, projects, aspectRatio, type Category } from "@/config/projects";
import { gsap, ScrollTrigger, EASE, loadFlip } from "@/lib/gsap";
import type { Flip as FlipPlugin } from "gsap/Flip";
import { useFinePointer, usePrefersReducedMotion } from "@/lib/hooks";
import { MediaFrame } from "@/components/ui/MediaFrame";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { SampleLabel } from "@/components/ui/Bits";
import dynamic from "next/dynamic";

/** Start fetching the lightbox on first pointer contact, so opening a project has no load wait. */
const preloadLightbox = () => void import("@/components/media/ProjectLightbox");
const ProjectLightbox = dynamic(() => import("@/components/media/ProjectLightbox").then((m) => m.ProjectLightbox), { ssr: false });
import { composeWork } from "./work-layout";
import { cn } from "@/lib/utils";

type Filter = "All" | Category;
const pad = (n: number) => String(n).padStart(2, "0");

export function Work() {
  const list = useRef<HTMLUListElement>(null);
  const flip = useRef<typeof FlipPlugin | null>(null);
  const flipState = useRef<ReturnType<(typeof FlipPlugin)["getState"]> | null>(null);
  const [filter, setFilter] = useState<Filter>("All");
  const [active, setActive] = useState<string | null>(null);
  const [openSlug, setOpenSlug] = useState<string | null>(null);
  // Stays mounted after first use so the surface can fly back to its card on close.
  const [lightboxUsed, setLightboxUsed] = useState(false);
  if (openSlug && !lightboxUsed) setLightboxUsed(true);
  // Fetch the lightbox while the browser is idle so the first open has no load wait (apple-design §1).
  useEffect(() => {
    const w = window as Window & { requestIdleCallback?: (cb: () => void) => number; cancelIdleCallback?: (id: number) => void };
    if (w.requestIdleCallback) {
      const id = w.requestIdleCallback(preloadLightbox);
      return () => w.cancelIdleCallback?.(id);
    }
    const id = window.setTimeout(preloadLightbox, 2000);
    return () => window.clearTimeout(id);
  }, []);
  const fine = useFinePointer();
  const reduce = usePrefersReducedMotion();

  const visible = useMemo(
    () => (filter === "All" ? projects : projects.filter((p) => p.categories.includes(filter))),
    [filter],
  );
  const slots = useMemo(() => {
    const composed = composeWork(visible);
    return new Map(visible.map((p, i) => [p.slug, composed[i]]));
  }, [visible]);

  const counts = useMemo(() => {
    const c = new Map<Filter, number>([["All", projects.length]]);
    for (const cat of categories) c.set(cat, projects.filter((p) => p.categories.includes(cat)).length);
    return c;
  }, []);

  const choose = async (f: Filter) => {
    if (f === filter) return;
    if (!reduce) {
      try {
        flip.current ??= await loadFlip();
        if (list.current) flipState.current = flip.current.getState(list.current.querySelectorAll("[data-flip-id]"));
      } catch {
        flipState.current = null; // plugin failed to load: filter without the FLIP animation
      }
    }
    setFilter(f);
  };

  // FLIP: animate from the captured layout to the new one. Leaving cards hard-cut out.
  const firstLayout = useRef(true);
  useLayoutEffect(() => {
    if (firstLayout.current) {
      firstLayout.current = false;
      return;
    }
    const state = flipState.current;
    const Flip = flip.current;
    flipState.current = null;
    if (!state || !Flip || reduce) {
      ScrollTrigger.refresh();
      return;
    }
    Flip.from(state, {
      duration: 0.8,
      ease: EASE.cut,
      absolute: true,
      onEnter: (els) =>
        gsap.fromTo(
          els,
          { opacity: 0, clipPath: "inset(50% 0% 50% 0%)" },
          { opacity: 1, clipPath: "inset(0% 0% 0% 0%)", duration: 0.7, delay: 0.25, ease: EASE.cut, clearProps: "clipPath" },
        ),
      onComplete: () => ScrollTrigger.refresh(),
    });
  }, [filter, reduce]);

  // Touch devices: play the single most visible card.
  useEffect(() => {
    const root = list.current;
    if (fine || !root) return;
    const ratios = new Map<string, number>();
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) ratios.set((e.target as HTMLElement).dataset.flipId ?? "", e.isIntersecting ? e.intersectionRatio : 0);
        let best: string | null = null;
        let max = 0.55;
        ratios.forEach((r, k) => {
          if (r > max) {
            max = r;
            best = k;
          }
        });
        setActive(best);
      },
      { threshold: [0, 0.25, 0.5, 0.6, 0.75, 0.9, 1] },
    );
    root.querySelectorAll("[data-flip-id]:not([data-hidden='true'])").forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [fine, filter]);

  // Close the lightbox if this route is hidden (cacheComponents keeps it alive in the background).
  useLayoutEffect(() => () => setOpenSlug(null), []);

  const openIndex = openSlug ? visible.findIndex((p) => p.slug === openSlug) : -1;
  const step = (d: number) => {
    if (openIndex < 0) return;
    setOpenSlug(visible[(openIndex + d + visible.length) % visible.length].slug);
  };

  return (
    <section id="work" onPointerOver={preloadLightbox} onPointerDown={preloadLightbox} aria-labelledby="work-title" data-scene="03" data-scene-label="Selected work" data-theme="paper" className="theme-paper py-[clamp(6rem,12vw,11rem)]">
      <SectionHeader
        id="work-title"
        scene="03"
        label="Selected work"
        title={
          <>
            Cut, graded, <em className="display-italic">delivered.</em>
          </>
        }
        intro="Long-form, vertical and campaign work, each cut for the platform it lives on."
        aside={projects.some((p) => p.isDemo) ? <SampleLabel>Demo projects · sample footage</SampleLabel> : undefined}
      />

      <div className="grid-shell mt-12 md:mt-16">
        <div
          role="group"
          aria-label="Filter work by category"
          className="col-span-4 -mx-(--margin) flex gap-1 overflow-x-auto px-(--margin) [scrollbar-width:none] md:col-span-12 md:mx-0 md:flex-wrap md:overflow-visible md:px-0"
        >
          {(["All", ...categories] as Filter[]).map((f) => (
            <button
              key={f}
              type="button"
              aria-pressed={filter === f}
              onClick={() => choose(f)}
              className={cn(
                "press meta inline-flex min-h-11 shrink-0 items-center gap-2 border px-3 transition-colors duration-300",
                filter === f ? "border-wine bg-wine text-paper" : "border-(--rule) hover:border-wine",
              )}
            >
              {f}
              <span className={cn("text-micro", filter === f ? "text-mute-inv" : "text-(--fg-mute)")}>{pad(counts.get(f) ?? 0)}</span>
            </button>
          ))}
        </div>
        <p className="meta col-span-4 mt-4 text-(--fg-mute) md:col-span-12" aria-live="polite">
          Showing {pad(visible.length)} of {pad(projects.length)}
          {filter !== "All" ? ` · ${filter}` : ""}
        </p>
      </div>

      <ul ref={list} className="grid-shell mt-10 gap-y-[clamp(3.5rem,8vw,8rem)] md:mt-14">
        {projects.map((p) => {
          const slot = slots.get(p.slug);
          const hidden = !slot;
          const n = projects.indexOf(p) + 1;
          const style = slot
            ? ({
                "--r": slot.row,
                "--cs": slot.start,
                "--sp": slot.span,
                "--al": slot.align,
                "--mcs": slot.mStart,
                "--msp": slot.mSpan,
              } as CSSProperties)
            : undefined;
          return (
            <li
              key={p.slug}
              data-flip-id={p.slug}
              data-hidden={hidden}
              style={style}
              onPointerEnter={fine ? () => setActive(p.slug) : undefined}
              onPointerLeave={fine ? () => setActive((s) => (s === p.slug ? null : s)) : undefined}
              data-origin={p.slug}
              className="press-card group relative [grid-column:var(--mcs)/span_var(--msp)] data-[hidden=true]:hidden md:[align-self:var(--al)] md:[grid-column:var(--cs)/span_var(--sp)] md:[grid-row:var(--r)]"
            >
              <MediaFrame
                src={p.src}
                aspect={aspectRatio[p.aspect]}
                label={`${p.title}: ${p.client}, ${p.categories[0]}${p.isDemo ? " (demo footage)" : ""}`}
                playback="controlled"
                active={active === p.slug}
                log
                splice
                isDemo={p.isDemo}
              >
                <div className="meta pointer-events-none absolute inset-0 z-10 flex flex-col justify-between p-2 text-micro text-paper opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                  <div className="flex justify-end gap-1">
                    <span className="bg-ink/75 px-1.5 py-0.5">{p.codec}</span>
                    <span className="bg-ink/75 px-1.5 py-0.5">{p.fps} fps</span>
                  </div>
                  <div className="flex justify-between gap-1">
                    <span className="bg-ink/75 px-1.5 py-0.5">{p.aspect}</span>
                    <span className="bg-ink/75 px-1.5 py-0.5">TC {p.duration}</span>
                  </div>
                </div>
              </MediaFrame>
              <div className="mt-3 flex items-baseline justify-between gap-4 border-t border-(--rule) pt-3">
                <h3 className="font-display text-h3">
                  <button
                    type="button"
                    onClick={() => setOpenSlug(p.slug)}
                    className="text-left outline-none after:absolute after:inset-0 after:content-[''] focus-visible:after:outline-2 focus-visible:after:outline-offset-4 focus-visible:after:outline-(--focus)"
                  >
                    {p.title}
                  </button>
                </h3>
                <span className="meta shrink-0 text-(--fg-mute)">{pad(n)}</span>
              </div>
              <p className="meta mt-1.5 text-(--fg-mute)">
                {p.categories.join(" · ")} — {p.aspect} · {p.duration}
              </p>
              {(p.aspect === "16:9" || p.aspect === "21:9") && (
                <p className="mt-3 hidden max-w-[54ch] text-sm leading-relaxed text-(--fg-mute) md:line-clamp-2">{p.brief}</p>
              )}
            </li>
          );
        })}
      </ul>

      {lightboxUsed && (
        <ProjectLightbox
          project={openIndex >= 0 ? visible[openIndex] : null}
          index={openIndex}
          total={visible.length}
          onClose={() => setOpenSlug(null)}
          onPrev={() => step(-1)}
          onNext={() => step(1)}
        />
      )}
    </section>
  );
}
