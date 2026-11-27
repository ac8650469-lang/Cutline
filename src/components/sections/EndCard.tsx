"use client";

import { useRef } from "react";
import { ArrowRight } from "lucide-react";
import { endCard, site, mailHref, whatsappHref, whatsappDisplay } from "@/config/site";
import { gsap, useDeferredGSAP, MQ, EASE, loadSplitText } from "@/lib/gsap";
import { Button } from "@/components/ui/Button";
import { RecDot } from "@/components/ui/Bits";
import { LocalTime } from "@/components/ui/LocalTime";
import dynamic from "next/dynamic";

// The form (and zod) load after the page is interactive; /contact renders it on the server.
const ContactForm = dynamic(() => import("@/components/contact/ContactForm").then((m) => m.ContactForm), {
  ssr: false,
  loading: () => <div className="min-h-[30rem]" aria-hidden="true" />,
});

/** SC.11 — the hero type returns as an end card, then a call-sheet form. */
export function EndCard() {
  const root = useRef<HTMLElement>(null);

  useDeferredGSAP(
    (contextSafe) => {
      const h = root.current?.querySelector<HTMLElement>("[data-endcard]");
      if (!h || !window.matchMedia(MQ.motion).matches) return;
      let split: { revert: () => void } | null = null;
      let cancelled = false;
      // SplitText is only needed down here, so it loads on demand (and the headline shows if it fails).
      loadSplitText()
        .then(
          contextSafe((SplitText: Awaited<ReturnType<typeof loadSplitText>>) => {
            if (cancelled) return;
            split = SplitText.create(h, {
              type: "lines,chars",
              mask: "lines",
              autoSplit: true,
              onSplit: (self) => {
                gsap.set(h, { opacity: 1 });
                return gsap.from(self.chars, {
                  yPercent: 110,
                  duration: 1.1,
                  ease: EASE.out,
                  stagger: 0.02,
                  scrollTrigger: { trigger: h, start: "top 78%", once: true },
                });
              },
            });
          }),
        )
        .catch(() => gsap.set(h, { opacity: 1 }));
      return () => {
        cancelled = true;
        split?.revert();
      };
    },
    root,
  );

  return (
    <section ref={root} id="start" aria-labelledby="end-title" data-scene="11" data-scene-label="End card" data-theme="wine" className="theme-wine brand-wave [--wave:var(--color-ink)]">
      <div className="flex min-h-svh flex-col justify-between gap-12 pb-[var(--margin)] pt-[calc(var(--nav-h)+1.5rem)]">
        <div className="grid-shell">
          <p className="meta col-span-4 flex items-center justify-between text-mute-inv md:col-span-12">
            <span>
              <span className="text-paper">SC.11</span> · End card
            </span>
            <span className="flex items-center gap-2">
              <RecDot /> Out point
            </span>
          </p>
        </div>

        <h2 id="end-title" data-endcard className="shell font-display text-[12.5vw] leading-[0.98] tracking-[-0.035em] md:text-[clamp(3.5rem,8vw,9.5rem)]">
          <span className="block">{endCard.lines[0]}</span>{" "}
          <span className="display-italic block text-right">{endCard.lines[1]}</span>
        </h2>

        <div className="grid-shell items-end gap-y-8">
          <div className="col-span-4 flex flex-col gap-6 md:col-span-6">
            <div>
              <Button href="/contact" magnetic size="lg" icon={<ArrowRight aria-hidden="true" className="size-4" />}>
                Start a project
              </Button>
            </div>
            <div className="flex flex-col gap-2 text-lg sm:flex-row sm:gap-8">
              <a href={mailHref} className="u-link w-fit py-1">
                {site.email}
              </a>
              <a href={whatsappHref} target="_blank" rel="noopener noreferrer" className="u-link w-fit py-1">
                WhatsApp {whatsappDisplay}
              </a>
            </div>
          </div>
          <p className="meta col-span-4 text-mute-inv md:col-span-4 md:col-start-9 md:text-right">
            {site.city} · <LocalTime /> · replies {site.responseTime}
          </p>
        </div>
      </div>

      <div className="grid-shell gap-y-10 border-t border-(--rule) py-[clamp(4rem,9vw,8rem)]">
        <div className="col-span-4 md:col-span-4">
          <p className="meta text-mute-inv">Call sheet</p>
          <h3 className="mt-4 font-display text-h3">Or brief us right here.</h3>
          <p className="mt-4 max-w-[34ch] text-mute-inv">Five fields. A person reads every brief, and you&rsquo;ll get a reply {site.responseTime}.</p>
        </div>
        <div className="col-span-4 md:col-span-7 md:col-start-6">
          <ContactForm idPrefix="end" />
        </div>
      </div>
    </section>
  );
}
