# REMI-011 · Consolidate version pins into the shared catalogue

| | |
| --- | --- |
| **Type** | chore |
| **Priority** | P2 |
| **Size** | An hour |
| **Depends on** | — |
| **Blocked by** | — |
| **Sources** | audit F-04, §4 (pre-1.0 pin question) |

## Problem statement

The pnpm catalogue exists so shared versions are pinned once — and runtime dependencies honour it
perfectly. But `@tailwindcss/postcss` (five apps), `@tailwindcss/cli` (packages/ui), `eslint`
(root + six apps), `postcss` (five apps) and `tsup` (both packages) are pinned literally in 2–7
files each. Tailwind and its companions must move together; today they can drift independently —
the exact failure the catalogue comment warns against. Separately, a few pre-1.0 dependencies
(`lucide-react`, `class-variance-authority`) use `^` ranges where minors may break.

## Required steps

1. Add the six tools to the catalogue in `pnpm-workspace.yaml`.
2. Replace every literal pin with `catalog:` across all manifests; `pnpm install` to settle the
   lockfile. No version changes — same resolved versions, one home.
3. Decide (and implement) exact pins for the pre-1.0 packages, or record the decision to accept
   caret ranges — one line in the PR either way.

## Acceptance criteria

- [ ] No shared tool version appears literally in more than one `package.json`.
- [ ] Lockfile resolves to the same versions as before (diff shows moves, not upgrades).
- [ ] The pre-1.0 pin decision is recorded.

## Agent prompt

```text
Work in the remi-ai monorepo. Read CLAUDE.md and CONVENTIONS.md, then docs/audit-report.md
finding F-04 and its §4 note on pre-1.0 pins.

Task: one version, one home.
1. In pnpm-workspace.yaml's catalog, add entries for @tailwindcss/postcss, @tailwindcss/cli,
   eslint, postcss, and tsup at the exact versions currently resolved in the lockfile.
2. Replace every literal pin of those packages in root and workspace package.json files with
   "catalog:". Run pnpm install and verify the lockfile diff shows no version changes.
3. Change lucide-react and class-variance-authority to exact pins in the catalogue (they are
   pre-1.0, where minors may break), unless you find a documented reason not to — state the
   choice in the PR.
Do not run build/lint/typecheck locally (factory-owned). Push a feature branch and open a PR.
```
