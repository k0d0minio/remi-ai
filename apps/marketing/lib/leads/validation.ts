import { MESSAGES } from "@/lib/content/landing";

/**
 * The checks the forms run in the browser, from Morgane's `lib/validation.ts`.
 * The service checks again on the server. The email pattern stays loose on
 * purpose: the only test of an address is a mail to it.
 */
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const PHONE_RE = /^[+()\d\s./-]{6,30}$/;

export const isEmail = (value: string) => EMAIL_RE.test(value.trim());
export const isPhone = (value: string) => PHONE_RE.test(value.trim());

export type FieldErrors = Record<string, string>;

export const MSG = MESSAGES;
