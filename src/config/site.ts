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
  url: "https://www.arteniqcreative.com", // production URL, used for canonical + OG
  email: "arteniqcreative@gmail.com", // primary: mailto links, form fallback, JSON-LD
  altEmail: "admin@arteniqcreative.com",
  phone: "+918777374475", // also the WhatsApp number (wa.me)
  socials: [
    { label: "Instagram", href: "https://www.instagram.com/arteniqcreative/" },
    { label: "YouTube", href: "https://www.youtube.com/@ArteniqCreative" },
    { label: "LinkedIn", href: "https://www.linkedin.com/in/arteniq-creative-849b17451/" },
    { label: "X", href: "https://x.com/arteniqcreative" },
  ],
  city: "Mumbai", // PLACEHOLDER {{BASE_CITY}}
  country: "India", // PLACEHOLDER
  timeZone: "Asia/Kolkata", // IANA zone for the footer clock — keep in sync with `city`
  responseTime: "within one working day",
  copyrightYear: 2026,
  placeholders: ["city", "country"] as const,
} as const;

export const nav = [
  { label: "Work", href: "/#work" },
  { label: "Services", href: "/#services" },
  { label: "Process", href: "/#workflow" },
  { label: "About", href: "/#principles" },
  { label: "Contact", href: "/contact" },
] as const;

export const whatsappHref = `https://wa.me/${site.phone.replace(/\D/g, "")}`;
export const mailHref = `mailto:${site.email}`;
export const altMailHref = `mailto:${site.altEmail}`;
export const phoneHref = `tel:${site.phone}`;

/** Readable phone number, e.g. +91 87773 74475 */
export const whatsappDisplay = site.phone.replace(/^\+(\d{2})(\d{5})(\d+)$/, "+$1 $2 $3");
export const phoneDisplay = whatsappDisplay;

export const hero = {
  meta: ["24 fps", "16:9", "Rec. 709", "Showreel"],
  lines: ["Twenty-four", "decisions", "a second."],
  support:
    "Arteniq is an editing and post studio for channels, brands and filmmakers. We cut for retention, grade for mood and mix until the room goes quiet.",
};

export const reel = {
  title: "Showreel",
  note: "Cut from Arteniq client and personal work.",
  src: {
    mp4: "/media/real/reel.mp4",
    webm: "/media/real/reel.webm",
    poster: "/media/real/reel.jpg",
    avif: "/media/real/reel.avif",
  },
  mobile: {
    mp4: "/media/real/reel-m.mp4",
    webm: "/media/real/reel-m.webm",
    poster: "/media/real/reel-m.jpg",
    avif: "/media/real/reel-m.avif",
  },
  captions: "/media/real/reel.vtt",
  duration: "0:20",
  isDemo: false,
};

export const endCard = {
  lines: ["Send us the footage.", "We’ll find the film."],
};
