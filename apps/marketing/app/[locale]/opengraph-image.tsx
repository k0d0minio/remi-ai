import { ImageResponse } from "next/og";
import { BRAND_COLORS, BRAND_NAME } from "@remi/ui/server";
import { META } from "@/lib/content/landing";
import { SITE } from "@/lib/site";

/**
 * The social card, generated at build time by file convention — every route
 * under /fr inherits it. The styles are inline on purpose: Satori renders
 * this outside the browser, with no Tailwind pass and no CSS custom
 * properties. The colours come from `BRAND_COLORS`, the one place a
 * token-to-hex conversion is allowed to live.
 */
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = META.ogTitle;

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
        backgroundColor: BRAND_COLORS.paper,
        color: BRAND_COLORS.ink,
      }}
    >
      <div
        style={{
          display: "flex",
          fontSize: 44,
          letterSpacing: 4,
          color: BRAND_COLORS.brand600,
        }}
      >
        {BRAND_NAME}
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        <div style={{ display: "flex", fontSize: 66, lineHeight: 1.1 }}>
          Devenez patient pilote
        </div>
        <div
          style={{
            display: "flex",
            fontSize: 34,
            lineHeight: 1.3,
            color: BRAND_COLORS.brand600,
          }}
        >
          {`Nutrition personnalisée · dès le ${SITE.pilotStartLabel}`}
        </div>
      </div>

      <div style={{ display: "flex", fontSize: 26, opacity: 0.75, lineHeight: 1.4 }}>
        {META.ogDescription}
      </div>
    </div>,
    size,
  );

export default Image;
