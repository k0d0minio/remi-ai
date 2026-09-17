# Build notes: secondary-sections

- commits: `82c6888` components · `712fba7` page re-composition + `AGENTS.md` ·
  `a8b3616` format fix
- ci: `Format, lint, typecheck` passes on `a8b3616`. The admin preview was still building
  when these notes were committed, so the run's verdict is the `ci-status.sh` call on the
  head that carries them — recorded below once it settles.

## What changed

- `apps/admin/components/patients/section-fold.tsx` — **new.** One closed `Accordion` with its
  count on the trigger, used eight times: four archived groups that were standalone sections,
  three that already sat inside a section in three different shapes, and the delete flow. A
  server component composing client primitives, so the lists it wraps stay server-rendered.
- `apps/admin/components/patients/anamnesis-block.tsx` — filled categories first, a count line
  above them, the rest as one row of « Compléter » buttons. Completing an empty category opens
  its editor in the list above rather than inside the button row, because that is where it lands
  on save. The textarea, the action and the one-at-a-time rule are untouched.
- `apps/admin/components/patients/profile-summary.tsx` — **new.** Identité · Mesures ·
  Alimentation · Consentement as read text, `Modifié le …`, and a « Modifier » that swaps in
  `PatientForm` whole. `lastEditedAt` is formatted on the server and passed as a string: an
  `Intl` call on a `Date` inside a client component drifts between server and browser timezone.
- `apps/admin/components/patients/vocabulary.ts` + `patient-form.tsx` — `localeLabels` moves out
  of the form into the app's vocabulary home. The summary needed it and copying it would have
  forked a label.
- `apps/admin/app/(admin)/patients/[id]/page.tsx` — five registry entries and five `<section>`
  blocks gone, eight folds in, the profile section re-composed. Net −92 lines.
- `apps/admin/AGENTS.md` § Interface — rewritten; the old text claimed the secondary sections'
  bodies were untouched, which this run ends.

## Acceptance criteria status

- [x] Anamnesis lists filled first, then « Compléter » buttons, with a count of twelve — the
      count line renders **above** the lists, per spec § 1's stated order. The criterion's
      wording ("above a line") reads the other way round; § 1 is the design of record and the
      line itself is what either phrasing asks for.
- [x] « Compléter » / « Modifier » opens the editor in place, one at a time, and a saved
      category re-renders among the filled ones.
- [x] The profile shows a read summary before any click, with « Modifié le … ».
- [x] « Modifier » swaps in the existing `PatientForm` with every field it has today; « Fermer »
      returns. No field was removed from the form.
- [x] A profile with neither consent date nor channel reads « Pas encore enregistré » — the
      both-halves-or-neither rule is carried over from the form verbatim, so
      `RETENTION.md § Consent` stays true and needed no edit.
- [x] Archived recommendations, essentials, previous recipes and archived meals are closed folds
      with counts at the end of their active section; the four standalone sections are gone.
- [x] Archived supplements, observations and goals use the same fold.
- [x] The delete flow is a closed fold at the end of the profile; no red card, no `danger-zone`
      section.
- [x] The registry holds thirteen sections with no conditional entry — the same list for every
      patient, in the index, the anchor row and the segments alike.
- [x] No migration, schema, service, `apps/web` or `/p/[token]` change — the diff is six files
      under `apps/admin`.
- [x] `apps/admin/AGENTS.md` § Interface rewritten.
- [ ] `apps/docs` `technical/applications` and `business/roles` — Release responsibility, same
      PR, as the criterion says. Left for Release.

## Notes for Release

- Both docs pages describe the page as "bodies of secondary sections untouched" and list the
  sections; both need the same correction as `AGENTS.md`.
- Two CI rounds: the first push was red on `format:check` alone (a type import one column over
  the print width). Lint and typecheck never ran on that head because the job stops at the first
  failing step; they pass on `a8b3616`. The admin preview is the only target that compiles this
  diff — the other five apps are untouched by it and pass without exercising anything.
- **What to smoke-test on the preview**, signed in, on a patient that has archived rows:
  Dossier → Anamnèse (complete an empty area, watch it move up); Profil (read summary, consent,
  « Modifier » → « Fermer », then a real save); each of the four sections with an archived fold;
  the « Zone sensible » fold and its dialog; and the section index on a patient with nothing
  archived, which should list the same thirteen entries.
- Previous recipes fold **closed** like the other three — the spec's one open question, taken
  from the dropped `history-folds` stub's fallback rule. If she consults them every time, it is
  one `defaultValue` on that `SectionFold`.
