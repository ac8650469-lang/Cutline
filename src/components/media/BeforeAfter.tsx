"use client";

import { useEffect, useRef, useState, type KeyboardEvent, type PointerEvent, type RefObject } from "react";
import type { CapabilityTab } from "@/config/content";
import { captionWords } from "@/config/content";
import { release, requestPlay } from "@/lib/video";
import { seeded } from "@/lib/utils";
import { rubberband, spring, type Spring } from "@/lib/spring";

const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));

/** Deterministic waveform bars (same on server and client). */
function bars(seed: number, mixed: boolean, n = 96) {
  const rnd = seeded(seed);
  return Array.from({ length: n }, (_, i) => {
    const speech = 0.55 + 0.35 * Math.sin(i / 3.1) * Math.sin(i / 11.7);
    if (mixed) return clamp(0.42 + speech * 0.28 + rnd() * 0.08, 0.2, 0.78);
    const spike = rnd() > 0.9 ? 0.45 : 0;
    const drop = rnd() > 0.86 ? -0.4 : 0;
    return clamp(speech * (0.4 + rnd() * 0.9) + spike + drop, 0.04, 1);
  });
}
/** Bars as two SVG paths (normal + clipping peaks) instead of ~100 <rect>s each. */
function wave(data: number[], tone: "raw" | "mix") {
  let normal = "";
  let hot = "";
  data.forEach((v, i) => {
    const seg = `M${(i * 4 + 0.6).toFixed(1)} ${(50 - v * 50).toFixed(1)}h2.6v${(v * 100).toFixed(1)}h-2.6z`;
    if (tone === "raw" && v > 0.92) hot += seg;
    else normal += seg;
  });
  return { normal, hot, width: data.length * 4 };
}
const RAW = wave(bars(7, false), "raw");
const MIX = wave(bars(7, true), "mix");

function Waveform({ data, tone, label }: { data: ReturnType<typeof wave>; tone: "raw" | "mix"; label: string }) {
  return (
    <div className="absolute inset-x-[5%] bottom-[8%] h-[30%]">
      <span className="meta absolute -top-6 left-0 text-micro text-paper">{label}</span>
      <svg viewBox={`0 0 ${data.width} 100`} preserveAspectRatio="none" className="h-full w-full" aria-hidden="true">
        {tone === "mix" && <rect x="0" y="26" width={data.width} height="48" className="fill-paper/10" />}
        <path d={data.normal} className="fill-paper/85" />
        {data.hot && <path d={data.hot} className="fill-signal" />}
      </svg>
    </div>
  );
}

function Captions({ video }: { video: RefObject<HTMLVideoElement | null> }) {
  const [word, setWord] = useState(0);
  useEffect(() => {
    const v = video.current;
    if (!v) return;
    const onTime = () => {
      const d = v.duration || 6;
      setWord(Math.min(captionWords.length - 1, Math.floor((v.currentTime / d) * (captionWords.length + 1))));
    };
    v.addEventListener("timeupdate", onTime);
    return () => v.removeEventListener("timeupdate", onTime);
  }, [video]);
  return (
    <>
      {/* Action-safe (90%) and title-safe (80%) guides */}
      <span className="absolute inset-[5%] border border-dashed border-paper/40" />
      <span className="absolute inset-[10%] border border-dashed border-paper/25" />
      <span className="meta absolute right-[10.5%] top-[10.5%] text-micro text-paper/70">Title safe</span>
      <p className="absolute inset-x-[12%] bottom-[14%] text-center font-sans text-[clamp(0.95rem,2.4vw,1.9rem)] font-semibold leading-tight tracking-tight text-paper [text-shadow:0_2px_12px_rgb(0_0_0/0.5)]">
        {captionWords.map((w, i) => (
          <span key={i} className={i === word ? "bg-signal px-[0.15em] text-paper" : i < word ? "" : "opacity-45"}>
            {w}{" "}
          </span>
        ))}
      </p>
    </>
  );
}

/** Drag (or arrow-key) a divider across two synced videos: raw on the left, finished on the right. */
export function BeforeAfter({ tab }: { tab: CapabilityTab }) {
  const root = useRef<HTMLDivElement>(null);
  const a = useRef<HTMLVideoElement>(null);
  const b = useRef<HTMLVideoElement>(null);
  const dragging = useRef(false);
  const [pos, setPos] = useState(50);

  // Play both while in view and keep the second locked to the first.
  useEffect(() => {
    const el = root.current;
    const va = a.current;
    const vb = b.current;
    if (!el || !va) return;
    const sync = () => {
      if (vb && Math.abs(vb.currentTime - va.currentTime) > 0.08) vb.currentTime = va.currentTime;
    };
    va.addEventListener("timeupdate", sync);
    va.addEventListener("seeked", sync);
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          requestPlay(va);
          if (vb) requestPlay(vb);
        } else {
          release(va);
          if (vb) release(vb);
        }
      },
      { threshold: 0.3 },
    );
    io.observe(el);
    return () => {
      io.disconnect();
      va.removeEventListener("timeupdate", sync);
      va.removeEventListener("seeked", sync);
      release(va);
      if (vb) release(vb);
    };
  }, []);

  // Grabbing the divider keeps the offset from where it was grabbed (no jump to the pointer);
  // pressing anywhere else on the frame moves the divider there. (apple-design §2)
  const grab = useRef(0);
  const pct = (clientX: number) => {
    const r = root.current?.getBoundingClientRect();
    return r ? ((clientX - r.left) / r.width) * 100 : pos;
  };
  // Past either end the divider follows with growing resistance, then springs home (apple-design §9).
  const settleAnim = useRef<Spring | null>(null);
  const livePos = useRef(pos);
  useEffect(() => {
    livePos.current = pos;
  }, [pos]);
  const soft = (v: number) => {
    const w = root.current?.offsetWidth || 600;
    if (v < 0) return (rubberband(v * (w / 100), w) / w) * 100;
    if (v > 100) return 100 + (rubberband((v - 100) * (w / 100), w) / w) * 100;
    return v;
  };
  const onDown = (e: PointerEvent<HTMLDivElement>) => {
    settleAnim.current?.stop();
    dragging.current = true;
    e.currentTarget.setPointerCapture(e.pointerId);
    const p = pct(e.clientX);
    const zone = (24 / (root.current?.offsetWidth || 600)) * 100; // ±24px around the divider
    grab.current = Math.abs(p - pos) <= zone ? pos - p : 0;
    setPos(clamp(p + grab.current, 0, 100));
  };
  const onMove = (e: PointerEvent<HTMLDivElement>) => {
    if (dragging.current) setPos(soft(pct(e.clientX) + grab.current));
  };
  const onUp = () => {
    dragging.current = false;
    const cur = livePos.current;
    const home = clamp(cur, 0, 100);
    if (home !== cur) settleAnim.current = spring({ from: cur, to: home, damping: 1, response: 0.3, onUpdate: setPos });
  };
  const onKey = (e: KeyboardEvent<HTMLDivElement>) => {
    const step = e.shiftKey ? 20 : 5;
    const next =
      e.key === "ArrowLeft" ? pos - step : e.key === "ArrowRight" ? pos + step : e.key === "Home" ? 0 : e.key === "End" ? 100 : null;
    if (next === null) return;
    e.preventDefault();
    setPos(clamp(next, 0, 100));
  };

  // A lazy poster <img> under each video (a `poster` attribute would download immediately).
  const video = (ref: RefObject<HTMLVideoElement | null>, src: NonNullable<CapabilityTab["after"]["src"]>) => (
    <>
      <img
        src={src.avif ?? src.poster}
        alt=""
        width={1280}
        height={720}
        loading="lazy"
        decoding="async"
        className="absolute inset-0 h-full w-full object-cover"
      />
      <video
        ref={ref}
        muted
        playsInline
        loop
        preload="none"
        width={1280}
        height={720}
        aria-hidden="true"
        tabIndex={-1}
        onPlaying={(e) => (e.currentTarget.dataset.ready = "true")}
        className="absolute inset-0 h-full w-full object-cover opacity-0 transition-opacity duration-300 data-[ready=true]:opacity-100"
      >
        <source src={src.mp4} type="video/mp4" />
        {src.webm && <source src={src.webm} type="video/webm" />}
      </video>
    </>
  );

  return (
    <div
      ref={root}
      onPointerDown={onDown}
      onPointerMove={onMove}
      onPointerUp={onUp}
      onPointerCancel={onUp}
      className="relative aspect-video touch-pan-y select-none overflow-hidden bg-ink"
    >
      {video(a, tab.before.src)}

      {tab.id === "sound" && (
        <div className="absolute inset-0" style={{ clipPath: `inset(0 ${100 - pos}% 0 0)` }}>
          <Waveform data={RAW} tone="raw" label="Raw · peaks clip" />
        </div>
      )}

      <div className="absolute inset-0" style={{ clipPath: `inset(0 0 0 ${pos}%)` }}>
        {tab.after.src && video(b, tab.after.src)}
        {tab.id === "sound" && <Waveform data={MIX} tone="mix" label="Mixed · steady band" />}
        {tab.id === "captions" && <Captions video={a} />}
      </div>

      <span className="meta absolute left-3 top-3 bg-ink/80 px-2 py-1 text-micro text-paper">{tab.before.label}</span>
      <span className="meta absolute right-3 top-3 bg-paper px-2 py-1 text-micro text-ink">{tab.after.label}</span>

      <div
        role="slider"
        tabIndex={0}
        aria-label={`Compare ${tab.before.label} and ${tab.after.label}`}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(clamp(pos, 0, 100))}
        aria-valuetext={`${Math.round(clamp(pos, 0, 100))}% ${tab.before.label}`}
        onKeyDown={onKey}
        className="absolute inset-y-0 z-10 w-11 -translate-x-1/2 outline-none [&:focus-visible>span:last-child]:outline-2 [&:focus-visible>span:last-child]:outline-signal"
        style={{ left: `${pos}%` }}
      >
        <span className="absolute inset-y-0 left-1/2 w-px -translate-x-1/2 bg-paper" />
        <span className="meta absolute left-1/2 top-1/2 flex h-11 w-11 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-paper text-ink outline-offset-2">
          ◂▸
        </span>
      </div>
    </div>
  );
}
