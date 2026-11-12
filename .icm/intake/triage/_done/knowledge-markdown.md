# Stub: The knowledge list shows each rule body without Markdown syntax

- lane: tweak
- found-by: the UAT audit, uat-admin.remiai.be/knowledge · 2026-11-12
- complexity: low
- priority: P1

## Problem

The rule rows on `/knowledge` print the body as raw Markdown. Morgane sees `**À compléter.**`
and `> Source — brainstorm v2 § H : « … »` as typed. The source is
`apps/admin/components/knowledge/rule-rows.tsx`, which puts `rule.body` in a `Typography`.
The detail page `/knowledge/[id]` already renders the body with `Markdown` from `@remi/ui/server`.

## Proposed change

Show a plain-text excerpt in each row. Remove the Markdown syntax with the parser that `Markdown`
uses. Keep the detail page as it is.

## Acceptance criteria

- [ ] A rule row on `/knowledge` shows no `**`, no `>` and no list markers from the body.
- [ ] A rule row keeps the body text and stays clamped to two lines.
- [ ] Raw HTML in a body does not show in a row and does not render.
- [ ] `/knowledge/[id]` shows bold, blockquotes, lists and paragraphs as formatted text.
