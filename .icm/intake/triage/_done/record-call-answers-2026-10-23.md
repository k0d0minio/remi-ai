# Stub: Record Morgane's answers from the call of 23 October in the breakdowns

- lane: chore
- found-by: Jamie's answers of 2026-11-01 on the ticket audit · 2026-11-01
- complexity: low
- priority: P0

## Problem

Jamie and Morgane went through the questions of the 23 October agenda on the call of
2026-10-23. The call's Gemini notes hold no usable transcript. The breakdowns still show the
defaults, so a build session would follow a default where Morgane answered. Jamie gave the
answers on 2026-11-01.

## Proposed change

Under « Questions for Morgane » of each breakdown that an answer touches, add one line
« Morgane answered on the call of 2026-10-23 (recorded by Jamie, 2026-11-01): … ». Record the
answers that bind more than one epic in `.icm/intake/README.md`: what 1 December must show, the
number of practitioners, the e-mail sender, the language of the patient space and the trigger of
« Recommandations à valider ». Write the current sender address in the `EMAIL_FROM` notes.
Questions the call did not touch keep their default.

## Acceptance criteria

- [ ] Each answer of 2026-11-01 is recorded once, in the breakdown or the README that its question lives in.
- [ ] `.icm/intake/README.md` § Milestones names what 1 December must show, in place of « question 1 of the call ».
- [ ] No question that the call did not touch is marked as answered.
