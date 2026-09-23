# Handoff: challenges

For the next session — human or agent — what to do first and what stands in the way.
Rewritten, not appended, at every stage stop; a stage that STOPs mid-way writes it before it
stops, so nothing is carried in anyone's head.

## Next steps

1. Smoke the previews (branch aliases — they serve 332c152, the last commit that touched app code;
   later commits only touched `.icm/`, so Vercel's ignored-build step skipped them):
   - console: https://admin-git-claude-gallant-newton-srfbk5-remi21.vercel.app — a patient page →
     « Challenges »: lancer, modifier, clore; « Nouveau challenge » while one runs asks the running
     one's outcome; the « Challenge » card in the working view; the roster badge.
   - link: https://app-git-claude-gallant-newton-srfbk5-remi21.vercel.app — open a patient's link
     from the console: « Le challenge du moment » first, « Challenge acquis » then « Prêt(e) pour le
     prochain », the empty-slot copy, « La consigne de la semaine » under it; `/en/…` too.
2. Tick **Ready to merge** on https://github.com/k0d0minio/remi-ai/pull/120, then `release challenges`.

## Blockers

- none for this run. Separately urgent: `.icm/intake/triage/dependency-audit-next-rce.md` (P0 —
  critical Next.js unauthenticated RCE on `main`); Release's security pass will report it as
  pre-existing.

## Do not

- Do not tick Ready to merge for the operator.
- Do not bump dependencies in this PR — the audit finding is the parked chore's.
- Do not run `patient-documents-and-links` or `general-feedback` beside this run until it merges —
  they share `schema.ts` and the migrations journal.
