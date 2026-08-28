# apps/admin — app rules (Layer 3 delta)

The global rules in [`/CONVENTIONS.md`](../../CONVENTIONS.md) still apply. This file holds only
what is specific to this app.

## What this app is

**Morgane's patient tool.** She creates and maintains a profile per patient, encodes each one's
protocol as recommendations, writes up her consultations, and shares a link the patient reads. Plus
the accounts that reach it. Nothing else lives here.

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
- **Two roles.** `owner` manages accounts as well as patients; `operator` manages patients only.
  The vocabulary and the check both live in `@remi/services/shared` (`canManageOperators`), never
  in a comparison written by hand at a call site.
- **Every guard is asserted twice.** The `(admin)` layout guards what renders; each server action
  calls `requireOperator()` or `requireOwner()` again, because an action is an endpoint of its own.
  Hiding a nav row is a courtesy, not a control.
- Destructive operations — delete, remove an account, regenerate a share link — confirm before
  acting and **write to the audit trail**. That is not advice: `lib/audit.ts` is the one way to
  record, and an action that changes a patient's record without calling it is an incomplete action.
- The console never reaches around `@remi/services/server` to a driver directly. If an operator
  needs a query the service layer does not expose, add it to the service with the permission check
  on it.

## Accounts

`OPERATOR_EMAIL` creates the **first** account and stops working the moment one exists. Every
account after that arrives by invitation: an owner issues one, the token is stored hashed
(`operator_invitations`), and accepting it mints the account with the invitation's email and role —
never with anything the acceptance form posted.

The console always keeps **at least one owner**. The service refuses the last demotion and the last
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

**Phone-usable is a requirement, not a nicety.** Morgane works from consultations, so the patient
page is one scrolling column ordered by how often each block is reached, and the mobile nav carries
the same links as the sidebar rather than a reduced set.
