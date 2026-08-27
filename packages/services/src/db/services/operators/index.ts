import { z } from "zod";
import { err, ok, type Result } from "../../../shared/result";
import type { Id } from "../../../types";
import { verifyPassword, hashPassword } from "../../../auth/password";
import { getDatabase } from "../../client";
import type { Operator } from "../../models/operator";

/**
 * Operator accounts for the admin console. Phase 1 needs exactly one —
 * Morgane's — created through the guarded bootstrap flow on the sign-in page;
 * there is no self-serve sign-up and no role to pick.
 */

const operators = () => getDatabase().collection<Operator>("operators");

const normaliseEmail = (email: string) => email.trim().toLowerCase();

export const hasOperator = async (): Promise<boolean> => {
  const page = await operators().findMany({}, { limit: 1 });
  return page.items.length > 0;
};

export const getOperator = async (id: Id): Promise<Operator | null> => {
  if (!z.uuid().safeParse(id).success) {
    return null;
  }
  return operators().findById(id);
};

export const findOperatorByEmail = async (
  email: string,
): Promise<Operator | null> => {
  const page = await operators().findMany(
    { email: normaliseEmail(email) },
    { limit: 1 },
  );
  return page.items[0] ?? null;
};

const credentialsSchema = z.object({
  email: z
    .string()
    .trim()
    .toLowerCase()
    .pipe(z.email("a valid email address is required")),
  name: z.string().trim().min(1, "a name is required").max(200),
  password: z
    .string()
    .min(12, "the password needs at least 12 characters")
    .max(1_000),
});

export type OperatorInput = z.input<typeof credentialsSchema>;

export const createOperator = async (
  input: OperatorInput,
): Promise<Result<Operator>> => {
  const parsed = credentialsSchema.safeParse(input);
  if (!parsed.success) {
    return err("invalid_input", parsed.error.issues[0].message);
  }
  const email = parsed.data.email;
  if (await findOperatorByEmail(email)) {
    return err("conflict", "an operator with that email already exists");
  }
  const operator = await operators().insert({
    email,
    name: parsed.data.name,
    passwordHash: await hashPassword(parsed.data.password),
  });
  return ok(operator);
};

/**
 * One generic failure for a wrong email and a wrong password alike — the
 * sign-in form must not confirm which emails hold an account.
 */
export const verifyOperator = async (
  email: string,
  password: string,
): Promise<Result<Operator>> => {
  const operator = await findOperatorByEmail(email);
  if (!operator || !(await verifyPassword(password, operator.passwordHash))) {
    return err("not_permitted", "that email and password do not match");
  }
  return ok(operator);
};
