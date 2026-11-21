import { faq } from "@/config/content";
import { site, mailHref } from "@/config/site";
import { Accordion } from "@/components/ui/Accordion";

const faqLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faq.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
};

/** SC.10 — sticky title column + accordion column. */
export function FAQ() {
  return (
    <section id="faq" aria-labelledby="faq-title" data-scene="10" data-scene-label="Questions" data-theme="paper" className="theme-paper py-[clamp(6rem,12vw,11rem)]">
      <div className="grid-shell gap-y-12">
        <div className="col-span-4 md:col-span-4">
          <div className="flex flex-col gap-6 md:sticky md:top-28">
            <p className="meta flex items-center gap-4 text-(--fg-mute)">
              <span className="text-(--fg)">SC.10</span>
              <span className="h-px w-10 bg-(--rule)" aria-hidden="true" />
              <span>Questions</span>
            </p>
            <h2 id="faq-title" className="font-display text-h2">
              Questions, <em className="display-italic">answered.</em>
            </h2>
            <p className="max-w-[32ch] text-(--fg-mute)">
              Still unsure? Write to{" "}
              <a href={mailHref} className="u-link text-(--fg)">
                {site.email}
              </a>
              . We reply {site.responseTime}.
            </p>
          </div>
        </div>
        <div className="col-span-4 md:col-span-7 md:col-start-6">
          <Accordion items={faq} />
        </div>
      </div>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd).replace(/</g, "\\u003c") }} />
    </section>
  );
}
