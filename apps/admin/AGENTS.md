# apps/admin — app rules (Layer 3 delta)

The global rules in [`/CONVENTIONS.md`](../../CONVENTIONS.md) still apply. This file holds only
what is specific to this app.

## What this app is

**Morgane's patient tool.** She creates and maintains a profile per patient, encodes each one's
protocol as recommendations, writes up her consultations, and shares a link the patient reads. Plus
the accounts that reach it, and one reference surface — `/aliments`, the CIQUAL food-composition
table, read-only — which is here because it is what the recipe step will query and she needs to be
able to check it by hand. One page is for the REMI team only: « Modèles d'IA » (`/ai-models`), the
model of each AI role. It answers not-found to a practitioner. One table belongs to no patient:
« Parts des repas » (`/meal-shares`, REM-197), the part of the day's energy and protein that each
meal carries. Each console account reads it and corrects it. Nothing else lives here.

It is a **separate deployment** from `apps/web` on purpose — its own URL, its own environment
variables, its own access control. A `/admin` route group inside the product app would put every
operator capability one routing mistake away from a customer.

The console used to carry practitioner, pilot, support, flag and dashboard screens. Every one of
them rendered fixture data with nothing behind it, and they were **deleted** — not hidden — when
the console was narrowed to this. A page that invents its own numbers is worse than no page,
because it gets believed. If one of those capabilities comes back, it comes back with a table
behind it.

## The boundary is the whole point

- Every route is operator-only. There is no public page in this app and no unauthenticated preview
  of admin data. The two exceptions prove it: `/sign-in` and `/invitation/[token]` are reached by
  someone who has no session yet, and they live outside the `(admin)` group for that reason alone.
- **Two roles (D-27).** `admin` is the REMI team: it manages the accounts, and it may open any
  patient file read-only after it types a reason. `practitioner` reads and writes only the files
  it holds. The vocabulary and the check both live in `@remi/services/shared`
  (`canManageOperators`), never in a comparison written by hand at a call site.
- **Every patient service takes the actor (story 3).** `requireActor()` builds it from the session
  and, for an admin, from the signed cookies of the files it opened. The service decides: a file
  the actor may not reach reads as missing, and an admin's open writes nothing. The open itself is
  `patient.admin_opened` in the journal, with the reason. The rule lives in
  `packages/services/src/db/services/access`, never at a call site.
- **Every guard is asserted twice.** The `(admin)` layout guards what renders; each server action
  calls `requireOperator()` or `requireAdmin()` again, because an action is an endpoint of its own.
  Hiding a nav row is a courtesy, not a control.
- Destructive operations — delete, remove an account, regenerate a share link — confirm before
  acting and **write to the audit trail**. That is not advice: `lib/audit.ts` is the one way to
  record, and an action that changes a patient's record without calling it is an incomplete action.
- The console never reaches around `@remi/services/server` to a driver directly. If an operator
  needs a query the service layer does not expose, add it to the service with the permission check
  on it.

## Accounts

`OPERATOR_EMAIL` creates the **first** account and stops working the moment one exists. Every
account after that arrives by invitation: an admin issues one, the token is stored hashed
(`operator_invitations`), and accepting it mints the account with the invitation's email and role —
never with anything the acceptance form posted.

The console always keeps **at least one admin**. The service refuses the last demotion and the last
deletion; the UI hides those controls on your own row so it never offers an action it will refuse.

Mail is best-effort by design. `lib/mailer.ts` registers Resend only when both `RESEND_API_KEY` and
`EMAIL_FROM` are set, and every flow that would send says on screen when it cannot: an invitation
still creates its copyable link, and emailing a patient their link refuses rather than reporting a
delivery it did not make.

## Structure

```text
app/
  (admin)/       every operator route — the group carries the boundary
  sign-in/       and invitation/[token]/ — the two routes reached without a session
  api/files/     the upload grant and the file opener — route handlers, outside the layout's
                 guard, so each checks the operator session itself and answers 401 without one
components/      composition only, grouped by capability
lib/             queries, actions, types, the audit and mailer helpers
```

## Imports

Same rules as `apps/web`: primitives from `@remi/ui`, `cn()` from `@remi/ui/utils`, data through
`@remi/services/server`, types through `@remi/services/shared`, `@/*` for app-local paths.

## Language

**The console renders in French; the code is English.** Morgane and Arnaud are its only users, and
a tool someone opens between consultations should not double as a translation exercise. Identifiers,
comments, file names and route paths stay English per `CONVENTIONS.md` — a path is an identifier.

There is no locale dictionary here and there should not be one: this app ships in one language, and
a lookup layer for a single locale is machinery with no second consumer. Strings are written where
they render. The one place vocabulary is centralised is a `vocabulary.ts` per capability, and only
because a status must read identically everywhere an operator can act on it.

Gendered French job nouns are avoided in role and permission copy — one label has to be right for
everyone who will ever hold the role. Name what the role grants, not the person holding it.

## Interface

Admin is a tool, not a showcase. Density over polish: rows that show everything, filters that narrow
fast, states that say what is actually happening. It uses the same design system as the product — so
the two never drift — but it is allowed to be plainer.

**Phone-usable is a requirement, not a nicety.** Morgane works from consultations.

**The patient page follows the file status, and shows one thing to do** (stories 5 and 6). It
answers four questions on the first screen: « Où en est-on ? Sur quoi travaille-t-on ? Que s'est-il
passé depuis la dernière fois ? Que dois-je faire maintenant ? ». It has four parts, in this order:

1. **The header** (`file/header.tsx`) stays in view while the page scrolls: the name, the
   appointment, the four statuses as a path with the present one marked (`StepPath` of `@remi/ui`:
   an icon and the label, never colour alone), and the safety items in short form
   (`file/safety-strip.tsx`). « Non renseigné » and « Aucune … connue » are two different states.
2. **The action card** (`file/next-step.tsx`) is the only place with a dominant button. Its content
   follows the status: the missing information, then the appointment and the preparation note, then
   what the validation will hold with « Valider les recommandations » and the recap of the
   activation with « Activer l'accompagnement » (`file/activation.tsx`), then the validated
   version, the date of the activation, the state of the e-mail « Votre espace REMI est prêt » (its
   date, or why it did not go out, with « Renvoyer l'e-mail ») and the patient's open changes
   (`file/patient-changes.tsx`): the field, the old value, the new value and the date of each one,
   with « Pris en compte ». A change of an allergy, of an intolerance or of the diet comes first.
   The quick actions are in this card, as secondary buttons.
3. **The work column** holds the open blocks. Before the consultation (« Dossier à compléter »,
   « Prêt pour consultation »): « Sécurité », every questionnaire answer, then the calculations.
   From « Recommandations à valider » on: the goals, the recommendations, the food directives,
   the meals, the supplements, the lifestyle advice, the essentials, then the calculations.
4. **Every other section is one row** (`file/section-row.tsx`): its name, one line or a count, and
   it opens in place. An empty section is one quiet line. The rows are in groups named by her work
   (`fileGroupLabels`), not by table. A link or a quick action to a closed row opens the row.

The rule of which section goes where is one pure function, `patientFileLayout` in
`@remi/services/shared` (`patient-file-layout.ts`), with its tests. It is there because this app has
no test runner. To add a section to the page: add one line to `patientFileSections` with its group,
put the body in its own file under `components/patients/`, and add its entry to `views` in
`app/(admin)/patients/[id]/page.tsx`. `page.tsx` loads the data, checks the access and composes: it
holds no section of its own. Do not add a card to the page by hand.

A value has three states, shown the same way in all places (`file/value.tsx`): absent
(« Non renseigné », muted), entered (plain), validated by the practitioner (the mark and the word
« validé »). A mark needs a fact in the data: never show one from a guess.

Navigation is a section index on desktop, in the order of the page, and a segmented control on
phone (Suivi · Journal · Dossier · Profil). A group has one segment (`fileGroupSegments`). On a
phone the page is one column in the same order, with no horizontal scroll and touch targets of
44 px.

The secondary sections read the way she works, not the way the schema stores things. The anamnesis
lists what she has written first and offers the rest as « Compléter »; the profile is a read summary
with the form one click behind « Modifier ». **What is no longer live is a closed fold with its
count at the foot of its own section** — archived rows, and the delete flow at the end of the
profile. That is the only pattern for it: no standalone « archivées » card, no red card, so the
section list is the same for every patient.
