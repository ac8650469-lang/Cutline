"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { gsap, useGSAP, MQ, EASE } from "@/lib/gsap";
import { useFocusTrap } from "@/lib/hooks";
import { lockScroll } from "@/lib/smooth-scroll";
import { cn } from "@/lib/utils";

type Props = {
  open: boolean;
  onClose: () => void;
  label: string;
  children: ReactNode;
  className?: string;
};

/** Modal shell: portal, focus trap, Esc, scroll lock, splice-in entrance, hard-cut exit. */
export function Dialog({ open, onClose, label, children, className }: Props) {
  if (!open || typeof document === "undefined") return null;
  return createPortal(
    <DialogInner onClose={onClose} label={label} className={className}>
      {children}
    </DialogInner>,
    document.body,
  );
}

function DialogInner({ onClose, label, children, className }: Omit<Props, "open">) {
  const ref = useRef<HTMLDivElement>(null);
  useFocusTrap(ref, true, onClose);

  useEffect(() => {
    lockScroll(true);
    return () => lockScroll(false);
  }, []);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(MQ.motion, () => {
        gsap.fromTo(
          ref.current,
          { clipPath: "inset(50% 0% 50% 0%)" },
          { clipPath: "inset(0% 0% 0% 0%)", duration: 0.7, ease: EASE.cut },
        );
      });
    },
    { scope: ref },
  );

  return (
    <div
      ref={ref}
      role="dialog"
      aria-modal="true"
      aria-label={label}
      tabIndex={-1}
      data-lenis-prevent
      className={cn("theme-ink fixed inset-0 z-[80] overflow-y-auto overscroll-contain outline-none", className)}
    >
      <button
        type="button"
        onClick={onClose}
        className="meta fixed right-[var(--margin)] top-4 z-10 inline-flex min-h-11 items-center gap-2 bg-ink/80 px-3 text-paper"
      >
        Close <X aria-hidden="true" className="size-4" />
      </button>
      {children}
    </div>
  );
}
