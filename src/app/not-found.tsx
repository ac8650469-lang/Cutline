import Link from "next/link";
import { ArrowLeft } from "lucide-react";

/** 404 as an NLE "Media offline" frame. Ink on signal (5.8:1). */
export default function NotFound() {
  return (
    <main id="main" data-theme="paper" className="flex min-h-svh flex-col justify-between bg-signal px-[var(--margin)] pb-[var(--margin)] pt-[calc(var(--nav-h)+2rem)] text-ink">
      <p className="meta flex justify-between">
        <span>Error 404</span>
        <span>A001_C404 · 00:00:00:00</span>
      </p>
      <div>
        <h1 className="font-mono text-[clamp(2.75rem,11vw,10rem)] font-medium uppercase leading-[0.9] tracking-[-0.04em]">Media offline</h1>
        <p className="mt-6 max-w-[40ch] text-lead">This clip was moved, renamed or never made it to the timeline.</p>
      </div>
      <Link href="/" className="meta inline-flex min-h-11 w-fit items-center gap-2 border border-ink px-5 transition-colors hover:bg-ink hover:text-signal">
        <ArrowLeft aria-hidden="true" className="size-4" /> Back to the timeline
      </Link>
    </main>
  );
}
