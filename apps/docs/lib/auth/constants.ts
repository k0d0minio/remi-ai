/**
 * The two facts `middleware.ts` needs, kept in a module with no imports at all.
 *
 * They are not in `session.ts` beside the rest of the gate for the same reason
 * the cookie's name is not in `@remi/services/auth`: middleware runs in the edge
 * runtime, and anything that reaches `node:crypto` or `next/headers` cannot be
 * bundled into it. A path and a header name reach neither.
 */
export const SIGN_IN_PATH = "/sign-in";

/**
 * Stamped on every request middleware passes through. The root layout is the
 * authoritative half of the gate and has to exempt the sign-in page from it;
 * Next gives a layout no other way to know which path it is rendering. A request
 * that somehow arrives without the header is treated as gated — closed, not open.
 */
export const PATHNAME_HEADER = "x-remi-pathname";
