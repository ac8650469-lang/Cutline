"use client";

import { useSyncExternalStore } from "react";

/**
 * Global playback budget. Components *request* playback (in view, hovered…); at most MAX of the
 * most recent requests actually play. Autoplay is off under prefers-reduced-motion, Save-Data, or
 * when the visitor pauses background video (WCAG 2.2.2).
 */
const MAX = 2;
const wanted: HTMLVideoElement[] = [];
let userPaused = false;
const listeners = new Set<() => void>();

type NavigatorWithConnection = Navigator & { connection?: { saveData?: boolean } };

function environmentAllows() {
  if (typeof window === "undefined") return false;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return false;
  return !(navigator as NavigatorWithConnection).connection?.saveData;
}

export function canAutoplay() {
  return !userPaused && environmentAllows();
}

function apply() {
  const keep = canAutoplay() ? wanted.slice(-MAX) : [];
  for (const v of wanted) if (!keep.includes(v) && !v.paused) v.pause();
  for (const v of keep) {
    if (!v.paused) continue;
    v.muted = true;
    v.play().catch(() => {
      /* blocked or not ready: the poster stays */
    });
  }
}

function remove(v: HTMLVideoElement) {
  const i = wanted.indexOf(v);
  if (i !== -1) wanted.splice(i, 1);
}

export function requestPlay(v: HTMLVideoElement) {
  remove(v);
  wanted.push(v);
  apply();
}

export function release(v: HTMLVideoElement) {
  remove(v);
  v.pause();
  apply();
}

export function setVideoPaused(paused: boolean) {
  userPaused = paused;
  try {
    sessionStorage.setItem("cutline:video-paused", paused ? "1" : "0");
  } catch {
    /* ignore */
  }
  apply();
  listeners.forEach((l) => l());
}

if (typeof window !== "undefined") {
  try {
    userPaused = sessionStorage.getItem("cutline:video-paused") === "1";
  } catch {
    /* ignore */
  }
}

const subscribe = (cb: () => void) => {
  listeners.add(cb);
  return () => listeners.delete(cb);
};

export function useVideoPaused() {
  return useSyncExternalStore(
    subscribe,
    () => userPaused,
    () => false,
  );
}
