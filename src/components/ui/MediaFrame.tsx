"use client";

import { useEffect, useRef, type CSSProperties, type ReactNode } from "react";
import type { MediaSrc } from "@/config/projects";
import { gsap, MQ, useGSAP, EASE, DUR } from "@/lib/gsap";
import { release, requestPlay } from "@/lib/video";
import { cn } from "@/lib/utils";

type Props = {
  src: MediaSrc;
  /** CSS aspect-ratio, e.g. "16 / 9". Omit with `fill` to fill the parent. */
  aspect?: string;
  fill?: boolean;
  /** Accessible description of the clip (used as the poster's alt text). */
  label: string;
  /** inview: plays while visible · controlled: plays while `active` · none: poster only */
  playback?: "inview" | "controlled" | "none";
  active?: boolean;
  /** Start in a flat "log" state and grade to full contrast as the frame reaches the viewport centre. */
  log?: boolean;
  /** Open with the split-frame "splice" cut when scrolled into view. */
  splice?: boolean;
  spliceDelay?: number;
  isDemo?: boolean;
  priority?: boolean;
  className?: string;
  style?: CSSProperties;
  children?: ReactNode;
  /** Render the root as a <span> (for frames set inline inside running text). */
  as?: "div" | "span";
};

/** Intrinsic poster size from the aspect, so <img> always carries width/height (no layout shift). */
function posterSize(aspect?: string): [number, number] {
  if (!aspect) return [1280, 720];
  const [w, h] = aspect.split("/").map((n) => parseFloat(n));
  return w >= h ? [1280, Math.round((1280 * h) / w)] : [Math.round((720 * w) / h), 720];
}

export function MediaFrame({
  src,
  aspect,
  fill,
  label,
  playback = "inview",
  active,
  log,
  splice,
  spliceDelay = 0,
  isDemo,
  priority,
  className,
  style,
  children,
  as: Root = "div",
}: Props) {
  const root = useRef<HTMLDivElement & HTMLSpanElement>(null);
  const video = useRef<HTMLVideoElement>(null);
  const [pw, ph] = posterSize(aspect);

  // In-view autoplay
  useEffect(() => {
    const el = root.current;
    const v = video.current;
    if (!el || !v || playback !== "inview") return;
    const io = new IntersectionObserver(([e]) => (e.isIntersecting ? requestPlay(v) : release(v)), {
      threshold: 0.2,
    });
    io.observe(el);
    return () => {
      io.disconnect();
      release(v);
    };
  }, [playback]);

  // Parent-controlled playback (hover on pointer devices, most-visible card on touch)
  useEffect(() => {
    const v = video.current;
    if (!v || playback !== "controlled") return;
    if (active) requestPlay(v);
    else release(v);
  }, [active, playback]);

  useEffect(() => {
    const v = video.current;
    return () => {
      if (v) release(v);
    };
  }, []);

  useGSAP(
    () => {
      const el = root.current;
      if (!el) return;
      const mm = gsap.matchMedia();
      mm.add(MQ.motion, () => {
        if (log) {
          gsap.to(el.querySelectorAll("[data-log]"), {
            opacity: 0,
            ease: "none",
            scrollTrigger: { trigger: el, start: "top 85%", end: "center 55%", scrub: true },
          });
        }
        if (splice) {
          gsap.fromTo(
            el,
            { clipPath: "inset(50% 0% 50% 0%)" },
            {
              clipPath: "inset(0% 0% 0% 0%)",
              duration: DUR.slow,
              ease: EASE.cut,
              delay: spliceDelay,
              scrollTrigger: { trigger: el, start: "top 90%", once: true },
            },
          );
        }
      });
    },
    { scope: root, dependencies: [log, splice] },
  );

  return (
    <Root
      ref={root}
      data-splice={splice ? "" : undefined}
      className={cn("relative isolate block overflow-hidden bg-ink-2", fill && "h-full w-full", className)}
      style={{ aspectRatio: fill ? undefined : aspect, ...style }}
    >
      <picture>
        {src.avif && <source type="image/avif" srcSet={src.avif} />}
        <img
          src={src.poster}
          alt={label}
          width={pw}
          height={ph}
          loading={priority ? "eager" : "lazy"}
          fetchPriority={priority ? "high" : "auto"}
          decoding="async"
          className="absolute inset-0 h-full w-full object-cover"
        />
      </picture>
      {playback !== "none" && (
        <video
          ref={video}
          muted
          playsInline
          loop
          preload="none"
          width={pw}
          height={ph}
          aria-hidden="true"
          tabIndex={-1}
          onPlaying={(e) => (e.currentTarget.dataset.ready = "true")}
          className="absolute inset-0 h-full w-full object-cover opacity-0 transition-opacity duration-300 data-[ready=true]:opacity-100"
        >
          <source src={src.mp4} type="video/mp4" />
          {src.webm && <source src={src.webm} type="video/webm" />}
        </video>
      )}
      {log && (
        <>
          <span data-log className="log-sat" />
          <span data-log className="log-lift" />
        </>
      )}
      {children}
      {isDemo && (
        <span className="meta absolute left-2 top-2 z-10 bg-paper px-1.5 py-0.5 text-micro text-ink">Demo</span>
      )}
    </Root>
  );
}
