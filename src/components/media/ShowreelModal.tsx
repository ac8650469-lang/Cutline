"use client";

import { reel } from "@/config/site";
import { Dialog } from "@/components/ui/Dialog";
import { VideoPlayer } from "./VideoPlayer";
import { RecDot } from "@/components/ui/Bits";

export function ShowreelModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <Dialog open={open} onClose={onClose} label="Showreel player">
      <div className="flex min-h-svh flex-col justify-center gap-4 px-[var(--margin)] py-20">
        <div className="meta flex flex-wrap items-center justify-between gap-3 text-mute-inv">
          <span className="flex items-center gap-2 text-paper">
            <RecDot /> {reel.title}
          </span>
          <span>{reel.duration} · captions available</span>
        </div>
        <div className="mx-auto aspect-video w-full max-w-[min(100%,calc((100svh-12rem)*16/9))]">
          <VideoPlayer src={reel.src} label={reel.isDemo ? "Showreel, demo edit" : "Showreel"} captions={reel.captions} autoPlay />
        </div>
        <p className="meta text-mute-inv">{reel.note}</p>
      </div>
    </Dialog>
  );
}
