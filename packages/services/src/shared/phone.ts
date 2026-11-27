/**
 * The one phone rule of the patient's file (REM-158, Morgane's UAT of
 * 2026-11-26): an international number, with the country code.
 *
 * Isomorphic and import-free: the browser checks the field as the patient
 * types, and each service checks it again before a write.
 *
 * - The patient types `+`, digits and spaces. Nothing else.
 * - The number starts with `+` and a country calling code of the ITU list.
 * - E.164: 15 digits at most, country code included. 8 digits at least.
 * - For the countries that Remi's patients live in, the national number has
 *   the exact length of that country, with no trunk `0`. An Italian number
 *   keeps its `0`: it is part of the number there.
 *
 * The stored form has no space: `+32470123456`.
 */

/** Assigned country calling codes (ITU-T E.164). No two share a prefix. */
const countryCodes = new Set(
  [
    "1 7 20 27 30 31 32 33 34 36 39 40 41 43 44 45 46 47 48 49 51 52",
    "53 54 55 56 57 58 60 61 62 63 64 65 66 81 82 84 86 90 91 92 93",
    "94 95 98 211 212 213 216 218 220 221 222 223 224 225 226 227 228",
    "229 230 231 232 233 234 235 236 237 238 239 240 241 242 243 244",
    "245 246 247 248 249 250 251 252 253 254 255 256 257 258 260 261",
    "262 263 264 265 266 267 268 269 290 291 297 298 299 350 351 352",
    "353 354 355 356 357 358 359 370 371 372 373 374 375 376 377 378",
    "379 380 381 382 383 385 386 387 389 420 421 423 500 501 502 503",
    "504 505 506 507 508 509 590 591 592 593 594 595 596 597 598 599",
    "670 672 673 674 675 676 677 678 679 680 681 682 683 685 686 687",
    "688 689 690 691 692 800 808 850 852 853 855 856 870 878 880 881",
    "882 883 886 888 960 961 962 963 964 965 966 967 968 970 971 972",
    "973 974 975 976 977 979 992 993 994 995 996 998",
  ]
    .join(" ")
    .split(" "),
);

/**
 * The national number lengths of the neighbour countries, with no trunk `0`:
 * Belgium, France, the Netherlands, Luxembourg, Germany, Switzerland, the UK.
 */
const nationalLengths: Readonly<Record<string, readonly [number, number]>> = {
  "32": [8, 9],
  "33": [9, 9],
  "31": [9, 9],
  "352": [4, 11],
  "49": [6, 13],
  "41": [9, 9],
  "44": [9, 10],
};

const countryCodeOf = (digits: string) =>
  [1, 2, 3]
    .map((length) => digits.slice(0, length))
    .find((prefix) => countryCodes.has(prefix));

/**
 * The number as stored (`+32470123456`), or null when it is not a valid
 * international number. Leading and trailing spaces do not count.
 */
export const normalizePhone = (value: string): string | null => {
  const typed = value.trim();
  if (!/^\+[\d ]+$/.test(typed)) {
    return null;
  }
  const digits = typed.slice(1).replace(/ /g, "");
  if (digits.length < 8 || digits.length > 15) {
    return null;
  }
  const code = countryCodeOf(digits);
  if (!code) {
    return null;
  }
  const national = digits.slice(code.length);
  const lengths = nationalLengths[code];
  if (lengths) {
    const [min, max] = lengths;
    if (
      national.startsWith("0") ||
      national.length < min ||
      national.length > max
    ) {
      return null;
    }
  }
  return `+${digits}`;
};

/** Keeps only what a phone field accepts: `+`, digits and spaces. */
export const maskPhoneEntry = (typed: string) => typed.replace(/[^+\d ]/g, "");
