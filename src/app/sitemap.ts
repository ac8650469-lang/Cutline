import type { MetadataRoute } from "next";
import { site } from "@/config/site";
import { projects } from "@/config/projects";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: `${site.url}/`, changeFrequency: "monthly", priority: 1 },
    { url: `${site.url}/contact`, changeFrequency: "yearly", priority: 0.8 },
    ...projects.map((p) => ({ url: `${site.url}/work/${p.slug}`, changeFrequency: "yearly" as const, priority: 0.6 })),
  ];
}
