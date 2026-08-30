# Stub: `main` is red — two `react-hooks` lint errors in `@remi/admin`

- feature-slug: admin-lint-red-on-main
- lane: bug
- priority: P1
- sources: found during the estate AGENTS.md rollout, 2026-08-30 (icm-board epic
  `opencode-sidecar`) · CI run 33306476917

## What this is

The `Format, lint, typecheck` workflow fails on `main`, and has for at least the last
three pushes — including two that touched nothing but `.icm/`. It is not a regression from
any one change; it is the standing state of the branch, which means every PR opened
against this repo inherits a red check and nobody can tell a real failure from the
background one.

Two errors, both from the React compiler's `react-hooks` rules, both in `apps/admin`:

- `apps/admin/app/(admin)/team/page.tsx:36:40` — _Cannot call impure function during
  render_. `Date.now()` is called in the render body, so the value changes on every
  re-render.
- `apps/admin/components/patients/roster-filters.tsx:76:5` — _Calling setState
  synchronously within an effect_. A `useEffect(() => setQuery(search), [search])` that
  mirrors a prop into state. The comment two lines above it explains why the sync exists,
  so the fix is a shape change (derive during render, or key the component), not a
  suppression.

`pnpm lint` runs with `--max-warnings=0`, so both are hard failures. `@remi/demo` fails
only as a cascade of the `@remi/admin` task.

## Worth knowing

Found while migrating this repo's Layer 0 to `AGENTS.md` (PR #58). That PR touches six
markdown/JSON files and no `.tsx`, so its red check is this, not its own work — worth
knowing before reading it.

## Prompt

Get `main` green in remi-ai. Two `react-hooks` lint errors fail `pnpm lint`
(`--max-warnings=0`) in `@remi/admin`: `Date.now()` called during render in
`apps/admin/app/(admin)/team/page.tsx:36`, and a prop-mirroring
`useEffect(() => setQuery(search), [search])` in
`apps/admin/components/patients/roster-filters.tsx:76`. Read
.icm/intake/triage/admin-lint-red-on-main.md first. Fix the shape in both cases rather
than suppressing the rule — the roster-filters effect carries a comment explaining the
sync it performs, so understand that before changing it. Open a PR on a claude/ branch and
read the result from CI.
