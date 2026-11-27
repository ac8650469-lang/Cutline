"use client";

import Link from "next/link";
import { Rewind } from "lucide-react";
import { nav, site, mailHref, altMailHref, phoneHref, phoneDisplay, whatsappHref } from "@/config/site";
import { scrollToTarget } from "@/lib/smooth-scroll";
import { LocalTime, CurrentYear } from "@/components/ui/LocalTime";
import { Logo } from "@/components/ui/Logo";

export function Footer() {
  return (
    <footer data-theme="ink" className="theme-ink brand-wave @container relative overflow-hidden border-t border-(--rule)">
      <div className="grid-shell gap-y-10 pt-16 md:pt-24">
        <div className="col-span-4 flex flex-col gap-2 md:col-span-3">
          <p className="meta mb-2 text-mute-inv">Studio</p>
          <p>{site.legalName}</p>
          <p className="text-mute-inv">
            {site.city}, {site.country}
          </p>
          <p className="meta mt-2">
            Local time <LocalTime className="tnum" />
          </p>
        </div>
        <nav aria-label="Footer" className="col-span-2 md:col-span-3">
          <p className="meta mb-4 text-mute-inv">Index</p>
          <ul className="flex flex-col gap-1">
            {nav.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="u-link inline-block py-1">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <div className="col-span-2 md:col-span-3">
          <p className="meta mb-4 text-mute-inv">Contact</p>
          <ul className="flex flex-col gap-1">
            <li>
              <a href={mailHref} className="u-link inline-block break-all py-1">
                {site.email}
              </a>
            </li>
            <li>
              <a href={altMailHref} className="u-link inline-block break-all py-1">
                {site.altEmail}
              </a>
            </li>
            <li>
              <a href={phoneHref} className="u-link inline-block py-1">
                {phoneDisplay}
              </a>
            </li>
            <li>
              <a href={whatsappHref} target="_blank" rel="noopener noreferrer" className="u-link inline-block py-1">
                WhatsApp
              </a>
            </li>
            <li>
              <Link href="/contact" className="u-link inline-block py-1">
                Start a project
              </Link>
            </li>
          </ul>
        </div>
        <div className="col-span-4 md:col-span-3">
          <p className="meta mb-4 text-mute-inv">Elsewhere</p>
          <ul className="flex flex-wrap gap-x-6 gap-y-1 md:flex-col">
            {site.socials.map((s) => (
              <li key={s.label}>
                <a href={s.href} target="_blank" rel="noopener noreferrer" className="u-link inline-block py-1">
                  {s.label}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="grid-shell mt-16 items-end gap-y-4">
        <button
          type="button"
          onClick={() => scrollToTarget(0)}
          className="meta col-span-4 flex min-h-11 w-fit items-center gap-3 md:col-span-5"
        >
          <Rewind aria-hidden="true" className="size-4 text-signal" />
          Rewind to 00:00:00:00
        </button>
        <p className="meta col-span-4 text-mute-inv md:col-span-7 md:text-right">
          © <CurrentYear /> {site.legalName} ·{" "}
          <a href="/media/demo/CREDITS.md" className="u-link">
            Footage credits
          </a>
        </p>
      </div>

      {/* The full lockup, sized to the footer's width. */}
      <div aria-hidden="true" className="shell mt-14 select-none pb-[var(--margin)]">
        <Logo className="w-full" />
        <p className="ml-[26.3%] mr-[4%] mt-[2.2cqw] flex justify-between font-sans text-[clamp(0.75rem,2.4cqw,2.4rem)] uppercase leading-none text-mute-inv">
          {"Creative".split("").map((c, i) => (
            <span key={i}>{c}</span>
          ))}
        </p>
      </div>
    </footer>
  );
}
