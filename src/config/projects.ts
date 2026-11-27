export const categories = [
  "YouTube",
  "Real estate",
  "Shorts",
  "Reels",
  "Brand",
  "Motion",
  "Cinematic",
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
  /** Short silent loop: grid, hover previews, posters. */
  src: MediaSrc;
  /** The full piece with sound, for the player. Falls back to `src`. */
  full?: MediaSrc;
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

/** Real work lives in public/media/real/ — encoded by scripts/encode-real.sh. */
export const real = (id: string): MediaSrc => ({
  mp4: `/media/real/${id}.mp4`,
  webm: `/media/real/${id}.webm`,
  poster: `/media/real/${id}.jpg`,
  avif: `/media/real/${id}.avif`,
});
const fullOf = (id: string): MediaSrc => ({ mp4: `/media/real/${id}-full.mp4`, poster: `/media/real/${id}.jpg`, avif: `/media/real/${id}.avif` });

const credits = [{ role: "Edit, motion & colour", name: "Arteniq Creative" }];

/** Builds a real project entry: preview loop + full piece share the slug. */
const work = (p: Omit<Project, "src" | "full" | "isDemo" | "codec" | "year" | "credits"> & Partial<Pick<Project, "year" | "credits">>): Project => ({
  isDemo: false,
  codec: "H.264",
  year: 2026,
  credits,
  src: real(p.slug),
  full: fullOf(p.slug),
  ...p,
});

/**
 * Arteniq's portfolio, from the "Portfolio/website based cuts" Drive folder. Clients are described by
 * type, not name. Order is the grid order (pairs of 16:9 + 9:16 alternate sides).
 */
export const projects: Project[] = [
  work({
    slug: "old-money-portland",
    title: "Where the Old Money Lives",
    client: "Real-estate agent · Portland, OR",
    categories: ["YouTube", "Real estate", "Motion"],
    aspect: "16:9",
    role: "Edit, map animation, motion graphics",
    brief:
      "A neighbourhood guide for a Portland agent: a top-five list of the city’s historic districts that has to feel like a story, not a listings tour.",
    deliverables: ["1:13 master (16:9)", "Animated map sequences", "Title and list graphics"],
    whatWeDid: [
      "Opened on the agent to camera with an animated stats card",
      "Built satellite map fly-ins to place every neighbourhood",
      "Used archive documents and highlights to carry the history",
      "Designed a numbered list system for the top-five structure",
    ],
    duration: "1:13",
    fps: 60,
  }),
  work({
    slug: "tesla-2008",
    title: "2008",
    client: "Business storytelling channel",
    categories: ["Shorts", "Motion"],
    aspect: "9:16",
    role: "Paper-collage animation, edit",
    brief: "The year Tesla and SpaceX nearly went under, told in twenty-six seconds of cut-out paper and newsprint.",
    deliverables: ["0:26 Short (9:16)"],
    whatWeDid: [
      "Built a paper-collage world on a green grid board",
      "Animated headlines, photos and banknotes as cut-outs",
      "Paced the story to land on the lesson at the end",
    ],
    duration: "0:26",
    fps: 15,
  }),
  work({
    slug: "indianapolis-2026",
    title: "Indianapolis in 2026",
    client: "Real-estate agent · Indianapolis",
    categories: ["YouTube", "Real estate"],
    aspect: "16:9",
    role: "Edit, b-roll, titles",
    brief: "A market preview on the developments changing Indianapolis, cut from walk-and-talk footage on location.",
    deliverables: ["0:43 master (16:9)", "Animated title open", "Article and highlight inserts"],
    whatWeDid: [
      "Opened with a glowing kinetic title over the skyline",
      "Cut the presenter’s on-site walk-and-talk to pace",
      "Inserted highlighted articles to back each claim",
    ],
    duration: "0:43",
    fps: 60,
  }),
  work({
    slug: "flaws-connect",
    title: "Perfection Impresses, Flaws Connect",
    client: "Branding essay · original script by @rabt.marketing.co",
    categories: ["Shorts", "Brand", "Motion"],
    aspect: "9:16",
    role: "Motion design, 3D product moments",
    brief: "A branding essay on why polish alienates and small flaws build trust, told through a coffee brand’s cups and beans.",
    deliverables: ["0:12 Short (9:16)"],
    whatWeDid: [
      "Set editorial serif type against clean white space",
      "Animated 3D cups, beans and props between lines",
      "Cut one dark beat in the middle to reset attention",
    ],
    duration: "0:12",
    fps: 60,
    credits: [
      { role: "Edit & motion", name: "Arteniq Creative" },
      { role: "Script", name: "@rabt.marketing.co" },
    ],
  }),
  work({
    slug: "neon-nights",
    title: "Neon Nights",
    client: "Cinematic reel · personal",
    categories: ["Cinematic", "Reels"],
    aspect: "16:9",
    role: "Edit, speed ramps, grade",
    brief: "A night-city piece built from handheld street footage: rain, neon and motion, cut to rhythm.",
    deliverables: ["0:17 reel (16:9)"],
    whatWeDid: ["Speed-ramped transitions between locations", "Graded for saturated neon against deep blacks", "Cut on motion to keep the energy up"],
    duration: "0:17",
    fps: 18,
  }),
  work({
    slug: "success-overnight",
    title: "Success Doesn’t Happen Overnight",
    client: "Personal-brand creator",
    categories: ["Shorts", "Motion"],
    aspect: "9:16",
    role: "Motion graphics, kinetic type",
    brief: "Twenty seconds on consistency: type, icons and silhouettes that keep moving with the voice-over.",
    deliverables: ["0:20 Short (9:16)"],
    whatWeDid: [
      "Built a black-and-white type system with one serif accent",
      "Animated icons and cut-out silhouettes for each idea",
      "Kept something moving on every line",
    ],
    duration: "0:20",
    fps: 30,
  }),
  work({
    slug: "houston-market",
    title: "Houston Market, 2026",
    client: "Real-estate agent · Houston",
    categories: ["YouTube", "Real estate", "Motion"],
    aspect: "16:9",
    role: "Edit, data graphics, map animation",
    brief: "Is 2026 a good time to buy in Houston? An explainer that turns market data into something a buyer can follow.",
    deliverables: ["0:47 intro cut (16:9)", "Map and data graphics", "Lower thirds"],
    whatWeDid: [
      "Animated the Houston map open",
      "Built clean data cards for supply and pricing",
      "Designed a ‘hot take’ graphic system for key points",
    ],
    duration: "0:47",
    fps: 60,
  }),
  work({
    slug: "focus-hijacked",
    title: "Your Focus Is Hijacked",
    client: "Wellbeing creator",
    categories: ["Reels", "Motion"],
    aspect: "9:16",
    role: "Edit, motion graphics",
    brief: "A reel about attention: open on a ticking clock and keep the message moving.",
    deliverables: ["0:33 reel (9:16)"],
    whatWeDid: ["Animated clock and type opening", "Built circular frame transitions", "Cut the talking head to the beat"],
    duration: "0:33",
    fps: 30,
  }),
  work({
    slug: "editing-with-claude",
    title: "Video Editing with Claude",
    client: "AI education channel",
    categories: ["YouTube", "Motion"],
    aspect: "16:9",
    role: "Edit, UI animation, captions",
    brief: "An explainer on editing video with an AI agent: make terminal screens and a talking head feel like one story.",
    deliverables: ["1:04 master (16:9)", "Animated UI cards", "Captions"],
    whatWeDid: [
      "Animated stats and brand cards with a glow treatment",
      "Cut between screen recordings and the presenter",
      "Captioned key lines on screen",
    ],
    duration: "1:04",
    fps: 60,
  }),
  work({
    slug: "brain-modes",
    title: "Our Brains Operate in Two Modes",
    client: "Psychology explainer",
    categories: ["Shorts", "Motion"],
    aspect: "9:16",
    role: "Explainer animation",
    brief: "System 1 and System 2 in ten seconds: a split brain, two labels, no clutter.",
    deliverables: ["0:10 Short (9:16)"],
    whatWeDid: ["Animated the title into the brain mark", "Highlighted each half as its system is named", "Built the lists line by line"],
    duration: "0:10",
    fps: 30,
  }),
  work({
    slug: "denver-market",
    title: "Denver’s Market Just Shifted",
    client: "Real-estate agent · Colorado",
    categories: ["YouTube", "Real estate", "Motion"],
    aspect: "16:9",
    role: "Edit, graphics, chapters",
    brief: "A market update for buyers and sellers: what changed in Denver, and what it means for each side.",
    deliverables: ["1:26 master (16:9)", "Chapter and topic cards", "Agent stats card"],
    whatWeDid: [
      "Built a topics card so viewers know what’s coming",
      "Animated the agent’s credentials and stats",
      "Highlighted sources on screen as they’re quoted",
    ],
    duration: "1:26",
    fps: 30,
  }),
  work({
    slug: "paper-noise",
    title: "Noise / Distraction",
    client: "Focus & productivity creator",
    categories: ["Shorts", "Motion"],
    aspect: "9:16",
    role: "Paper-style animation, 3D objects",
    brief: "Two words defined like a dictionary page, with 3D objects that make each one physical.",
    deliverables: ["0:20 Short (9:16)"],
    whatWeDid: ["Designed a paper-texture dictionary layout", "Animated 3D headphones and a capsule as the hero objects", "Added a swatch palette as a design detail"],
    duration: "0:20",
    fps: 60,
  }),
  work({
    slug: "eclipse",
    title: "Eclipse",
    client: "30-day edit challenge",
    categories: ["Cinematic", "Motion"],
    aspect: "16:9",
    role: "VFX, sound design",
    brief: "Eight seconds, one idea: an eye that opens on a world inside it.",
    deliverables: ["0:08 piece (16:9)"],
    whatWeDid: ["Composited a figure into the iris", "Built the reveal out of black", "Designed the sound around the open"],
    duration: "0:08",
    fps: 30,
  }),
  work({
    slug: "success-definition",
    title: "The Definition of Success",
    client: "Mindset creator",
    categories: ["Shorts", "Motion"],
    aspect: "9:16",
    role: "Edit, motion graphics, UI animation",
    brief: "A talking-head Short rebuilt with graphics: lists, charts, phone screens and a map that ends on a trophy.",
    deliverables: ["0:23 Short (9:16)"],
    whatWeDid: [
      "Cut between the speaker and full-screen graphics",
      "Animated a growth chart, checklist and phone UI",
      "Built a route-map sequence for the payoff",
    ],
    duration: "0:23",
    fps: 30,
  }),
  work({
    slug: "red-signal",
    title: "Red Signal",
    client: "Promo reel · personal",
    categories: ["Promo", "Cinematic"],
    aspect: "16:9",
    role: "Edit, grade, transitions",
    brief: "A fast promo built on one colour: red, from the first frame to the last.",
    deliverables: ["0:16 promo (16:9)"],
    whatWeDid: ["Graded every shot into one red world", "Used match cuts and light transitions", "Paced to sixteen seconds"],
    duration: "0:16",
    fps: 30,
  }),
  work({
    slug: "kolkata",
    title: "Kolkata",
    client: "Travel film · personal",
    categories: ["Cinematic"],
    aspect: "16:9",
    role: "Edit, grade, title",
    brief: "A short city film: landmarks, traffic and light, held together by rhythm.",
    deliverables: ["0:31 film (16:9)"],
    whatWeDid: ["Opened on a title set into the skyline", "Graded warm streets against cool night", "Cut to music with motion matches"],
    duration: "0:31",
    fps: 30,
  }),
  work({
    slug: "cinematic-fonts",
    title: "Top 3 Cinematic Fonts",
    client: "30-day edit challenge",
    categories: ["Motion", "Cinematic"],
    aspect: "16:9",
    role: "Typography, compositing",
    brief: "Three fonts, three scenes: each typeface set into a shot that suits it.",
    deliverables: ["0:09 piece (16:9)"],
    whatWeDid: ["Composited type behind and in front of the subject", "Lit each title to match its scene"],
    duration: "0:09",
    fps: 60,
  }),
];

export const getProject = (slug: string) => projects.find((p) => p.slug === slug);

export const aspectRatio: Record<Aspect, string> = {
  "16:9": "16 / 9",
  "9:16": "9 / 16",
  "1:1": "1 / 1",
  "21:9": "21 / 9",
};
