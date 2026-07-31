import { ImageResponse } from "next/og";

/**
 * The social card, generated at build time by file convention — every route
 * inherits it, which is what makes the "every page has an OG image" rule in
 * AGENTS.md hold without wiring one per page.
 *
 * The styles are inline and literal on purpose: Satori renders this outside the
 * browser, so there is no Tailwind pass and no CSS custom properties to resolve.
 * The colours are the light-mode `--brand-600` / `--grey-950` tokens converted
 * to hex — if the brand moves in tokens.css, move them here too.
 */
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "Remi AI — nutrition tracking with clinical reasoning";

const Image = () =>
  new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: 80,
        backgroundColor: "#0b1220",
        color: "#f7f8fa",
      }}
    >
      <div style={{ display: "flex", fontSize: 40, letterSpacing: -1 }}>
        Remi
      </div>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 24,
        }}
      >
        <div style={{ display: "flex", fontSize: 68, lineHeight: 1.1 }}>
          Know what you eat.
        </div>
        <div
          style={{
            display: "flex",
            fontSize: 68,
            lineHeight: 1.1,
            color: "#6b8dff",
          }}
        >
          Understand what it does.
        </div>
      </div>

      <div style={{ display: "flex", fontSize: 26, opacity: 0.7 }}>
        Nutrition tracking with clinical reasoning behind it
      </div>
    </div>,
    size,
  );

export default Image;
