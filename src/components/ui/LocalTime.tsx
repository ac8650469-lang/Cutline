"use client";

import { useSyncExternalStore } from "react";
import { site } from "@/config/site";

const fmt = new Intl.DateTimeFormat("en-GB", {
  timeZone: site.timeZone,
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
  timeZoneName: "short",
});

const subscribe = (cb: () => void) => {
  const id = window.setInterval(cb, 15_000);
  return () => window.clearInterval(id);
};

/** Local time in the studio's city. Renders "--:--" on the server (no Date during prerender). */
export function LocalTime({ className }: { className?: string }) {
  const value = useSyncExternalStore(
    subscribe,
    () => fmt.format(new Date()),
    () => "--:--",
  );
  return <time className={className}>{value}</time>;
}

const yearSubscribe = () => () => {};

export function CurrentYear() {
  const year = useSyncExternalStore(
    yearSubscribe,
    () => String(new Date().getFullYear()),
    () => String(site.copyrightYear),
  );
  return <>{year}</>;
}
