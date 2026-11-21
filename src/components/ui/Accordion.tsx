"use client";

import { useId, useState } from "react";
import { Plus } from "lucide-react";
import { cn } from "@/lib/utils";

/** Accessible accordion: button + aria-expanded, height animated with grid rows (no layout jank). */
export function Accordion({ items, defaultOpen = 0 }: { items: { q: string; a: string }[]; defaultOpen?: number | null }) {
  const [open, setOpen] = useState<number | null>(defaultOpen);
  const base = useId();

  return (
    <div className="border-b border-(--rule)">
      {items.map((it, i) => {
        const isOpen = open === i;
        const id = `${base}-${i}`;
        return (
          <div key={it.q} className="border-t border-(--rule)">
            <h3>
              <button
                type="button"
                id={`${id}-b`}
                aria-expanded={isOpen}
                aria-controls={`${id}-p`}
                onClick={() => setOpen(isOpen ? null : i)}
                className="group/acc flex min-h-11 w-full items-center justify-between gap-6 py-6 text-left"
              >
                <span className="font-display text-[clamp(1.35rem,2.2vw,2rem)] leading-tight transition-transform duration-500 ease-out-expo group-hover/acc:translate-x-1.5">
                  {it.q}
                </span>
                <Plus aria-hidden="true" className={cn("size-5 shrink-0 transition-transform duration-500 ease-cut", isOpen && "rotate-45")} />
              </button>
            </h3>
            <div id={`${id}-p`} role="region" aria-labelledby={`${id}-b`} className="acc-panel" data-open={isOpen} inert={!isOpen}>
              <div>
                <p className="max-w-[62ch] pb-7 leading-relaxed text-(--fg-mute)">{it.a}</p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
