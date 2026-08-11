# REMI-012 · Accessibility batch: skip links, language attributes, root 404s

|                |                                                                          |
| -------------- | ------------------------------------------------------------------------ |
| **Type**       | chore                                                                    |
| **Priority**   | P1 (skip link fails WCAG 2.4.1 today)                                    |
| **Size**       | Hours                                                                    |
| **Depends on** | — (root 404s may already be done by REMI-009 — check before duplicating) |
| **Blocked by** | —                                                                        |
| **Sources**    | audit F-40, F-42, F-43                                                   |

## Problem statement

A keyboard or screen-reader user must tab through the full header and sidebar on every page of
every app: no skip-to-content link exists anywhere, even though web and admin already ship the
`<main id="content">` target. The admin app declares `lang="en"` over deliberately-French pages
(screen readers read French prose with English pronunciation), two UI primitives hardcode an
English "Close" that reaches French screens, and the marketing consent error is not
programmatically linked to its checkbox.

## Required steps

1. Build one skip-link component in `packages/ui` (visually hidden until focused, first tab
   stop, jumps to the main content anchor) and render it first in each app shell; add the
   `id="content"` anchor where missing.
2. Fix language attributes: `lang="fr"` wrapper on admin's French Company pages.
3. Add a label prop (with per-locale value) to the close buttons in `packages/ui`'s `sheet.tsx`
   and `dialog.tsx` instead of the hardcoded "Close".
4. Wire `aria-describedby` from the marketing consent checkbox to its error message.
5. If REMI-009 hasn't landed: add root-level `not-found.tsx` to web, marketing, support (F-43).

## Acceptance criteria

- [ ] First Tab press on any page of any app reveals a working skip link.
- [ ] Admin's French pages are announced as French.
- [ ] No hardcoded English strings reach French screens from `packages/ui`.
- [ ] The consent error is announced with its field.

## Agent prompt

```text
Work in the remi-ai monorepo. Read CLAUDE.md and CONVENTIONS.md (design-system rules), then
.icm/docs/audit-report.md findings F-40, F-42, F-43.

Task: clear the accessibility floor.
1. Create a SkipLink component in packages/ui (visually hidden until focused, styled with
   tokens, href to a content anchor). Export it and render it as the first element in every app's
   shell layout; ensure every app has a <main id="content"> target (web and admin already do).
   The label must exist in both languages where the app is bilingual — follow the repo's content
   patterns for EN/FR parity.
2. In apps/admin, wrap the deliberately-French Company pages so they carry lang="fr"
   (apps/admin/app/layout.tsx currently declares lang="en" globally).
3. In packages/ui/src/components/sheet.tsx and dialog.tsx, replace the hardcoded "Close"
   screen-reader text with a prop (default preserved) and pass localised values from the apps.
4. In apps/marketing/components/contact-form.tsx, link the consent error message to its checkbox
   with aria-describedby (and aria-invalid when errored).
5. Check whether root-level not-found.tsx pages already exist in web/marketing/support (REMI-009
   may have added them); if not, add them modelled on admin's.
Do not run build/lint/typecheck locally (factory-owned). Push a feature branch and open a PR.
```
