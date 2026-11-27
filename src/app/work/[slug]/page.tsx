import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { projects, getProject, aspectRatio } from "@/config/projects";
import { SceneTracker } from "@/components/ui/SceneTracker";
import { VideoPlayer } from "@/components/media/VideoPlayer";
import { MediaFrame } from "@/components/ui/MediaFrame";
import { Button } from "@/components/ui/Button";
import { Tag } from "@/components/ui/Bits";

type Params = { params: Promise<{ slug: string }> };
const pad = (n: number) => String(n).padStart(2, "0");

export function generateStaticParams() {
  return projects.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const p = getProject(slug);
  if (!p) return { title: "Media offline" };
  return {
    title: p.title,
    description: p.brief,
    alternates: { canonical: `/work/${p.slug}` },
    openGraph: { title: p.title, description: p.brief, images: [{ url: p.src.poster }] },
  };
}

export default function CaseStudyPage({ params }: Params) {
  return (
    <Suspense fallback={<main id="main" className="theme-ink min-h-svh" />}>
      <CaseStudy params={params} />
    </Suspense>
  );
}

async function CaseStudy({ params }: Params) {
  const { slug } = await params;
  const p = getProject(slug);
  if (!p) notFound();
  const index = projects.indexOf(p);
  const next = projects[(index + 1) % projects.length];
  const tall = p.aspect === "9:16" || p.aspect === "1:1";
  const [w, h] = p.aspect === "9:16" ? [404, 720] : p.aspect === "1:1" ? [720, 720] : p.aspect === "21:9" ? [1280, 548] : [1280, 720];

  return (
    <main id="main">
      <SceneTracker />
      <article>
        <header data-scene="01" data-scene-label={p.title} data-theme="ink" className="theme-ink pb-16 pt-[calc(var(--nav-h)+2rem)] md:pb-24">
          <div className="grid-shell gap-y-8">
            <div className="meta col-span-4 flex flex-wrap items-center justify-between gap-4 md:col-span-12">
              <Link href="/#work" className="inline-flex min-h-11 items-center gap-2 text-mute-inv transition-colors hover:text-paper">
                <ArrowLeft aria-hidden="true" className="size-4" /> All work
              </Link>
              <span className="flex items-center gap-3 text-mute-inv">
                Clip {pad(index + 1)} / {pad(projects.length)} · {p.categories.join(" · ")}
                {p.isDemo && <Tag>Demo project</Tag>}
              </span>
            </div>
            <h1 className="col-span-4 font-display text-display md:col-span-10">{p.title}</h1>
            <dl className="meta col-span-4 grid grid-cols-2 gap-6 border-t border-(--rule) pt-5 md:col-span-12 md:grid-cols-4">
              <div>
                <dt className="text-mute-inv">Client</dt>
                <dd className="mt-1.5 normal-case tracking-normal">{p.client}</dd>
              </div>
              <div>
                <dt className="text-mute-inv">Role</dt>
                <dd className="mt-1.5 normal-case tracking-normal">{p.role}</dd>
              </div>
              <div>
                <dt className="text-mute-inv">Runtime</dt>
                <dd className="mt-1.5">{p.duration}</dd>
              </div>
              <div>
                <dt className="text-mute-inv">Format</dt>
                <dd className="mt-1.5">
                  {p.aspect} · {p.fps} fps · {p.codec}
                </dd>
              </div>
            </dl>
            <div className="col-span-4 flex justify-center md:col-span-12">
              <div className={tall ? "h-[70svh] max-w-full md:h-[82svh]" : "w-full"} style={{ aspectRatio: aspectRatio[p.aspect] }}>
                <VideoPlayer src={p.full ?? p.src} label={`${p.title}${p.isDemo ? ", demo clip" : ""}`} width={w} height={h} />
              </div>
            </div>
            {p.isDemo && (
              <p className="meta col-span-4 text-mute-inv md:col-span-12">
                Demo project: stock footage (Mixkit) with sample client, brief and credits.
              </p>
            )}
          </div>
        </header>

        <section aria-label="Project notes" data-scene="02" data-scene-label="Notes" data-theme="paper" className="theme-paper py-[clamp(5rem,10vw,9rem)]">
          <div className="grid-shell gap-y-14">
            <h2 className="meta col-span-4 text-(--fg-mute) md:col-span-3">The brief</h2>
            <p className="col-span-4 font-display text-h3 md:col-span-8">{p.brief}</p>

            <h2 className="meta col-span-4 text-(--fg-mute) md:col-span-3">What we did</h2>
            <ul className="col-span-4 grid gap-3 md:col-span-8">
              {p.whatWeDid.map((item) => (
                <li key={item} className="flex gap-4 border-t border-(--rule) pt-3 text-lead">
                  <span aria-hidden="true" className="mt-3 size-1.5 shrink-0 bg-signal" />
                  {item}
                </li>
              ))}
            </ul>

            <h2 className="meta col-span-4 text-(--fg-mute) md:col-span-3">Deliverables</h2>
            <ul className="col-span-4 flex flex-wrap gap-2 md:col-span-8">
              {p.deliverables.map((d) => (
                <li key={d}>
                  <Tag className="text-meta">{d}</Tag>
                </li>
              ))}
            </ul>

            <h2 className="meta col-span-4 text-(--fg-mute) md:col-span-3">Credits</h2>
            <dl className="col-span-4 grid grid-cols-2 gap-x-6 gap-y-4 md:col-span-8 md:grid-cols-3">
              {p.credits.map((c) => (
                <div key={c.role}>
                  <dt className="meta text-(--fg-mute)">{c.role}</dt>
                  <dd className="mt-1">{c.name}</dd>
                </div>
              ))}
            </dl>
          </div>
        </section>

        <nav aria-label="Next project" data-scene="03" data-scene-label="Next clip" data-theme="ink" className="theme-ink py-[clamp(5rem,10vw,9rem)]">
          <div className="grid-shell items-end gap-y-8">
            <div className="col-span-4 md:col-span-7">
              <p className="meta text-mute-inv">Next clip · {pad(projects.indexOf(next) + 1)}</p>
              <Link href={`/work/${next.slug}`} className="group mt-4 block font-display text-display" data-cursor="Open">
                <span className="inline-block transition-transform duration-500 ease-out-expo group-hover:translate-x-3">{next.title}</span>
              </Link>
              <div className="mt-8">
                <Button href={`/work/${next.slug}`} variant="secondary" icon={<ArrowRight aria-hidden="true" className="size-4" />}>
                  Open case study
                </Button>
              </div>
            </div>
            <div className="col-span-4 md:col-span-4 md:col-start-9">
              <MediaFrame src={next.src} aspect="16 / 9" label={`${next.title} preview${next.isDemo ? " (demo footage)" : ""}`} playback="inview" isDemo={next.isDemo} />
            </div>
          </div>
        </nav>
      </article>
    </main>
  );
}
