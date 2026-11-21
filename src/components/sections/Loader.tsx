import { site } from "@/config/site";

/**
 * First-visit loader (≤1.2s): the wordmark is cut on while a frame counter runs 00→24, then the
 * card wipes up into the hero. Entirely CSS (see globals.css → Loader), shown only when the boot
 * script sets html.intro: repeat visits and reduced-motion users never see it, and it never waits
 * on assets or hydration.
 */
export function Loader() {
  return (
    <div id="loader" aria-hidden="true" className="theme-ink fixed inset-0 z-[99] flex-col justify-between p-[var(--margin)]">
      <div className="meta flex justify-between text-mute-inv">
        <span>Reel 01</span>
        <span>24 fps</span>
      </div>
      <div className="crop-marks relative mx-auto px-[4vw] py-[2vw] text-mute-inv">
        <span data-loader-word className="block font-display text-[clamp(4.5rem,19vw,18rem)] leading-[0.9] tracking-[-0.03em] text-paper">
          {site.name}
        </span>
      </div>
      <div className="meta flex items-center justify-between text-mute-inv">
        <span className="flex items-center gap-2">
          <span className="size-2 rounded-full bg-signal" /> Rec
        </span>
        <span className="tnum text-paper">
          FR <span data-loader-count />
          /24
        </span>
      </div>
    </div>
  );
}
