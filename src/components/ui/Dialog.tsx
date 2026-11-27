"use client";

import { useEffect, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { useFocusTrap } from "@/lib/hooks";
import { lockScroll } from "@/lib/smooth-scroll";
import { useAnchoredSheet } from "@/lib/sheet";
import { cn } from "@/lib/utils";

type Props = {
  open: boolean;
  onClose: () => void;
  label: string;
  children: ReactNode;
  className?: string;
  /** Element to return to on close (e.g. the card of the project now showing). Defaults to the opener. */
  origin?: () => Element | null;
};

/**
 * Modal surface: grows from whatever opened it and flies back there on close (see lib/sheet.ts).
 * Focus trap, Esc, scroll lock and modality end the moment it starts closing, so the page is usable
 * while the surface is still travelling home (apple-design §3: never lock out input).
 */
export function Dialog({ open, onClose, label, children, className, origin }: Props) {
  const { present, panel, scrim } = useAnchoredSheet({ open, origin, onDismiss: onClose });
  useFocusTrap(panel, open && present, onClose);

  useEffect(() => {
    if (!open) {
      // Sound stops with the decision to close, not when the flight ends.
      panel.current?.querySelectorAll("video").forEach((v) => v.pause());
      return;
    }
    lockScroll(true);
    return () => lockScroll(false);
  }, [open, panel]);

  if (!present || typeof document === "undefined") return null;
  return createPortal(
    <>
      <div ref={scrim} aria-hidden="true" className="sheet-scrim fixed inset-0 z-[79]" style={{ opacity: 0 }} />
      <div
        ref={panel}
        role={open ? "dialog" : undefined}
        aria-modal={open ? true : undefined}
        aria-label={open ? label : undefined}
        aria-hidden={open ? undefined : true}
        tabIndex={-1}
        style={{ opacity: 0 }}
        className={cn(
          "theme-ink fixed inset-0 z-[80] overflow-y-auto overscroll-contain outline-none",
          !open && "pointer-events-none",
          className,
        )}
      >
        <button type="button" onClick={onClose} tabIndex={open ? undefined : -1} className="press material-chip meta fixed right-[var(--margin)] top-4 z-10 inline-flex min-h-11 items-center gap-2 px-3">
          Close <X aria-hidden="true" className="size-4" />
        </button>
        {children}
      </div>
    </>,
    document.body,
  );
}
