import { ImageResponse } from "next/og";
import {
  BRAND_COLORS,
  BRAND_GLYPH_PATH,
  BRAND_GLYPH_VIEW_BOX,
  BRAND_NAME,
} from "@remi/ui/server";

/**
 * The iOS home-screen icon. Generated rather than checked in as a file because
 * `apple-icon` accepts only jpg/jpeg/png as a static asset, and this repo does
 * not carry binary art — so the source stays hand-written and Next rasterises
 * it at build time.
 *
 * Square and full-bleed, with no corner radius: iOS applies its own mask, and a
 * rounded source shows as a visible double-rounding inside it. `app/icon.svg`
 * keeps the radius because a browser tab does not mask anything.
 */
export const size = { width: 180, height: 180 };
export const contentType = "image/png";
export const alt = BRAND_NAME;

const Icon = () =>
  new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: BRAND_COLORS.brand600,
      }}
    >
      <svg
        width={92}
        height={112}
        viewBox={BRAND_GLYPH_VIEW_BOX}
        xmlns="http://www.w3.org/2000/svg"
      >
        <path d={BRAND_GLYPH_PATH} fill="#ffffff" fillRule="evenodd" />
      </svg>
    </div>,
    size,
  );

export default Icon;
