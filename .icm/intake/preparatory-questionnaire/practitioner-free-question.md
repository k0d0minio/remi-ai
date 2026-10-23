# Stub: A practitioner adds one question of their own to the questionnaire of their patients

- feature-slug: practitioner-free-question
- epic: preparatory-questionnaire
- story: 4
- sequence: 5 of 5
- depends-on: questionnaire-flow
- complexity: low
- priority: P1

## Problem

Story 4: « Question libre créée par le praticien pour toute information importante avant la
consultation. » The questionnaire has no practitioner-specific content.

## Proposed change

Add `questionnaire_question` to `operators`, one text (Morgane's question 4). The practitioner
edits it on the account page. When set, the patient's questionnaire shows it as the last
section with a free-text answer stored in `practitioner_question_answer`. The file shows the
question and the answer.

## Acceptance criteria

- [ ] The practitioner sets, changes or clears the question on the account page
- [ ] A patient of that practitioner sees the question as the last section. A patient of a practitioner with no question does not see the section
- [ ] The answer is optional and saves on change
- [ ] The file shows the question text as it was when answered, and the answer

## Out of scope

- Several questions. Question types other than free text.

## Notes

- P1: not on the 1 December path. If Morgane answers « plusieurs » to question 4, this stub becomes a table and `medium`.
