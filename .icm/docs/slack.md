# Slack for REMI AI — the workspace, and how it works

One document. It explains the system, then walks the setup step by step with blocks you paste
straight into Slack.

Read § 1–3 before touching anything. Everything from § 4 on is executable in order; § 18 is the
same thing as a tick-list.

---

## 1. Two audiences, one company

REMI AI has two working surfaces, and they are not the same place.

**The engine room** — this repository. `.icm/docs/` (what REMI is), `.icm/intake/` (the ordered
backlog), `pipeline/` (how work moves), the specs, the PRs, the run folders. Its readers are Jamie
and the agents. It is written in a form agents can act on, which is exactly what makes it unusable
as a company-wide surface: nobody who does not work in a terminal is going to open a markdown file
to find out where a feature stands.

**The bridge** — Slack. Its readers are all three of you. It is where the product is discussed and
scoped, where the state of everything is visible without asking, and where each person can see what
is waiting on them.

The mistake to avoid is making Slack a table of contents for the engine room. A channel full of
links into a repository that two of the three people never open is a channel those two stop
reading. So:

> **Rule 1 — Nothing Morgane or Arnaud need is only in the repository.**
> If they need it, it exists in Slack, in French, in full: the state of a feature, what was decided,
> what is expected of them. Not a link to it. The thing itself.
>
> **Rule 2 — Nothing an agent needs is only in Slack.**
> Agents cannot read Slack. An agreed scope, a decision, an answered question is not real work until
> it is written into `.icm/docs/`, `.icm/intake/` or a `spec.md`.

Both rules bind at once, which means somebody carries things across. That is Jamie, and the crossing
is the one part of this system that is scheduled rather than remembered: it happens at the
fortnightly bet, when a scope is agreed, when a demo goes live, and when something ships (§ 8).
Anything that depends on remembering to update two places at an unspecified moment does not survive
a busy fortnight.

**What that costs, honestly.** Some things exist in two forms: a feature's state is a row in a
Slack list _and_ a ticket in `.icm/intake/`. That is duplication, and duplication drifts. It is
accepted here because the alternative — one copy that two thirds of the company cannot read — is
worse. Drift is controlled three ways: the flow is **one-directional** (the repository is the
detailed truth; Slack carries state and conclusions, never specifications), the crossing happens at
**fixed moments**, and the monthly audit (§ 12.4) checks the two agree.

**What Slack decides, and what it does not.** Product decisions — what to build, for whom, in what
order, at what price — are **made in Slack**, by the three of you. That is the point of the whole
setup. Delivery gates are not: the pipeline's two binding gates are checkboxes in the PR, ticked by
a human, and no amount of enthusiasm in a Slack thread substitutes for the tick. Slack decides
_what_; the PR records _that it is finished_.

---

## 2. What each person gets out of it

The setup is judged against three questions, one per person. If a channel or a canvas does not
serve one of them, it does not belong here.

| Person      | What they must be able to do, without asking anyone                                                                                                                                |
| ----------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Morgane** | See every feature's state in one screen · discuss and shape a feature before it is built · answer the questions that block the build · sign off a prototype from her phone         |
| **Arnaud**  | See what the company owes the outside world · see what is waiting on him and by when · see what is being spent · sign off what binds the company                                   |
| **Jamie**   | Get scope agreed before building it · get answers to open questions without chasing · report progress once, not three times · keep the repository fed without doing the work twice |

Two of those three are about **the state being visible without asking**, and one is about
**questions getting answered**. That is what the product board (§ 9) and the actions list (§ 10)
exist for. Everything else is conversation.

---

## 3. The method, and why this one

You already have a delivery methodology: the six-stage pipeline with five gates, plus three fast
lanes. It is better suited to you than anything imported. What is missing around it is a cadence, a
way of deciding, and a place to discuss the product before it becomes code. That is what Slack adds
— four pieces, each doing one job.

### 3.1 Shape Up's _betting_, not its ceremony

[Shape Up](https://basecamp.com/shapeup) is the method most often recommended for teams under about
250 people: instead of continuous sprint planning, a **bet** — a fixed appetite of time, a shaped
piece of work, no interruption until the appetite runs out. Basecamp uses six-week cycles; six weeks
is too long here, and the phases in `.icm/intake/` are sized in days and 1–2 weeks.

**Adopt: a two-week bet, with a half-day cooldown.** Every second Monday the three of you agree
what the fortnight is for. The bet is written once, in `#annonces`, in French, naming what will be
built **and what is expected of Morgane and Arnaud during those two weeks**. It does not change
mid-cycle except for a production incident.

The important half is the second one. A bet that only says what Jamie will build leaves the other
two as spectators; a bet that also says "Morgane : valider la maquette de l'onboarding avant
mercredi · Arnaud : les numéros BCE pour le dossier Startup Boost" gives all three people a
fortnight they can be held to.

### 3.2 Kanban's _WIP limit_, not its board

**Adopt: 2 features in flight at once, at most 1 being built.** When a third wants to start,
something finishes or goes back to the board. Checked out loud at the Monday bet, in front of
everyone — which is what makes it real, because the pressure to start a third thing usually comes
from the people who cannot see the first two.

### 3.3 DACI, lightweight, for the decisions that deserve it

[DACI](https://www.atlassian.com/team-playbook/plays/daci) — Driver, Approver, Contributors,
Informed — exists so that a group of three never has an expensive decision made by whoever spoke
last. Cheap and reversible decisions skip it; that is part of the framework, not a shortcut.

**Adopt: one thread per decision in `#decisions`, one named approver, and it is not decided until
the thread says so.** Standing approvers:

| Domain                                              | Approver         |
| --------------------------------------------------- | ---------------- |
| Product, direction, positioning, pricing            | Morgane          |
| Legal, finance, company, data protection, contracts | Arnaud           |
| Architecture, code, tooling, delivery               | Jamie            |
| Anything that spends money every month              | Arnaud + Morgane |

_(§ 20 flags this — Arnaud's domain is inferred from `history/info-gathering.md`, where the DPAs,
the company particulars and the accountant are all addressed to him. Confirm before the workspace
opens.)_

### 3.4 Handbook-first — but the handbook they read is in Slack

GitLab's handbook-first culture is the reference implementation of a knowledge centre: if it is not
written down it did not happen, and there is one place to look. The subtlety for you is that
**there are two handbooks, for two audiences**, and each has to be complete for its own readers.

| Handbook                                 | Reader            | Holds                                                                    |
| ---------------------------------------- | ----------------- | ------------------------------------------------------------------------ |
| `.icm/docs/` + `.icm/intake/`            | Jamie, the agents | The braindump, the specs, the tickets, the conventions — full detail     |
| The Slack canvases and lists (§ 9, § 10) | All three         | What REMI is building, where each thing stands, what is expected of whom |

The Slack side is **not a summary of the other one with links back**. It is written to be read on
its own, in French, and someone should be able to answer "où en est-on ?" without ever leaving
Slack. Where the two disagree on detail, the repository wins and the canvas gets fixed at the audit.

### 3.5 What we are deliberately not adopting

| Not adopting                      | Why                                                                             |
| --------------------------------- | ------------------------------------------------------------------------------- |
| Scrum — sprints, points, velocity | Ceremony cost is fixed; at three people it is most of the day                   |
| Jira / Linear / Notion            | A fourth surface to keep in sync. Slack plus the repository is already two      |
| Daily stand-ups                   | The bet and the Friday recap carry it; three people do not need a daily meeting |
| A Slack copy of the specs         | State and conclusions cross into Slack. Specifications stay in one place        |
| Business+ (advanced AI, SSO)      | Priced for compliance organisations. Revisit past ~8 people (§ 19)              |

---

## 4. Decide these five things before you click anything

| #   | Decision      | Recommendation                                                                                                                                                                                                                                                                                                             |
| --- | ------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | Plan          | **Pro** — $7.25/user/month billed annually, $8.75 monthly. Pro unlocks everything this document uses: full message history, unlimited apps, Workflow Builder, lists, standalone canvases, channel email addresses, group huddles, Slack Connect. Business+ ($15) adds compliance features you do not need at three people. |
| 2   | Workspace URL | `remiai.slack.com` if free, else `remi-ai.slack.com`. It appears in every invitation — pick once.                                                                                                                                                                                                                          |
| 3   | Email domain  | The `@remiai.be` addresses. Ties the workspace to the brand domain rather than a personal Gmail, and makes domain-based joining possible later.                                                                                                                                                                            |
| 4   | Owners        | **Two: Jamie and Arnaud.** Never one — a single-owner workspace is a bus-factor incident. Morgane as Admin.                                                                                                                                                                                                                |
| 5   | Language      | **French**, in every channel the three of you share. Only the two technical channels are English. `CONVENTIONS.md` § Working languages already says so: _"French is the language of the conversation with them — Slack, email, meeting notes — whoever starts the thread."_                                                |

**Cost.** 3 × $7.25 × 12 ≈ **$261/year** (≈ 240 € HTVA), billed annually. Slack charges per _active_
member, so a fourth seat costs nothing until someone actually joins. Add the row to the tool and
cost register the moment the subscription exists — that is
[REMI-012](../intake/REMI-012-tool-and-cost-register.md):

```text
Outil : Slack Pro
À quoi ça sert : communication interne, cadrage produit, alertes et suivi des actions
Responsable : Arnaud (facturation) / Jamie (administration de l'espace)
Coût : ~21,75 $/mois HTVA (3 sièges × 7,25 $, facturation annuelle) — ~261 $/an
Renouvellement : annuel, reconduction automatique — à revoir à l'audit du mois précédant l'échéance
Données : conversation interne uniquement. Aucune donnée patiente, aucun secret (§ 15)
```

---

## 5. Create the workspace

1. <https://slack.com/get-started#/createnew>, signed in with your `@remiai.be` address.
2. Workspace name: **REMI AI**.
3. Skip the invitation prompt. Channels, canvases and the product board go in first — a workspace
   someone joins on day one with nothing in it is a workspace they invent their own habits in, and
   those habits are hard to undo.
4. Upgrade to Pro straight away: **workspace name → Settings & administration → Manage subscription
   → Upgrade → Pro → annual**.
5. Set the icon to the REMI logo and the description:

```text
REMI AI — le poste de pilotage de l'équipe. Ce qu'on construit, où on en est, ce qu'on attend de chacun.
```

---

## 6. Admin settings — once, in order

**Settings & administration → Workspace settings.**

| Setting                               | Set to                                | Why                                                                   |
| ------------------------------------- | ------------------------------------- | --------------------------------------------------------------------- |
| Channel management → create / archive | Everyone                              | Three people. Conventions keep the list short, not permissions        |
| Channel posting permissions           | Restrict `#annonces` to Owners/Admins | An announcements channel everyone posts in becomes a second `#equipe` |
| Messages → retention                  | **Keep everything**                   | Full history is what Pro is for                                       |
| Messages → editing / deletion         | On, 24-hour edit window               | Enough to fix a typo, not enough to rewrite a decision                |
| Apps → installation                   | Require approval (Jamie approves)     | Free apps are the usual way a workspace leaks data                    |
| Apps → Slack Connect                  | Owners approve each invitation        | § 16                                                                  |
| Security → two-factor authentication  | **Required for everyone**             | This workspace links to a repository that will link to health data    |
| Invitations                           | Owners / Admins only                  | Three people                                                          |
| Default channels for new members      | `#equipe`, `#annonces`, `#produit`    | Someone joining lands where the system explains itself                |
| Emails → send emails to channels      | Allow Owners/Admins                   | Needed for the ship note (§ 11.3)                                     |
| Display → default to threads          | On                                    | Threads are the difference between a searchable workspace and a wall  |

---

## 7. The channels

### 7.1 Two tiers, stated out loud

Eight channels the three of you share, and two that are Jamie's machine room. The second tier is
**explicitly not required reading** — that sentence is in each channel's description, because a
non-technical person who thinks they are supposed to keep up with a CI feed will either burn an hour
a week on it or mute the workspace entirely.

**Channels all three live in — French, always:**

| Channel          | Job                                                                                                   |
| ---------------- | ----------------------------------------------------------------------------------------------------- |
| `#equipe`        | The town square. Anything without a better home. The home canvas lives here                           |
| `#annonces`      | Low volume, high signal: the fortnightly bet, decisions taken, what shipped                           |
| `#produit`       | **The scoping room** — where a feature is discussed, shaped and agreed before anything is built (§ 8) |
| `#decisions`     | One thread per expensive or irreversible decision, with a named approver                              |
| `#idees-et-bugs` | The front door: an idea, a bug, a request. Raw capture; triaged within 48 h                           |
| `#argent`        | Costs, tools, invoices, the company, legal, data protection, Startup Boost                            |
| `#croissance`    | Marketing, content, recruiting the founding practitioners                                             |
| `#detente`       | Not work. Keeps the other seven clean                                                                 |

**Jamie's machine room — English, not required reading:**

| Channel         | Job                                                   |
| --------------- | ----------------------------------------------------- |
| `#dev-pipeline` | GitHub: pull requests, reviews, the delivery gates    |
| `#dev-alertes`  | Deploys, CI failures, runtime errors, database alerts |

Plus `#ext-<nom>` per outside party, created only when there is one (§ 16).

**Why no bot ever posts in the eight.** The one exception is the ship note, and only because it will
be written in French for exactly this audience (§ 11.3, § 17.2). Everything else that comes out of
GitHub or Vercel is English, technical, and constant — put it in `#produit` and within a week
Morgane is scrolling past a wall of `chore(deps): bump` to find a question addressed to her. The
machine tells Jamie; **Jamie tells the team, in French, at the moments § 8 defines.**

### 7.2 Naming

Lowercase, French, one word where possible. No prefix system beyond `dev-` and `ext-`: prefixes earn
their keep at fifty channels and cost clarity at ten. `dev-` means "technical, ignore unless you are
curious"; `ext-` means "someone from outside is in this channel — mind what you write".

**Archive anything idle for 90 days** at the monthly audit. Archived channels stay searchable on Pro.

### 7.3 Create them

Ten channels, all **public** — a private channel in a company of three is a DM with extra steps.

Rename the default channel first: click `#general` → _Edit_ → `equipe`. It keeps its history and its
everyone-is-a-member property.

For each channel: **+ → Create → Channel**, then open it, click its name, and paste the topic and
description below.

```text
# equipe
Topic: Le carré du village. Le canvas épinglé explique tout le reste.
Description: Tout ce qui n'a pas de meilleur endroit. Le canvas épinglé est la page d'accueil de l'entreprise : où on en est, qui fait quoi, ce qu'on attend de chacun, et à quoi sert chaque canal. Si vous ne deviez lire qu'une chose, c'est lui.
```

```text
# annonces
Topic: Signal uniquement — le pari de la quinzaine, les décisions, ce qui est livré.
Description: Peu de messages, tous importants : le pari de la quinzaine (ce qu'on construit et ce qu'on attend de chacun), les décisions prises, et une note en français à chaque fois que quelque chose part en production. Publication réservée aux propriétaires ; tout le monde répond en fil. Si vous ne suivez qu'un canal, suivez celui-ci.
```

```text
# produit
Topic: On cadre ici avant de construire. Une fonctionnalité = un fil.
Description: Le canal où le produit se décide. Une idée devient une fonctionnalité cadrée ici — le problème, pour qui, ce que ça change, ce qu'on ne fait pas — avant qu'une ligne de code soit écrite. C'est aussi ici que les maquettes se valident. Le tableau « Fonctionnalités » épinglé donne l'état de tout, à tout moment.
```

```text
# decisions
Topic: Un fil = une décision. Pilote, approbateur, échéance, puis « Décision : ».
Description: Les décisions coûteuses ou difficiles à annuler : un fournisseur, un prix, un engagement juridique, une dépense mensuelle. Ouvrez le fil avec le raccourci ⚡ « Demande de décision ». Une décision est prise quand le fil porte une réponse « Décision : … » signée par l'approbateur. Les petites décisions réversibles ne passent pas par ici — on les prend dans le fil concerné.
```

```text
# idees-et-bugs
Topic: La porte d'entrée. Une idée, un bug, une demande — déposez, on trie sous 48 h.
Description: Capture brute. Utilisez les raccourcis ⚡ « Signaler un bug » et « Proposer une idée » : ils posent les bonnes questions du premier coup. Rien ne se décide ici — chaque dépôt reçoit une réponse sous 48 h qui dit ce qu'il devient (fonctionnalité à cadrer, correction rapide, plus tard, ou non avec la raison), puis ✅.
```

```text
# argent
Topic: Coûts, outils, société, juridique, RGPD, Startup Boost.
Description: Tout ce qui coûte, rapporte ou engage la société. Les outils et leurs coûts se déclarent avec le raccourci ⚡ « Nouvel outil / nouveau coût ». Les échéances administratives et ce qui bloque le produit côté juridique vivent dans la liste « Actions ». Jamais de coordonnées bancaires ni d'identifiants ici : les documents sensibles vont dans le Drive, avec le lien ici.
```

```text
# croissance
Topic: Marketing, contenu, praticiennes fondatrices.
Description: L'acquisition et la relation : le site, le contenu, et surtout les praticiennes fondatrices (objectif ~15 pour la bêta). Chaque contact se déclare avec le raccourci ⚡ « Praticienne fondatrice ». Ce qu'une praticienne dit avec ses mots vaut plus que notre résumé — notez-le tel quel.
```

```text
# detente
Topic: Pas du travail. C'est le but.
Description: Le canal qui garde les sept autres propres.
```

```text
# dev-pipeline
Topic: GitHub — PRs, reviews, delivery gates. Bots only. Not required reading.
Description: Machine room. The GitHub app posts pull requests, reviews and comments for k0d0minio/remi-ai here. Morgane and Arnaud never need to read this channel — anything that concerns them is translated into #produit or #annonces. WIP limit: 2 features in flight, at most 1 in Build.
```

```text
# dev-alertes
Topic: Deploys, CI, runtime errors. Machines only. Not required reading.
Description: Machine room. Every alert ends in a thread reply — fixed (with the link), ignored (with the reason), or ticketed (with the ticket). An alert with no reply after one working day gets escalated with 🚨 in #equipe. Morgane and Arnaud never need to read this channel; anything that affects them arrives in #annonces in French.
```

---

## 8. The scoping loop — how a feature lives

This is the centre of the system. A feature travels through seven steps; each one has a place, an
owner, and a message that makes the step visible to everyone else. The pipeline's stages sit
underneath — Jamie runs them — but nobody outside the terminal needs to know the stage names to
follow what is happening.

| #   | Step                     | Where            | Who acts              | What the others see                                          |
| --- | ------------------------ | ---------------- | --------------------- | ------------------------------------------------------------ |
| 1   | L'idée                   | `#idees-et-bugs` | anyone                | The idea, and within 48 h what becomes of it                 |
| 2   | **Le cadrage**           | `#produit`       | all three             | A thread they can shape; the board row turns _en discussion_ |
| 3   | Cadrage validé           | `#produit`       | Morgane decides       | What will be built, in what order, and what is excluded      |
| 4   | La maquette              | `#produit`       | Morgane signs off     | A link they can click on a phone, and what to look at        |
| 5   | La construction          | (silent)         | Jamie                 | The board row, and the fortnightly bet                       |
| 6   | Les questions bloquantes | `#produit`       | Morgane/Arnaud answer | A question with a deadline, in the actions list              |
| 7   | La livraison             | `#annonces`      | Jamie announces       | What a user can now do that they could not before            |

**Steps 2, 3, 4, 6 and 7 are conversations with Morgane and Arnaud.** Step 5 is deliberately quiet:
during construction the board row and the bet say everything, and a running commentary on commits
would be noise to them. If a build takes more than a fortnight, that is what the next bet is for.

### 8.1 Step 2 — opening a scoping thread

The one habit that makes this work: **a feature is never built from a one-line idea.** The thread is
opened with the shape below, in `#produit`, and everyone answers in the thread. Use the ⚡ shortcut
« Nouvelle fonctionnalité à cadrer » (§ 13.4), or paste this:

```text
:mag: *Cadrage — <nom de la fonctionnalité>*

*Le problème.* <Ce qui coince aujourd'hui, pour qui, à quel moment. Pas la solution.>

*Pour qui.* <Une patiente ? Une praticienne ? Nous ? Décrivez la personne et le moment précis.>

*Aujourd'hui, sans ça.* <Ce que la personne fait à la place, et ce que ça lui coûte.>

*Ce qu'on imagine.* <Une esquisse, pas une spécification. Deux ou trois phrases.>

*Ce qu'on ne fait PAS dans cette version.* <Aussi important que le reste : c'est ce qui empêche une
fonctionnalité de doubler de taille en cours de route.>

*Questions ouvertes.* <Ce qu'on ne sait pas encore et qui changerait la construction.>

*Appétit.* <Combien de temps ça vaut : quelques jours ? une quinzaine ? Si ça vaut plus, on découpe.>

—
Morgane, Arnaud : répondez en fil. Ce cadrage est ouvert jusqu'au <date>. Rien ne se construit avant
qu'il soit validé.
```

Two things about that template are load-bearing. **« Ce qu'on ne fait pas »** is where scope creep
gets stopped, and it is far easier to agree an exclusion before building than to argue one during.
**« Appétit »** — Shape Up's word — sets the time the idea is worth _before_ anyone estimates, which
is the difference between "how long will this take" (a question that invites optimism) and "is this
worth two weeks" (a question the three of you can actually answer).

### 8.2 Step 3 — closing the scope

Morgane closes the thread. Not Jamie, and not silence: an unclosed scoping thread is the single most
common way a feature ends up built to the wrong shape.

```text
:white_check_mark: *Cadrage validé — <nom de la fonctionnalité>*

*On construit :*
• <ce que ça fera, en une phrase, du point de vue de la personne qui l'utilise>
• <…>

*On ne fait pas maintenant :* <la liste courte, gelée pour cette version>
*Appétit :* <quelques jours | une quinzaine>
*Questions encore ouvertes :* <celles qui ne bloquent pas le démarrage>

Validé par <Morgane|Arnaud> le <date>.
```

**Then the crossing (Jamie, same day).** The agreed scope becomes `/pipeline scope`, a `scope.md`
and one intake stub per feature PR — because the agents cannot read the thread. When that is done,
one reply closes the loop so the others see the handover happened:

```text
C'est passé côté construction. Découpé en <n> morceaux, dans cet ordre :
1. <ce que ça donne, en français, pas le nom technique>
2. <…>

Premier morceau en construction cette quinzaine. Le tableau « Fonctionnalités » est à jour.
```

### 8.3 Step 4 — signing off a prototype

The Design stage puts a real prototype on a live URL. That is the cheapest moment in the whole
system to change your mind, and it is wasted if the link arrives as an English bot message in a
channel nobody reads. So Jamie posts it, in `#produit`, in French, with instructions:

```text
:art: *Maquette à valider — <nom de la fonctionnalité>*

<lien>

Ça s'ouvre sur téléphone. Ce sont de fausses données : rien n'est enregistré, vous pouvez tout
cliquer.

*À regarder en particulier :*
1. <la question précise qu'on se pose — « est-ce que le premier écran est assez simple ? »>
2. <…>

*Ce qui n'est pas encore vrai :* <ce qui est simulé, pour éviter les faux problèmes>

Réponse souhaitée avant le <date>. Un « c'est bon » suffit ; si quelque chose cloche, dites-le avec
vos mots, je traduis.
```

« Je traduis » is not politeness. Morgane describing a problem as _« on dirait que ça me demande
trop de choses d'un coup »_ is more useful than her attempting a specification, and asking for the
former is what gets an answer in a day instead of a week.

### 8.4 Step 6 — the questions that block the build

Every ticket in `.icm/intake/` carries an **"Open questions — flag these on pickup"** section, on
purpose: the phases were proposed before Morgane reviewed them, and things the braindump does not
settle — how a meal is described, what counts as adherence, whether a patient can have two
practitioners — would otherwise be decided by accident, in code.

Those questions are useless in a markdown file she never opens. So: **an open question that blocks
work becomes a Slack post within a day of being hit**, and a row in the actions list (§ 10.2).

```text
:raising_hand: *Question qui bloque — <sujet>*

*Ce que je dois savoir :* <la question, en une phrase, sans jargon>

*Pourquoi ça bloque :* <ce que je ne peux pas construire tant que ce n'est pas tranché>

*Les options telles que je les vois :*
• <option A> — <ce que ça implique concrètement>
• <option B> — <ce que ça implique concrètement>

*Mon avis, si ça aide :* <une phrase, clairement étiquetée comme un avis>

*Pour qui :* <Morgane|Arnaud> · *Avant le :* <date> · *Si pas de réponse :* je pars sur <option>, et
on pourra changer d'avis, mais ça coûtera <ce que ça coûtera>.
```

The last line is the one that matters. A question with no default blocks forever; a question with a
stated default and a stated cost of changing later gets answered, because the reader can see what
their silence buys.

### 8.5 Step 7 — the ship note

Something reaching production is the moment the whole system is judged on. It arrives in `#annonces`
automatically: the Ship stage already emails its note through Resend, and § 11.3 points that email
at the channel. **The note must be written in French** — its audience is now Morgane and Arnaud, and
`CONVENTIONS.md` puts documents written for them in French (§ 17.2 covers the repo-side change).

Shape it like this, whoever writes it:

```text
:ship: *<Ce qu'une personne peut faire maintenant, en une phrase>*

*Pour qui :* <les patientes | les praticiennes | nous, en interne>
*Concrètement :* <deux ou trois phrases, du point de vue de la personne — pas de vocabulaire technique>
*Ce que ça ne fait pas encore :* <ce qui viendra plus tard, pour couper court aux attentes>
*Où le voir :* <lien>

Cadré le <date> dans #produit, construit en <durée>.
```

The last line closes the circle: the scoping thread it came from is one click away, which is how a
fortnight of work stops feeling like something that happened elsewhere.

### 8.6 What crosses into the repository, and when

The five crossings. Each is attached to a moment that already exists, so none depends on remembering.

| When                            | Jamie writes into the repository                                            |
| ------------------------------- | --------------------------------------------------------------------------- |
| A scope is agreed (step 3)      | `/pipeline scope` → `scope.md` + the intake stubs                           |
| A decision is taken             | The `Décision :` reply → the ticket, `.icm/docs/`, or `CONVENTIONS.md`      |
| A blocking question is answered | The answer → the ticket's open-questions section, or the `spec.md`          |
| The fortnightly bet             | Intake order adjusted to match what was actually agreed                     |
| Something ships                 | The run's record merges with the PR; the board row and the ship note follow |

And the reverse crossing — repository into Slack — happens at exactly two moments: **the bet**
(what is being built, what is expected of whom) and **the ship note**. Between them, the product
board carries the state.

---

## 9. The knowledge centre — canvases with content, not links

A canvas is a document attached to a channel. **Add one to every channel the three of you share,
pin it, and write it so it can be read on its own.** A canvas that says "see `.icm/docs/braindump/`"
has failed at its only job.

**How:** open the channel → the bookmark bar → **+ → Canvas** → paste → ⋮ → _Pin to channel_.
Markdown pastes and converts: headings, bullets, links, tables, checkboxes.

### 9.1 The home canvas — `#equipe`

The front page of the company. If someone reads one thing, this is it.

```markdown
# REMI AI — page d'accueil

## Ce qu'on construit

REMI accompagne les patientes entre deux consultations et donne aux praticiennes une vue sur ce qui
se passe réellement chez leurs patientes. Le cœur : une micro-action utile tout de suite, pas un
programme rigide.

La construction avance par phases. On ne saute pas une phase pour aller plus vite : chacune rend la
suivante possible.

| Phase | Ce que c'est                                                                              | Où on en est |
| ----- | ----------------------------------------------------------------------------------------- | ------------ |
| A     | Décider et déblayer — base de données, périmètre de la V2, registre des coûts             | <état>       |
| B     | Les fondations — comptes, modèle de données, protection des données, filets de sécurité   | <état>       |
| C     | **La boucle patiente** — onboarding immédiat, « Améliore mon assiette », le hub quotidien | <état>       |
| D     | Le tableau de bord praticienne — voir sa cohorte, ajuster à distance, inviter par QR      | <état>       |
| E     | Le parseur — transformer les documents des praticiennes en règles exploitables            | <état>       |
| F     | Argent et bêta — abonnements praticiennes, ~15 praticiennes fondatrices, indicateurs      | <état>       |

Le détail de chaque fonctionnalité vit dans le tableau **Fonctionnalités** (épinglé dans #produit).

## Qui fait quoi

| Personne | Rôle                                                  | Tranche                                              |
| -------- | ----------------------------------------------------- | ---------------------------------------------------- |
| Morgane  | Fondatrice — produit, vision, positionnement          | Produit, direction, prix                             |
| Arnaud   | Société — juridique, finances, administratif          | Légal, finances, RGPD, contrats, dépenses mensuelles |
| Jamie    | Construction — architecture, développement, livraison | Technique, outillage, livraison                      |

## Où regarder, selon la question

| La question                               | Le canal                                              |
| ----------------------------------------- | ----------------------------------------------------- |
| Où en est cette fonctionnalité ?          | Le tableau **Fonctionnalités**, épinglé dans #produit |
| Qu'est-ce qu'on attend de moi ?           | La liste **Actions**, épinglée dans #equipe           |
| Qu'est-ce qui a été décidé, et pourquoi ? | #decisions                                            |
| Qu'est-ce qui est parti en production ?   | #annonces                                             |
| J'ai une idée / j'ai vu un bug            | #idees-et-bugs, bouton ⚡                             |
| Combien ça coûte, qui doit signer quoi    | #argent                                               |

Les canaux `dev-` sont la salle des machines. **Vous n'avez jamais besoin de les lire** : tout ce qui
vous concerne est traduit ici, en français.

## Le rythme

| Quand                                | Quoi                                                          |
| ------------------------------------ | ------------------------------------------------------------- |
| Lundi, une semaine sur deux, 9 h 30  | Le pari de la quinzaine — 30 min, tous les trois              |
| Vendredi, 16 h                       | Récapitulatif de la semaine — à l'écrit, chacun quand il peut |
| Dernier vendredi après-midi du cycle | Refroidissement : nettoyage, documentation, dette             |
| Premier lundi du mois, 10 h          | Audit — on vérifie que ce qui est écrit ici est encore vrai   |

**Deux fonctionnalités en cours au maximum, une seule en construction.** C'est la règle qui garantit
que les choses se terminent.

## Comment une fonctionnalité naît

1. Une idée arrive dans #idees-et-bugs.
2. Si elle vit, elle est **cadrée** dans #produit : le problème, pour qui, ce qu'on ne fait pas.
   Tout le monde répond. Rien n'est construit avant que Morgane valide le cadrage.
3. Une **maquette** cliquable arrive dans #produit. C'est le moment le moins cher pour changer d'avis.
4. Construction. Le tableau suit l'état ; le pari dit ce qui est en cours.
5. Les **questions bloquantes** arrivent dans #produit avec une date. Sans réponse, on part sur
   l'option par défaut annoncée.
6. Livraison : une note en français dans #annonces qui dit ce qu'une personne peut faire maintenant.

## Six règles

1. **Une réponse va dans un fil**, pas en message de premier niveau.
2. **Pas de décision en message privé.** Les MP servent à « tu es dispo à 15 h ? ».
3. **Un cadrage se ferme explicitement** — validé ou abandonné, jamais laissé en suspens.
4. **Aucun secret ici** : ni clé, ni mot de passe, ni donnée patiente. Si ça arrive, on révoque.
5. **Une question posée avec une date reçoit une réponse avant cette date**, même « je ne sais pas ».
6. **Un canal sans activité depuis 90 jours est archivé** à l'audit mensuel.

## Les émojis qui veulent dire quelque chose

| Émoji | Sens                                          |
| ----- | --------------------------------------------- |
| 👀    | Vu, je m'en occupe                            |
| ✅    | Fait                                          |
| 🧵    | Réponds en fil                                |
| 🚢    | Parti en production                           |
| 🧊    | Gelé pour ce cycle — on n'y touche pas        |
| 🚨    | Bloqué : quelqu'un doit intervenir maintenant |

## Quatre choses à savoir avant de lire un vieux document

1. **Il n'y a pas de pilote signé.** ~15 praticiennes est un objectif de recrutement pour la bêta.
2. **Il n'y a ni date de facturation ni revenu** à ce jour.
3. **La base de données est tranchée : Supabase.**
4. **La V2 n'est pas un portage de la v1.** Journal alimentaire 7 jours, questionnaire
   psychologique, moteur nutrigénomique et plans hebdomadaires rigides sont hors périmètre.

## Premier jour

- [ ] Lire ce canvas.
- [ ] Ouvrir le tableau **Fonctionnalités** (#produit) et la liste **Actions** (#equipe).
- [ ] Régler ses notifications : mentions uniquement partout, sauf #annonces et #produit.
- [ ] Mettre ses heures de travail dans son profil — Slack retiendra les notifications en dehors.
- [ ] Se présenter dans #equipe.
```

Replace `<état>` with one of: `pas commencé` · `en cours` · `terminé`. Six words, updated at the
monthly audit. It is the single most-read line in the workspace.

### 9.2 `#produit`

```markdown
# Comment on cadre une fonctionnalité

**Rien ne se construit sans cadrage validé.** Ça paraît lourd ; c'est ce qui évite de construire
pendant deux semaines la mauvaise chose.

## Un fil = une fonctionnalité

Ouvrez avec le raccourci ⚡ « Nouvelle fonctionnalité à cadrer ». Le formulaire pose six questions ;
répondez court, on affine en fil.

## Les six questions, et pourquoi

| Question                               | Ce qu'elle empêche                                              |
| -------------------------------------- | --------------------------------------------------------------- |
| Le problème (pas la solution)          | Construire une solution élégante à un problème que personne n'a |
| Pour qui, à quel moment                | Une fonctionnalité « pour tout le monde », donc pour personne   |
| Aujourd'hui, sans ça                   | Confondre une gêne réelle avec une préférence                   |
| Ce qu'on imagine                       | — (c'est l'esquisse, pas la spécification)                      |
| **Ce qu'on ne fait pas**               | Qu'une quinzaine devienne un trimestre                          |
| L'appétit : ça vaut combien de temps ? | Estimer avant d'avoir décidé si ça vaut le coup                 |

## Qui tranche

Morgane. Un cadrage se termine par une réponse « Cadrage validé » ou « On abandonne, parce que … ».
Un fil laissé ouvert bloque tout le reste : c'est la file d'attente.

## Les maquettes

Une maquette cliquable arrive ici avant la construction. Fausses données, rien n'est enregistré.
Dites ce qui cloche avec vos mots — la traduction en langage technique, c'est le travail de Jamie.

## Les questions bloquantes

Elles arrivent ici avec une date et une option par défaut. Sans réponse à la date, on part sur
l'option annoncée : c'est réversible, mais ça coûte, et le coût est écrit dans le message.

## Le tableau

Le tableau **Fonctionnalités** épinglé donne l'état de tout, à tout moment. Il est à jour au pari du
lundi et à chaque livraison.
```

### 9.3 `#decisions`

```markdown
# Comment on décide

Un fil = une décision. Ouvrez avec le raccourci ⚡ « Demande de décision ».

## Ce qui passe par ici

Ce qui est **coûteux ou difficile à annuler** : un fournisseur, un prix, une architecture, un
engagement juridique, une dépense mensuelle. Le reste se décide dans le fil concerné — une décision
réversible en une journée ne mérite pas de cérémonie.

## Les quatre rôles

- **Pilote** — pousse la décision et rédige. Une personne.
- **Approbateur** — tranche. Une personne.
- **Contributeurs** — donnent leur avis avant.
- **Informés** — le savent après.

| Domaine                                  | Approbateur      |
| ---------------------------------------- | ---------------- |
| Produit, direction, positionnement, prix | Morgane          |
| Juridique, finances, société, RGPD       | Arnaud           |
| Architecture, code, outillage, livraison | Jamie            |
| Toute dépense mensuelle                  | Arnaud + Morgane |

## Une décision est prise quand le fil porte ceci

Décision : <ce qui est décidé, une phrase>
Approuvé par : <nom>, le <date>
Ce qui change concrètement : <…>
À revoir : <date ou « jamais »>

Sans cette réponse, ce n'est pas une décision — c'est une conversation.
```

### 9.4 `#argent`

```markdown
# Argent, outils, société

## Ce qui vit ici

Les coûts, les outils, les factures, les échéances de la société, le juridique, la protection des
données, le dossier Startup Boost.

## Déclarer un outil

Raccourci ⚡ « Nouvel outil / nouveau coût » : l'outil, à quoi il sert, le coût mensuel HTVA, le
responsable, la date de renouvellement, et si des données personnelles y transitent. Cette dernière
question conditionne un contrat de sous-traitance (DPA) avant tout enregistrement réel.

## Toute dépense mensuelle est une décision

Elle passe par #decisions, approbateurs Arnaud + Morgane. Un essai gratuit qui bascule en payant est
une dépense mensuelle.

## Les échéances

Ce qui a une date et un responsable vit dans la liste **Actions**, pas dans un fil. Un fil se perd ;
une ligne avec une date ne se perd pas.

## Jamais ici

Coordonnées bancaires, identifiants, factures avec un numéro de compte complet. Le Drive, avec le
lien ici.
```

---

## 10. The two lists — state, and what is expected of whom

Slack Lists are included on Pro. Two of them answer the two questions Morgane and Arnaud should
never have to ask anyone.

Earlier drafts of this document argued against a second backlog, on the grounds that `.icm/intake/`
already is one. That argument is wrong for this company: a backlog only two thirds of the team
cannot read is not a shared backlog. The board below is not a copy of the tickets — it holds
**state and expectations, never specifications** — and it is updated at two fixed moments, so the
drift stays bounded and visible.

### 10.1 `Fonctionnalités` — the product board

Create it from `#produit` (**+ → List**), then pin it to the channel.

| Column               | Type   | Values                                                                                                         |
| -------------------- | ------ | -------------------------------------------------------------------------------------------------------------- |
| Fonctionnalité       | Text   | In plain French, from the user's point of view — « Améliore mon assiette », not « REMI-019 »                   |
| État                 | Select | idée · en cadrage · cadrée, en attente · maquette à valider · en construction · à tester · livrée · abandonnée |
| Phase                | Select | A · B · C · D · E · F                                                                                          |
| Pour qui             | Select | patientes · praticiennes · nous, en interne                                                                    |
| On attend            | Person | Empty means nothing is blocked on a human                                                                      |
| Quoi exactement      | Text   | « valider la maquette », « répondre à la question sur l'adhérence » — never empty when _On attend_ is set      |
| Fil de cadrage       | Text   | Link to the `#produit` thread                                                                                  |
| Dernière mise à jour | Date   | —                                                                                                              |

**The two columns that make it worth maintaining are _On attend_ and _Quoi exactement_.** A board
that only shows state tells people what is happening; those two also tell them what to do about it.
Morgane filtering the board on her own name is the whole "what do I need to do" answer, and it takes
her four seconds.

**Updated twice:** at the Monday bet, and whenever a feature changes state. Both are moments that
already exist, which is why this one survives.

### 10.2 `Actions` — what the company owes, and to whom

Create it from `#equipe` and pin it. This is the one that stops Arnaud's half of the company from
living in three email threads and one person's memory.

| Column        | Type   | Values                                                                         |
| ------------- | ------ | ------------------------------------------------------------------------------ |
| Ce qu'il faut | Text   | One line, an action — « obtenir le numéro BCE », not « société »               |
| Responsable   | Person | One person. Never two                                                          |
| État          | Select | à faire · en cours · en attente d'un tiers · fait                              |
| Échéance      | Date   | —                                                                              |
| Domaine       | Select | société · juridique / RGPD · finances · Startup Boost · fournisseurs · produit |
| Ça bloque     | Text   | What cannot move until this is done — empty if nothing                         |
| Lien          | Text   | The Slack thread, the Drive file, or the document                              |

_Ça bloque_ is what turns an administrative chore into an obvious priority. « Obtenir les DPA
signés » sitting undated for a month reads as paperwork; « Obtenir les DPA signés — bloque : le
premier enregistrement patient réel » reads as the thing standing between the company and its beta.

**Seed it now**, from `history/info-gathering.md` and the Phase A tickets — every one of these is
real and currently tracked nowhere Arnaud can see:

```text
Obtenir le numéro BCE/KBO, l'adresse du siège, le numéro de TVA, la date de constitution — Arnaud — société — bloque : les pages légales, la facturation, le dossier Startup Boost
Récupérer l'accès au registrar / DNS de remiai.be — Arnaud — fournisseurs — bloque : mettre le produit sur le domaine de la marque
Confirmer qui reçoit morgane@ et arnaud@ (Google Workspace ou autre) — Arnaud — société — bloque : le formulaire de contact du site public
Faire signer les DPA (Vercel, Supabase, Anthropic, autres) — Arnaud — juridique / RGPD — bloque : le premier enregistrement de santé réel
Donner les coordonnées du comptable et de l'avocat — Arnaud — société — bloque : la validation des CGV et du calendrier de conservation
Vérifier les critères d'éligibilité Startup Boost et trancher go / no-go — Jamie + Arnaud — Startup Boost — bloque : la rédaction du dossier
Confirmer le périmètre gelé de la V2 — Morgane — produit — bloque : le découpage des phases C et D
```

### 10.3 What is deliberately not in a list

Specifications, acceptance criteria, technical detail. Those live in `spec.md` and the tickets,
because they are read by agents and change during a build. Putting them in Slack would guarantee two
versions of the same requirement within a fortnight, and the one Slack holds would be the stale one.

**The line to hold:** Slack lists say **what** and **who** and **when**. The repository says **how**.

---

## 11. Alerts and integrations

Four things, and a strict rule about where their output lands: **nothing English or automatic posts
in the eight shared channels**, with the single exception of the ship note, which is written in
French for that audience.

### 11.1 GitHub — into the machine room only

Install from <https://slack.github.com> → _Add to Slack_, then:

```text
/github signin
```

**In `#dev-pipeline`** — the app subscribes to `issues`, `pulls`, `commits`, `releases` and
`deployments` by default, so the second line matters as much as the first (this repo keeps specs in
PRs and issues out of the way):

```text
/github subscribe k0d0minio/remi-ai
/github unsubscribe k0d0minio/remi-ai issues commits releases deployments
/github subscribe k0d0minio/remi-ai reviews comments
```

**In `#dev-alertes`** — what happens to `main`, and what CI says:

```text
/github subscribe k0d0minio/remi-ai
/github unsubscribe k0d0minio/remi-ai issues pulls releases deployments
/github subscribe k0d0minio/remi-ai commits:main
/github subscribe k0d0minio/remi-ai workflows:{name:"Quality" branch:"main"}
/github subscribe k0d0minio/remi-ai workflows:{name:"Gates" branch:"main"}
/github subscribe k0d0minio/remi-ai workflows:{name:"Pipeline" branch:"main"}
```

The three workflow names come from `.github/workflows/{quality,gates,pipeline}.yaml`.

**Nothing goes to `#produit`.** An earlier version of this document routed demo PRs there with a
`+label:"type:design"` filter. It is technically neat and practically wrong: the message would
arrive in English, formatted for a developer, in the channel where Morgane is supposed to be able to
find questions addressed to her. The prototype reaches her through § 8.3 instead — Jamie's French
post, with what to look at and by when.

Useful afterwards:

```text
/github subscribe list
/github unsubscribe k0d0minio/remi-ai
```

### 11.2 Vercel — deploys

Install from <https://vercel.com/marketplace/slack>, then in `#dev-alertes`:

```text
/vercel subscribe
```

Choose **deployment failed**, **deployment succeeded (production only)**, and **comments**. Not
preview successes: six apps × every push is exactly the noise that teaches people to mute a channel.

### 11.3 The ship note — Resend into `#annonces`

The pipeline already sends this. `pipeline/scripts/send-ship-note.sh` emails the Ship stage's note
through Resend to whatever is in `SHIP_NOTE_RECIPIENTS`, and its own header says the recipient is
_"normally ONE address: a channel's inbound email, so the note lands where the owners already read
everything."_ That channel is `#annonces`.

1. `#annonces` → channel name → **Integrations** → **Send emails to this channel** → **Get email
   address**.
2. Copy the address Slack generates (it looks like `remi-ai-aaa1234@remiai.slack.com`).
3. Set it as `SHIP_NOTE_RECIPIENTS` wherever the pipeline scripts run — your shell profile or
   `.env.local`. **Not in this file and not in git**: `ENV.md` catalogues names, never values, and
   that variable already has its row.
4. In the same dialog set the sender name to `REMI · livraisons` and the icon to 🚢, so ship notes
   are visually distinct from human announcements.
5. Test before trusting it:

```bash
pipeline/scripts/send-ship-note.sh <slug>          # dry run — prints, sends nothing
pipeline/scripts/send-ship-note.sh <slug> --send   # sends
```

This only works if the note itself is written in French, for Morgane and Arnaud — see § 17.2.

### 11.4 Supabase — once REMI-013 lands

No first-party Slack app; the route is a **database webhook → a Slack workflow**, which Pro covers.

1. `#dev-alertes` → **Automations → Workflows → New workflow → From a webhook**.
2. Variables, all text: `event`, `table`, `severity`, `detail`.
3. One step, _Send a message to a channel_ → `#dev-alertes`:

```text
:rotating_light: Supabase — {{event}}
Table: {{table}} · Severity: {{severity}}
{{detail}}

Reply in thread: fixed / ignored (why) / ticketed (link).
```

4. Publish, copy the webhook URL, create the Supabase webhook (Dashboard → _Database_ → _Webhooks_)
   with a JSON body whose keys match those four names.
5. Test it:

```bash
curl -X POST -H 'Content-Type: application/json' \
  -d '{"event":"test","table":"none","severity":"info","detail":"Webhook wiring test — ignore."}' \
  '<the webhook URL Slack gave you>'
```

That URL is a secret: anyone holding it can post into the channel. It lives in Supabase's config,
never in the repository.

### 11.5 Error tracking — once REMI-017 lands

[REMI-017](../intake/REMI-017-error-tracking.md) picks the tracker. Whatever it picks, the routing
rule is decided now so the ticket need not re-litigate it: **production, unhandled, first occurrence
→ `#dev-alertes`. Everything else → nowhere.** And when an incident affects users, it is announced
in `#annonces` in French, by a human — a stack trace is not a status update.

### 11.6 Google Calendar

Install it and connect the `@remiai.be` account. It is what makes § 12's rhythm real rather than
aspirational: the bet, the recap and the audit exist as recurring events with all three people on
them.

```text
/gcal help
```

### 11.7 Optional — Claude in Slack

Claude Code can install its own Slack app (`/install-slack-app` from the CLI), which lets you ask
questions of the codebase from a phone. Genuinely useful for Jamie; irrelevant to the other two. Set
it up after the rest works, and keep it in the machine room.

---

## 12. The rhythm

Four recurring moments. Put all four in Google Calendar with all three people invited — an unwritten
rhythm is a rhythm that survives exactly until the first busy fortnight.

### 12.1 Le pari de la quinzaine — Monday, every second week, 09:30, 30 minutes

A huddle in `#annonces`. Huddle notes are recorded automatically on paid plans, so "what did we say
last time" answers itself. Fixed agenda, posted automatically by the workflow in § 13.8:

1. **Ce qui est parti** since the last bet — two minutes, no commentary.
2. **Ce qui est en cours** — the WIP limit checked out loud: 2 features, 1 in construction.
3. **Le pari** — what the fortnight is for, drawn from the board in phase order.
4. **Ce qu'on attend de chacun** — the half that matters: what Morgane and Arnaud owe, by when.
5. **Ce qu'on ne fait pas** 🧊 — the short frozen list.
6. **Ce qui bloque** — decisions and answers outstanding.

Written once, as a reply, and it does not change mid-cycle except for a production incident.

### 12.2 Le récap du vendredi — Friday, 16:00, written not spoken

Three lines in a thread: what shipped, what slipped and why, what is blocking Monday. Nobody
attends anything. What nobody writes disappears — this is the only weekly trace kept.

### 12.3 Le refroidissement — the last Friday afternoon of the cycle

No bets. Cleanup, documentation, dependency bumps, the `chore` lane. A cycle with no cooldown
borrows from the next one, and the debt compounds quietly.

### 12.4 L'audit — first Monday of the month, 10:00, 30 minutes

The half-hour that stops this system rotting. The workflow in § 13.14 posts the checklist; the
important items are:

- **The home canvas's phase table** — are the six `<état>` words still true?
- **The product board** — does every row's state match reality, and does every _On attend_ still
  have a live _Quoi exactement_?
- **The actions list** — anything overdue, anything whose _Ça bloque_ has become urgent.
- **Slack against the repository** — do the board and `.icm/intake/` still agree on what is being
  built and in what order? This is the drift check that Rule 1 and Rule 2 depend on.
- **Documentary drift** — `.icm/docs/README.md` records that the business pages in `apps/docs` have
  not been reconciled with the braindump. How many are left? One fewer than last month?
- **Channels** — anything idle for 90 days gets archived, today, not "soon".
- **Costs** — any renewal in the next 30 days you no longer want, cancelled today.

---

## 13. Workflows and forms

### 13.1 How the builder works, once

**Automations → Workflows → New workflow.** A workflow is a **trigger** plus **steps**. Publish it,
then add it to a channel so it appears under the ⚡ shortcuts button at the bottom of the message
box.

Three things worth knowing before building a dozen:

- **Pro has no conditional branching** — that is a Business+ feature. Every recipe below is linear:
  collect, post, done. Where a branch would be natural, a human reply does the branching.
- **Form answers become variables** — after a _Collect information_ step, each field is available as
  `{{Field name}}`. The blocks below use the exact labels, so pasting works; rename a field and you
  must rename it in the message too.
- **Test each one yourself before telling anyone it exists.** A form that posts to the wrong channel
  teaches people not to use forms.

Build them in this order. The first four carry most of the value; 13.4 and 13.5 are the ones this
whole document exists for.

### 13.2 « Signaler un bug » → `#idees-et-bugs`

Shortcut, added to `#idees-et-bugs` and `#produit`.

```text
Field 1 — Qu'est-ce qui ne marche pas ?  (short answer, required)
Field 2 — Où l'avez-vous vu ?  (select, required)
         Options: l'application · l'espace praticienne · le site public · le centre d'aide · la maquette · autre
Field 3 — Comment le reproduire, étape par étape ?  (long answer, required)
Field 4 — Qu'est-ce qui devrait se passer à la place ?  (long answer, required)
Field 5 — Gravité  (select, required)
         Options: bloquant (impossible de continuer) · gênant · cosmétique
Field 6 — Lien ou capture d'écran  (short answer, optional)
```

```text
:beetle: *Bug signalé par {{person who submitted}}*

*Ce qui ne marche pas :* {{Qu'est-ce qui ne marche pas ?}}
*Où :* {{Où l'avez-vous vu ?}} · *Gravité :* {{Gravité}}

*Reproduction :*
{{Comment le reproduire, étape par étape ?}}

*Attendu :* {{Qu'est-ce qui devrait se passer à la place ?}}
*Complément :* {{Lien ou capture d'écran}}

Réponse sous 48 h : corrigé · à corriger, planifié · pas un bug (avec la raison).
```

Those six questions are exactly what the `bug` fast lane needs to reproduce before fixing. A report
that arrives complete goes straight into the lane; one that arrives as « ça marche pas » costs three
round-trips, and those happen at everyone's slowest speed.

### 13.3 « Proposer une idée » → `#idees-et-bugs`

```text
Field 1 — L'idée, en une phrase  (short answer, required)
Field 2 — Quel problème ça résout, et pour qui ?  (long answer, required)
         Placeholder: Une patiente ? Une praticienne ? Nous ? Décrivez la personne et le moment.
Field 3 — Qu'est-ce qui se passe aujourd'hui sans ça ?  (long answer, required)
Field 4 — Domaine  (select, required)
         Options: produit · acquisition · notre façon de travailler · je ne sais pas
Field 5 — Urgence ressentie  (select, required)
         Options: maintenant · au prochain cycle · un jour peut-être
```

```text
:bulb: *Idée de {{person who submitted}}* — {{L'idée, en une phrase}}

*Le problème :* {{Quel problème ça résout, et pour qui ?}}
*Aujourd'hui sans ça :* {{Qu'est-ce qui se passe aujourd'hui sans ça ?}}
*Domaine :* {{Domaine}} · *Urgence :* {{Urgence ressentie}}

Une idée n'est pas un engagement. Réponse sous 48 h ; si elle vit, elle part en cadrage dans
#produit et personne ne construit avant.
```

### 13.4 « Nouvelle fonctionnalité à cadrer » → `#produit`

The most important workflow in the workspace. Shortcut in `#produit`, `#idees-et-bugs`, `#equipe`.

```text
Field 1 — Le nom de la fonctionnalité, en français  (short answer, required)
         Placeholder: du point de vue de la personne qui l'utilise — « Améliore mon assiette »
Field 2 — Le problème (pas la solution)  (long answer, required)
         Placeholder: Ce qui coince aujourd'hui, pour qui, à quel moment.
Field 3 — Pour qui, et à quel moment  (select, required)
         Options: une patiente · une praticienne · nous, en interne
Field 4 — Aujourd'hui, sans ça, il se passe quoi ?  (long answer, required)
Field 5 — Ce qu'on imagine (une esquisse, pas une spécification)  (long answer, required)
Field 6 — Ce qu'on ne fait PAS dans cette version  (long answer, required)
Field 7 — Appétit : ça vaut combien de temps ?  (select, required)
         Options: quelques jours · une quinzaine · plus — donc à découper
Field 8 — Questions ouvertes  (long answer, optional)
Field 9 — Cadrage ouvert jusqu'au  (date, required)
```

```text
:mag: *Cadrage — {{Le nom de la fonctionnalité, en français}}*
Ouvert par {{person who submitted}} · réponses souhaitées avant le {{Cadrage ouvert jusqu'au}}

*Le problème.* {{Le problème (pas la solution)}}
*Pour qui.* {{Pour qui, et à quel moment}}
*Aujourd'hui, sans ça.* {{Aujourd'hui, sans ça, il se passe quoi ?}}
*Ce qu'on imagine.* {{Ce qu'on imagine (une esquisse, pas une spécification)}}
*Ce qu'on ne fait PAS dans cette version.* {{Ce qu'on ne fait PAS dans cette version}}
*Appétit.* {{Appétit : ça vaut combien de temps ?}}
*Questions ouvertes.* {{Questions ouvertes}}

Morgane, Arnaud : tout se discute en fil. Rien ne se construit avant un « Cadrage validé ».
Ajoutez la ligne au tableau *Fonctionnalités* en état « en cadrage ».
```

Field 6 is required on purpose. A scope without an explicit exclusion list is not a scope; it is an
intention, and intentions grow during construction.

### 13.5 « Question qui bloque » → `#produit`

The workflow that unblocks builds. Shortcut in `#produit` and `#dev-pipeline`.

```text
Field 1 — La question, en une phrase, sans jargon  (short answer, required)
Field 2 — Pourquoi ça bloque  (long answer, required)
Field 3 — Les options, une par ligne, avec ce que chacune implique  (long answer, required)
Field 4 — Mon avis, si ça aide  (long answer, optional)
Field 5 — Qui peut répondre ?  (person, required)
Field 6 — Réponse souhaitée avant le  (date, required)
Field 7 — Sans réponse, je pars sur…  (short answer, required)
Field 8 — …et changer d'avis plus tard coûtera  (short answer, required)
```

```text
:raising_hand: *Question qui bloque — {{La question, en une phrase, sans jargon}}*
Pour {{Qui peut répondre ?}} · avant le {{Réponse souhaitée avant le}}

*Pourquoi ça bloque :* {{Pourquoi ça bloque}}

*Les options :*
{{Les options, une par ligne, avec ce que chacune implique}}

*Mon avis :* {{Mon avis, si ça aide}}

*Sans réponse d'ici là*, je pars sur : {{Sans réponse, je pars sur…}}
Changer d'avis ensuite coûtera : {{…et changer d'avis plus tard coûtera}}

Ajouté à la liste *Actions*.
```

Fields 7 and 8 are the design. A question with no default blocks indefinitely; a question with a
stated default and a stated cost of reversal gets answered, because the reader can see exactly what
their silence is buying.

### 13.6 « Demande de décision » → `#decisions`

```text
Field 1 — La décision à prendre, formulée comme une question  (short answer, required)
Field 2 — Les options envisagées  (long answer, required)
         Placeholder: Une par ligne. Trois maximum — au-delà, c'est encore une exploration.
Field 3 — Ce qui se passe si on ne décide pas  (long answer, required)
Field 4 — Qui tranche ?  (select, required)
         Options: Morgane (produit, direction, prix) · Arnaud (juridique, finances, société) · Jamie (technique, livraison) · Arnaud + Morgane (dépense mensuelle)
Field 5 — Facile à annuler ?  (select, required)
         Options: oui, réversible en une journée · non, on vit avec pendant des mois
Field 6 — Échéance  (date, required)
```

```text
:balance_scale: *Décision demandée par {{person who submitted}}*

*Question :* {{La décision à prendre, formulée comme une question}}
*Approbateur :* {{Qui tranche ?}} · *Échéance :* {{Échéance}} · *Réversible :* {{Facile à annuler ?}}

*Options :*
{{Les options envisagées}}

*Si on ne décide pas :* {{Ce qui se passe si on ne décide pas}}

{{Qui tranche ?}} : c'est pris quand ce fil porte une réponse « Décision : … ».
```

### 13.7 « Maquette à valider » → `#produit`

```text
Field 1 — La fonctionnalité  (short answer, required)
Field 2 — Le lien  (short answer, required)
Field 3 — À regarder en particulier (une question par ligne)  (long answer, required)
Field 4 — Ce qui n'est pas encore vrai dans la maquette  (long answer, required)
Field 5 — Qui valide ?  (person, required)
Field 6 — Réponse souhaitée avant le  (date, required)
```

```text
:art: *Maquette à valider — {{La fonctionnalité}}*
{{Qui valide ?}}, avant le {{Réponse souhaitée avant le}}

{{Le lien}}

Ça s'ouvre sur téléphone. Fausses données : rien n'est enregistré, cliquez partout.

*À regarder :*
{{À regarder en particulier (une question par ligne)}}

*Pas encore vrai :* {{Ce qui n'est pas encore vrai dans la maquette}}

Un « c'est bon » suffit. Si quelque chose cloche, dites-le avec vos mots — je traduis.
```

### 13.8 Le pari de la quinzaine → `#annonces`

Scheduled, Monday 09:15, Europe/Brussels. (Slack schedules weekly; run it weekly and let the off
weeks be a two-minute confirmation.)

```text
:dart: *Pari de la quinzaine — semaine du {{date}}*

Huddle à 9 h 30, 30 minutes. Ordre du jour :

1. *Ce qui est parti* depuis le dernier pari.
2. *Ce qui est en cours* — maximum 2, une seule en construction.
3. *Le pari* — ce qu'on construit, tiré du tableau *Fonctionnalités*, dans l'ordre des phases.
4. *Ce qu'on attend de chacun* — Morgane, Arnaud : ce qui est sur vous pour ces deux semaines.
5. *Ce qu'on ne fait pas* 🧊.
6. *Ce qui bloque* — décisions et réponses en attente.

Le pari s'écrit en réponse à ce message, une fois, et ne change pas en cours de route.
```

Second step — the template to fill in as that reply:

```text
*Pari : du {{date}} au <date + 2 semaines>*

*On construit :*
• <la fonctionnalité, et ce qu'une personne pourra faire à la fin>
• <…>

*Ce qu'on attend de vous :*
• Morgane : <quoi, avant quand>
• Arnaud : <quoi, avant quand>

*On ne fait pas 🧊 :* <liste courte>
*En attente d'une réponse :* <qui doit trancher quoi>
*Refroidissement :* vendredi <date> après-midi.
```

### 13.9 Le récap du vendredi → `#annonces`

Scheduled, Friday 16:00.

```text
:ship: *Récap de la semaine — {{date}}*

Trois réponses en fil, une ligne chacune :

1. *Parti en production* — ce qu'une personne peut faire aujourd'hui et qui n'existait pas lundi.
2. *Ce qui a glissé, et pourquoi* — juste le fait, sans justification. Un pari qui glisse deux fois
   d'affilée est un pari mal taillé, et c'est une information utile.
3. *Ce qui bloque lundi* — la décision, la validation ou l'information qui manque.

Ce que personne n'écrit ici disparaît.
```

### 13.10 « Nouvel outil / nouveau coût » → `#argent`

```text
Field 1 — L'outil ou le service  (short answer, required)
Field 2 — À quoi il sert, en une phrase  (short answer, required)
Field 3 — Coût mensuel HTVA  (short answer, required)
         Placeholder: en euros, par mois, hors TVA — p. ex. 21,75 €
Field 4 — Responsable  (person, required)
Field 5 — Renouvellement ou fin d'essai  (date, required)
Field 6 — Des données personnelles y transitent-elles ?  (select, required)
         Options: non · oui, données de l'équipe · oui, données de patientes ou de praticiennes · je ne sais pas
```

```text
:credit_card: *Nouvel outil déclaré par {{person who submitted}}*

*Outil :* {{L'outil ou le service}} — {{À quoi il sert, en une phrase}}
*Coût :* {{Coût mensuel HTVA}} /mois HTVA · *Responsable :* {{Responsable}}
*Renouvellement :* {{Renouvellement ou fin d'essai}}
*Données personnelles :* {{Des données personnelles y transitent-elles ?}}

À faire : ajouter la ligne au registre des coûts, et une ligne dans *Actions* pour l'échéance.
Si des données de patientes ou de praticiennes transitent, un DPA est requis avant le premier
enregistrement réel — ouvrez une décision dans #decisions.
```

### 13.11 « Praticienne fondatrice » → `#croissance`

```text
Field 1 — Nom  (short answer, required)
Field 2 — Où l'avons-nous rencontrée ?  (short answer, required)
Field 3 — Spécialité / type de pratique  (short answer, required)
Field 4 — Combien de patientes, à peu près ?  (short answer, optional)
Field 5 — Où en est-on ?  (select, required)
         Options: premier contact · démo prévue · démo faite · intéressée, en attente · engagée pour la bêta · non
Field 6 — Prochaine action, et pour quand ?  (short answer, required)
Field 7 — Ce qu'elle a dit qui compte  (long answer, optional)
         Placeholder: Ses mots, pas notre résumé.
```

```text
:seedling: *{{Nom}}* — {{Où en est-on ?}}

*Pratique :* {{Spécialité / type de pratique}} · *Patientes :* {{Combien de patientes, à peu près ?}}
*Rencontrée :* {{Où l'avons-nous rencontrée ?}}
*Prochaine action :* {{Prochaine action, et pour quand ?}}

*Ses mots :*
{{Ce qu'elle a dit qui compte}}

Ajouté par {{person who submitted}}.
```

Field 7 is worth more than the other six combined: it is product research in the practitioner's own
words, and it is exactly the material that belongs in the braindump rather than in a CRM.

### 13.12 « Bienvenue » → automatic

Trigger: _When a person joins a channel_ → `#equipe`. Step: message that person.

```text
Bienvenue chez REMI AI :wave:

Commence par le canvas épinglé ici : ce qu'on construit, où on en est, qui décide quoi, et ce qu'on
attend de chacun. Dix minutes, et tu n'auras plus à deviner où poster.

Deux endroits à connaître :
• le tableau *Fonctionnalités* (#produit) — l'état de tout, à tout moment ;
• la liste *Actions* (#equipe) — filtre sur ton nom, tu vois ce qui t'attend.

Les canaux `dev-` sont la salle des machines : tu n'as jamais besoin de les lire.
```

### 13.13 « 🚨 Bloqué » → escalation by emoji

Trigger: _When an emoji reaction is used_ → `:rotating_light:` → any channel. Step: post to `#equipe`.

```text
:rotating_light: *{{person who reacted}} signale un blocage* — {{link to message}}

Quelqu'un doit intervenir maintenant. Répondez dans le fil d'origine, pas ici.
```

Three people do not need an escalation policy. They need one gesture that means _now_, that works
from a phone, and that does not require finding the right channel first.

### 13.14 L'audit du mois → `#equipe`

Scheduled, first Monday, 10:00. Post the checklist from § 12.4 as the message body, and add:

```text
Chaque point : fait, ou reporté avec une date. Pas de troisième option.
```

---

## 14. Notifications — the settings that make async work

Async collaboration between three people in different rhythms depends on two settings each. Do them
together, in the launch huddle, or they never get done.

| Setting                         | Morgane & Arnaud                 | Jamie         |
| ------------------------------- | -------------------------------- | ------------- |
| Default notifications           | Mentions only                    | Mentions only |
| `#annonces`                     | **All messages**                 | All messages  |
| `#produit`                      | **All messages**                 | All messages  |
| `#dev-pipeline`, `#dev-alertes` | Muted — leave the channels muted | All messages  |
| Working hours in the profile    | Set them                         | Set them      |
| Mobile                          | On, mentions only                | On            |

Slack holds notifications outside working hours once they are set. A three-person company where
everyone is reachable at 22:00 burns out inside a year, and the remedy is a setting rather than
willpower.

**And a rule that costs nothing:** if a question is for one person, @-mention them. In a workspace
of three, "someone will pick it up" means nobody does.

---

## 15. Security, and what never goes in Slack

Slack is a US-hosted service holding your internal conversation. Fine for internal conversation; not
fine for anything else.

| Never in Slack                                    | Where it goes instead                                            |
| ------------------------------------------------- | ---------------------------------------------------------------- |
| API keys, tokens, connection strings, passwords   | Vercel env vars / GitHub Actions secrets. `ENV.md` holds _names_ |
| Patient data — names, health details, screenshots | Nowhere outside the product. Not even anonymised "examples"      |
| Practitioner personal data beyond name and stage  | The list at most; the real record belongs in the product         |
| Bank details, full invoices, contracts            | The Drive, with the link in `#argent`                            |

If a secret does land in Slack: **rotate it, then delete the message.** Deleting alone is theatre —
it was in a message queue, a notification, and possibly on a phone lock screen. Same discipline
`ENV.md` states for the repository, extended one tool sideways.

**Retention: keep everything.** Counter-intuitive as a privacy stance, but a 90-day auto-delete
encourages treating Slack as durable storage while quietly destroying the record. The control is not
deleting Slack; it is not putting the sensitive thing there.

Backing it up: 2FA required, app installation by approval, Slack Connect by owner approval, 24-hour
edit window (§ 6).

---

## 16. Outsiders — Slack Connect and guests

Pro includes Slack Connect with up to 250 external organisations. Three cases will come up:

| Who                                     | How                                                                                             |
| --------------------------------------- | ----------------------------------------------------------------------------------------------- |
| Accountant, lawyer, Startup Boost coach | **Slack Connect channel**, `#ext-<nom>`. They keep their Slack, you keep yours                  |
| A founding practitioner during the beta | **Don't.** They belong in the product. Feedback comes through the form and email                |
| A contractor on the code                | **Multi-channel guest**, limited to `#dev-pipeline` and `#dev-alertes`, removed on the last day |

Pin this as each `ext-` channel's canvas:

```text
Ce canal est partagé avec une personne extérieure à REMI AI.

- Rien de confidentiel qui ne la concerne pas : pas de chiffres d'ensemble, pas de discussions
  d'équipe, pas de captures d'écran contenant des données.
- Les décisions prises ici repartent dans #decisions côté interne. Ce canal est un lieu de
  conversation, jamais le lieu de la décision.
- Le canal est archivé à la fin de la mission, pas « un jour ».
```

---

## 17. What this asks of the repository

Four small changes. None is large; all four are what make Rule 1 and Rule 2 hold in practice rather
than on paper.

### 17.1 Scoping starts in Slack, not in the terminal

`/pipeline scope` currently interrogates the business logic in a session with Jamie. From now on it
runs **after** the `#produit` thread is closed, and its input is the agreed scope — the problem, the
audience, the exclusions, the appetite. The command does not change; what changes is that it is
never the first place a feature is thought about. A scope written in a terminal and shown to Morgane
afterwards is a scope she is reviewing rather than shaping, and the difference shows up two weeks
later as rework.

### 17.2 Ship notes are written in French, for Morgane and Arnaud

The Ship stage's `ship-note.md` is now read by two non-technical founders in `#annonces`, so
`CONVENTIONS.md` § Working languages applies to it: _"Any document prepared for Morgane and Arnaud
to analyse, review or sign off … is written in French."_ Its first `# ` heading becomes the email
subject — so that heading is the one-line answer to _what can a person do now that they could not
before_, not a slug or a ticket number. The shape is in § 8.5.

This is a one-line change to `pipeline/stages/06_ship/CONTEXT.md` and it should ride the next Ship
run rather than becoming its own chore.

### 17.3 Open questions get raised in Slack within a day of being hit

Every intake ticket carries an "Open questions — flag these on pickup" section, and the intake
README's rule is _do the work that does not depend on the open question; raise the question; do not
invent an answer and bury it in code_. "Raise it" now has an address: `#produit`, with the § 13.5
form, with a deadline and a stated default. A question raised in a PR body that Morgane never opens
is not raised.

### 17.4 The board is refreshed at two moments, by Jamie

At the Monday bet, and whenever a feature changes state. Both already exist as moments. If a third
moment ever becomes necessary, the board has too many columns — cut columns rather than adding
rituals.

---

## 18. The rollout — three sittings

Not one evening. The workspace people adopt is the one where every channel already explains itself
on the day they arrive.

**Sitting one — the shell (≈ 90 min, alone)**

- [ ] Create the workspace, upgrade to Pro annual (§ 4–5)
- [ ] Apply every admin setting in § 6
- [ ] Rename `#general` → `#equipe`; create the other nine channels (§ 7.3)
- [ ] Paste every topic and description
- [ ] Write the home canvas into `#equipe` and pin it — including the six real `<état>` words (§ 9.1)

**Sitting two — the substance (≈ 2 h, alone)**

- [ ] Paste the `#produit`, `#decisions` and `#argent` canvases (§ 9.2–9.4)
- [ ] Create the `Fonctionnalités` board and **fill it with what already exists** — every feature in
      phases A to F, with its real state (§ 10.1)
- [ ] Create the `Actions` list and seed it with the seven rows in § 10.2
- [ ] Build workflows 13.4, 13.5, 13.6 and 13.7 — scoping, blocking questions, decisions, prototypes
- [ ] Test each one end to end
- [ ] GitHub and Vercel into the two `dev-` channels only (§ 11.1–11.2)
- [ ] Channel email for `#annonces`; set `SHIP_NOTE_RECIPIENTS`; dry-run the ship note (§ 11.3)

**Sitting three — the people (≈ 60 min, together)**

- [ ] Invite Arnaud (Owner) and Morgane (Admin)
- [ ] Walk the home canvas, the board and the actions list live, in a huddle. Fifteen minutes, and it
      prevents a year of "where do I put this"
- [ ] Everyone sets notifications, working hours, timezone, photo (§ 14)
- [ ] **Open one real scoping thread in `#produit`** — the next feature in phase order — and let
      Morgane answer in it before the huddle ends. A system starts by being used, not by being
      announced
- [ ] Run the first `Pari de la quinzaine` in the same huddle
- [ ] Afterwards: the remaining workflows (13.2, 13.3, 13.8–13.14)

**Then, deliberately, for two weeks: no new channels.** Ten cover more than it looks, and the monthly
audit is where the map changes.

The invitation message:

```text
Bienvenue dans le Slack de REMI AI.

C'est ici qu'on décide ce qu'on construit, qu'on voit où en est chaque chose, et qu'on sait ce qu'on
attend de chacun. Pas besoin d'ouvrir quoi que ce soit d'autre.

Commence par le canvas épinglé dans #equipe. Puis regarde deux choses : le tableau *Fonctionnalités*
dans #produit, et la liste *Actions* dans #equipe filtrée sur ton nom.
```

---

## 19. Keeping it honest

**Monthly**, the audit (§ 12.4) runs itself. It is the only thing standing between this system and
the usual slow rot.

**The failure mode to watch for** is not silence — it is Morgane or Arnaud asking Jamie a question
the board already answers. Every time that happens, the board is wrong, stale, or unreadable. Fix
the board; do not answer the question and move on.

**A second failure mode**, the mirror of the first: a feature reaching production that never had a
scoping thread. That is Rule 1 breaking in the other direction — work that happened where two people
could not see it. The Friday recap catches it, once, if someone is honest enough to say so.

**When to change the plan.** Stay on Pro until one of these is true:

| Signal                                                        | Then                                                             |
| ------------------------------------------------------------- | ---------------------------------------------------------------- |
| Headcount past ~8, or a first non-technical hire              | Consider Business+ — channel recaps genuinely help at that size  |
| A client or investor requires SSO / SAML                      | Business+                                                        |
| You want to process patient data through a workflow           | Stop. That is a data-protection decision first (REMI-015)        |
| Morgane or Arnaud start opening the repository to find things | The Slack side has gone stale. Fix it — that is the whole system |

**When to add a channel.** Only when a topic has produced sustained conversation in `#equipe` for
two weeks _and_ somebody has muted something because of it.

---

## 20. What I assumed, and what you should confirm

1. **Arnaud's domain.** Approver for legal, finance, company and data protection, and second
   workspace Owner — inferred from `history/info-gathering.md`, where the DPAs, the company
   particulars and the accountant are all addressed to him. If he is more product-facing, three
   places change: § 3.3, the `#decisions` canvas, and the `Actions` seed rows.
2. **The two-week cycle.** Sized against Phase A (days) and Phase B (1–2 weeks). If Phase C is a
   month of work, move to three-week cycles rather than letting a bet overrun — a bet that
   routinely overruns stops being information.
3. **Morgane's and Arnaud's availability.** The rhythm assumes both can answer within two working
   days and attend a 30-minute huddle fortnightly. If either is materially less available, the
   defaults in § 13.5 become the primary mechanism rather than the fallback, and that should be
   said out loud rather than discovered.
4. **Slack Connect for founding practitioners.** Recommended against (§ 16). If REMI-031's beta plan
   assumes a shared channel with practitioners, that is a real decision with a data-protection
   dimension, and it belongs in `#decisions` before the beta opens.
5. **The `@remiai.be` mailboxes.** Assumed live and monitored; `history/info-gathering.md` REQ-06
   lists that as unconfirmed. Found the workspace on them regardless — migrating off a personal
   Gmail later is painful.

---

## 21. Sources

Slack plans and capabilities checked in August 2026; plan boundaries move, so re-check anything
cost-relevant before buying.

- [Slack pricing](https://slack.com/pricing) — plan comparison and per-seat cost
- [Updates to feature availability and pricing for Slack plans](https://slack.com/help/articles/39264531104275-Updates-to-feature-availability-and-pricing-for-Slack-plans)
- [Manage Workflow Builder access and features](https://slack.com/help/articles/360035822734-Manage-Workflow-Builder-access-and-features)
- [Send emails to Slack](https://slack.com/help/articles/206819278-Send-emails-to-Slack) — channel email addresses, paid plans, 30 per workspace
- [Naming channels by convention](https://api.slack.com/best-practices/blueprints/channel-naming-conventions)
- [Customizing notifications for GitHub in Slack](https://docs.github.com/en/integrations/how-tos/slack/customize-notifications) — the `/github subscribe` feature list and filter syntax
- [Slack for Vercel](https://vercel.com/marketplace/slack) · [Run and track deploys from Slack](https://vercel.com/kb/guide/run-and-track-deploys-from-slack)
- [Creating webhook triggers](https://docs.slack.dev/tools/deno-slack-sdk/guides/creating-webhook-triggers/) — the Supabase route in § 11.4
- [Shape Up](https://basecamp.com/shapeup) — betting, appetite, cooldown
- [DACI, Atlassian Team Playbook](https://www.atlassian.com/team-playbook/plays/daci)
- [The GitLab Handbook](https://handbook.gitlab.com/) · [Shared reality](https://handbook.gitlab.com/teamops/shared-reality/)

---

_This document is operational, not product truth. It holds no claim about what REMI is — where it
touches direction, [`.icm/docs/README.md`](README.md)'s precedence order wins, and this file gets
corrected._
