# Run: september-sources

- lane: front
- story: 01_scope/\_source/story.md
- author/source: call with Morgane, Arnaud and Jamie, 2026-09-11 · Morgane's « Ce que les consultants doivent voir », 2026-09-14 · the four August calls, her 20 Aug catalogue and the Startup Boost roadmap, all through `.icm/raw/`
- personas: patient, practitioner, operator
- scope-agreed: 2026-09-23
- stubs: 5 — cut into the existing epics, not into `.icm/intake/september-sources/`: `patient-loop/challenges`, `patient-loop/patient-documents-and-links`, `patient-loop/general-feedback` (D-19), `beyond-december/patient-record-export`, `beyond-december/send-link-email` (D-22); `ai-assist/mistral-adapter` renamed `ai-gateway-adapter` (D-16); five stubs and three breakdowns amended
- why no folder of its own: the sources amend a backlog that already exists — every new stub sits on a seam an epic already owns (the patient link, the parked list) and would fragment the board in a folder of its own; `validate-intake.sh` passes on `patient-loop` (9), `beyond-december` (8) and `ai-assist` (5)
- context-budget: the five transcripts (~280 KB) were read whole — the 11 Sept one by the session, the four August ones by a subagent whose drift report was read back; within budget, no overrun
