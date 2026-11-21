"use client";

import { useRef } from "react";
import { ScrollTrigger, useGSAP } from "@/lib/gsap";

/**
 * Rendered inside each page's <main>. Drives the nav's scene label (SC.04 Services) and its
 * light/dark theme from [data-scene] and [data-theme] markers in this page only, so routes kept
 * alive in the background (cacheComponents keeps them hidden, not unmounted) never interfere.
 */
export function SceneTracker() {
  const probe = useRef<HTMLSpanElement>(null);

  useGSAP(() => {
    const main = probe.current?.closest("main");
    if (!main) return;
    const nav = document.getElementById("site-nav");
    const sceneEl = document.getElementById("nav-scene");
    const footer = document.querySelector<HTMLElement>("footer[data-theme]");
    const scenes = Array.from(main.querySelectorAll<HTMLElement>("[data-scene]"));
    const themes = [...Array.from(main.querySelectorAll<HTMLElement>("[data-theme]")), ...(footer ? [footer] : [])];
    const activeScenes = new Set<HTMLElement>();
    const activeThemes = new Set<HTMLElement>();

    const last = (list: HTMLElement[], set: Set<HTMLElement>) => {
      for (let i = list.length - 1; i >= 0; i--) if (set.has(list[i])) return list[i];
      return null;
    };
    const paintScene = () => {
      const s = last(scenes, activeScenes);
      if (s && sceneEl) sceneEl.textContent = `SC.${s.dataset.scene} ${s.dataset.sceneLabel ?? ""}`;
    };
    const paintTheme = () => {
      const t = last(themes, activeThemes);
      if (nav) nav.dataset.theme = t?.dataset.theme ?? "paper";
    };

    scenes.forEach((el) =>
      ScrollTrigger.create({
        trigger: el,
        start: "top 50%",
        end: "bottom 50%",
        onToggle: (self) => {
          if (self.isActive) activeScenes.add(el);
          else activeScenes.delete(el);
          paintScene();
        },
      }),
    );
    themes.forEach((el) =>
      ScrollTrigger.create({
        trigger: el,
        start: "top 32px",
        end: "bottom 32px",
        onToggle: (self) => {
          if (self.isActive) activeThemes.add(el);
          else activeThemes.delete(el);
          paintTheme();
        },
      }),
    );
    paintTheme();
    return () => {
      if (nav) nav.dataset.theme = "paper";
    };
  }, []);

  return <span ref={probe} hidden />;
}
