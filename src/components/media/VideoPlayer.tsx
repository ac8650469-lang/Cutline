"use client";

import { useEffect, useRef, useState, type MouseEvent } from "react";
import { Maximize, Pause, Play, Volume2, VolumeX } from "lucide-react";
import type { MediaSrc } from "@/config/projects";
import { cn, timecode } from "@/lib/utils";

type Props = {
  src: MediaSrc;
  label: string;
  captions?: string;
  autoPlay?: boolean;
  width?: number;
  height?: number;
  className?: string;
};

/**
 * Full player with its own control bar (play, SMPTE timecode, seek, captions, sound, fullscreen).
 * Custom controls instead of native ones: native media controls live in a closed shadow root that
 * swallows key events, which broke Escape-to-close and the focus trap inside dialogs.
 */
export function VideoPlayer({ src, label, captions, autoPlay, width = 1280, height = 720, className }: Props) {
  const wrap = useRef<HTMLDivElement>(null);
  const video = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);
  const [time, setTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [muted, setMuted] = useState(false);
  const [cc, setCc] = useState(true);

  useEffect(() => {
    const v = video.current;
    if (!autoPlay || !v) return;
    v.play().catch(() => {
      /* autoplay with sound refused: try muted, otherwise the poster and Play button stay */
      v.muted = true;
      setMuted(true);
      v.play().catch(() => {});
    });
  }, [autoPlay]);

  // Captions start on via <track default>; the CC button flips the track mode.
  const toggleCaptions = (e: MouseEvent<HTMLButtonElement>) => {
    const next = !cc;
    setCc(next);
    const track = e.currentTarget.closest("[data-player]")?.querySelector("video")?.textTracks[0];
    if (track) track.mode = next ? "showing" : "hidden";
  };

  const toggle = () => {
    const v = video.current;
    if (!v) return;
    if (v.paused) v.play().catch(() => {});
    else v.pause();
  };

  return (
    <div ref={wrap} data-player className={cn("relative h-full w-full bg-ink", className)}>
      <video
        ref={video}
        playsInline
        loop
        preload="metadata"
        poster={src.avif ?? src.poster}
        aria-label={label}
        width={width}
        height={height}
        onClick={toggle}
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onTimeUpdate={(e) => {
          const v = e.currentTarget;
          setTime(v.currentTime);
          // Cached clips can report metadata before listeners exist; pick the duration up here too.
          if (Number.isFinite(v.duration) && v.duration > 0) setDuration(v.duration);
        }}
        onDurationChange={(e) => {
          const d = e.currentTarget.duration;
          if (Number.isFinite(d) && d > 0) setDuration(d);
        }}
        onVolumeChange={(e) => setMuted(e.currentTarget.muted)}
        data-cursor={playing ? "Pause" : "Play"}
        className="block h-full w-full object-contain"
      >
        <source src={src.mp4} type="video/mp4" />
        {src.webm && <source src={src.webm} type="video/webm" />}
        {captions && <track kind="captions" src={captions} srcLang="en" label="English" default />}
      </video>

      <div className="meta absolute inset-x-0 bottom-0 flex items-center gap-1 bg-ink/85 px-1 text-micro text-paper sm:gap-3 sm:px-2">
        <button type="button" onClick={toggle} aria-label={playing ? "Pause" : "Play"} className="press grid size-11 shrink-0 place-items-center">
          {playing ? <Pause aria-hidden="true" className="size-4" /> : <Play aria-hidden="true" className="size-4" />}
        </button>
        <span className="tnum hidden shrink-0 sm:inline" aria-hidden="true">
          {timecode(time * 24)}
        </span>
        <input
          type="range"
          min={0}
          max={duration || 0}
          step={1 / 24}
          value={Math.min(time, duration || 0)}
          onChange={(e) => {
            if (video.current) video.current.currentTime = Number(e.target.value);
          }}
          aria-label="Seek"
          aria-valuetext={`${timecode(time * 24)} of ${timecode(duration * 24)}`}
          className="h-11 min-w-0 flex-1 cursor-pointer accent-signal"
        />
        <span className="tnum hidden shrink-0 text-mute-inv sm:inline" aria-hidden="true">
          {timecode(duration * 24)}
        </span>
        {captions && (
          <button type="button" onClick={toggleCaptions} aria-pressed={cc} aria-label="Captions" className={cn("press grid h-11 shrink-0 place-items-center px-2", !cc && "text-mute-inv")}>
            CC
          </button>
        )}
        <button
          type="button"
          onClick={() => {
            if (video.current) video.current.muted = !video.current.muted;
          }}
          aria-label={muted ? "Unmute" : "Mute"}
          className="press grid size-11 shrink-0 place-items-center"
        >
          {muted ? <VolumeX aria-hidden="true" className="size-4" /> : <Volume2 aria-hidden="true" className="size-4" />}
        </button>
        <button
          type="button"
          onClick={() => (document.fullscreenElement ? document.exitFullscreen() : wrap.current?.requestFullscreen?.())?.catch?.(() => {})}
          aria-label="Fullscreen"
          className="press grid size-11 shrink-0 place-items-center"
        >
          <Maximize aria-hidden="true" className="size-4" />
        </button>
      </div>
    </div>
  );
}
