import { real, type MediaSrc } from "./projects";

const demo = (id: string): MediaSrc => ({
  mp4: `/media/demo/${id}.mp4`,
  webm: `/media/demo/${id}.webm`,
  poster: `/media/demo/${id}.jpg`,
  avif: `/media/demo/${id}.avif`,
});

/* ---------------- Raw → final (capabilities) ---------------- */
export type CapabilityTab = {
  id: "colour" | "pacing" | "sound" | "captions";
  label: string;
  title: string;
  body: string;
  lookFor: string;
  before: { label: string; src: MediaSrc };
  after: { label: string; src?: MediaSrc };
  note: string;
};

export const capabilities: CapabilityTab[] = [
  {
    id: "colour",
    label: "Colour",
    title: "Flat by design. Graded on purpose.",
    body: "Log footage keeps every stop of highlight and shadow, so it looks washed out. The grade is where we decide the mood.",
    lookFor: "Skin tone, the sky's separation from the horizon, and how deep the shadows are allowed to go.",
    before: { label: "Log · simulated raw", src: demo("grade-log") },
    after: { label: "Graded", src: demo("grade") },
    note: "Simulated raw footage (demo): the log version is generated from the finished clip.",
  },
  {
    id: "pacing",
    label: "Pacing",
    title: "The assembly has every take. The cut keeps the ones that move.",
    body: "Same walk, same camera. The fine cut keeps four beats of the take and lands them on the rhythm.",
    lookFor: "Where the cut lands mid-stride, and how much ground the subject covers in the same six seconds.",
    before: { label: "Assembly", src: demo("pace-raw") },
    after: { label: "Fine cut", src: demo("pace-cut") },
    note: "Demo: both sides are cut from one stock clip.",
  },
  {
    id: "sound",
    label: "Sound",
    title: "Same picture, two mixes.",
    body: "The raw track spikes and drops out. The mix holds dialogue in a steady band and tucks the music under it.",
    lookFor: "The peaks on the left, and the even floor of the mix on the right.",
    before: { label: "Raw track", src: demo("mic-check") },
    after: { label: "Mixed" },
    note: "Illustrative waveform. The demo clip has no audio.",
  },
  {
    id: "captions",
    label: "Captions",
    title: "Most feeds start muted. Captions carry the first five seconds.",
    body: "Word-by-word captions set inside the title-safe area, sized for a phone held at arm's length.",
    lookFor: "Safe-area guides, the active word, and how the line breaks follow the speech.",
    before: { label: "Clean", src: demo("talk") },
    after: { label: "Captioned" },
    note: "Caption styling demo, with placeholder words, not a transcript.",
  },
];

export const captionWords = [
  "The", "first", "five", "seconds", "decide", "whether", "anyone", "hears", "the", "rest.",
];

/* ---------------- Principles (manifesto) ---------------- */
export type PrincipleToken = string | { media: MediaSrc; label: string };
export const principles: PrincipleToken[][] = [
  ["We", "cut", "for", "the", "second", "watch,", { media: real("neon-nights"), label: "Neon Nights clip" }, "the", "one", "where", "people", "notice", "what", "they", "felt", "the", "first", "time."],
  ["Retention", "isn’t", "a", "trick.", "We", "earn", "the", "next", "ten", "seconds,", { media: real("ai-finance"), label: "AI finance Short clip" }, "every", "ten", "seconds."],
  ["Colour", "is", "a", "point", "of", "view", { media: real("red-room-mood"), label: "Red-graded clip" }, "and", "sound", "is", "half", "the", "picture."],
  ["One", "editor", "owns", "your", "project", "from", "first", "assembly", "to", "final", "export.", "No", "hand-offs,", "no", "drift."],
  ["We’ll", "tell", "you", "what", "to", "cut.", "Then", "we’ll", "cut", "it."],
];

/* ---------------- Workflow ---------------- */
export const workflow = [
  {
    id: "consult",
    title: "Consultation",
    body: "A 30-minute call. We look at your channel or campaign, talk through goals, and agree whether we're the right fit.",
    duration: "Day 0 · 30 min",
    provide: "Links to past work, your goal, a deadline.",
    weight: 1,
  },
  {
    id: "brief",
    title: "Brief",
    body: "We write a one-page brief: audience, story, references, length and deliverables. You sign it off before we touch a frame.",
    duration: "1–2 days",
    provide: "References you love, and ones you don't.",
    weight: 1.4,
  },
  {
    id: "assets",
    title: "Assets",
    body: "You upload footage, music and brand files to a shared folder. We check every clip, sync audio and log selects.",
    duration: "1 day",
    provide: "Rushes, audio, logos, fonts.",
    weight: 1.1,
  },
  {
    id: "edit",
    title: "Edit & post",
    body: "Assembly, rough cut, fine cut, then colour, sound and graphics. You see a cut at the halfway mark.",
    duration: "3–10 days",
    provide: "Nothing. This part is ours.",
    weight: 3.2,
  },
  {
    id: "revisions",
    title: "Revisions",
    body: "Timestamped notes on a review link. Two rounds are included, and most projects only need one.",
    duration: "1–3 days",
    provide: "Notes in one place, from one voice.",
    weight: 1.6,
  },
  {
    id: "delivery",
    title: "Delivery",
    body: "Masters, platform versions, captions and project files, named and filed so anyone can find them.",
    duration: "Same day",
    provide: "A thumbs up.",
    weight: 1,
  },
];

/* ---------------- Results (all placeholders) ---------------- */
export const stats = [
  { value: 480, suffix: "+", label: "Videos delivered", isPlaceholder: true },
  { value: 38, suffix: "%", label: "Average lift in view duration", isPlaceholder: true },
  { value: 72, suffix: "h", label: "Median Shorts turnaround", isPlaceholder: true },
  { value: 120, suffix: "M", label: "Views on work we've cut", isPlaceholder: true },
];

/* ---------------- Testimonials (samples) ---------------- */
export const testimonials = [
  {
    quote:
      "They cut forty minutes of rambling into a twelve-minute video people actually finish. Our average view duration nearly doubled.",
    name: "Sample name",
    role: "Host, sample channel",
    mark: "SC",
    isDemo: true,
  },
  {
    quote: "The first cut came back better than the brief. The second came back exactly right.",
    name: "Sample name",
    role: "Marketing lead, sample brand",
    mark: "SB",
    isDemo: true,
  },
  {
    quote:
      "We send raw footage on Monday and have Shorts scheduled by Thursday. It's the most reliable part of our week.",
    name: "Sample name",
    role: "Producer, sample podcast",
    mark: "SP",
    isDemo: true,
  },
];

/* ---------------- FAQ ---------------- */
export const faq = [
  {
    q: "How do you price projects?",
    a: "Per project, quoted after the brief. Long-form and Shorts work can also run as a monthly retainer. You see the full cost before we start, and it doesn't change unless the scope does.",
  },
  {
    q: "How many revisions are included?",
    a: "Two rounds on every project. Notes arrive timestamped on a review link, so nothing gets lost in email. Extra rounds are quoted upfront.",
  },
  {
    q: "What's the turnaround?",
    a: "Shorts in 48 to 72 hours. Long-form in five to seven working days. Commercials depend on scope; the quote includes a dated schedule.",
  },
  {
    q: "What do you deliver, and in what formats?",
    a: "Masters in ProRes or H.264, platform versions (16:9, 9:16, 1:1, 4:5), SRT captions and thumbnail frames. Broadcast specs and loudness targets on request.",
  },
  {
    q: "Do I get the project files?",
    a: "Yes. On final payment you receive the project file, graded masters and organised media, so you're never locked in to us.",
  },
  {
    q: "Which tools do you work with?",
    a: "We edit in Premiere Pro and DaVinci Resolve, review on Frame.io, and talk on Slack, email or WhatsApp, whichever you already use.",
  },
  {
    q: "Who owns the rights?",
    a: "You do. Final deliverables are yours to use anywhere. Music and stock are licensed in your name, or we work with assets you provide.",
  },
];
