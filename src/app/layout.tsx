import type { Metadata, Viewport } from "next";
import Script from "next/script";
import { Instrument_Serif, Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { site } from "@/config/site";
import { SmoothScroll } from "@/lib/smooth-scroll";
import { Nav } from "@/components/sections/Nav";
import { Footer } from "@/components/sections/Footer";
import { Loader } from "@/components/sections/Loader";
import { Cursor } from "@/components/ui/Cursor";
import { SkipLink } from "@/components/ui/SkipLink";

// Display face: Instrument Serif, ~21 KB per style. (Fraunces looked good but cost ~145 KB before
// first paint, which kept mobile LCP above target — see PROGRESS.md.)
const display = Instrument_Serif({
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
  variable: "--font-instrument",
  display: "swap",
});
const sans = Geist({ subsets: ["latin"], variable: "--font-geist", display: "swap" });
const mono = Geist_Mono({ subsets: ["latin"], variable: "--font-geist-mono", display: "swap" });

const title = `${site.name} — Editing & post-production studio`;

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: { default: title, template: `%s — ${site.name}` },
  description: site.description,
  applicationName: site.name,
  openGraph: { type: "website", siteName: site.name, title, description: site.description, locale: "en_GB" },
  twitter: { card: "summary_large_image", title, description: site.description },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: "#000000",
  colorScheme: "light",
};

/**
 * Runs before paint: marks JS, reduced motion, and whether the first-visit loader plays.
 * `intro` is removed after the intro has finished, so later client navigations don't replay it.
 */
const boot = `(function(){var d=document.documentElement;d.classList.add('js');try{if(matchMedia('(prefers-reduced-motion: reduce)').matches){d.classList.add('rm')}else if(!sessionStorage.getItem('arteniq:intro')){d.classList.add('intro');sessionStorage.setItem('arteniq:intro','1');setTimeout(function(){d.classList.remove('intro')},3200)}}catch(e){}})();`;

const organization = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: site.legalName,
  url: site.url,
  email: site.email,
  telephone: site.phone,
  description: site.description,
  address: { "@type": "PostalAddress", addressLocality: site.city, addressCountry: site.country },
  sameAs: site.socials.map((s) => s.href),
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${display.variable} ${sans.variable} ${mono.variable}`}
      suppressHydrationWarning
    >
      <body>
        <Script id="boot" strategy="beforeInteractive">
          {boot}
        </Script>
        <SkipLink />
        <Loader />
        <SmoothScroll>
          <Nav />
          {children}
          <Footer />
        </SmoothScroll>
        <Cursor />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organization).replace(/</g, "\\u003c") }}
        />
      </body>
    </html>
  );
}
