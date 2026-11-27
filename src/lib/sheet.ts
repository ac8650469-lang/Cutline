"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { spring, project, rubberband, VelocityTracker, type Spring } from "./spring";
import { haptic } from "./haptics";

/**
 * Anchored, interruptible full-screen surface (apple-design §2–§7, §9, §12, §14):
 * - grows out of the element that opened it and returns to it on close (same path both ways);
 * - one spring drives the whole flight, so reopening or closing mid-flight continues from the live value;
 * - a dimming, blurred scrim materializes with it;
 * - while closing, the page is already interactive (the caller drops modality as soon as `open` is false);
 * - touch: pull down from the top of the content to dismiss: 1:1 tracking, rubber band upward,
 *   momentum projection, velocity handed into the fly-back;
 * - reduced motion: opacity cross-fade only.
 */

// The last element a pointer pressed: the trigger, even in browsers that don't focus buttons on click.
let lastPress: { el: Element; t: number } | null = null;
if (typeof document !== "undefined") {
  document.addEventListener("pointerdown", (e) => (lastPress = { el: e.target as Element, t: performance.now() }), true);
}
function trigger(): Element | null {
  const pressed = lastPress && performance.now() - lastPress.t < 1500 ? lastPress.el : null;
  const el = pressed ?? document.activeElement;
  if (!(el instanceof Element) || el === document.body || el === document.documentElement) return null;
  return el.closest("[data-origin]") ?? el;
}

/** A usable anchor is a visible box that fits on screen; anything else falls back to a cross-fade. */
function anchorRect(el: Element | null | undefined): DOMRect | null {
  const r = el?.getBoundingClientRect();
  if (!r || r.width < 1 || r.height < 1) return null;
  if (r.width > window.innerWidth * 1.5 || r.height > window.innerHeight * 1.5) return null;
  if (r.bottom < 0 || r.top > window.innerHeight || r.right < 0 || r.left > window.innerWidth) return null;
  return r;
}

type Opts = {
  open: boolean;
  /** Where to return to on close (defaults to whatever opened it). Re-read at close time. */
  origin?: () => Element | null;
  /** A swipe-down committed a dismissal. */
  onDismiss: () => void;
};

const OPEN = { damping: 1, response: 0.42 };

/** Returns whether to render, plus the refs to attach to the surface and its scrim. */
export function useAnchoredSheet<P extends HTMLElement = HTMLDivElement>({ open, origin, onDismiss }: Opts) {
  const panel = useRef<P>(null);
  const scrim = useRef<HTMLDivElement>(null);
  const [present, setPresent] = useState(open);
  if (open && !present) setPresent(true);

  const progress = useRef(0); // 0 = at the origin, 1 = open
  const pull = useRef(0); // swipe-down offset in px
  const pAnim = useRef<Spring | null>(null);
  const yAnim = useRef<Spring | null>(null);
  const rect = useRef<DOMRect | null>(null);
  const opener = useRef<Element | null>(null);
  const handoff = useRef(0);
  const dismissRef = useRef(onDismiss);
  useEffect(() => {
    dismissRef.current = onDismiss;
  });

  const reduced = () => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const apply = () => {
    const el = panel.current;
    if (!el) return;
    const P = progress.current;
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const dy = pull.current;
    const pullK = Math.min(Math.max(dy, 0) / vh, 1);
    const r = rect.current;
    const dim = scrim.current;
    if (dim) dim.style.opacity = String(P * (1 - pullK * 0.85));

    if (reduced() || !r || r.width < 1 || r.height < 1) {
      el.style.opacity = String(P * (1 - pullK * 0.5));
      el.style.transform = dy ? `translate3d(0,${dy}px,0)` : "";
      el.style.clipPath = "";
      return;
    }
    // Uniform scale from the trigger's size (cover), centre travels from the trigger to the viewport centre.
    const s0 = Math.max(r.width / vw, r.height / vh);
    const scale = (s0 + (1 - s0) * P) * (1 - pullK * 0.18);
    const tx = (r.left + r.width / 2 - vw / 2) * (1 - P);
    const ty = (r.top + r.height / 2 - vh / 2) * (1 - P) + dy;
    el.style.transform = `translate3d(${tx}px,${ty}px,0) scale(${scale})`;
    // Crop to the trigger's shape at the start, so the surface reads as the card itself growing.
    const ix = ((vw - r.width / s0) / 2) * (1 - P);
    const iy = ((vh - r.height / s0) / 2) * (1 - P);
    el.style.clipPath = P >= 0.999 && !dy ? "" : `inset(${Math.max(0, iy)}px ${Math.max(0, ix)}px)`;
    // Content materializes with the surface rather than fading on its own.
    el.style.opacity = String(Math.min(1, P * 1.6));
  };

  const run = (to: number, velocity: number, done?: () => void) => {
    pAnim.current?.stop();
    pAnim.current = spring({
      from: progress.current,
      to,
      velocity,
      ...OPEN,
      response: reduced() ? 0.22 : OPEN.response,
      onUpdate: (v) => {
        progress.current = v;
        apply();
      },
      onComplete: done,
    });
  };

  useLayoutEffect(() => {
    if (!present) return;
    if (open) {
      if (progress.current === 0 && !pAnim.current) opener.current = trigger();
      rect.current = anchorRect(opener.current);
      apply();
      run(1, pAnim.current?.velocity ?? 0);
    } else {
      const back = origin?.() ?? opener.current;
      rect.current = anchorRect(back) ?? (back ? null : rect.current);
      const v = handoff.current || (pAnim.current?.velocity ?? 0);
      handoff.current = 0;
      run(0, v, () => {
        pAnim.current = null;
        pull.current = 0;
        setPresent(false);
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- driven by open/present only
  }, [open, present]);

  useEffect(() => () => {
    pAnim.current?.stop();
    yAnim.current?.stop();
  }, []);

  // Pull-to-dismiss (touch). Native scrolling inside the surface is untouched unless we're at the top
  // and the finger moves down; only then do we take over the gesture.
  useEffect(() => {
    const el = panel.current;
    if (!present || !el) return;
    let g: { x: number; y: number; grab: number; active: boolean; vt: VelocityTracker } | null = null;

    const start = (e: TouchEvent) => {
      if (!open || e.touches.length !== 1) return;
      const t = e.touches[0];
      yAnim.current?.stop(); // grab mid-flight
      g = { x: t.clientX, y: t.clientY, grab: t.clientY - pull.current, active: pull.current !== 0, vt: new VelocityTracker() };
      g.vt.add(t.clientY);
    };
    const move = (e: TouchEvent) => {
      if (!g) return;
      const t = e.touches[0];
      if (!g.active) {
        const dx = t.clientX - g.x;
        const dy = t.clientY - g.y;
        if (Math.hypot(dx, dy) < 10) return; // hysteresis
        if (dy > 0 && Math.abs(dy) > Math.abs(dx) && el.scrollTop <= 0) g.active = true;
        else {
          g = null;
          return;
        }
      }
      e.preventDefault();
      g.vt.add(t.clientY);
      const raw = t.clientY - g.grab;
      pull.current = raw >= 0 ? raw : rubberband(raw, window.innerHeight);
      apply();
    };
    const end = () => {
      if (!g?.active) {
        g = null;
        return;
      }
      const v = g.vt.velocity;
      g = null;
      const vh = window.innerHeight;
      yAnim.current?.stop();
      if (pull.current + project(v) > vh * 0.22) {
        haptic("commit");
        handoff.current = -v / vh; // carry the flick into the flight home
        yAnim.current = spring({ from: pull.current, to: 0, velocity: v, ...OPEN, onUpdate: (y) => ((pull.current = y), apply()) });
        dismissRef.current();
      } else {
        yAnim.current = spring({ from: pull.current, to: 0, velocity: v, damping: 1, response: 0.35, onUpdate: (y) => ((pull.current = y), apply()) });
      }
    };
    el.addEventListener("touchstart", start, { passive: true });
    el.addEventListener("touchmove", move, { passive: false });
    el.addEventListener("touchend", end);
    el.addEventListener("touchcancel", end);
    return () => {
      el.removeEventListener("touchstart", start);
      el.removeEventListener("touchmove", move);
      el.removeEventListener("touchend", end);
      el.removeEventListener("touchcancel", end);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- refs are stable
  }, [present, open]);

  return { present, panel, scrim };
}
