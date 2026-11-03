# Stub: Add a "Tester REMI" page to the docs for Morgane

- lane: tweak
- found-by: Jamie, in chat · 2026-11-03
- complexity: low
- priority: P1

## Problem

Morgane tests each batch on UAT. No page tells her the test addresses, how to sign in, or how
to report a fault. The addresses are only in `.icm/environments.md`, which she does not read.

## Proposed change

Add one short French page, `apps/docs/app/tester/page.mdx`, second in the docs navigation.
Link it from the overview page.

## Acceptance criteria

- [ ] The docs navigation shows "Tester REMI" directly after the overview.
- [ ] The page names the three UAT addresses: `uat.remiai.be`, `uat-app.remiai.be` and `uat-admin.remiai.be`.
- [ ] The page names the production addresses as not for tests.
- [ ] The page says how to sign in to the console and how to test as a patient.
- [ ] The page says how to report a fault.
- [ ] The overview page links to the new page.
