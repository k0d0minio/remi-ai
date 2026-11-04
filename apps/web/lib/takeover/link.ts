import { headers } from "next/headers";
import type { TakeoverLinkFor } from "@remi/services/server";
import {
  appOrigin,
  fileTakeoverPath,
  localePath,
} from "@remi/services/shared";

/** An origin and nothing else: a scheme, a host, an optional port. */
const originShape = /^https?:\/\/[A-Za-z0-9.-]+(:\d+)?$/;

/**
 * The takeover link, on the origin the patient is on. A preview then mails a
 * link to the same preview, not to production. Next.js refuses a server
 * action whose `Origin` does not match the host, so the header is the page's
 * own origin. Without it, the link falls back to the app's catalogued origin.
 */
export const takeoverLinkFor = async (): Promise<TakeoverLinkFor> => {
  const origin = (await headers()).get("origin") ?? "";
  const base = originShape.test(origin) ? origin : appOrigin("web");
  return (token, locale) => `${base}${localePath(locale, fileTakeoverPath(token))}`;
};
