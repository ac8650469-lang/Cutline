import { useId } from "react";
import { cn } from "@/lib/utils";

/**
 * Arteniq brand mark, redrawn as vector from the supplied logo artwork.
 * The "A" and the letters use currentColor (ink on paper, paper on ink); the swoosh and the Q tail
 * are always the signal crimson, fading into burgundy at the foot like the source artwork.
 *
 * Mark geometry lives in a 100 × 65 box (cap height 65). The wordmark scales it ×2.1 so the A
 * stands taller than the RTENIQ letters, as in the lockup.
 */

/** The cut that splits the A where the swoosh passes through it. */
const CUT = "M-5,64 C25,44.5 55,29.5 110,24.6 L110,25 L77.8,35.9 L63.7,42 L-24.7,80 Z";
const A = "0,65 50,0 100,65 81.5,65 50,24 18.5,65";
const SWOOSH = "M0,65 C25,46 55,30.5 105,25.4 C72,27.6 42,38.5 22,65 Z";

function Mark({ id }: { id: string }) {
  return (
    <>
      <defs>
        <mask id={`${id}-m`} maskUnits="userSpaceOnUse" x="-10" y="-10" width="130" height="90">
          <rect x="-10" y="-10" width="130" height="90" fill="#fff" />
          <path d={CUT} fill="#000" />
        </mask>
        <linearGradient id={`${id}-g`} x1="0" y1="1" x2="1" y2="0">
          <stop offset="0" style={{ stopColor: "var(--color-wine)" }} />
          <stop offset="0.55" style={{ stopColor: "var(--color-signal)" }} />
        </linearGradient>
      </defs>
      <polygon points={A} fill="currentColor" mask={`url(#${id}-m)`} />
      <path d={SWOOSH} fill={`url(#${id}-g)`} />
    </>
  );
}

type LogoProps = {
  /** "mark" is the A alone; "wordmark" is the full ARTENIQ lockup. */
  variant?: "mark" | "wordmark";
  className?: string;
  /** Accessible name. Leave empty when a parent already labels it (e.g. a home link). */
  title?: string;
};

export function Logo({ variant = "wordmark", className, title }: LogoProps) {
  const id = useId().replace(/:/g, "");
  const a11y = title ? { role: "img", "aria-label": title } : { "aria-hidden": true as const };

  if (variant === "mark") {
    return (
      <svg viewBox="-1 -1 107 67" className={cn("block h-auto", className)} {...a11y}>
        <Mark id={id} />
      </svg>
    );
  }

  return (
    <svg viewBox="-2 -138 988 150" className={cn("block h-auto", className)} {...a11y}>
      <g transform="translate(0,-136.5) scale(2.1)">
        <Mark id={id} />
      </g>
      <g fill="none" stroke="currentColor" strokeWidth="11.5">
        {/* R */}
        <path d="M260,0 V-96.2 H312 A23.6 23.6 0 0 1 312,-49 H260 M302,-49 L339.6,-3" />
        {/* T */}
        <path d="M389,-96.2 H478 M433.5,-96.2 V0" />
        {/* E */}
        <path d="M606,-96.2 H532 V-5.8 H606 M532,-50 H600" />
        {/* I */}
        <path d="M802.5,-102 V0" />
        {/* Q bowl */}
        <circle cx="898" cy="-51" r="45.2" />
      </g>
      {/* N */}
      <path d="M650,0 V-102 H663.5 L735.5,-13 V-102 H747 V0 H733.5 L661.5,-89 V0 Z" fill="currentColor" />
      {/* Q tail */}
      <polygon points="906,-45 928,-45 982,10 960,10" style={{ fill: "var(--color-signal)" }} />
    </svg>
  );
}
