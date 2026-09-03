# Stub: Page frame — wide container, patient banner, section registry, desktop columns

- feature-slug: page-frame
- sequence: 2 of 6
- depends-on: layout-prototype
- priority: P1
- size: L
- sources: breakdown.md § The design · R1, R2, R4, R5, R10, R17–R19, R25, R28, R29 ·
  `apps/admin/app/(admin)/patients/[id]/page.tsx` · `apps/admin/AGENTS.md` § Interface

## What this is

The trunk of the epic: the page stops being a `max-w-2xl` stack and becomes a frame the other
stubs fill. Four things land together because none is useful alone:

**The measure.** `mx-auto max-w-2xl` goes; the page takes the `wide` container measure
(`Container size="wide"` from `@remi/ui/server`, 88 rem — the token nobody in admin uses). The
shell already pays `lg:pl-60` for the sidebar; the page fills what is left (R4, R5). Prose inside
sections keeps a ~70 ch measure on its own text blocks (R19) — the width cap moves from the page
to the paragraph.

**The patient banner (R29).** One row, sticky under the shell header (`top-14`), opaque (R25):
back link, pseudonym, status badge, the age · sex · measures line, the copy-link button, and a
slot for the page-level "Ajouter" menu that `add-surfaces` fills. Today's three-line heading
becomes this. On phone it compacts to two lines — the visual only; the segment control is
`phone-segments`.

**The section registry.** One typed list, in the page, of every section: `id`, French title,
description, the `ReactNode` body, an optional count, and which _group_ it belongs to (the groups
are what `phone-segments` turns into segments). The page renders the registry once, in order, as
`<section id={…}>` with `scroll-margin-top` clearing the sticky banner (R10, R28). Existing cards
become registry entries with their bodies unchanged — this stub moves furniture, it does not
rebuild it. The three queued `patient-record` cards (summary, goals, supplements) get a documented
place to register when they ship; if any has shipped first, it is folded in here.

**The desktop grid and the section index.** At `lg`: a two-column grid — a fluid work column
holding every section in the registry marked `column: "work"`, and a sticky rail
(`lg:w-80 xl:w-88`, top-aligned under the banner) holding the ones marked `column: "rail"`: the
link card, the profile form's card (collapsed to its summary line with an edit affordance —
the full form opens in place), and the sensitive zone (R1, R2). At the top of the rail sits the
**section index**: the registry's titles and counts as in-page anchors, the current section
marked from an `IntersectionObserver` in one small client island (R10). At `md` the grid is one
column, the rail entries drop below the work column, and the index becomes a horizontally
scrolling row pinned under the banner. Below `md` nothing changes yet — the stack stays, and it
still works.

**The rule.** `apps/admin/AGENTS.md` § Interface says the patient page "is one scrolling column
ordered by how often each block is reached". Rewrite it to what is now true: one DOM order by
frequency; desktop columns, medium single column and phone segments are views over it; phone stays
a first-class target.

## Worth knowing

- One tree (decision #2): the grid and the index are CSS and one island; nothing is rendered
  twice, no `useMediaQuery` chooses a tree on the server — that hydrates wrong.
- The page is a server component with client islands; the registry's bodies are already
  server-rendered `ReactNode`s, so the index island receives only `{ id, title, count }[]`.
- Container queries (`@container` on the section, `@md:` inside) are how a section lays its rows
  in two columns in the work column and one in the rail — one component, no breakpoint forks
  (R18).
- Loading state: `(admin)/loading.tsx` is deliberately generic; leave it.
- The `patient-form` card is 500 lines of fields; it moves to the rail _collapsed_ — the form
  itself is untouched.

## Open questions — flag these on pickup

- `wide` (88 rem) or `content` (72 rem)? The prototype answers this from the live URL; if it was
  dropped, ship `wide` and say so in the PR body.
- Is the profile card right in the rail collapsed, or does Morgane want it in the work column
  because she edits it mid-consultation?
- Anything the prototype's sign-off changed about the rail's contents — carry the decision here
  in one line, from `design-notes.md`.

## Prompt

Run `/pipeline new .icm/intake/patient-workspace/page-frame.md` in the remi-ai repo and follow
the pipeline from there. Read the stub, its epic's `breakdown.md` (research + design — do not
redo them) and, if `layout-prototype` shipped, that run's `design-notes.md`. Scope: the admin
patient page moves to the `wide` container with a sticky one-row patient banner, a typed section
registry rendered once in one DOM order, a desktop two-column grid (work column + sticky rail
with a section index island) and a medium single column with a pinned anchor row; below `md`
unchanged; existing card bodies untouched; `apps/admin/AGENTS.md` § Interface rewritten to the
new rule. Layout only — no data, service or patient-link change. Raise the stub's open questions
rather than answering them.
