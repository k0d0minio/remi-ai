import type { MetadataRoute } from "next";
import { defaultLocale, localePath } from "@remi/services/shared";

/**
 * The web app manifest (story 22). The patient puts REMI on the home screen
 * of a phone from the browser, as « Votre espace REMI est prêt » explains.
 * With `display: standalone` the shortcut opens full screen, with the REMI
 * icon and no browser bar. There is no app store listing.
 *
 * The icons are the two that exist: `icon.png` (256 px) and `apple-icon.png`
 * (180 px). The colours are the charter's: `surface.page` and
 * `brand.primary`.
 *
 * Next.js serves this at `/manifest.webmanifest` and links it from each page.
 * The proxy does not match a path with a dot, so it gets no locale prefix.
 */
const manifest = (): MetadataRoute.Manifest => ({
  name: "REMI",
  short_name: "REMI",
  description: "Entre recommandation et action",
  lang: "fr-BE",
  start_url: localePath(defaultLocale, "/"),
  scope: "/",
  display: "standalone",
  background_color: "#F4F8FC",
  theme_color: "#3362AE",
  icons: [
    { src: "/icon.png", sizes: "256x256", type: "image/png" },
    { src: "/apple-icon.png", sizes: "180x180", type: "image/png" },
  ],
});

export default manifest;
