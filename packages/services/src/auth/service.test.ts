import { beforeEach, describe, expect, it } from "vitest";
import { isOperator, type AuthUser, type SessionRecord } from "./model";
import {
  createOperator,
  resolveSession,
  SIGN_IN_FAILED,
  signInWithPassword,
  signOut,
} from "./service";
import { registerAuthStore, type AuthStore } from "./store";

/**
 * An in-memory `AuthStore`, so the session lifecycle is tested against the seam
 * rather than against Neon. Every rule that decides whether a token is live —
 * unrevoked, unexpired, joined to a user — is expressed here exactly as
 * `adapters/neon.ts` expresses it in SQL, which is what makes this suite a
 * contract for the next adapter as much as a test of this one.
 */
const rows: { users: AuthUser[]; sessions: SessionRecord[] } = {
  users: [],
  sessions: [],
};

let sequence = 0;
const nextId = (prefix: string) => `${prefix}-${(sequence += 1)}`;

const findUser = (email: string) =>
  rows.users.find((user) => user.email.toLowerCase() === email.toLowerCase());

const memoryStore: AuthStore = {
  driver: "memory",

  findUserByEmail: async (email) => findUser(email) ?? null,

  upsertUser: async (input) => {
    const now = new Date();
    const existing = findUser(input.email);
    if (existing) {
      existing.passwordHash = input.passwordHash;
      existing.role = input.role;
      existing.status = input.status;
      existing.updatedAt = now;
      return existing;
    }
    const user: AuthUser = {
      id: nextId("user"),
      email: input.email,
      passwordHash: input.passwordHash,
      role: input.role,
      status: input.status,
      createdAt: now,
      updatedAt: now,
      lastSignInAt: null,
    };
    rows.users.push(user);
    return user;
  },

  markSignedIn: async (id, at) => {
    const user = rows.users.find((candidate) => candidate.id === id);
    if (user) {
      user.lastSignInAt = at;
    }
  },

  createSession: async (input) => {
    const session: SessionRecord = {
      id: nextId("session"),
      userId: input.userId,
      tokenHash: input.tokenHash,
      expiresAt: input.expiresAt,
      createdAt: new Date(),
      revokedAt: null,
    };
    rows.sessions.push(session);
    return session;
  },

  findLiveSession: async (tokenHash, now) => {
    const session = rows.sessions.find(
      (candidate) =>
        candidate.tokenHash === tokenHash &&
        candidate.revokedAt === null &&
        candidate.expiresAt > now,
    );
    if (!session) {
      return null;
    }
    const user = rows.users.find(
      (candidate) => candidate.id === session.userId,
    );
    return user ? { session, user } : null;
  },

  touchSession: async (id, expiresAt) => {
    const session = rows.sessions.find((candidate) => candidate.id === id);
    if (session && session.revokedAt === null) {
      session.expiresAt = expiresAt;
    }
  },

  revokeSession: async (tokenHash, at) => {
    const session = rows.sessions.find(
      (candidate) =>
        candidate.tokenHash === tokenHash && candidate.revokedAt === null,
    );
    if (session) {
      session.revokedAt = at;
    }
  },
};

registerAuthStore(memoryStore);

const EMAIL = "dana@example.com";
const PASSWORD = "a genuinely long operator password";

const seedOperator = async (email = EMAIL, password = PASSWORD) => {
  const result = await createOperator({ email, password });
  if (!result.ok) {
    throw new Error(result.message);
  }
  return result.data;
};

const signIn = async (email = EMAIL, password = PASSWORD) => {
  const result = await signInWithPassword({ email, password });
  if (!result.ok) {
    throw new Error(result.message);
  }
  return result.data;
};

beforeEach(() => {
  rows.users = [];
  rows.sessions = [];
});

describe("createOperator", () => {
  it("stores a hash, never the password", async () => {
    const user = await seedOperator();
    expect(user.role).toBe("operator");
    expect(user.status).toBe("active");
    expect(user.passwordHash).not.toContain(PASSWORD);
    expect(user.passwordHash.startsWith("scrypt$")).toBe(true);
  });

  it("folds the email, so one operator cannot become two", async () => {
    await seedOperator("Dana@Example.com");
    await seedOperator("dana@example.com", "another long enough password");
    expect(rows.users).toHaveLength(1);
  });

  it("re-running it rotates the password — the only rotation this ticket ships", async () => {
    await seedOperator();
    await seedOperator(EMAIL, "the replacement operator password");

    await expect(
      signInWithPassword({ email: EMAIL, password: PASSWORD }),
    ).resolves.toMatchObject({ ok: false });
    await expect(
      signInWithPassword({
        email: EMAIL,
        password: "the replacement operator password",
      }),
    ).resolves.toMatchObject({ ok: true });
  });

  it("refuses something that is not an email", async () => {
    await expect(
      createOperator({ email: "dana", password: PASSWORD }),
    ).resolves.toMatchObject({ ok: false, error: "invalid_input" });
  });
});

describe("signInWithPassword", () => {
  it("issues a session for the right password", async () => {
    const user = await seedOperator();
    const { token, session } = await signIn();

    expect(token).toBeTruthy();
    expect(session.actor.id).toBe(user.id);
    expect(session.actor.email).toBe(EMAIL);
    expect(isOperator(session)).toBe(true);
  });

  it("records when the operator last signed in", async () => {
    await seedOperator();
    await signIn();
    expect(rows.users[0].lastSignInAt).toBeInstanceOf(Date);
  });

  it("accepts the email in any case", async () => {
    await seedOperator();
    await expect(
      signInWithPassword({ email: "DANA@Example.COM", password: PASSWORD }),
    ).resolves.toMatchObject({ ok: true });
  });

  it("rejects the wrong password", async () => {
    await seedOperator();
    await expect(
      signInWithPassword({ email: EMAIL, password: "not the right password" }),
    ).resolves.toEqual({
      ok: false,
      error: "not_permitted",
      message: SIGN_IN_FAILED,
    });
  });

  it("answers an unknown email exactly as it answers a wrong password", async () => {
    await seedOperator();
    const wrongPassword = await signInWithPassword({
      email: EMAIL,
      password: "not the right password",
    });
    const unknownEmail = await signInWithPassword({
      email: "nobody@example.com",
      password: PASSWORD,
    });

    // The point of the assertion: nothing in the reply distinguishes "no such
    // account" from "wrong password". An account-existence oracle on a form
    // anyone can reach is how an internal user list leaks.
    expect(unknownEmail).toEqual(wrongPassword);
  });

  it("refuses a suspended operator with the same generic message", async () => {
    await seedOperator();
    rows.users[0].status = "suspended";

    await expect(
      signInWithPassword({ email: EMAIL, password: PASSWORD }),
    ).resolves.toEqual({
      ok: false,
      error: "not_permitted",
      message: SIGN_IN_FAILED,
    });
  });

  it("stores only the HMAC — the raw token is nowhere in the session row", async () => {
    await seedOperator();
    const { token } = await signIn();

    expect(rows.sessions).toHaveLength(1);
    expect(rows.sessions[0].tokenHash).not.toBe(token);
    expect(JSON.stringify(rows.sessions)).not.toContain(token);
  });

  it("mints a distinct token per sign-in, each bound to its own row", async () => {
    await seedOperator();
    const first = await signIn();
    const second = await signIn();

    expect(first.token).not.toBe(second.token);
    expect(rows.sessions).toHaveLength(2);
    expect(rows.sessions[0].tokenHash).not.toBe(rows.sessions[1].tokenHash);
  });
});

describe("resolveSession", () => {
  it("resolves a live token", async () => {
    await seedOperator();
    const { token } = await signIn();

    const session = await resolveSession(token);
    expect(isOperator(session)).toBe(true);
  });

  it.each([
    ["no cookie", null],
    ["an empty cookie", ""],
    ["a token nobody issued", "not-a-real-token"],
  ])("treats %s as signed out", async (_label, token) => {
    await seedOperator();
    await signIn();
    await expect(resolveSession(token)).resolves.toBeNull();
  });

  it("reads role and status from the user row on every request", async () => {
    await seedOperator();
    const { token } = await signIn();

    // Suspending the operator takes effect on their very next request — the
    // session cookie is unchanged and still carries nothing but a token.
    rows.users[0].status = "suspended";

    const session = await resolveSession(token);
    expect(session?.status).toBe("suspended");
    expect(isOperator(session)).toBe(false);
  });

  it("slides the expiry forward, so a working day is not cut in half", async () => {
    await seedOperator();
    const { token } = await signIn();

    // Nearly out of time, as it would be seven hours into a shift.
    rows.sessions[0].expiresAt = new Date(Date.now() + 60_000);

    const session = await resolveSession(token);

    const sevenHoursOut = Date.now() + 7 * 60 * 60 * 1000;
    expect(rows.sessions[0].expiresAt.getTime()).toBeGreaterThan(sevenHoursOut);
    expect(session?.expiresAt.getTime()).toBeGreaterThan(sevenHoursOut);
  });

  it("refuses an expired token", async () => {
    await seedOperator();
    const { token } = await signIn();

    rows.sessions[0].expiresAt = new Date(Date.now() - 1_000);
    await expect(resolveSession(token)).resolves.toBeNull();
  });
});

describe("signOut", () => {
  it("revokes the row, so the token is dead even if the cookie survives", async () => {
    await seedOperator();
    const { token } = await signIn();

    await signOut(token);

    expect(rows.sessions[0].revokedAt).toBeInstanceOf(Date);
    await expect(resolveSession(token)).resolves.toBeNull();
  });

  it("leaves the operator's other sessions alone", async () => {
    await seedOperator();
    const laptop = await signIn();
    const phone = await signIn();

    await signOut(laptop.token);

    await expect(resolveSession(laptop.token)).resolves.toBeNull();
    await expect(resolveSession(phone.token)).resolves.not.toBeNull();
  });

  it("is safe to call twice, and with nothing at all", async () => {
    await seedOperator();
    const { token } = await signIn();

    await signOut(token);
    const revokedAt = rows.sessions[0].revokedAt;
    await signOut(token);
    await signOut(null);

    expect(rows.sessions[0].revokedAt).toBe(revokedAt);
  });
});
