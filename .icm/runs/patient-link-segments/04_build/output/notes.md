# Build notes: patient-link-segments

- commits: `448578c` merge main (living-summary + supplement-protocol landed), `feat: patient-link-segments — six segments under one token`
- demo: none

## What changed

- `apps/web/lib/patient-link/load.ts`: one `cache`d read per request returning the
  patient and all six segments' data, plus `visibleSegments` / `hasSegment`. Every page
  loads the whole record because the nav must know which segments are non-empty on every
  route — the hiding rule is itself a read of all six. `recordPatientLinkOpened` fires
  here, so it is called once on arrival at any route.
- `apps/web/lib/patient-link/segments.ts`: the six segment keys and their path suffixes.
- `apps/web/app/[locale]/p/[token]/layout.tsx`: the shell — wordmark, greeting, nav, and
  the privacy/disclaimer card plus beta note as a shared footer. Resolves the token and
  `notFound()`s here, so an unknown token 404s on all six routes with no partial chrome.
- `page.tsx` + five sub-routes: one page per segment, each `force-dynamic`, each
  `notFound()`ing when its own segment is empty. Home always renders.
- `apps/web/components/patient-link/*`: the nav (a client island only so the current
  route can be marked, as the signed-in shell's nav already is) and one list per segment.
- `apps/web/lib/content/{types,en,fr}.ts`: the `patientLink` branch gains nav labels,
  segment titles and per-segment field labels; the keys home no longer renders
  (`objectiveTitle`, `profileTitle`, `constraintsTitle`, `preferencesTitle`,
  `medicationsTitle`, `supplementsTitle`, `ageLabel`, `heightLabel`, `weightLabel`) are
  deleted in the same change, per CONVENTIONS on superseded implementations.

## Acceptance criteria status

- [x] Six routes render for a valid token in both locales — layout + six `page.tsx`.
- [x] Every route `force-dynamic` — declared on the layout and on all six pages.
- [x] Unknown/malformed/revoked token 404s on all six, no partial chrome, no name — the
      layout resolves before rendering any chrome.
- [x] Empty segment hidden from nav and 404 at its URL; home always renders.
- [x] Nav shows exactly the non-empty segments and marks the current one; wraps at 375px
      with `min-h-11` (44px) targets.
- [x] Home renders greeting, active living summary, active priority goals with baselines.
- [x] Home renders none of the § A extract, the objective, or the measurement line — the
      keys are gone from the dictionary, so a regression is a type error.
- [x] Recommandations renders category, title and detail exactly as before.
- [x] Compléments renders the protocol; nothing reads `patient_profiles.supplements`.
- [x] Placard & frigo renders essentials in `position` order with their `why` — the
      service returns them ordered.
- [x] Recettes renders assignments newest first, body as prose with line breaks, her
      note; no `tags` render.
- [x] Repas renders every non-archived entry newest first with date, slot label,
      description, patient comment and feedback where written.
- [x] Repas renders no learning and no observation.
- [x] Nothing from anamnesis, consultation notes or goal check-ins on any route.
- [x] `recordPatientLinkOpened` called once per request, on any route.
- [x] Privacy note, disclaimer and beta note on all six — in the shared layout footer.
- [x] Real name when recorded, pseudonym otherwise, on all six — in the shared header.
- [x] No form, input, mutation or link into the signed-in app; no session.
- [x] Both dictionaries carry every new label (25 keys each, verified equal) and
      `types.ts` makes a missing one a type error.
- [x] `apps/admin`, the `(app)` group and the `(patient)` fixture pages untouched.
- [x] No schema change, migration or new service; the diff touches `apps/web` only.

## Notes for Verify

- **The nav is a client component.** Only to mark the current route from `usePathname`,
  matching `apps/web/components/shell/nav-links.tsx`. No state, no input, no mutation —
  but it is the one place worth confirming the view-only rule still holds.
- **Every page loads all six segments.** Deliberate, not accidental: the nav needs the
  full emptiness picture on every route. If the read cost matters later, the fix is a
  cheaper existence query, not per-page loading.
- **`position` ordering for pantry and supplements** is inherited from the services
  rather than re-sorted here; worth confirming on the preview with a patient whose list
  Morgane has reordered.
- **Prettier reflowed the files on commit** (Husky), so the diff is formatter-final.
- The spec's _Precondition_ section still names both tables as outstanding. Both have
  since merged (`#79` supplement-protocol, `#80` living-summary) and `main` was merged
  into this branch at `448578c`; the sentence is stale, not wrong about anything built.
