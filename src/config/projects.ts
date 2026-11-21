export const categories = [
  "YouTube",
  "Shorts",
  "Reels",
  "Cinematic",
  "Commercial",
  "Brand",
  "Podcast",
  "Social",
  "Promo",
] as const;
export type Category = (typeof categories)[number];

export type Aspect = "16:9" | "9:16" | "1:1" | "21:9";

export type MediaSrc = { mp4: string; webm?: string; poster: string; avif?: string };

export type Project = {
  slug: string;
  title: string;
  client: string;
  /** First entry is the primary category; the rest are extra filter matches. */
  categories: Category[];
  aspect: Aspect;
  /** Shows a "Demo" tag on every surface while true. */
  isDemo: boolean;
  src: MediaSrc;
  /** Optional "raw" version for a before/after on the case-study page. */
  beforeSrc?: MediaSrc;
  role: string;
  brief: string;
  deliverables: string[];
  whatWeDid: string[];
  /** Runtime of the finished piece, e.g. "18:42". */
  duration: string;
  fps: number;
  codec: string;
  year: number;
  credits: { role: string; name: string }[];
};

const demo = (id: string): MediaSrc => ({
  mp4: `/media/demo/${id}.mp4`,
  webm: `/media/demo/${id}.webm`,
  poster: `/media/demo/${id}.jpg`,
  avif: `/media/demo/${id}.avif`,
});

const sampleCredits = [
  { role: "Editor", name: "Sample name" },
  { role: "Colourist", name: "Sample name" },
  { role: "Sound", name: "Sample name" },
];

/**
 * DEMO PROJECTS. Footage: Mixkit (see public/media/demo/CREDITS.md). Clients, briefs and credits are
 * sample copy. To publish real work: replace an entry, point `src` at /media/real/…, set isDemo: false.
 */
export const projects: Project[] = [
  {
    slug: "night-shift-tokyo",
    title: "Night Shift, Tokyo",
    client: "Travel channel (sample)",
    categories: ["YouTube"],
    aspect: "16:9",
    isDemo: true,
    src: demo("night-shift"),
    role: "Story edit, colour, sound design",
    brief:
      "Six hours of handheld night footage and one voice memo. The channel needed a 19-minute episode that holds attention past the intro without a single talking-head shot.",
    deliverables: ["19:04 master (16:9)", "3 × Shorts cut-downs", "Thumbnail frames", "SRT captions"],
    whatWeDid: [
      "Built the structure around three walks, each with its own sound bed",
      "Cut the cold open to 11 seconds with a payoff at 0:45",
      "Matched three cameras to one neon-and-sodium grade",
      "Designed city ambience to bridge every jump in time",
    ],
    duration: "19:04",
    fps: 25,
    codec: "H.264",
    year: 2026,
    credits: sampleCredits,
  },
  {
    slug: "afterhours",
    title: "Afterhours",
    client: "Music artist (sample)",
    categories: ["Reels", "Social"],
    aspect: "9:16",
    isDemo: true,
    src: demo("afterhours"),
    role: "Vertical edit, colour",
    brief: "A release-week teaser that loops cleanly and lands the hook before the first swipe.",
    deliverables: ["0:15 Reel", "0:07 Story loop", "Cover frame"],
    whatWeDid: ["Cut on the downbeat, every 12 frames", "Built a seamless loop point", "Pushed the gel colours into a print-film curve"],
    duration: "0:15",
    fps: 24,
    codec: "H.264",
    year: 2026,
    credits: sampleCredits,
  },
  {
    slug: "switchback",
    title: "Switchback",
    client: "Outdoor brand (sample)",
    categories: ["Cinematic", "Brand"],
    aspect: "21:9",
    isDemo: true,
    src: demo("switchback"),
    role: "Edit, colour, sound",
    brief: "A widescreen brand film about the drive, not the destination. No logo until the last frame.",
    deliverables: ["2:10 film (2.39:1)", "0:30 and 0:15 cut-downs", "16:9 and 9:16 reframes"],
    whatWeDid: ["Paced the edit to the road, slow on the curves", "Graded a cool, overcast palette with warm skin", "Built wind and tyre texture from scratch"],
    duration: "2:10",
    fps: 24,
    codec: "ProRes 422 HQ",
    year: 2026,
    credits: sampleCredits,
  },
  {
    slug: "side-b",
    title: "Side B",
    client: "Audio hardware brand (sample)",
    categories: ["Social", "Brand"],
    aspect: "1:1",
    isDemo: true,
    src: demo("side-b"),
    role: "Social edit, sound design",
    brief: "A square loop for the feed that sells the sound of the product with the sound off.",
    deliverables: ["0:10 square loop", "0:06 bumper"],
    whatWeDid: ["Cut to the reel's rotation", "Animated captions that read like a spec sheet", "Mixed for phone speakers first"],
    duration: "0:10",
    fps: 24,
    codec: "H.264",
    year: 2026,
    credits: sampleCredits,
  },
  {
    slug: "red-room",
    title: "Red Room",
    client: "Automotive campaign (sample)",
    categories: ["Commercial", "Promo"],
    aspect: "16:9",
    isDemo: true,
    src: demo("red-room"),
    role: "Offline edit, online, colour",
    brief: "A 30-second spot shot in one location under one colour of light. It had to feel like six setups.",
    deliverables: ["0:30 TVC master", "0:15 / 0:06 cut-downs", "9:16 and 1:1 versions"],
    whatWeDid: ["Found four distinct moods inside one red", "Speed-ramped the reveal to the bass drop", "Delivered broadcast and social specs in one pass"],
    duration: "0:30",
    fps: 24,
    codec: "ProRes 4444",
    year: 2026,
    credits: sampleCredits,
  },
  {
    slug: "hot-take",
    title: "Hot Take",
    client: "Weekly podcast (sample)",
    categories: ["Shorts", "Podcast"],
    aspect: "9:16",
    isDemo: true,
    src: demo("hot-take"),
    role: "Clip selection, vertical edit, captions",
    brief: "Turn a 90-minute episode into a week of Shorts that each stand alone.",
    deliverables: ["8 × Shorts", "Burned-in captions", "Hook-first titles"],
    whatWeDid: ["Pulled the eight strongest 40-second arguments", "Reframed a static wide into a tracking vertical", "Wrote on-screen hooks for the first second"],
    duration: "0:42",
    fps: 24,
    codec: "H.264",
    year: 2026,
    credits: sampleCredits,
  },
  {
    slug: "mic-check",
    title: "Mic Check",
    client: "Video podcast (sample)",
    categories: ["Podcast", "YouTube"],
    aspect: "16:9",
    isDemo: true,
    src: demo("mic-check"),
    role: "Multi-cam edit, audio clean-up, chapters",
    brief: "A three-camera studio show that needed to feel produced without losing the room.",
    deliverables: ["58:20 episode", "Chapters", "Audiogram", "Clip pack"],
    whatWeDid: ["Cut three angles on reactions, not just speakers", "Cleaned room tone and levelled four mics", "Added chapter markers every 6–9 minutes"],
    duration: "58:20",
    fps: 24,
    codec: "H.264",
    year: 2026,
    credits: sampleCredits,
  },
  {
    slug: "embers",
    title: "Embers",
    client: "Hospitality brand (sample)",
    categories: ["Brand", "Cinematic"],
    aspect: "21:9",
    isDemo: true,
    src: demo("embers"),
    role: "Edit, colour, sound design",
    brief: "A 60-second brand film about slowing down. Fire, steam, faces, and no voice-over.",
    deliverables: ["1:00 film", "0:20 cut-down", "Stills pulled from the grade"],
    whatWeDid: ["Held shots twice as long as feels safe", "Graded firelight against a crushed, blue night", "Built the mix from crackle and breath"],
    duration: "1:00",
    fps: 24,
    codec: "ProRes 422 HQ",
    year: 2026,
    credits: sampleCredits,
  },
  {
    slug: "lash-line",
    title: "Lash Line",
    client: "Beauty brand (sample)",
    categories: ["Reels", "Commercial"],
    aspect: "9:16",
    isDemo: true,
    src: demo("lash-line"),
    role: "Vertical edit, colour, motion graphics",
    brief: "A product Reel that shows the result in the first half-second.",
    deliverables: ["0:12 Reel", "0:06 ad cut", "Caption styles"],
    whatWeDid: ["Opened on the after shot", "Kept skin true while pushing the iris", "Designed captions that sit outside the UI safe zone"],
    duration: "0:12",
    fps: 30,
    codec: "H.264",
    year: 2026,
    credits: sampleCredits,
  },
  {
    slug: "wet-neon",
    title: "Wet Neon",
    client: "Event promoter (sample)",
    categories: ["Promo"],
    aspect: "16:9",
    isDemo: true,
    src: demo("wet-neon"),
    role: "Promo edit, sound, titles",
    brief: "A launch promo that sells the city before it sells the ticket.",
    deliverables: ["0:45 promo", "0:15 teaser", "Countdown stories"],
    whatWeDid: ["Cut to rain hits and horn stabs", "Built titles from the signage in shot", "Delivered a countdown kit for a week of posts"],
    duration: "0:45",
    fps: 30,
    codec: "H.264",
    year: 2026,
    credits: sampleCredits,
  },
];

export const getProject = (slug: string) => projects.find((p) => p.slug === slug);

export const aspectRatio: Record<Aspect, string> = {
  "16:9": "16 / 9",
  "9:16": "9 / 16",
  "1:1": "1 / 1",
  "21:9": "21 / 9",
};
