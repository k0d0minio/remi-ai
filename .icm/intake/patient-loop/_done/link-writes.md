# Stub: Link writes — the token accepts writes, attributed, rate-limited, audited

- feature-slug: link-writes
- sequence: 1 of 6
- depends-on: none
- priority: P1
- size: M
- sources: decision #2 (2026-09-10) · `apps/web/lib/patient-link/load.ts` ·
  `apps/web/app/[locale]/p/[token]/layout.tsx` (the privacy card, "no session is created or read")
  · `.icm/docs/RETENTION.md` · `packages/services/src/db/services/patients/*`

## What this is

The infrastructure every other stub in this epic writes through, done once and done carefully:

- **A write path for the link.** A server-action helper in `apps/web` that resolves the token to
  the patient (same rules as the loader: unknown or revoked → not found), runs the write through
  the services seam, and records an audit event whose actor is `patient` with the pseudonym — not
  an operator. The audit table's `actor_*` columns carry an operator today; the patient case is a
  documented actor kind, not a null.
- **Attribution on rows.** Rows a patient can create (meal entries, recipe feedback, check-ins,
  profile changes) carry `written_by: practitioner | patient` where the table is shared with the
  console, so the console can show "écrit par la patiente" and the AI round can tell the two
  apart.
- **Limits.** Per-token rate limit on writes (the last-opened write already does one per five
  minutes; writes need a more generous but real ceiling), body length caps, and no file input.
- **The privacy card and RETENTION.** The card says nothing is created or read; it becomes true
  again with new words: what the patient writes, that it is attributed to their link, that the
  practitioner sees it. `RETENTION.md` gains the patient-written rows and their place in the
  deletion cascade. The docs' `business/roles` page (what each role can change) is updated.

What this stub does **not** decide: whether a URL is a good enough credential for health-data
writes. Decision #2 accepts it for the beta and `beyond-december/patient-accounts` is the answer;
the privacy card says plainly that anyone holding the link can write as the patient, so a patient
can choose.

## Worth knowing

- The link is the only database-backed route in `apps/web`; `apps/web/lib/database.ts` registers
  the adapter lazily — the write helper goes through the same `ensure*()` path.
- Server actions on a public route: they must never trust anything but the token, and the token
  must never leave the URL into a cookie — a session is exactly what decision #2 postpones.
- `revalidatePath` after a write so the segment re-renders with the new row.

## Open questions — flag these on pickup

- Rate limit numbers: enough for a patient logging three meals and a check-in a day, low enough
  to make a leaked link boring. Propose, do not assume.
- Should the console show a "lien utilisé pour écrire" timestamp separate from "last opened"? It is
  one more column; only if it changes what Morgane does.

## Prompt

Run `/pipeline new .icm/intake/patient-loop/link-writes.md` in the remi-ai repo and follow the
pipeline from there. Read the stub and its epic's `breakdown.md` (and the decisions of record in
`.icm/intake/practitioner-workflow/breakdown.md` — #2 binds) first. Scope: a server-action write
helper for `/p/[token]` that resolves the token, writes through the services seam, audits with a
`patient` actor kind, enforces per-token rate limits and length caps; a `written_by` attribution on
shared tables; the privacy card and `RETENTION.md` rewritten to what becomes true; `business/roles`
updated. No feature writes yet — the helper and its proof. Raise the stub's open questions rather
than answering them.
