import { beforeAll, describe, expect, it } from "vitest";
import { registerDatabase } from "../../client";
import { createMemoryDatabase } from "../../test-helpers";
import { createLead, getLead, listLeads, setLeadContacted } from "./index";

beforeAll(() => {
  registerDatabase(createMemoryDatabase());
});

const unwrapOk = <T>(result: { ok: true; data: T } | { ok: false }): T => {
  expect(result.ok).toBe(true);
  if (!result.ok) {
    throw new Error("unreachable");
  }
  return result.data;
};

const version = "2026-11-draft-1";

describe("leads", () => {
  it("stores a patient pilot with the address lower-cased and blanks as null", async () => {
    const written = unwrapOk(
      await createLead({
        type: "patient_pilot",
        email: "  Claire@Example.com ",
        firstName: "Claire",
        phone: "",
        offerInterest: "genetic",
        consentTextVersion: version,
      }),
    );
    expect(written.duplicate).toBe(false);
    expect(written.lead.email).toBe("claire@example.com");
    expect(written.lead.phone).toBeNull();
    expect(written.lead.lastName).toBeNull();
    expect(written.lead.offerInterest).toBe("genetic");
    expect(written.lead.contactedAt).toBeNull();
    expect(unwrapOk(await getLead(written.lead.id)).email).toBe(
      "claire@example.com",
    );
  });

  it("answers a second submit on the same list with the first row", async () => {
    const first = unwrapOk(
      await createLead({
        type: "info_request",
        email: "twice@example.com",
        message: "Une question.",
        consentTextVersion: version,
      }),
    );
    const second = unwrapOk(
      await createLead({
        type: "info_request",
        email: "TWICE@example.com",
        consentTextVersion: version,
      }),
    );
    expect(second.duplicate).toBe(true);
    expect(second.lead.id).toBe(first.lead.id);
    expect(second.lead.message).toBe("Une question.");
  });

  it("keeps the same address apart on two lists", async () => {
    const patient = unwrapOk(
      await createLead({
        type: "patient_pilot",
        email: "both@example.com",
        firstName: "Lou",
        consentTextVersion: version,
      }),
    );
    const practitioner = unwrapOk(
      await createLead({
        type: "practitioner_pilot",
        email: "both@example.com",
        firstName: "Lou",
        profession: "diététicienne",
        consentTextVersion: version,
      }),
    );
    expect(practitioner.duplicate).toBe(false);
    expect(practitioner.lead.id).not.toBe(patient.lead.id);
  });

  it("refuses what the form of each list requires", async () => {
    expect(
      (
        await createLead({
          type: "patient_pilot",
          email: "noname@example.com",
          consentTextVersion: version,
        })
      ).ok,
    ).toBe(false);
    expect(
      (
        await createLead({
          type: "practitioner_pilot",
          email: "nojob@example.com",
          firstName: "Sam",
          consentTextVersion: version,
        })
      ).ok,
    ).toBe(false);
    expect(
      (
        await createLead({
          type: "info_request",
          email: "not-an-address",
          consentTextVersion: version,
        })
      ).ok,
    ).toBe(false);
    expect(
      (
        await createLead({
          type: "info_request",
          email: "noconsent@example.com",
          consentTextVersion: "",
        })
      ).ok,
    ).toBe(false);
  });

  it("drops the offer and the profession that belong to another list", async () => {
    const info = unwrapOk(
      await createLead({
        type: "info_request",
        email: "stray@example.com",
        offerInterest: "consultation",
        profession: "coach",
        consentTextVersion: version,
      }),
    );
    expect(info.lead.offerInterest).toBeNull();
    expect(info.lead.profession).toBeNull();
  });

  it("lists by list and by state, and marks a row contacted and back", async () => {
    const lead = unwrapOk(
      await createLead({
        type: "practitioner_pilot",
        email: "mark@example.com",
        firstName: "Ana",
        profession: "nutrithérapeute",
        consentTextVersion: version,
      }),
    ).lead;

    const pending = await listLeads({ type: "practitioner_pilot", state: "pending" });
    expect(pending.map((row) => row.id)).toContain(lead.id);

    const marked = unwrapOk(await setLeadContacted(lead.id, true));
    expect(marked.contactedAt).toBeInstanceOf(Date);
    expect(
      (await listLeads({ type: "practitioner_pilot", state: "pending" })).map(
        (row) => row.id,
      ),
    ).not.toContain(lead.id);
    expect(
      (await listLeads({ type: "practitioner_pilot", state: "contacted" })).map(
        (row) => row.id,
      ),
    ).toContain(lead.id);

    const reopened = unwrapOk(await setLeadContacted(lead.id, false));
    expect(reopened.contactedAt).toBeNull();
    expect((await setLeadContacted("00000000-0000-4000-8000-0000000000ff", true)).ok).toBe(false);
  });
});
