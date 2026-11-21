import type { Metadata } from "next";
import { SceneTracker } from "@/components/ui/SceneTracker";
import { Hero } from "@/components/sections/Hero";
import { Work } from "@/components/sections/Work";
import { Services } from "@/components/sections/Services";
import { Capabilities } from "@/components/sections/Capabilities";
import { Manifesto } from "@/components/sections/Manifesto";
import { Workflow } from "@/components/sections/Workflow";
import { Results } from "@/components/sections/Results";
import { Testimonials } from "@/components/sections/Testimonials";
import { FAQ } from "@/components/sections/FAQ";
import { EndCard } from "@/components/sections/EndCard";

export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

export default function Home() {
  return (
    <main id="main">
      <SceneTracker />
      <Hero />
      <Work />
      <Services />
      <Capabilities />
      <Manifesto />
      <Workflow />
      <Results />
      <Testimonials />
      <FAQ />
      <EndCard />
    </main>
  );
}
