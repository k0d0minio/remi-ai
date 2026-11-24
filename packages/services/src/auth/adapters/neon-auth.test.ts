import { afterEach, describe, expect, it, vi } from "vitest";
import { isSessionReadError } from "../provider";
import {
  neonAuthProviderFrom,
  SESSION_READ_WAITS_MS,
  SESSION_VERIFIER_PARAM,
  sortSessionAnswer,
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

/** The SDK's answers of `getSession`, as the auth server causes them. */
const signedInAnswer = { data: { user }, error: null };
const nobodyAnswer = { data: null, error: null };
const unreachable = {
  data: null,
  error: { status: 502, code: "NETWORK_TIMEOUT", message: "timed out" },
};
const serverError = {
  data: null,
  error: { status: 500, message: "Internal Server Error" },
};
const rateLimited = {
  data: null,
  error: { status: 429, message: "Too many requests." },
};

type SessionAnswer = Awaited<ReturnType<NeonAuthClient["getSession"]>>;

/** A provider whose reads answer `answers` in order, and that never waits. */
const readerOver = (...answers: SessionAnswer[]) => {
  const client = fakeClient();
  const getSession = vi.fn<NeonAuthClient["getSession"]>();
  for (const answer of answers) {
    getSession.mockResolvedValueOnce(answer);
  }
  client.getSession = getSession;
  const waits: number[] = [];
  const provider = neonAuthProviderFrom(client, {
    wait: async (ms) => {
      waits.push(ms);
    },
  });
  return { provider, getSession, waits };
};

/** The error of a rejected read, or null when the read answered. */
const failureOf = async (read: Promise<unknown>): Promise<unknown> =>
  read.then(
    () => null,
    (cause: unknown) => cause,
  );

describe("the session read of the Neon Auth adapter", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("sorts the three answers apart", () => {
    expect(sortSessionAnswer(signedInAnswer).kind).toBe("identity");
    expect(sortSessionAnswer(nobodyAnswer)).toEqual({ kind: "nobody" });
    expect(sortSessionAnswer({ data: {}, error: null })).toEqual({
      kind: "nobody",
    });
    expect(sortSessionAnswer({ data: null, error: { status: 401 } })).toEqual({
      kind: "nobody",
    });
    expect(sortSessionAnswer(unreachable)).toEqual({
      kind: "failed",
      reason: "502 NETWORK_TIMEOUT",
      retry: true,
    });
    expect(sortSessionAnswer(serverError)).toEqual({
      kind: "failed",
      reason: "500 no code",
      retry: true,
    });
    expect(sortSessionAnswer(rateLimited)).toEqual({
      kind: "failed",
      reason: "429 no code",
      retry: false,
    });
  });

  it("never reads an error as an identity, whatever data comes with it", () => {
    const answer = sortSessionAnswer({
      data: { user },
      error: { status: 500 },
    });
    expect(answer.kind).toBe("failed");
  });

  it("answers nobody at the first read, with no second read", async () => {
    const { provider, getSession, waits } = readerOver(nobodyAnswer);
    expect(await provider.readIdentity()).toBeNull();
    expect(getSession).toHaveBeenCalledTimes(1);
    expect(waits).toEqual([]);
  });

  it("reads again after a failed read, and answers the identity", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    const { provider, getSession, waits } = readerOver(
      serverError,
      signedInAnswer,
    );
    expect(await provider.readIdentity()).toMatchObject({ subject: "user-1" });
    expect(getSession).toHaveBeenCalledTimes(2);
    expect(waits).toEqual([SESSION_READ_WAITS_MS[0]]);
  });

  it("answers nobody when the second read says nobody", async () => {
    const { provider } = readerOver(unreachable, nobodyAnswer);
    expect(await provider.readIdentity()).toBeNull();
  });

  it("throws a session read error after three failed reads, not nobody", async () => {
    const logged = vi.spyOn(console, "error").mockImplementation(() => {});
    const { provider, getSession, waits } = readerOver(
      unreachable,
      serverError,
      unreachable,
    );
    const failure = await failureOf(provider.readIdentity());
    expect(isSessionReadError(failure)).toBe(true);
    expect(failure).toMatchObject({ reason: "502 NETWORK_TIMEOUT" });
    expect(getSession).toHaveBeenCalledTimes(3);
    expect(waits).toEqual([...SESSION_READ_WAITS_MS]);
    expect(logged).toHaveBeenCalledWith("[auth] the session read failed", {
      reason: "502 NETWORK_TIMEOUT",
    });
  });

  it("does not read again at once after a rate limit", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    const { provider, getSession, waits } = readerOver(
      rateLimited,
      signedInAnswer,
    );
    const failure = await failureOf(provider.readIdentity());
    expect(isSessionReadError(failure)).toBe(true);
    expect(getSession).toHaveBeenCalledTimes(1);
    expect(waits).toEqual([]);
  });

  it("reads again when the SDK throws, as it does for a cookie in a render", async () => {
    const client = fakeClient();
    const getSession = vi
      .fn<NeonAuthClient["getSession"]>()
      .mockRejectedValueOnce(new Error("Cookies can only be modified"))
      .mockResolvedValueOnce(signedInAnswer);
    client.getSession = getSession;
    const provider = neonAuthProviderFrom(client, { wait: async () => {} });
    expect(await provider.readIdentity()).toMatchObject({ subject: "user-1" });
    expect(getSession).toHaveBeenCalledTimes(2);
  });

  it("keeps the message of a thrown error out of the reason and the log", async () => {
    const logged = vi.spyOn(console, "error").mockImplementation(() => {});
    const client = fakeClient();
    client.getSession = vi.fn<NeonAuthClient["getSession"]>(async () => {
      throw new TypeError("fetch failed for cookie abc");
    });
    const provider = neonAuthProviderFrom(client, { wait: async () => {} });
    const failure = await failureOf(provider.readIdentity());
    expect(isSessionReadError(failure)).toBe(true);
    expect(failure).toMatchObject({ reason: "TypeError" });
    expect(JSON.stringify(logged.mock.calls)).not.toContain("abc");
  });
});

const TOKEN = "__Secure-neon-auth.session_token";
const CACHE = "__Secure-neon-auth.local.session_data";
const page = "https://app.example.be/fr/accueil";

const pageRequest = (cookie: string) =>
  new Request(page, { headers: cookie ? { cookie } : {} });

/** The route handler's `get-session` answer for a token with no cache. */
const renewedAnswer = (extraCookies: string[] = []) => {
  const headers = new Headers({ "content-type": "application/json" });
  headers.append(
    "set-cookie",
    `${CACHE}=signed.copy; Path=/; Max-Age=299; HttpOnly; Secure; SameSite=Lax`,
  );
  for (const cookie of extraCookies) {
    headers.append("set-cookie", cookie);
  }
  return new Response(JSON.stringify({ user, session: { id: "s-1" } }), {
    status: 200,
    headers,
  });
};

describe("the session cache renewal of the Neon Auth adapter", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("does nothing for a request with no session token", async () => {
    const client = fakeClient();
    const provider = neonAuthProviderFrom(client);
    expect(await provider.renewSessionCache(pageRequest(""))).toBeNull();
    expect(
      await provider.renewSessionCache(pageRequest("remi-link-preview=abc")),
    ).toBeNull();
    expect(client.handler).not.toHaveBeenCalled();
  });

  it("does nothing while the cache is there", async () => {
    const client = fakeClient();
    const provider = neonAuthProviderFrom(client);
    const request = pageRequest(`${TOKEN}=t.sig; ${CACHE}=old.copy`);
    expect(await provider.renewSessionCache(request)).toBeNull();
    expect(client.handler).not.toHaveBeenCalled();
  });

  it("asks get-session with the cookies, and answers the cache only", async () => {
    const client = fakeClient();
    const handlers = handlersAnswering(
      renewedAnswer([`${TOKEN}=other; Path=/; Max-Age=0`]),
    );
    client.handler = vi.fn(() => handlers);
    const provider = neonAuthProviderFrom(client);
    const cookie = `other=1; ${TOKEN}=t.sig`;

    const renewal = await provider.renewSessionCache(pageRequest(cookie));

    expect(renewal?.setCookies).toEqual([
      `${CACHE}=signed.copy; Path=/; Max-Age=299; HttpOnly; Secure; SameSite=Lax`,
    ]);
    expect(renewal?.cookieHeader).toBe(`${cookie}; ${CACHE}=signed.copy`);
    const [sent, context] = handlers.GET.mock.calls[0] ?? [];
    expect(sent?.url).toBe("https://app.example.be/api/auth/get-session");
    expect(sent?.headers.get("cookie")).toBe(cookie);
    expect(await context?.params).toEqual({ path: ["get-session"] });
  });

  it("answers null, and clears nothing, when the auth server knows no session", async () => {
    const client = fakeClient();
    const headers = new Headers({ "content-type": "application/json" });
    headers.append("set-cookie", `${TOKEN}=; Path=/; Max-Age=0`);
    const gone = new Response("null", { status: 200, headers });
    client.handler = vi.fn(() => handlersAnswering(gone));
    const provider = neonAuthProviderFrom(client);
    expect(
      await provider.renewSessionCache(pageRequest(`${TOKEN}=t.sig`)),
    ).toBeNull();
  });

  it("answers null when the answer has a user and no cache", async () => {
    const client = fakeClient();
    const plain = new Response(JSON.stringify({ user }), {
      status: 200,
      headers: { "content-type": "application/json" },
    });
    client.handler = vi.fn(() => handlersAnswering(plain));
    const provider = neonAuthProviderFrom(client);
    expect(
      await provider.renewSessionCache(pageRequest(`${TOKEN}=t.sig`)),
    ).toBeNull();
  });

  it("answers null when the auth server refuses the read", async () => {
    const client = fakeClient();
    const refused = new Response(JSON.stringify({ message: "Too many" }), {
      status: 429,
      headers: { "content-type": "application/json" },
    });
    client.handler = vi.fn(() => handlersAnswering(refused));
    const provider = neonAuthProviderFrom(client);
    expect(
      await provider.renewSessionCache(pageRequest(`${TOKEN}=t.sig`)),
    ).toBeNull();
  });

  it("answers null when the handler throws", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    const client = fakeClient();
    const GET = vi.fn<Get>(async () => {
      throw new Error("no request scope");
    });
    const unused = vi.fn();
    client.handler = vi.fn(() => ({
      GET,
      POST: unused,
      PUT: unused,
      PATCH: unused,
      DELETE: unused,
    }));
    const provider = neonAuthProviderFrom(client);
    expect(
      await provider.renewSessionCache(pageRequest(`${TOKEN}=t.sig`)),
    ).toBeNull();
  });
});

describe("the deletion of a user (REM-133)", () => {
  const subject = "0b6f1c3e-8a52-4f0e-9d3a-2c7b5e1f4a90";

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("removes the user by its subject", async () => {
    const removeUser = vi.fn(async () => undefined);
    const provider = neonAuthProviderFrom(fakeClient(), { removeUser });
    expect(await provider.deleteUser(subject)).toEqual({
      ok: true,
      data: null,
    });
    expect(removeUser).toHaveBeenCalledWith(subject);
  });

  it("does not build the SDK to delete a user", async () => {
    const build = vi.fn(fakeClient);
    const provider = neonAuthProviderFrom(build, {
      removeUser: vi.fn(async () => undefined),
    });
    expect((await provider.deleteUser(subject)).ok).toBe(true);
    expect(build).not.toHaveBeenCalled();
  });

  it("builds the SDK once, at the first call that uses it", async () => {
    const build = vi.fn(fakeClient);
    const provider = neonAuthProviderFrom(build);
    await provider.signOut();
    await provider.signOut();
    expect(build).toHaveBeenCalledTimes(1);
  });

  it("answers a success for a subject that no user can have", async () => {
    const removeUser = vi.fn(async () => undefined);
    const provider = neonAuthProviderFrom(fakeClient(), { removeUser });
    expect((await provider.deleteUser("subject-claire")).ok).toBe(true);
    expect(removeUser).not.toHaveBeenCalled();
  });

  it("answers upstream_failed when the database refuses, and logs no subject", async () => {
    const error = vi.spyOn(console, "error").mockImplementation(() => {});
    const provider = neonAuthProviderFrom(fakeClient(), {
      removeUser: vi.fn(async () => {
        throw new Error(`permission denied for ${subject}`);
      }),
    });
    const result = await provider.deleteUser(subject);
    expect(result.ok ? null : result.error).toBe("upstream_failed");
    expect(JSON.stringify(error.mock.calls)).not.toContain(subject);
  });
});
