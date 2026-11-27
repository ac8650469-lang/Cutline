"use client";

import { Pause, Play } from "lucide-react";
import { setVideoPaused, useVideoPaused } from "@/lib/video";
import { cn } from "@/lib/utils";

/** Pauses every autoplaying preview on the site (WCAG 2.2.2 Pause, Stop, Hide). */
export function VideoToggle({ className, withLabel = false }: { className?: string; withLabel?: boolean }) {
  const paused = useVideoPaused();
  return (
    <button
      type="button"
      aria-pressed={paused}
      aria-label={paused ? "Resume background video" : "Pause background video"}
      title={paused ? "Play background video" : "Pause background video"}
      onClick={() => setVideoPaused(!paused)}
      className={cn("press meta inline-flex min-h-11 min-w-11 items-center justify-center gap-2", className)}
    >
      {paused ? <Play aria-hidden="true" className="size-3.5" /> : <Pause aria-hidden="true" className="size-3.5" />}
      {withLabel && <span>{paused ? "Play video" : "Pause video"}</span>}
    </button>
  );
}
