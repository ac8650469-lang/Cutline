"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { nav, site, mailHref, whatsappHref, whatsappDisplay } from "@/config/site";
import { gsap, useGSAP, MQ, EASE } from "@/lib/gsap";
import { useFocusTrap } from "@/lib/hooks";
import { lockScroll } from "@/lib/smooth-scroll";
import { scrollTimecode } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { RecDot } from "@/components/ui/Bits";
import { LocalTime } from "@/components/ui/LocalTime";
import { VideoToggle } from "@/components/ui/VideoToggle";

export function Nav() {
  const bar = useRef<HTMLElement>(null);
  const tc = useRef<HTMLSpanElement>(null);
  const tcMobile = useRef<HTMLSpanElement>(null);
  const [open, setOpen] = useState(false);
  const openRef = useRef(false);

  useEffect(() => {
    openRef.current = open;
  }, [open]);

  // Live scroll timecode + hide on scroll down / show on scroll up.
  useEffect(() => {
    let last = window.scrollY;
    let raf = 0;
    const update = () => {
      raf = 0;
      const y = window.scrollY;
      const code = scrollTimecode(y);
      if (tc.current) tc.current.textContent = code;
      if (tcMobile.current) tcMobile.current.textContent = code;
      const el = bar.current;
      if (!el) return;
      if (Math.abs(y - last) > 6) {
        el.dataset.hidden = String(y > last && y > 160 && !openRef.current);
        last = y;
      }
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <>
      <header
        ref={bar}
        id="site-nav"
        data-theme="paper"
        className="group/nav fixed inset-x-0 top-0 z-50 text-ink transition-[translate,color] duration-500 ease-cut focus-within:translate-y-0! data-[hidden=true]:-translate-y-full data-[theme=ink]:text-paper"
      >
        <nav aria-label="Primary" className="shell flex h-(--nav-h) items-center justify-between gap-6">
          <Link href="/" className="flex items-baseline gap-2" aria-label={`${site.name}, home`}>
            <span className="font-display text-[1.65rem] leading-none tracking-[-0.02em]">{site.name}</span>
            <RecDot className="-translate-y-0.5" />
          </Link>

          <p className="meta hidden items-center gap-3 lg:flex" aria-hidden="true">
            <span ref={tc} className="tnum">
              00:00:00:00
            </span>
            <span className="opacity-40">/</span>
            <span id="nav-scene">SC.01 Opening</span>
          </p>

          <div className="hidden items-center gap-6 md:flex">
            <VideoToggle className="-mx-2 opacity-80 hover:opacity-100" />
            <ul className="flex items-center gap-6">
              {nav.map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className="meta inline-block py-3 opacity-80 transition-opacity hover:opacity-100">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
            <div className="[--bg:var(--color-paper)] [--fg:var(--color-ink)] group-data-[theme=ink]/nav:[--bg:var(--color-ink)] group-data-[theme=ink]/nav:[--fg:var(--color-paper)]">
              <Button href="/contact">Start a project</Button>
            </div>
          </div>

          <div className="flex items-center gap-4 md:hidden">
            <span ref={tcMobile} className="meta tnum text-micro" aria-hidden="true">
              00:00:00:00
            </span>
            <button
              type="button"
              className="meta min-h-11 min-w-11 px-1"
              aria-expanded={open}
              aria-controls="mobile-menu"
              onClick={() => setOpen(true)}
            >
              Menu
            </button>
          </div>
        </nav>
      </header>
      {open && <MobileMenu onClose={() => setOpen(false)} />}
    </>
  );
}

function MobileMenu({ onClose }: { onClose: () => void }) {
  const ref = useRef<HTMLDivElement>(null);
  useFocusTrap(ref, true, onClose);

  useEffect(() => {
    lockScroll(true);
    return () => lockScroll(false);
  }, []);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(MQ.motion, () => {
        gsap
          .timeline()
          .fromTo(ref.current, { clipPath: "inset(0% 0% 100% 0%)" }, { clipPath: "inset(0% 0% 0% 0%)", duration: 0.6, ease: EASE.cut })
          .fromTo("[data-menu-item]", { yPercent: 110 }, { yPercent: 0, duration: 0.9, stagger: 0.06, ease: EASE.out }, 0.25)
          .fromTo("[data-menu-fade]", { opacity: 0 }, { opacity: 1, duration: 0.6 }, 0.5);
      });
    },
    { scope: ref },
  );

  return (
    <div
      ref={ref}
      id="mobile-menu"
      role="dialog"
      aria-modal="true"
      aria-label="Menu"
      className="theme-ink fixed inset-0 z-[60] flex flex-col overflow-y-auto"
    >
      <div className="shell flex h-(--nav-h) shrink-0 items-center justify-between">
        <span className="font-display text-[1.65rem] leading-none">{site.name}</span>
        <button type="button" onClick={onClose} className="meta min-h-11 min-w-11 px-1">
          Close
        </button>
      </div>
      <ul className="shell mt-6 flex flex-1 flex-col">
        {[{ label: "Home", href: "/" }, ...nav].map((item, i) => (
          <li key={item.href} className="overflow-hidden">
            <Link
              href={item.href}
              onClick={onClose}
              data-menu-item
              className="flex items-baseline gap-4 py-1 font-display text-[clamp(3rem,14vw,5rem)] leading-[1.02]"
            >
              <span className="meta text-micro text-mute-inv">0{i + 1}</span>
              {item.label}
            </Link>
          </li>
        ))}
      </ul>
      <div data-menu-fade className="shell grid gap-3 border-t border-(--rule) py-6">
        <a href={mailHref} className="u-link w-fit py-1 text-lg">
          {site.email}
        </a>
        <a href={whatsappHref} target="_blank" rel="noopener noreferrer" className="u-link w-fit py-1 text-lg">
          WhatsApp {whatsappDisplay}
        </a>
        <div className="flex items-center justify-between gap-4">
          <p className="meta text-mute-inv">
            {site.city} · <LocalTime />
          </p>
          <VideoToggle withLabel className="-mr-2 px-2 text-mute-inv" />
        </div>
      </div>
    </div>
  );
}
