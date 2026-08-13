/**
 * The contact form's state, in its own module rather than beside the action.
 *
 * A `"use server"` file may export async functions and nothing else — every
 * other export is turned into a server-action reference, and React throws
 * "a 'use server' file can only export async functions" when it evaluates one.
 * `initialContactState` is a plain object, so it lives here and both the action
 * and the form import it from a module with no directive at all.
 */

export type ContactState = {
  status: "idle" | "success" | "error";
  message?: string;
  /** A second line under `message`. Only delivery failures need one. */
  detail?: string;
  /** Field name → what is wrong with it. Rendered by `Field`'s `error` prop. */
  errors?: Partial<Record<"name" | "email" | "message" | "consent", string>>;
};

export const initialContactState: ContactState = { status: "idle" };
