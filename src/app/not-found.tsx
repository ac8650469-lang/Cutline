import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { SceneTracker } from "@/components/ui/SceneTracker";

/** 404 as an NLE "Media offline" frame. Paper on brand burgundy (12.6:1). */
export default function NotFound() {
  return (
    <main id="main">
      <SceneTracker />
      <div
        data-scene="404"
        data-scene-label="Media offline"
        data-theme="ink"
        className="brand-wave flex min-h-svh flex-col justify-between bg-wine px-[var(--margin)] pb-[var(--margin)] pt-[calc(var(--nav-h)+2rem)] text-paper [--focus:var(--color-paper)] [--wave:var(--color-ink)]"
      >
        <p className="meta flex justify-between">
          <span>Error 404</span>
          <span>A001_C404 · 00:00:00:00</span>
        </p>
        <div>
          <h1 className="font-mono text-[clamp(2.75rem,11vw,10rem)] font-medium uppercase leading-[0.9] tracking-[-0.04em]">Media offline</h1>
          <p className="mt-6 max-w-[40ch] text-lead">This clip was moved, renamed or never made it to the timeline.</p>
        </div>
        <Link href="/" className="meta inline-flex min-h-11 w-fit items-center gap-2 border border-paper px-5 transition-colors hover:bg-paper hover:text-wine">
          <ArrowLeft aria-hidden="true" className="size-4" /> Back to the timeline
        </Link>
      </div>
    </main>
  );
}
