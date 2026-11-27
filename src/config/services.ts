import { real, type MediaSrc } from "./projects";

export type Service = {
  id: string;
  title: string;
  formats: string;
  what: string;
  problem: string;
  who: string;
  why: string;
  preview: MediaSrc;
};


export const services: Service[] = [
  {
    id: "long-form",
    title: "Long-form YouTube",
    formats: "16:9 · 8–40 min",
    what: "Full edits for 8 to 40-minute videos: structure, pacing passes, b-roll, graphics, sound and thumbnail frames.",
    problem: "Watch time that falls off a cliff at minute two.",
    who: "Creators and channels publishing every week.",
    why: "Average view duration is the number the algorithm actually reads.",
    preview: real("editing-with-claude"),
  },
  {
    id: "shorts",
    title: "Shorts & Reels",
    formats: "9:16 · 7–60 s",
    what: "Vertical cuts built around the first second: hook, payoff, loop. Native captions and safe areas for every platform.",
    problem: "Swipes in under a second.",
    who: "Creators, brands and podcasts repurposing long-form.",
    why: "In a vertical feed, the first frame is the thumbnail.",
    preview: real("creator-reel"),
  },
  {
    id: "commercial",
    title: "Commercials & brand films",
    formats: "16:9 · 21:9 · 15 s–3 min",
    what: "Spots from first assembly to final online, with versions for every placement.",
    problem: "A great shoot that cuts together flat.",
    who: "Brands, agencies and production companies.",
    why: "Rhythm is what makes a spot feel expensive.",
    preview: real("az-coffee"),
  },
  {
    id: "podcast",
    title: "Podcast & interview",
    formats: "Multi-cam · clips",
    what: "Multi-camera episode edits, clean audio, chapter markers and a pack of clips from every episode.",
    problem: "Three hours of footage and no time to find the moments.",
    who: "Shows and hosts recording every week.",
    why: "Every episode should feed a week of social.",
    preview: real("houston-market"),
  },
  {
    id: "colour",
    title: "Colour grading",
    formats: "Look dev · finishing",
    what: "Look development, shot matching and finishing, delivered for web, broadcast or cinema.",
    problem: "Footage from three cameras that never quite matches.",
    who: "Filmmakers, brands and music artists.",
    why: "Colour tells the audience how to feel before anyone speaks.",
    preview: real("red-room-mood"),
  },
  {
    id: "sound",
    title: "Sound design & mix",
    formats: "Dialogue · music · mix",
    what: "Dialogue clean-up, music edit, sound design and a loudness-compliant mix.",
    problem: "Audio that gives away the budget.",
    who: "Anyone whose audience wears headphones.",
    why: "People forgive soft focus. They don’t forgive bad sound.",
    preview: real("eclipse"),
  },
  {
    id: "motion",
    title: "Motion graphics & captions",
    formats: "Titles · captions · explainers",
    what: "Titles, lower thirds, kinetic captions and animated explainers that match your brand system.",
    problem: "Information that has to land with the sound off.",
    who: "Educational channels, SaaS teams and social teams.",
    why: "Most feeds autoplay muted, so the captions are the script.",
    preview: real("cinematic-fonts"),
  },
];

export const budgets = ["Under $1k", "$1k–$3k", "$3k–$8k", "$8k+", "Not sure yet"] as const; // PLACEHOLDER currency/ranges
