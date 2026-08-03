import { ImageResponse } from "next/og";
import { BRAND_COLORS, BRAND_NAME, BRAND_TAGLINE } from "@remi/ui/server";
import { hero } from "@/lib/content/landing";

/**
 * The social card, generated at build time by file convention — every route
 * inherits it, which is what makes the "every page has an OG image" rule in
 * AGENTS.md hold without wiring one per page.
 *
 * The styles are inline on purpose: Satori renders this outside the browser, so
 * there is no Tailwind pass and no CSS custom properties to resolve. The colours
 * are the one thing that must not be literal here — they come from
 * `BRAND_COLORS`, which is where a token-to-hex conversion is allowed to live.
 */
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = `${BRAND_NAME} — ${BRAND_TAGLINE.en}`;

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
        backgroundColor: BRAND_COLORS.ink,
        color: BRAND_COLORS.paper,
      }}
    >
      <div style={{ display: "flex", fontSize: 40, letterSpacing: 2 }}>
        {BRAND_NAME}
      </div>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 24,
        }}
      >
        {hero.titleLines.map((line, index) => (
          <div
            key={line}
            style={{
              display: "flex",
              fontSize: 68,
              lineHeight: 1.1,
              // The second line carries the brand colour — it is the half of the
              // sentence the page is actually about.
              ...(index > 0 ? { color: BRAND_COLORS.brandOnDark } : {}),
            }}
          >
            {line}
          </div>
        ))}
      </div>

      <div style={{ display: "flex", fontSize: 26, opacity: 0.7 }}>
        {BRAND_TAGLINE.en}
      </div>
    </div>,
    size,
  );

export default Image;
