"use client";

import { useEffect, useRef } from "react";
import type { MediaSrc } from "@/config/projects";
import { cn } from "@/lib/utils";

type Props = {
  src: MediaSrc;
  label: string;
  captions?: string;
  autoPlay?: boolean;
  width?: number;
  height?: number;
  className?: string;
};

/** Full player: native controls (keyboard + screen-reader friendly), captions track slot. */
export function VideoPlayer({ src, label, captions, autoPlay, width = 1280, height = 720, className }: Props) {
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const v = ref.current;
    if (!autoPlay || !v) return;
    v.play().catch(() => {
      /* autoplay refused: the poster and controls stay visible */
    });
  }, [autoPlay]);

  return (
    <video
      ref={ref}
      controls
      playsInline
      loop
      preload="metadata"
      poster={src.poster}
      aria-label={label}
      width={width}
      height={height}
      className={cn("block h-full w-full bg-ink object-contain", className)}
    >
      <source src={src.mp4} type="video/mp4" />
      {src.webm && <source src={src.webm} type="video/webm" />}
      {captions && <track kind="captions" src={captions} srcLang="en" label="English" default />}
    </video>
  );
}
