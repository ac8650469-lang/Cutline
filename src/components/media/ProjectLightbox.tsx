"use client";

import { useEffect, useRef } from "react";
import { ArrowLeft, ArrowRight, ArrowUpRight } from "lucide-react";
import { aspectRatio, type Project } from "@/config/projects";
import { Dialog } from "@/components/ui/Dialog";
import { Button } from "@/components/ui/Button";
import { Tag } from "@/components/ui/Bits";
import { VideoPlayer } from "./VideoPlayer";

const pad = (n: number) => String(n).padStart(2, "0");

type Props = {
  project: Project | null;
  index: number;
  total: number;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
};

export function ProjectLightbox({ project, index, total, onClose, onPrev, onNext }: Props) {
  const nav = useRef({ onPrev, onNext });
  useEffect(() => {
    nav.current = { onPrev, onNext };
  });

  useEffect(() => {
    if (!project) return;
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement | null)?.tagName;
      if (tag === "VIDEO" || tag === "INPUT") return;
      if (e.key === "ArrowRight") nav.current.onNext();
      if (e.key === "ArrowLeft") nav.current.onPrev();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [project]);

  const tall = project && (project.aspect === "9:16" || project.aspect === "1:1");
  const [w, h] = project?.aspect === "9:16" ? [404, 720] : project?.aspect === "1:1" ? [720, 720] : project?.aspect === "21:9" ? [1280, 548] : [1280, 720];

  return (
    <Dialog open={!!project} onClose={onClose} label={project ? `${project.title}, project details` : "Project details"}>
      {project && (
        <div className="grid-shell min-h-svh content-center gap-y-10 py-20 md:py-24">
          <div className="col-span-4 flex items-center justify-center md:col-span-7 lg:col-span-8">
            <div
              key={project.slug}
              className={tall ? "h-[58svh] max-w-full md:h-[76svh]" : "w-full"}
              style={{ aspectRatio: aspectRatio[project.aspect] }}
            >
              <VideoPlayer src={project.full ?? project.src} label={`${project.title}${project.isDemo ? ", demo clip" : ""}`} autoPlay width={w} height={h} />
            </div>
          </div>

          <div className="col-span-4 flex flex-col gap-6 md:col-span-5 lg:col-span-4" aria-live="polite">
            <p className="meta flex flex-wrap items-center gap-3 text-mute-inv">
              <span className="text-paper">
                Clip {pad(index + 1)} / {pad(total)}
              </span>
              <span>{project.categories.join(" · ")}</span>
              {project.isDemo && <Tag>Demo</Tag>}
            </p>
            <div>
              <h2 className="font-display text-h2">{project.title}</h2>
              <p className="meta mt-3 text-mute-inv">{project.client}</p>
            </div>
            <p className="leading-relaxed text-mute-inv">{project.brief}</p>
            <div>
              <h3 className="meta mb-3 text-mute-inv">What we did</h3>
              <ul className="grid gap-2">
                {project.whatWeDid.map((item) => (
                  <li key={item} className="flex gap-3 border-t border-(--rule) pt-2">
                    <span aria-hidden="true" className="mt-2 size-1.5 shrink-0 bg-signal" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <dl className="meta grid grid-cols-2 gap-x-6 gap-y-4">
              <div>
                <dt className="text-mute-inv">Role</dt>
                <dd className="mt-1 normal-case tracking-normal">{project.role}</dd>
              </div>
              <div>
                <dt className="text-mute-inv">Runtime · format</dt>
                <dd className="mt-1">
                  {project.duration} · {project.aspect} · {project.fps} fps
                </dd>
              </div>
              <div className="col-span-2">
                <dt className="text-mute-inv">Deliverables</dt>
                <dd className="mt-1 normal-case tracking-normal">{project.deliverables.join(", ")}</dd>
              </div>
            </dl>
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Button href={`/work/${project.slug}`} onClick={onClose} icon={<ArrowUpRight aria-hidden="true" className="size-4" />}>
                Case study
              </Button>
              <Button variant="secondary" onClick={onPrev} aria-label="Previous project" icon={<ArrowLeft aria-hidden="true" className="size-4" />}>
                Prev
              </Button>
              <Button variant="secondary" onClick={onNext} aria-label="Next project" icon={<ArrowRight aria-hidden="true" className="size-4" />}>
                Next
              </Button>
            </div>
          </div>
        </div>
      )}
    </Dialog>
  );
}
