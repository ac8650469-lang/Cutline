import type { Metadata } from "next";
import { site, mailHref, whatsappHref, whatsappDisplay } from "@/config/site";
import { SceneTracker } from "@/components/ui/SceneTracker";
import { ContactForm } from "@/components/contact/ContactForm";
import { LocalTime } from "@/components/ui/LocalTime";
import { RecDot } from "@/components/ui/Bits";

export const metadata: Metadata = {
  title: "Start a project",
  description: `Brief ${site.name} on an edit: long-form, Shorts and Reels, commercials, colour, sound or motion graphics. We reply ${site.responseTime}.`,
  alternates: { canonical: "/contact" },
};

export default function ContactPage() {
  return (
    <main id="main">
      <SceneTracker />
      <section
        aria-labelledby="contact-title"
        data-scene="01"
        data-scene-label="Start a project"
        data-theme="paper"
        className="theme-paper min-h-svh pb-24 pt-[calc(var(--nav-h)+3rem)] md:pb-32"
      >
        <div className="grid-shell gap-y-14">
          <div className="col-span-4 flex flex-col md:col-span-5">
            <p className="meta flex items-center gap-3">
              <RecDot /> SC.01 · Start a project
            </p>
            <h1 id="contact-title" className="mt-8 font-display text-display">
              Start a <em className="display-italic">project.</em>
            </h1>
            <p className="mt-8 max-w-[38ch] text-lead text-(--fg-mute)">
              Tell us what you&rsquo;re making, how long it runs and when it needs to ship. A person reads every brief and replies {site.responseTime}.
            </p>
            <dl className="mt-12 grid gap-6 border-t border-(--rule) pt-6">
              <div>
                <dt className="meta text-(--fg-mute)">Email</dt>
                <dd className="mt-1 text-lg">
                  <a href={mailHref} className="u-link">
                    {site.email}
                  </a>
                </dd>
              </div>
              <div>
                <dt className="meta text-(--fg-mute)">WhatsApp</dt>
                <dd className="mt-1 text-lg">
                  <a href={whatsappHref} target="_blank" rel="noopener noreferrer" className="u-link">
                    {whatsappDisplay}
                  </a>
                </dd>
              </div>
              <div>
                <dt className="meta text-(--fg-mute)">Studio</dt>
                <dd className="mt-1 text-lg">
                  {site.city}, {site.country} · <LocalTime className="tnum" />
                </dd>
              </div>
            </dl>
          </div>
          <div className="col-span-4 md:col-span-6 md:col-start-7 md:pt-24">
            <ContactForm idPrefix="contact" />
          </div>
        </div>
      </section>
    </main>
  );
}
