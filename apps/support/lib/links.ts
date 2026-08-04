import { localePath, type Locale } from "@remi/services/shared";
import type { SiteLink } from "@/lib/content/types";

/**
 * The help centre is a leaf: almost every link it renders leaves for another
 * app. Those apps are separate Vercel projects on their own origins, so the URL
 * has to be built rather than routed — a `next/link` to "/contact" would resolve
 * against this origin and 404.
 *
 * Both variables are registered in turbo.json's globalEnv and docs/ENV.md. The
 * localhost fallbacks are for `pnpm support:dev`, where neither is set.
 */
const marketingUrl =
  process.env.NEXT_PUBLIC_MARKETING_URL ?? "http://localhost:3001";

const productUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

const origins: Record<SiteLink["target"], string> = {
  marketing: marketingUrl,
  product: productUrl,
};

/**
 * Both destinations ship in the same two languages under the same `/en` and
 * `/fr` prefixes, so a visitor reading the French help centre stays in French
 * when they leave it.
 */
export const externalHref = (locale: Locale, link: SiteLink) =>
  `${origins[link.target]}${localePath(locale, link.path)}`;
