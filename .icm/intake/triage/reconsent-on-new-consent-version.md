# Stub: A patient who accepted an older version of a mandatory consent accepts the current version

- lane: bug
- found-by: triage/care-consent-v2 · 2026-11-12
- complexity: medium
- priority: P1

## Problem

`checkSignupConsents` asks the current version only at sign-up. No code asks a signed-in patient to accept a newer version. A patient who accepted `care` version 1 (Arnaud on UAT, 2026-11-11) keeps version 1 after version 2 ships. Section 12 of the care text promises a new consent when a change rests on consent. The consent stubs list « Re-consent on a new text version » as out of scope.

## Proposed change

investigate. At sign-in, compare the latest `given` row of each mandatory key with `currentConsentText`. Show the new text and block the patient's space until the patient accepts or refuses.

## Acceptance criteria

- [ ] A patient whose latest `care` row names an older version sees the current text at the next sign-in
- [ ] Acceptance writes one `patient_consents` row with the current version and an audit event
- [ ] A refusal applies the withdrawal consequence of `consent-withdrawal-in-app`
