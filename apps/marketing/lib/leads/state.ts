import type { LeadType, OfferInterest } from "@remi/services/shared";

/**
 * What a form sends and what it gets back. In its own module because a
 * `"use server"` file may export async functions and nothing else.
 */
export type LeadSubmission = {
  type: LeadType;
  email: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  offerInterest?: OfferInterest;
  profession?: string;
  message?: string;
  /** The honeypot. A value here is a robot, and the answer is a quiet success. */
  website?: string;
};

export type SubmitResult =
  | { ok: true }
  | { ok: false; reason: "network" | "server" };
