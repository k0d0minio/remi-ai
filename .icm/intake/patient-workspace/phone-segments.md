# Stub: Phone segments — five segments at most over the same sections, the segment in the URL

- feature-slug: phone-segments
- sequence: 3 of 6
- depends-on: page-frame
- priority: P1
- size: M
- sources: breakdown.md § The design · R6, R7, R9, R11, R17, R23–R26 · `layout-prototype`
  sign-off (segment labels)

## What this is

Below `md` the page today is fourteen cards deep. This stub gives the phone the view the
prototype approved: a **segmented control** of at most five segments (R11) that shows only the
sections of the chosen group — the groups the registry already carries from `page-frame`.
Provisionally _Suivi · Journal · Dossier · Profil_, labels as Morgane confirmed them on the demo.

How it works, under decision #2 (one tree): the control is a client island that reads the
registry's `{ id, group }` list and toggles `hidden` on the sections that are not in the current
group — the sections are the same server-rendered nodes the desktop grid shows; nothing renders
twice. Above `md` the island renders nothing and hides nothing. The active segment lives in the
URL (`?vue=journal`, or the hash — the prototype decides) so a link from the roster or a
notification lands on the right segment and Back restores the previous one; the default segment
is the first group.

The control sits under the compact banner, sticky with it, one row tall (R25), horizontally
scrollable only if the labels do not fit (they must fit at five — R7). Semantics follow the APG
tabs pattern (R26): `tablist` / `tab` with arrow-key movement, the visible sections' wrapper as
the `tabpanel`. Targets 44 px (R24). The `@remi/ui` `Tabs` primitive gives the visuals
(`variant="pill"`) — but Radix `TabsContent` would want to own the panels, so either
`forceMount` + the island's own hidden-toggling, or the `TabsList` alone with a hand-written
panel — Define picks, the constraint is one tree.

Also here: the banner's phone compaction from `page-frame` gets its final form — two lines,
pseudonym + status on the first, the measures line on the second, copy-link as an icon button.

## Worth knowing

- Anchor links from the section index (desktop/medium) point at sections that may be hidden on
  the phone — the index is hidden below `md`, so nothing links into a hidden section from the
  page itself; a deep link with a `#section` hash should switch to that section's segment first.
- Scroll position resets to the top of the panel on segment change; the browser keeps it on
  Back.
- No `useMediaQuery` deciding what to render — the island is mounted always and CSS decides
  visibility above `md` (`md:hidden` on the control; the hidden-toggling is skipped when the
  control is not displayed, read via a `matchMedia` listener _after_ hydration).

## Open questions — flag these on pickup

- Query parameter or hash for the segment? The prototype's choice; if it was dropped, use a
  query parameter (survives server navigation, and the roster can link to it) and say so.
- Does the sensitive zone belong in _Profil_ at the end, or behind the "Ajouter" overflow? (Same
  question as the prototype's — carry its answer.)

## Prompt

Run `/pipeline new .icm/intake/patient-workspace/phone-segments.md` in the remi-ai repo and
follow the pipeline from there. Read the stub, its epic's `breakdown.md` and the `page-frame`
run's notes first. Scope: below `md`, a sticky segmented control (≤ 5 segments, labels from the
prototype sign-off) that shows only the current group's sections by toggling visibility on the
one server-rendered tree, the segment persisted in the URL and restored on Back, APG tabs
semantics, 44 px targets, and the two-line compact banner. No change above `md`, no data or
service change. Raise the stub's open questions rather than answering them.
