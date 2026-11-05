import { describe, expect, it, vi } from "vitest";
import {
  neonAuthProviderFrom,
  SESSION_VERIFIER_PARAM,
  toServiceError,
  type NeonAuthClient,
} from "./neon-auth";

// The SDK reads cookies through `next/headers`, which has no request here. The
// adapter's own logic is tested over a fake client instead. Vitest hoists the
// mock above the imports.
vi.mock("@neon/auth/next/server", () => ({ createNeonAuth: vi.fn() }));

const user = {
  id: "user-1",
  email: "Claire@Example.be",
  name: "Claire",
  emailVerified: true,
};

const fakeClient = (): NeonAuthClient => ({
  signUp: { email: vi.fn(async () => ({ data: { user }, error: null })) },
  signIn: {
    email: vi.fn(async () => ({ data: { user }, error: null })),
    magicLink: vi.fn(async () => ({ data: { status: true }, error: null })),
  },
  signOut: vi.fn(async () => ({ data: { success: true }, error: null })),
  getSession: vi.fn(async () => ({ data: { user }, error: null })),
  requestPasswordReset: vi.fn(async () => ({ data: null, error: null })),
  resetPassword: vi.fn(async () => ({ data: null, error: null })),
  handler: vi.fn(() => {
    throw new Error("not used");
  }),
});

const landing = "https://app.example.be/fr/connexion/lien";

type RouteContext = { params: Promise<{ path: string[] }> };
type Get = (request: Request, context: RouteContext) => Promise<Response>;

/** Route handlers whose GET answers `answer`, the way the auth proxy does. */
const handlersAnswering = (answer: Response) => {
  const GET = vi.fn<Get>(async () => answer);
  const unused = vi.fn();
  return { GET, POST: unused, PUT: unused, PATCH: unused, DELETE: unused };
};

/** The proxy's `get-session` answer: the user and the session cookies. */
const sessionAnswer = () => {
  const headers = new Headers({ "content-type": "application/json" });
  headers.append("set-cookie", "session_token=t; Path=/; HttpOnly");
  headers.append("set-cookie", "session_data=d; Path=/; HttpOnly");
  return new Response(JSON.stringify({ user, session: { id: "s-1" } }), {
    status: 200,
    headers,
  });
};

describe("the Neon Auth adapter", () => {
  it("passes the e-mail, the name and the return path to the magic link", async () => {
    const client = fakeClient();
    const provider = neonAuthProviderFrom(client);
    const result = await provider.requestMagicLink({
      email: "claire@example.be",
      name: "Claire",
      callbackPath: "/fr/questionnaire",
    });
    expect(result.ok).toBe(true);
    expect(client.signIn.magicLink).toHaveBeenCalledWith({
      email: "claire@example.be",
      name: "Claire",
      callbackURL: "/fr/questionnaire",
    });
  });

  it("maps the signed-in user onto a vendor-free identity", async () => {
    const provider = neonAuthProviderFrom(fakeClient());
    const result = await provider.signIn({
      email: "claire@example.be",
      password: "correct horse",
    });
    expect(result).toEqual({
      ok: true,
      data: {
        subject: "user-1",
        email: "claire@example.be",
        name: "Claire",
        emailVerified: true,
      },
    });
  });

  it("reads no identity when the SDK has no session", async () => {
    const client = fakeClient();
    client.getSession = vi.fn(async () => ({ data: null, error: null }));
    expect(await neonAuthProviderFrom(client).readIdentity()).toBeNull();
  });

  it("turns an existing e-mail into a conflict", async () => {
    const client = fakeClient();
    client.signUp.email = vi.fn(async () => ({
      data: null,
      error: {
        message: "User already exists",
        status: 422,
        code: "USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL",
      },
    }));
    const result = await neonAuthProviderFrom(client).signUp({
      email: "claire@example.be",
      password: "correct horse",
      name: "Claire",
    });
    expect(result.ok ? null : result.error).toBe("conflict");
  });

  it("maps the error codes a page renders", () => {
    expect(
      toServiceError({ code: "INVALID_EMAIL_OR_PASSWORD", status: 401 }),
    ).toBe("not_permitted");
    expect(toServiceError({ code: "EMAIL_NOT_VERIFIED", status: 403 })).toBe(
      "not_permitted",
    );
    expect(toServiceError({ status: 429 })).toBe("rate_limited");
    expect(toServiceError({ status: 400 })).toBe("invalid_input");
    expect(toServiceError({ code: "NETWORK_TIMEOUT", status: 502 })).toBe(
      "upstream_failed",
    );
  });

  it("builds the route handlers once", () => {
    const client = fakeClient();
    const handlers = {
      GET: vi.fn(),
      POST: vi.fn(),
      PUT: vi.fn(),
      PATCH: vi.fn(),
      DELETE: vi.fn(),
    };
    client.handler = vi.fn(() => handlers);
    const provider = neonAuthProviderFrom(client);
    expect(provider.routeHandlers()).toBe(handlers);
    expect(provider.routeHandlers()).toBe(handlers);
    expect(client.handler).toHaveBeenCalledTimes(1);
  });

  it("leaves a landing with no verifier to the route", async () => {
    const client = fakeClient();
    const provider = neonAuthProviderFrom(client);
    expect(
      await provider.completeRedirectSignIn(new Request(landing)),
    ).toBeNull();
    expect(client.handler).not.toHaveBeenCalled();
  });

  it("sends the verifier to get-session and redirects with the cookies", async () => {
    const client = fakeClient();
    const handlers = handlersAnswering(sessionAnswer());
    client.handler = vi.fn(() => handlers);
    const request = new Request(`${landing}?${SESSION_VERIFIER_PARAM}=proof`);
    const provider = neonAuthProviderFrom(client);
    const answer = await provider.completeRedirectSignIn(request);
    const [sent, context] = handlers.GET.mock.calls[0] ?? [];
    expect(sent).toBe(request);
    expect(await context?.params).toEqual({ path: ["get-session"] });
    expect(answer?.status).toBe(303);
    expect(answer?.headers.get("location")).toBe(landing);
    expect(answer?.headers.getSetCookie()).toHaveLength(2);
  });

  it("answers null when get-session returns no user", async () => {
    const client = fakeClient();
    const empty = new Response("null", {
      status: 200,
      headers: { "content-type": "application/json" },
    });
    client.handler = vi.fn(() => handlersAnswering(empty));
    const request = new Request(`${landing}?${SESSION_VERIFIER_PARAM}=spent`);
    const provider = neonAuthProviderFrom(client);
    expect(await provider.completeRedirectSignIn(request)).toBeNull();
  });
});
