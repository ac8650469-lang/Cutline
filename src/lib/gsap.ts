"use client";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import type { RefObject } from "react";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger, useGSAP);
  // Motion tokens (DESIGN.md §2): expo-out for entrances, power4.inOut ≈ cubic-bezier(.76,0,.24,1) for cuts.
  gsap.defaults({ ease: "expo.out", duration: 0.6 });
  ScrollTrigger.config({ ignoreMobileResize: true });
}

/**
 * SplitText (end card) and Flip (work filters) are loaded on demand with these helpers, so they
 * stay out of the initial bundle.
 */
export async function loadSplitText() {
  const { SplitText } = await import("gsap/SplitText");
  gsap.registerPlugin(SplitText);
  return SplitText;
}
export async function loadFlip() {
  const { Flip } = await import("gsap/Flip");
  gsap.registerPlugin(Flip);
  return Flip;
}

export const EASE = {
  out: "expo.out",
  cut: "power4.inOut",
  inOut: "power2.inOut",
} as const;

export const DUR = { fast: 0.25, base: 0.6, slow: 1.1, cinematic: 1.6 } as const;

/** gsap.matchMedia conditions used everywhere. */
export const MQ = {
  motion: "(prefers-reduced-motion: no-preference)",
  reduce: "(prefers-reduced-motion: reduce)",
  desktop: "(min-width: 48rem)",
  mobile: "(max-width: 47.99rem)",
  fine: "(hover: hover) and (pointer: fine)",
} as const;

/**
 * Like useGSAP, but the setup only runs once `scope` comes within ~one viewport of the screen.
 * Keeps below-the-fold sections from creating dozens of ScrollTriggers (and forced layouts) at load.
 * Everything created inside is tracked by the useGSAP context and reverted on unmount.
 */
type ContextSafe = <T extends (...args: never[]) => unknown>(fn: T) => T;

export function useDeferredGSAP(
  setup: (contextSafe: ContextSafe) => void | (() => void),
  scope: RefObject<HTMLElement | null>,
  dependencies: unknown[] = [],
) {
  useGSAP(
    (_ctx, contextSafe) => {
      const el = scope.current;
      if (!el || !contextSafe) return;
      const safe = contextSafe as unknown as ContextSafe;
      let cleanup: void | (() => void);
      const run = safe(() => {
        cleanup = setup(safe);
      });
      const io = new IntersectionObserver(
        (entries) => {
          if (!entries.some((e) => e.isIntersecting)) return;
          io.disconnect();
          run();
        },
        { rootMargin: "100% 0px 100% 0px" },
      );
      io.observe(el);
      return () => {
        io.disconnect();
        if (typeof cleanup === "function") cleanup();
      };
    },
    { scope, dependencies },
  );
}

export { gsap, ScrollTrigger, useGSAP };
