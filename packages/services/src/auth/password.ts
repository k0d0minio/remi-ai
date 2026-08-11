import { randomBytes, scrypt, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";

const derive = promisify(scrypt);

/**
 * Password hashing on `node:crypto` alone — no new dependency, because the one
 * thing worse than hand-rolled crypto is a supply-chain surface added for a
 * primitive Node already ships.
 *
 * The stored string is self-describing: `scrypt$N$r$p$salt$hash`, base64 for the
 * two byte fields. Carrying the cost parameters means raising them later is a
 * new default plus a re-hash on next sign-in, not a flag day where every stored
 * hash becomes unverifiable.
 */
const SCHEME = "scrypt";
const COST = 16_384; // N — 16 MiB of working memory at r=8, inside scrypt's default maxmem.
const BLOCK_SIZE = 8; // r
const PARALLELISM = 1; // p
const KEY_LENGTH = 64;
const SALT_LENGTH = 16;

/** A ceiling on a parsed `N`, so a malformed row cannot ask for gigabytes. */
const MAX_COST = 1 << 20;

export const MIN_PASSWORD_LENGTH = 12;

/**
 * Unicode normalisation, applied on both sides. Without it a password typed on a
 * Mac and the same password typed on Linux can differ byte-for-byte while
 * looking identical, and the user is told their correct password is wrong.
 */
const encode = (password: string) =>
  Buffer.from(password.normalize("NFKC"), "utf8");

export const hashPassword = async (password: string): Promise<string> => {
  if (password.length < MIN_PASSWORD_LENGTH) {
    throw new Error(
      `password must be at least ${MIN_PASSWORD_LENGTH} characters — this is an operator credential, not a demo one`,
    );
  }

  const salt = randomBytes(SALT_LENGTH);
  const key = (await derive(encode(password), salt, KEY_LENGTH, {
    N: COST,
    r: BLOCK_SIZE,
    p: PARALLELISM,
  })) as Buffer;

  return [
    SCHEME,
    COST,
    BLOCK_SIZE,
    PARALLELISM,
    salt.toString("base64"),
    key.toString("base64"),
  ].join("$");
};

/**
 * Returns false rather than throwing on a malformed stored value: a corrupt row
 * is a failed sign-in, not a crash that tells the caller a row exists. The
 * comparison is `timingSafeEqual`, and the explicit length guard in front of it
 * matters — that function returns true for two empty buffers, which is exactly
 * what a truncated hash column would produce.
 */
export const verifyPassword = async (
  password: string,
  stored: string,
): Promise<boolean> => {
  const parts = stored.split("$");
  if (parts.length !== 6 || parts[0] !== SCHEME) {
    return false;
  }

  const [, costRaw, blockSizeRaw, parallelismRaw, saltRaw, keyRaw] = parts;
  const cost = Number(costRaw);
  const blockSize = Number(blockSizeRaw);
  const parallelism = Number(parallelismRaw);

  if (
    !Number.isInteger(cost) ||
    !Number.isInteger(blockSize) ||
    !Number.isInteger(parallelism) ||
    cost < 2 ||
    cost > MAX_COST ||
    blockSize < 1 ||
    parallelism < 1
  ) {
    return false;
  }

  const salt = Buffer.from(saltRaw, "base64");
  const key = Buffer.from(keyRaw, "base64");
  if (salt.length === 0 || key.length === 0) {
    return false;
  }

  try {
    const candidate = (await derive(encode(password), salt, key.length, {
      N: cost,
      r: blockSize,
      p: parallelism,
      maxmem: 256 * 1024 * 1024,
    })) as Buffer;
    return timingSafeEqual(key, candidate);
  } catch {
    return false;
  }
};
