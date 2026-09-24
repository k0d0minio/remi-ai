# Handoff: patient-documents-and-links

For the next session — human or agent — what to do first and what stands in the way.
Rewritten, not appended, at every stage stop; a stage that STOPs mid-way writes it before it
stops, so nothing is carried in anyone's head.

## Next steps

1. Operator: create a **private** Vercel Blob store in an **EU region** (one per environment —
   preview and production) and set its `BLOB_READ_WRITE_TOKEN` on **both** Vercel projects,
   admin and app (`env.sh audit --changed` reports `GAPS 2` until then). Redeploy the branch's
   admin and app previews after setting it.
2. Operator: smoke the previews — admin `https://admin-git-claude-quirky-bohr-vd6jm2-remi21.vercel.app`,
   link `https://app-git-claude-quirky-bohr-vd6jm2-remi21.vercel.app` (built at 8c3729d, the last
   commit that changed app code; later commits touched `.icm/` only, so the ignore step skipped
   them). Exercise the 13 criteria: upload a PDF and an image, add a link, tag one as a recipe,
   attach one to a goal and one to a recipe, edit, remove, « Voir comme la patiente », open a file
   from the link, delete a test patient that has files.
3. Tick **Ready to merge** on https://github.com/k0d0minio/remi-ai/pull/122, then run
   `release patient-documents-and-links`.

## Blockers

- The Blob store and its token (operator) — without them the smoke covers links only.

## Do not

- Do not tick either gate.
- Do not create a public or non-EU Blob store — privacy and region cannot be changed afterwards.
- Do not bump `next` or clear the dependency advisories in this PR — they are main's, parked as
  `triage/dependency-audit-next-rce`.
- Release: the `technical/decisions` entry is owed (Notes for Release in `03_build/output/notes.md`).
