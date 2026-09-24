# Handoff: patient-documents-and-links

For the next session — human or agent — what to do first and what stands in the way.
Rewritten, not appended, at every stage stop; a stage that STOPs mid-way writes it before it
stops, so nothing is carried in anyone's head.

## Next steps

1. Operator: read `02_define/output/spec.md`, tick **Spec approved** on
   https://github.com/k0d0minio/remi-ai/pull/122, then run `build patient-documents-and-links`.
2. Before Build's pass 3 can be smoked: create a **private** Vercel Blob store in an **EU region**
   and give its token to the admin and web projects (the variable is catalogued in ENV.md by pass 1).

## Blockers

- The Spec approved tick (operator).

## Do not

- Do not tick either gate; do not start Build before the tick.
- Do not create a public or non-EU Blob store — region and privacy cannot be changed afterwards.
- Do not touch `beyond-december/meal-photos` scope: meals stay text-only (D-12).
