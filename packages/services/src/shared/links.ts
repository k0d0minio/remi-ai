import { defaultLocale, localePath, type Locale } from "./i18n";
import { sha256Hex } from "./sha256";

/**
 * Where every app in this monorepo answers, in one place.
 *
 * Four apps are four Vercel projects on four origins, so a link that crosses
 * between them has to be built rather than routed — a `next/link` to "/contact"
 * resolves against the origin it was rendered on and 404s. That much was always
 * true; what makes this a single file is that the answer changes all at once.
 * When the domain changes, four subdomains move together, and an origin typed
 * into one footer somewhere is the one that gets missed.
 *
 * Read straight from `process.env` rather than through `@remi/services/server`'s
 * `env()`: these are read from client components too, and a `NEXT_PUBLIC_*`
 * variable is only inlined into the browser bundle for a literal
 * `process.env.NAME`. That is why every override below is spelled out by hand
 * instead of looked up by key.
 */

/** The four deployments, named as `apps/` names them. */
export type AppKey = "web" | "marketing" | "admin" | "docs";

/**
 * The domain everything hangs off, and the label each app answers on. This is
 * the last resort, not the live answer: each origin comes from the
 * `NEXT_PUBLIC_*_URL` overrides below. `remiai.be` is the only domain since
 * 2026-11-03 (D-37), so this table names the production addresses. The
 * marketing site answers on `www`: the bare domain redirects to it. Nothing
 * else in the repo spells an origin out.
 */
const rootDomain = "remiai.be";

const subdomains: Record<AppKey, string> = {
  web: "app",
  marketing: "www",
  admin: "admin",
  docs: "docs",
};

/** The port each app's dev server binds to — the same numbers as its `package.json`. */
const devPorts: Record<AppKey, number> = {
  web: 3000,
  marketing: 3001,
  admin: 3002,
  docs: 3003,
};

/**
 * Where each app actually answers, set per Vercel project. These win over the
 * table above, and in production and uat they are what should be answering: a
 * project missing its variable does not fail — it quietly advertises the
 * production address of the table, which is wrong on uat. A placeholder domain
 * in this table is how a live operator invitation once went out pointing at
 * the wrong domain.
 *
 * Unset is still legitimate in local development, where the dev ports below
 * answer. A Vercel preview does not read them: `resolveOrigin` builds the
 * previews of its own branch instead. All four are registered in turbo.json's
 * `globalEnv`, and .icm/docs/ENV.md carries the per-project matrix of which
 * app needs which.
 */
const overrides: Record<AppKey, string | undefined> = {
  web: process.env.NEXT_PUBLIC_APP_URL,
  marketing: process.env.NEXT_PUBLIC_MARKETING_URL,
  admin: process.env.NEXT_PUBLIC_ADMIN_URL,
  docs: process.env.NEXT_PUBLIC_DOCS_URL,
};

/**
 * Which apps publish every route under a locale prefix. Holding the answer here
 * is what lets a caller hand its own locale to every link it builds and still
 * get a working URL for the two apps that have no prefix — the alternative is
 * each caller remembering which is which, which is how a `/fr` lands in front of
 * an English-only console.
 */
const localised: Record<AppKey, boolean> = {
  web: true,
  marketing: true,
  admin: false,
  docs: false,
};

/**
 * `pnpm dev` runs all four on localhost, so a development build points at ports
 * rather than at the live domain. Without this, following a footer link while
 * working locally would leave the machine entirely.
 */
const isDevelopment = process.env.NODE_ENV === "development";

/**
 * The Vercel environment of this build (`production`, `uat` or `preview`) and
 * its git branch. Each app's `next.config` copies them from `VERCEL_TARGET_ENV`
 * and `VERCEL_GIT_COMMIT_REF` at build time, so the browser bundle has them
 * too. `VERCEL_ENV` cannot do this job: it reads `preview` on `uat` as well.
 * Empty or unset, as in local development and the tests, means not a preview.
 */
const vercelTargetEnv = process.env.NEXT_PUBLIC_VERCEL_TARGET_ENV || undefined;
const vercelBranch = process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_REF || undefined;

/** The Vercel team of the four projects: the last label of each preview alias. */
const vercelTeam = "remi21";

/** The Vercel project each app deploys as (`.icm/environments.md`). */
const vercelProjects: Record<AppKey, string> = {
  web: "app",
  marketing: "marketing",
  admin: "admin",
  docs: "documentation",
};

/**
 * Where a preview links when it does not know its branch: the UAT addresses of
 * `.icm/environments.md`. `docs` has no UAT, so it keeps its one address.
 */
const uatOrigins: Record<AppKey, string> = {
  web: `https://uat-app.${rootDomain}`,
  marketing: `https://uat.${rootDomain}`,
  admin: `https://uat-admin.${rootDomain}`,
  docs: `https://docs.${rootDomain}`,
};

/**
 * The branch alias that Vercel gives a project for a git branch:
 * `<project>-git-<branch>-<team>.vercel.app`. A label longer than 63
 * characters is cut, and the first 6 hex characters of
 * sha256(`git-<branch><project>`) go before the team. The rule was checked
 * against 222 aliases of this repo's pull requests.
 */
export const vercelBranchAlias = (app: AppKey, branch: string) => {
  const project = vercelProjects[app];
  const slug = branch
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  const full = `${project}-git-${slug}-${vercelTeam}`;
  if (full.length <= 63) return `https://${full}.vercel.app`;
  const hash = sha256Hex(`git-${branch}${project}`).slice(0, 6);
  const head = `${project}-git-${slug}`
    .slice(0, 63 - hash.length - vercelTeam.length - 2)
    .replace(/-+$/, "");
  return `https://${head}-${hash}-${vercelTeam}.vercel.app`;
};

/** What decides an origin. `appOrigin` gives this build's values. */
export type OriginContext = {
  /** The Vercel environment: `production`, `uat`, `preview`, or unset. */
  targetEnv?: string;
  /** The git branch of a Vercel build. */
  branch?: string;
  /** The `NEXT_PUBLIC_*_URL` value for the app. */
  override?: string;
  /** True for `next dev`. */
  development?: boolean;
};

/**
 * The origin of an app in a given context. A Vercel preview links to the
 * previews of its own branch, which share its Neon branch, and never to
 * production: a preview ignores the overrides, because a value set for
 * every environment would name production. `uat` and production take their
 * override, then the table.
 */
export const resolveOrigin = (app: AppKey, context: OriginContext) => {
  if (context.targetEnv === "preview") {
    return context.branch
      ? vercelBranchAlias(app, context.branch)
      : uatOrigins[app];
  }
  return (
    context.override ??
    (context.development
      ? `http://localhost:${devPorts[app]}`
      : `https://${subdomains[app]}.${rootDomain}`)
  );
};

/** Origin only, no trailing slash — so a path concatenates onto it cleanly. */
export const appOrigin = (app: AppKey) =>
  resolveOrigin(app, {
    targetEnv: vercelTargetEnv,
    branch: vercelBranch,
    override: overrides[app],
    development: isDevelopment,
  });

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
