import { defaultLocale, localePath, type Locale } from "./i18n";

/**
 * Where every app in this monorepo answers, in one place.
 *
 * Six apps are six Vercel projects on six origins, so a link that crosses
 * between them has to be built rather than routed — a `next/link` to "/contact"
 * resolves against the origin it was rendered on and 404s. That much was always
 * true; what makes this a single file is that the answer changes all at once.
 * The day the real domain is bought, six subdomains move together, and an origin
 * typed into one footer somewhere is the one that gets missed.
 *
 * Read straight from `process.env` rather than through `@remi/services/server`'s
 * `env()`: these are read from client components too, and a `NEXT_PUBLIC_*`
 * variable is only inlined into the browser bundle for a literal
 * `process.env.NAME`. That is why every override below is spelled out by hand
 * instead of looked up by key.
 */

/** The six deployments, named as `apps/` names them. */
export type AppKey =
  "web" | "marketing" | "admin" | "docs" | "support" | "demo";

/**
 * The domain everything hangs off, and the label each app answers on. Buying a
 * real domain is one edit to `rootDomain`; moving one app is one edit to its
 * row. Nothing else in the repo spells an origin out.
 */
const rootDomain = "jamienisbet.com";

const subdomains: Record<AppKey, string> = {
  web: "remi-app",
  marketing: "remi",
  admin: "remi-admin",
  docs: "remi-docs",
  support: "remi-support",
  demo: "remi-demo",
};

/** The port each app's dev server binds to — the same numbers as its `package.json`. */
const devPorts: Record<AppKey, number> = {
  web: 3000,
  marketing: 3001,
  admin: 3002,
  docs: 3003,
  support: 3004,
  demo: 3005,
};

/**
 * A per-environment escape hatch, for the cases the table above cannot know:
 * a preview deployment, a staging domain, a rename that has not landed here yet.
 * Set the variable in Vercel and it wins; leave it unset — which is the normal
 * case — and the table answers. All six are registered in turbo.json's
 * `globalEnv` and docs/ENV.md.
 */
const overrides: Record<AppKey, string | undefined> = {
  web: process.env.NEXT_PUBLIC_APP_URL,
  marketing: process.env.NEXT_PUBLIC_MARKETING_URL,
  admin: process.env.NEXT_PUBLIC_ADMIN_URL,
  docs: process.env.NEXT_PUBLIC_DOCS_URL,
  support: process.env.NEXT_PUBLIC_SUPPORT_URL,
  demo: process.env.NEXT_PUBLIC_DEMO_URL,
};

/**
 * Which apps publish every route under a locale prefix. Holding the answer here
 * is what lets a caller hand its own locale to every link it builds and still
 * get a working URL for the three apps that have no prefix — the alternative is
 * each caller remembering which is which, which is how a `/fr` lands in front of
 * an English-only console.
 */
const localised: Record<AppKey, boolean> = {
  web: true,
  marketing: true,
  support: true,
  admin: false,
  docs: false,
  demo: false,
};

/**
 * `pnpm dev` runs all six on localhost, so a development build points at ports
 * rather than at the live domain. Without this, following a footer link while
 * working locally would leave the machine entirely.
 */
const isDevelopment = process.env.NODE_ENV === "development";

/** Origin only, no trailing slash — so a path concatenates onto it cleanly. */
export const appOrigin = (app: AppKey) =>
  overrides[app] ??
  (isDevelopment
    ? `http://localhost:${devPorts[app]}`
    : `https://${subdomains[app]}.${rootDomain}`);

/**
 * A full URL into another app. `path` excludes the locale prefix, exactly as
 * `localePath` expects it; `locale` is ignored for the apps that ship in one
 * language, so a caller never has to check which it is addressing.
 *
 * A localised app always gets a prefix, `defaultLocale` when the caller has no
 * locale of its own to carry across. That is not a nicety: those apps route
 * entirely under `app/[locale]/` and nothing answers their bare root, so an
 * unprefixed link to one is a 404 rather than a redirect.
 */
export const appHref = (app: AppKey, path = "/", locale?: Locale) => {
  const suffix = localised[app]
    ? localePath(locale ?? defaultLocale, path)
    : path;
  return `${appOrigin(app)}${suffix === "/" ? "" : suffix}`;
};
