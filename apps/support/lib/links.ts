import { appHref, type Locale } from "@remi/services/shared";
import type { SiteLink } from "@/lib/content/types";

/**
 * The help centre is a leaf: almost every link it renders leaves for another
 * app. Those apps are separate Vercel projects on their own origins, so the URL
 * has to be built rather than routed — a `next/link` to "/contact" would resolve
 * against this origin and 404.
 *
 * Every origin comes from `@remi/services/shared` → `links.ts`, the one place
 * that knows where each app answers. `appHref` also knows which destinations
 * carry a locale prefix, so a visitor reading the French help centre stays in
 * French when they leave it, and a link to an English-only app never gains a
 * `/fr` that app cannot serve.
 */
export const externalHref = (locale: Locale, link: SiteLink) =>
  appHref(link.target, link.path, locale);
