"use client";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import { Flip } from "gsap/Flip";
import { useGSAP } from "@gsap/react";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger, SplitText, Flip, useGSAP);
  // Motion tokens (DESIGN.md §2): expo-out for entrances, power4.inOut ≈ cubic-bezier(.76,0,.24,1) for cuts.
  gsap.defaults({ ease: "expo.out", duration: 0.6 });
  ScrollTrigger.config({ ignoreMobileResize: true });
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

export { gsap, ScrollTrigger, SplitText, Flip, useGSAP };
