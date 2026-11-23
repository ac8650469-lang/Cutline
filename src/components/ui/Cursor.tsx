"use client";

import { useEffect, useRef } from "react";
import { gsap } from "@/lib/gsap";
import { useFinePointer, usePrefersReducedMotion } from "@/lib/hooks";

/**
 * Custom cursor for fine pointers only. States: default dot, "hover" (links/buttons),
 * a labelled pill for [data-cursor="Play|View|Drag|Open"], hidden over text fields.
 */
export function Cursor() {
  const fine = useFinePointer();
  const reduce = usePrefersReducedMotion();
  const root = useRef<HTMLDivElement>(null);
  const text = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = root.current;
    if (!fine || !el) return;
    const html = document.documentElement;
    html.classList.add("has-cursor");
    const dur = reduce ? 0 : 0.35;
    const xTo = gsap.quickTo(el, "x", { duration: dur, ease: "expo.out" });
    const yTo = gsap.quickTo(el, "y", { duration: dur, ease: "expo.out" });
    let lastLabel = "";

    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      xTo(e.clientX);
      yTo(e.clientY);
      const t = e.target as Element | null;
      if (!t || !t.closest) return;
      if (t.closest("input, textarea, select, [contenteditable='true']")) {
        el.dataset.state = "hidden";
        return;
      }
      const labelled = t.closest<HTMLElement>("[data-cursor]");
      const label = labelled?.dataset.cursor;
      if (label) {
        if (label !== lastLabel && text.current) text.current.textContent = label;
        lastLabel = label;
        el.dataset.state = "label";
      } else if (t.closest("a, button, [role='slider'], [role='tab'], summary, label")) {
        el.dataset.state = "hover";
      } else {
        el.dataset.state = "default";
      }
    };
    const onLeave = () => (el.dataset.state = "hidden");
    const onDown = () => el.classList.add("is-down");
    const onUp = () => el.classList.remove("is-down");

    window.addEventListener("pointermove", onMove, { passive: true });
    document.documentElement.addEventListener("pointerleave", onLeave);
    window.addEventListener("pointerdown", onDown);
    window.addEventListener("pointerup", onUp);
    return () => {
      html.classList.remove("has-cursor");
      window.removeEventListener("pointermove", onMove);
      document.documentElement.removeEventListener("pointerleave", onLeave);
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointerup", onUp);
    };
  }, [fine, reduce]);

  if (!fine) return null;

  return (
    <div
      ref={root}
      aria-hidden="true"
      data-state="hidden"
      className="group/c pointer-events-none fixed left-0 top-0 z-[95] [&.is-down_.c-dot]:scale-75"
    >
      <span className="c-dot absolute -left-1.5 -top-1.5 block size-3 rounded-full border-2 border-paper bg-ink shadow-[0_0_0_1px_var(--color-ink)] transition-[transform,opacity] duration-300 ease-out-expo group-data-[state=hover]/c:scale-[3] group-data-[state=label]/c:scale-0 group-data-[state=hidden]/c:opacity-0" />
      <span className="meta absolute left-3 top-3 flex origin-top-left scale-50 items-center gap-2 bg-signal px-3 py-2 text-paper opacity-0 transition-[transform,opacity] duration-300 ease-out-expo group-data-[state=label]/c:scale-100 group-data-[state=label]/c:opacity-100">
        <span className="size-1.5 rounded-full bg-paper" />
        <span ref={text}>Play</span>
      </span>
    </div>
  );
}
