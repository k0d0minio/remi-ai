import type { AuthRouteHandlers } from "@remi/services/server";
import { ensureAuthProvider } from "@/lib/auth/provider";

/**
 * The auth API: sign-up, sign-in, the magic link, e-mail verification and the
 * password reset all land here. The handlers come from the auth seam, so this
 * route names no vendor.
 *
 * The provider is resolved per request, not at module load: `next build` loads
 * this module, and a build without the auth variables must still pass.
 */

type Method = keyof AuthRouteHandlers;
type Context = { params: Promise<{ path: string[] }> };

export const dynamic = "force-dynamic";

const handle = async (method: Method, request: Request, context: Context) => {
  const provider = ensureAuthProvider();
  if (!provider) {
    return Response.json({ error: "auth_not_configured" }, { status: 503 });
  }
  return provider.routeHandlers()[method](request, context);
};

export const GET = async (request: Request, context: Context) =>
  handle("GET", request, context);

export const POST = async (request: Request, context: Context) =>
  handle("POST", request, context);

export const PUT = async (request: Request, context: Context) =>
  handle("PUT", request, context);

export const PATCH = async (request: Request, context: Context) =>
  handle("PATCH", request, context);

export const DELETE = async (request: Request, context: Context) =>
  handle("DELETE", request, context);
