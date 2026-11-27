export const categories = [
  "YouTube",
  "Real estate",
  "Shorts",
  "Reels",
  "Commercial",
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
const work = (p: Omit<Project, "src" | "full" | "isDemo" | "codec" | "year" | "credits"> & { year?: number }): Project => ({
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
    slug: "az-coffee",
    title: "AZ Coffee",
    client: "Coffee subscription brand",
    categories: ["Commercial", "Brand", "Motion"],
    aspect: "9:16",
    role: "Product ad, motion design",
    brief: "A vertical ad for a coffee-matching app: show the quiz, the product and the promise in thirty-five seconds.",
    deliverables: ["0:35 ad (9:16)", "App screen animation", "End card with logo"],
    whatWeDid: [
      "Animated the app’s quiz inside a phone mock-up",
      "Set kinetic type on a coffee-bean texture for each benefit",
      "Built the product reveal and logo resolve as the end card",
    ],
    duration: "0:35",
    fps: 60,
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
    slug: "ai-finance",
    title: "$77,600 in 17 Days",
    client: "Finance creator",
    categories: ["Shorts", "Motion"],
    aspect: "9:16",
    role: "Short-form edit, kinetic captions",
    brief: "An eleven-second hook for a finance short: land the number before the thumb moves on.",
    deliverables: ["0:11 Short (9:16)", "Kinetic captions", "Stock and 3D inserts"],
    whatWeDid: [
      "Cut to a new visual on almost every word",
      "Animated the money figures as the payoff",
      "Styled captions to read with the sound off",
    ],
    duration: "0:11",
    fps: 30,
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
    slug: "creator-reel",
    title: "Talking-Head Reel",
    client: "Creator · sample edit",
    categories: ["Reels", "Shorts", "Motion"],
    aspect: "9:16",
    role: "Short-form edit, captions, pacing",
    brief: "A sample edit for a creator: turn a two-minute talking-head take into a reel that holds to the end.",
    deliverables: ["2:23 reel (9:16)", "Word-by-word captions", "Punch-ins and reframes"],
    whatWeDid: [
      "Tightened the take and cut every pause",
      "Added punch-ins and screen inserts to reset attention",
      "Styled captions with key words in colour",
    ],
    duration: "2:23",
    fps: 25,
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
    slug: "macbook-m4",
    title: "MacBook Air M4",
    client: "Tech creator",
    categories: ["Reels", "Promo"],
    aspect: "9:16",
    role: "Speed ramps, product shots, titles",
    brief: "A product reel for the MacBook Air M4: make an unboxing feel like a launch.",
    deliverables: ["0:20 reel (9:16)"],
    whatWeDid: ["Speed-ramped every product move", "Set neon-style product titles", "Timed the cuts to the music"],
    duration: "0:20",
    fps: 60,
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
    slug: "good-editing",
    title: "What Is Good Editing?",
    client: "Editing channel",
    categories: ["Shorts", "Motion"],
    aspect: "9:16",
    role: "Motion design",
    brief: "A ten-second animated hook: a question that pops out of a folder.",
    deliverables: ["0:10 animation (9:16)"],
    whatWeDid: ["Designed the folder pop-up animation", "Set the title with a soft 3D look"],
    duration: "0:10",
    fps: 30,
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
