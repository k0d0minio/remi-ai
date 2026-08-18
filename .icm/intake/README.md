# Intake — reset 18 August 2026

> This folder follows the estate-wide ticket standard (`.icm/intake/`, canonical spec:
> `_system/contracts/TICKETS.md` in the Apps estate). One markdown ticket per unit of work,
> each with a pasteable agent prompt; finished tickets are `git mv`'d to `_done/` by the PR
> that implements them. The admin dashboard's tickets board reads this folder from `main`.

## Why the board is empty

On 18 August 2026 Morgane's braindump landed in
[`docs/morgane-braindump/`](../../docs/morgane-braindump/) — 40 documents covering the
vision, positioning, pivots, V2 feature set, business model, roadmap and priorities. It is
**the source of truth for what REMI is**.

The 33 tickets that previously lived here were derived from the pre-build audit and the v1
analysis — both written from assumptions about the product that the braindump has now
superseded. Several of the assumptions turned out to be wrong (most visibly, a "signed pilot
billing from 1 September" that was demo fixture data). Rather than patch the old backlog
ticket by ticket, it was wiped in one commit; every removed ticket remains recoverable in git
history (they lived at `.icm/intake/REMI-0*.md` until this commit).

The six tickets in [`_done/`](_done/) are kept: they record work that actually merged
(exposure closed, fixtures de-identified, contact form wired, branch protection, drift fixes)
and none of it is invalidated by the braindump.

## Where the next backlog comes from

The direction and phases for the new ticket set are proposed in
[`docs/remi-status-report.html`](../../docs/remi-status-report.html) (§ "A new plan"), built
from the braindump's own priorities: the patient core loop ("Améliore mon assiette", value in
under 60 seconds), the practitioner dashboard, the recommendation parser, then monetisation
and the ~15-practitioner beta pilot.

New tickets get cut from those phases **after the owner reviews the report** — not before.
Until then, an empty board here is honest: it says "the plan is being re-decided", which is
exactly what is happening.
