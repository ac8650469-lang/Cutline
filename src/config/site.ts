/**
 * Every value from the brief's §0 lives here. Anything marked PLACEHOLDER must be replaced before launch.
 * `placeholders` lists them so the README and a dev-only console note can point at them.
 */
export const site = {
  name: "Arteniq",
  legalName: "Arteniq Creative",
  tagline: "Twenty-four decisions a second.", // {{TAGLINE_HINT}} — written for the concept, edit freely
  description:
    "Arteniq Creative is an editing and post-production studio for YouTube channels, brands and filmmakers: long-form, Shorts and Reels, commercials, colour, sound and motion graphics.",
  url: "https://example.com", // PLACEHOLDER — production URL, used for canonical + OG
  email: "hello@example.com", // PLACEHOLDER {{EMAIL}}
  whatsapp: "+910000000000", // PLACEHOLDER {{WHATSAPP}} — digits only after +, used for wa.me
  socials: [
    { label: "Instagram", href: "https://instagram.com/" }, // PLACEHOLDER
    { label: "YouTube", href: "https://youtube.com/" }, // PLACEHOLDER
    { label: "LinkedIn", href: "https://linkedin.com/" }, // PLACEHOLDER
    { label: "X", href: "https://x.com/" }, // PLACEHOLDER
  ],
  city: "Mumbai", // PLACEHOLDER {{BASE_CITY}}
  country: "India", // PLACEHOLDER
  timeZone: "Asia/Kolkata", // IANA zone for the footer clock — keep in sync with `city`
  responseTime: "within one working day",
  copyrightYear: 2026,
  placeholders: ["url", "email", "whatsapp", "socials", "city", "country"] as const,
} as const;

export const nav = [
  { label: "Work", href: "/#work" },
  { label: "Services", href: "/#services" },
  { label: "Process", href: "/#workflow" },
  { label: "About", href: "/#principles" },
  { label: "Contact", href: "/contact" },
] as const;

export const whatsappHref = `https://wa.me/${site.whatsapp.replace(/\D/g, "")}`;
export const mailHref = `mailto:${site.email}`;

/** Readable WhatsApp number, e.g. +91 00000 00000 */
export const whatsappDisplay = site.whatsapp.replace(/^\+(\d{2})(\d{5})(\d+)$/, "+$1 $2 $3");

export const hero = {
  meta: ["24 fps", "16:9", "Rec. 709", "Demo reel"],
  lines: ["Twenty-four", "decisions", "a second."],
  support:
    "Arteniq is an editing and post studio for channels, brands and filmmakers. We cut for retention, grade for mood and mix until the room goes quiet.",
};

export const reel = {
  title: "Showreel — demo edit",
  note: "Cut from licensed stock (Mixkit). Replace with your reel.",
  src: {
    mp4: "/media/demo/reel.mp4",
    webm: "/media/demo/reel.webm",
    poster: "/media/demo/reel.jpg",
    avif: "/media/demo/reel.avif",
  },
  mobile: {
    mp4: "/media/demo/reel-m.mp4",
    webm: "/media/demo/reel-m.webm",
    poster: "/media/demo/reel-m.jpg",
    avif: "/media/demo/reel-m.avif",
  },
  captions: "/media/demo/reel.vtt",
  duration: "0:14",
  isDemo: true,
};

export const endCard = {
  lines: ["Send us the footage.", "We’ll find the film."],
};
