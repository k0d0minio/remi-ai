import { ImageResponse } from "next/og";
import { isLocale, type Locale } from "@remi/services/shared";
import { BRAND_COLORS, BRAND_NAME } from "@remi/ui/server";

/**
 * The social card, generated at build time by file convention — every route
 * under the locale inherits it, which is what makes the "every page has an OG
 * image" rule in AGENTS.md hold without wiring one per page.
 *
 * The styles are inline on purpose: Satori renders this outside the browser, so
 * there is no Tailwind pass and no CSS custom properties to resolve. The colours
 * are the one thing that must not be literal here — they come from
 * `BRAND_COLORS`, which is where a token-to-hex conversion is allowed to live.
 */
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = `${BRAND_NAME} — the wellness copilot between two consultations`;

const lines: Record<Locale, { first: string; second: string; footer: string }> =
  {
    en: {
      first: "Between two consultations,",
      second: "everything is at stake.",
      footer: "The wellness copilot for practitioner-guided nutrition",
    },
    fr: {
      first: "Entre deux consultations,",
      second: "tout se joue.",
      footer: "Le copilote bien-être de l'accompagnement nutritionnel",
    },
  };

const Image = async ({ params }: { params: Promise<{ locale: string }> }) => {
  const { locale } = await params;
  const copy = lines[isLocale(locale) ? locale : "en"];

  return new ImageResponse(
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
        <div style={{ display: "flex", fontSize: 64, lineHeight: 1.1 }}>
          {copy.first}
        </div>
        <div
          style={{
            display: "flex",
            fontSize: 64,
            lineHeight: 1.1,
            color: BRAND_COLORS.brandOnDark,
          }}
        >
          {copy.second}
        </div>
      </div>

      <div style={{ display: "flex", fontSize: 26, opacity: 0.7 }}>
        {copy.footer}
      </div>
    </div>,
    size,
  );
};

export default Image;
