import { ImageResponse } from "next/og";
import { site } from "@/config/site";

export const alt = `${site.name}: Twenty-four decisions a second. Editing and post-production studio.`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/* Satori can't read CSS variables, so the token values are repeated here. */
const PAPER = "#ede8df";
const INK = "#0e0e0c";
const MUTE = "#5f5a51";
const SIGNAL = "#ff4d1c";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between", background: PAPER, color: INK, padding: 64 }}>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 22, letterSpacing: 2, color: MUTE }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 14, height: 14, borderRadius: 7, background: SIGNAL }} />
            <span>REC · SC.01 OPENING</span>
          </div>
          <span>00:00:00:00</span>
        </div>
        <div style={{ display: "flex", flexDirection: "column", fontSize: 118, lineHeight: 0.92, letterSpacing: -4 }}>
          <span>Twenty-four</span>
          <span>decisions</span>
          <span style={{ alignSelf: "flex-end" }}>a second.</span>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 24, color: MUTE }}>
          <span style={{ color: INK }}>{site.name}</span>
          <span>Editing · Colour · Sound · Motion</span>
        </div>
      </div>
    ),
    size,
  );
}
