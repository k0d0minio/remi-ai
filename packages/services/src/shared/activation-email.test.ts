import { describe, expect, it } from "vitest";
import {
  ACTIVATION_EMAIL_FAILED,
  ACTIVATION_EMAIL_SENT,
  activationEmailDecision,
  activationEmailState,
  type ActivationEmailEvent,
} from "./activation-email";

const at = (minute: number) => new Date(Date.UTC(2026, 10, 20, 9, minute));

const sent = (minute: number): ActivationEmailEvent => ({
  action: ACTIVATION_EMAIL_SENT,
  detail: "sign_in",
  createdAt: at(minute),
});

const failed = (minute: number, detail = "send_failed"): ActivationEmailEvent => ({
  action: ACTIVATION_EMAIL_FAILED,
  detail,
  createdAt: at(minute),
});

describe("the state of the activation e-mail, from the audit events", () => {
  it("is none for a file with no event", () => {
    expect(activationEmailState([])).toEqual({ kind: "none" });
  });

  it("ignores the events of another action", () => {
    expect(
      activationEmailState([
        {
          action: "patient.file_status_changed",
          detail: "to_validate → active",
          createdAt: at(0),
        },
      ]),
    ).toEqual({ kind: "none" });
  });

  it("is failed with the reason of the last try", () => {
    expect(
      activationEmailState([failed(5, "no_mailer"), failed(1, "no_email")]),
    ).toEqual({ kind: "failed", at: at(5), reason: "no_mailer" });
  });

  it("reads a detail that is not a known reason as a refused send", () => {
    expect(activationEmailState([failed(1, "something else")])).toEqual({
      kind: "failed",
      at: at(1),
      reason: "send_failed",
    });
  });

  it("is sent when one e-mail went out, whatever the order of the events", () => {
    expect(activationEmailState([failed(1), sent(2)])).toEqual({
      kind: "sent",
      at: at(2),
    });
    expect(activationEmailState([sent(2), failed(9)])).toEqual({
      kind: "sent",
      at: at(2),
    });
  });

  it("dates a sent e-mail from the first one", () => {
    expect(activationEmailState([sent(7), sent(3)])).toEqual({
      kind: "sent",
      at: at(3),
    });
  });
});

describe("the decision to send the activation e-mail", () => {
  const none = activationEmailState([]);
  const wasSent = activationEmailState([sent(1)]);
  const hasFailed = activationEmailState([failed(1)]);

  it("sends at the activation when no send was tried", () => {
    expect(
      activationEmailDecision({ active: true, state: none, trigger: "activation" }),
    ).toEqual({ send: true });
  });

  it("sends nothing for a file that is not active", () => {
    for (const trigger of ["activation", "resend"] as const) {
      expect(
        activationEmailDecision({ active: false, state: none, trigger }),
      ).toEqual({ send: false, why: "not_active" });
    }
  });

  it("sends nothing when an e-mail went out, at the activation or on a resend", () => {
    for (const trigger of ["activation", "resend"] as const) {
      expect(
        activationEmailDecision({ active: true, state: wasSent, trigger }),
      ).toEqual({ send: false, why: "already_sent" });
    }
  });

  it("sends nothing at a second activation call after a failed send", () => {
    expect(
      activationEmailDecision({
        active: true,
        state: hasFailed,
        trigger: "activation",
      }),
    ).toEqual({ send: false, why: "already_tried" });
  });

  it("sends on a resend after a failed send", () => {
    expect(
      activationEmailDecision({ active: true, state: hasFailed, trigger: "resend" }),
    ).toEqual({ send: true });
  });

  it("sends on a resend when the send of the activation never ran", () => {
    expect(
      activationEmailDecision({ active: true, state: none, trigger: "resend" }),
    ).toEqual({ send: true });
  });
});
