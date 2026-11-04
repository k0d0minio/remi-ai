# Stub: An admin's read-only open of a file shows no write control

- lane: tweak
- found-by: `consent-and-data/data-access-scoping` · 2026-11-04
- complexity: medium
- priority: P2

## Problem

An admin opens another practitioner's file read-only (story 3). The page shows a banner, but it
still renders every form and button. A submit is refused with « ce dossier patient est
introuvable ». Files: `apps/admin/app/(admin)/patients/[id]/page.tsx` and the section components
under `apps/admin/components/patients/`.

## Proposed change

Pass a `readOnly` flag down the file page. Hide each add, edit, archive and delete control when it
is set. Give the refused action a message that says the file is read-only.

## Acceptance criteria

- [ ] An admin's open of another practitioner's file shows no add, edit, archive or delete control
- [ ] A refused write on a read-only file says « Lecture seule » and not « introuvable »
- [ ] The holding practitioner sees every control as before
