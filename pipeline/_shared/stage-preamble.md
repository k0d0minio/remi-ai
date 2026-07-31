# Stage preamble — resolve the run, or STOP (Layer 3 reference)

The single canonical procedure for **adopting** an existing run into the working tree. Build, Verify
and Ship (and `status <slug>`) run it before anything else. **The front never runs it** — Scope
creates the run folder and Define creates the branch and PR; the guard below applies only to the
adopting stages.

## Procedure

1. **Resolve the run with one blocking call.** Don't read `run.md` by hand, search for the PR, or
   check out a branch yourself. `resolve-run.sh` does all of it deterministically — reads `run.md`
   if it is already in the tree, otherwise finds the PR by slug through the GitHub API, then fetches
   and checks out the run's branch — and spends no model tokens doing so:

   ```bash
   pipeline/scripts/resolve-run.sh <slug>
   ```

   - Exit 0 / `RESULT: READY` → the run's branch is checked out and `pipeline/runs/<slug>/run.md` is
     in the working tree. Go to step 2.
   - Non-zero / `RESULT: STOP` → no run resolved: Define has not run for this slug, or the slug is
     wrong. **STOP.** Do **not** create `runs/<slug>/`, a spec, a `run.md`, or a branch, and do not
     fall back to `git checkout -b`. Recreating the folder fabricates an unspecced run and orphans
     the real one. Tell the user to run `/pipeline new "<request>"` (or fix the slug), and stop. The
     script itself never creates anything — it only reports `STOP`.

2. Load the stage contract (`pipeline/stages/NN_*/CONTEXT.md`) and follow it.

The resolver reads a GitHub token (`GITHUB_TOKEN` or `GH_TOKEN`) from the environment for the PR
search, and optionally `GITHUB_REPO` / `GITHUB_API_URL`. Its header documents the full signature and
verdict vocabulary.
