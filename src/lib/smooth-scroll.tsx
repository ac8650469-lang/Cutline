"use client";

import Lenis from "lenis";
import { useEffect, type ReactNode } from "react";
import { gsap, ScrollTrigger } from "./gsap";

let lenis: Lenis | null = null;
let locks = 0;

/** Smooth-scroll to a target (element, selector or y). Falls back to native when Lenis is off. */
export function scrollToTarget(target: string | number | HTMLElement, opts: { duration?: number; offset?: number } = {}) {
  if (lenis) {
    lenis.scrollTo(target, { duration: opts.duration ?? 1.2, offset: opts.offset ?? 0 });
    return;
  }
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const behavior: ScrollBehavior = reduce ? "auto" : "smooth";
  if (typeof target === "number") window.scrollTo({ top: target, behavior });
  else {
    const el = typeof target === "string" ? document.querySelector(target) : target;
    el?.scrollIntoView({ behavior, block: "start" });
  }
}

/** Lock page scroll while a dialog or menu is open (ref-counted). */
export function lockScroll(lock: boolean) {
  locks = Math.max(0, locks + (lock ? 1 : -1));
  const locked = locks > 0;
  document.documentElement.classList.toggle("scroll-locked", locked);
  if (lenis) {
    if (locked) lenis.stop();
    else lenis.start();
  }
}

export function SmoothScroll({ children }: { children: ReactNode }) {
  useEffect(() => {
    // Smooth scroll only for mouse/trackpad users who haven't asked for less motion.
    // Touch devices keep native scrolling (and no per-frame loop).
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    const instance = new Lenis({ lerp: 0.11, wheelMultiplier: 1, anchors: { offset: 0 } });
    lenis = instance;
    instance.on("scroll", ScrollTrigger.update);
    const tick = (time: number) => instance.raf(time * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);
    return () => {
      gsap.ticker.remove(tick);
      instance.destroy();
      lenis = null;
    };
  }, []);

  return <>{children}</>;
}
