import { ImageResponse } from "next/og";

export const alt = "SetuAI - Practical AI literacy for schools and communities";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div style={{ display: "flex", height: "100%", width: "100%", background: "#102c34", color: "#f8fbfa", padding: "72px", position: "relative" }}>
        <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", width: "100%" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "18px", fontSize: 28, letterSpacing: 1 }}>
            <div style={{ display: "flex", width: 52, height: 52, alignItems: "center", justifyContent: "center", border: "2px solid #f6cf63", color: "#f6cf63", fontSize: 28 }}>S</div>
            <span>SetuAI</span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", maxWidth: "940px" }}>
            <div style={{ display: "flex", fontSize: 26, color: "#f6cf63", letterSpacing: 2 }}>PRACTICAL AI LITERACY</div>
            <div style={{ display: "flex", marginTop: 24, fontSize: 78, lineHeight: 1.02, letterSpacing: -3 }}>Build understanding before dependence.</div>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 24, color: "#d3e7e4" }}>
            <span>Active AI literacy initiative</span>
            <span>SetuAI.org</span>
          </div>
        </div>
      </div>
    ),
    size,
  );
}
