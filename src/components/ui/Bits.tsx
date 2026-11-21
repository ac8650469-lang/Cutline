import { useId, type ReactNode } from "react";
import { cn } from "@/lib/utils";

export function Tag({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <span className={cn("meta inline-flex items-center gap-1.5 border border-(--rule) px-2 py-1 text-micro", className)}>
      {children}
    </span>
  );
}

export function RecDot({ className, blink = true }: { className?: string; blink?: boolean }) {
  return (
    <span
      aria-hidden="true"
      className={cn("inline-block size-2 rounded-full bg-signal", blink && "motion-safe:animate-blink", className)}
    />
  );
}

/** A visibly marked placeholder with an accessible tooltip. */
export function Placeholder({
  label = "[ADD REAL FIGURE]",
  hint = "Placeholder — replace with a real figure in src/config/content.ts",
  align = "left",
  className,
}: {
  label?: string;
  hint?: string;
  /** Which edge the tooltip anchors to (use "right" near the right edge of the screen). */
  align?: "left" | "right";
  className?: string;
}) {
  const id = useId();
  return (
    <span className={cn("group/ph relative inline-flex", className)}>
      <span
        tabIndex={0}
        aria-describedby={id}
        className="meta border border-dashed border-current px-1.5 py-0.5 text-micro"
      >
        {label}
      </span>
      <span
        role="tooltip"
        id={id}
        className={cn(
          "meta pointer-events-none absolute bottom-full z-20 mb-2 hidden w-[min(14rem,calc(100vw-2*var(--margin)))] bg-ink px-2.5 py-2 text-micro normal-case tracking-normal text-paper group-hover/ph:block group-focus-within/ph:block",
          align === "right" ? "right-0" : "left-0",
        )}
      >
        {hint}
      </span>
    </span>
  );
}

/** Sample-content label (testimonials, demo copy). */
export function SampleLabel({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <span className={cn("meta inline-flex items-center gap-2 border border-dashed border-current px-2 py-1 text-micro", className)}>
      {children}
    </span>
  );
}
