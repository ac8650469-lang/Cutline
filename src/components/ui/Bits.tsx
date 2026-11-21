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
  className,
}: {
  label?: string;
  hint?: string;
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
        className="meta pointer-events-none absolute bottom-full left-0 z-20 mb-2 w-56 bg-ink px-2.5 py-2 text-micro normal-case tracking-normal text-paper opacity-0 transition-opacity duration-200 group-hover/ph:opacity-100 group-focus-within/ph:opacity-100"
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
