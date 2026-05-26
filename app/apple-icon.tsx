import { ImageResponse } from "next/og";

export const runtime = "edge";
// iOS uses 180x180 for high-res home screen icon
export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          background: "#1a4d3a",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 0,
        }}
      >
        {/* Big S */}
        <span
          style={{
            color: "#ffffff",
            fontSize: 90,
            fontWeight: 900,
            fontFamily: "serif",
            lineHeight: 1,
            letterSpacing: -4,
          }}
        >
          S
        </span>
        {/* KINZ underneath */}
        <span
          style={{
            color: "#c4943c",
            fontSize: 26,
            fontWeight: 700,
            fontFamily: "serif",
            lineHeight: 1,
            letterSpacing: 6,
            marginTop: -8,
          }}
        >
          KINZ
        </span>
      </div>
    ),
    { ...size }
  );
}
