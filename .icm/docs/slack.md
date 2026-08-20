# Slack for REMI AI — the workspace, and how it works

One document. It explains the system, then walks the setup step by step with blocks you paste
straight into Slack. Written for a three-person company — Jamie, Morgane, Arnaud — that already has
a delivery pipeline, a source of truth in git, and no appetite for process theatre.

Read § 1–3 before touching anything. Everything from § 4 on is executable in order; the checklist
in § 15 is the same thing as a tick-list if you'd rather work from that.

---

## 1. The one rule

**Slack is the nervous system. Git is the memory.**

Every failed Slack rollout fails the same way: Slack quietly becomes a second source of truth, then
a third, and six weeks later nobody can say where the real answer lives. This repository already
solved that problem — [`.icm/docs/README.md`](README.md) states a precedence order, and
[`CLAUDE.md`](../../CLAUDE.md) says each rule lives in exactly one home. Slack does not get to
break that.

So the split is absolute:

| Slack carries                                           | Git carries                                    |
| ------------------------------------------------------- | ---------------------------------------------- |
| What is happening **right now**                         | What is **true**                               |
| Signals — CI, deploys, PR gates waiting on a human      | Specs, scopes, tickets, decisions, conventions |
| Capture — a raw idea, a bug seen on a phone, a form     | The triaged ticket that idea became            |
| Coordination — who is on what, what we bet on this week | The record of what was built and why           |
| Pointers into git                                       | The thing being pointed at                     |

**The 24-hour rule.** Anything in Slack that will still matter in three months leaves Slack within
24 hours — into `.icm/docs/` (truth), `.icm/intake/` (work), or `pipeline/runs/<slug>/` (a run).
The Slack message then gets a link to where it landed and a ✅. Slack keeps the conversation; git
keeps the conclusion.

**Slack never approves code.** The pipeline has exactly two binding gates, both PR checkboxes —
_Spec approved_ and _Ready to merge_ ([`pipeline/CONTEXT.md`](../../pipeline/CONTEXT.md)). Slack
can _ask_ for a gate, chase a gate, celebrate a gate. It cannot _be_ a gate. A "yes go ahead" in
Slack is not an approval; the checkbox is.

Everything below is that one rule, applied.

---

## 2. The methodology, and why this one

You asked for the best project-management methodology. The honest answer is that you already have
one, and it is better suited to you than anything I would import: the six-stage pipeline with five
gates, plus three fast lanes. What is missing around it is not a methodology — it is **a cadence, a
decision protocol, and a knowledge centre**. That is what Slack is for.

So the system is four borrowed pieces, each doing one job:

### 2.1 Shape Up's _betting_, not its ceremony

[Shape Up](https://basecamp.com/shapeup) is the method consistently recommended for teams under
about 250 people, and for early-stage startups in particular: it replaces continuous sprint
planning with a **bet** — a fixed appetite of time, a shaped piece of work, and no interruption
until the appetite runs out. Basecamp uses six-week cycles. Six weeks is too long for you; your
phases in [`.icm/intake/`](../intake/README.md) are sized in days and 1–2 weeks.

**Adopt: a two-week bet, with a one-day cooldown.** Every second Monday you bet on the work for
the fortnight, drawn from `.icm/intake/` in phase order. The bet is written once, in
`#hq-announcements`, and does not change mid-cycle except for a production incident. The last Friday
afternoon of the cycle is cooldown: no bets, only cleanup, docs, dependency bumps, the `chore`
lane.

Why it fits: it protects the one genuinely scarce resource here (uninterrupted build time), it
matches the phase sizes already written down, and the "shaping" step is exactly what
`/pipeline scope` already does.

### 2.2 Kanban's _WIP limit_, not its board

You do not need a board — `.icm/intake/` **is** the ordered backlog and the PR list is the board.
What Kanban contributes is one number. For a three-person team the standard guidance is a doing
limit of three or four; for a team where only one person writes code, it is lower.

**Adopt: WIP ≤ 2 pipeline runs open at once, and at most 1 in Build.** When a third wants to
start, something finishes or something goes back to intake. The rule lives in the `#dev-pipeline`
canvas and is checked at the Monday bet.

### 2.3 DACI for decisions, lightweight

[DACI](https://www.atlassian.com/team-playbook/plays/daci) — Driver, Approver, Contributors,
Informed — exists so a group of three never has a decision quietly made by whoever spoke last.
Small and reversible decisions skip it entirely; that is part of the framework, not a shortcut.

**Adopt: a decision is DACI'd only if it is expensive or hard to reverse.** One thread per
decision in `#hq-decisions`, one approver named up front, and it is not decided until the thread
carries a `Décision :` reply and a link to where it landed in git. Standing approvers:

| Domain                                              | Approver         |
| --------------------------------------------------- | ---------------- |
| Product, direction, positioning, pricing            | Morgane          |
| Legal, finance, company, data protection, contracts | Arnaud           |
| Architecture, code, tooling, delivery               | Jamie            |
| Anything that spends money on a recurring basis     | Arnaud + Morgane |

_(Flagged in § 17 — confirm Arnaud's domain; I inferred it from `history/info-gathering.md`, where
the DPAs, company particulars and the accountant are all addressed to him.)_

### 2.4 Handbook-first for knowledge

GitLab's handbook-first culture is the reference implementation of a knowledge centre: **if it is
not written down, it did not happen**, and the handbook — not a meeting, not a DM — is the single
source of truth. You already run this: `.icm/docs/` with an explicit precedence table is a
handbook, and a better one than most three-person companies have.

**Adopt: Slack canvases are the index, never the content.** Each channel gets a canvas that says
what the channel is for and links into `.icm/docs/`, `.icm/intake/` and `pipeline/`. A canvas that
starts explaining the product instead of linking to it is a bug — fix it by deleting the prose and
linking.

Plus the two habits that make handbook-first work at three people:

- **Working out loud.** Decisions and reasoning go in a channel, not a DM. DMs are for
  "are you free at 3", nothing else.
- **A monthly knowledge audit**, 30 minutes, standing (§ 11.3). The precedence table in
  `.icm/docs/README.md` already flags that `apps/docs/app/business/**` has not been reconciled
  with the braindump — that kind of drift is exactly what the audit exists to burn down.

### 2.5 What we are deliberately _not_ adopting

| Not adopting                          | Why                                                                             |
| ------------------------------------- | ------------------------------------------------------------------------------- |
| Scrum — sprints, points, velocity     | Ceremony cost is fixed; at three people it is most of the day                   |
| A Slack-side task tracker             | Second backlog. `.icm/intake/` is the backlog                                   |
| Daily stand-ups                       | Three people in one channel; the bet and the ship recap carry it                |
| Jira / Linear / Notion                | Git already holds the spec, the ticket and the record. A fourth tool adds drift |
| Business+ features (advanced AI, SSO) | Priced for compliance orgs; revisit if headcount passes ~8 (§ 16)               |

---

## 3. Decide these five things before you click anything

| #   | Decision         | Recommendation                                                                                                                                                                                                                                                                                                                                            |
| --- | ---------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | Plan             | **Pro.** $7.25/user/month billed annually, $8.75 monthly. Pro is the plan that unlocks everything this document uses: full history, unlimited apps, Workflow Builder, channel email addresses, group huddles, Slack Connect, standalone canvases and Lists. Business+ ($15) buys advanced AI, SSO and compliance exports you do not need at three people. |
| 2   | Workspace URL    | `remiai.slack.com` if free, else `remi-ai.slack.com`. It appears in every invite — pick once.                                                                                                                                                                                                                                                             |
| 3   | Email domain     | Use `@remiai.be` addresses (`morgane@`, `arnaud@`, and yours). This lets you turn on domain-based joining later and keeps the workspace tied to the brand domain, not a personal Gmail.                                                                                                                                                                   |
| 4   | Who is Owner     | **Two Owners: you and Arnaud.** Never one — a single-owner workspace is a bus-factor incident. Morgane as Admin.                                                                                                                                                                                                                                          |
| 5   | Working language | Set by [`CONVENTIONS.md`](../../CONVENTIONS.md) § Working languages, and it already covers Slack: **French is the language of the conversation with Morgane and Arnaud.** See § 6.1.                                                                                                                                                                      |

**Cost.** 3 members × $7.25 × 12 ≈ **$261/year** (≈ 240 € HTVA at current rates), billed annually.
Slack charges per _active_ member, so a fourth person costs nothing until they actually join. Add
the row to the tool and cost register the moment it exists — that is [REMI-012](../intake/REMI-012-tool-and-cost-register.md):

```text
Tool: Slack Pro
Purpose: Internal comms, alerting, forms, and the operating cadence for the team
Owner: Arnaud (billing) / Jamie (workspace admin)
Cost: ~21,75 $/mois HTVA (3 sièges × 7,25 $, facturation annuelle) — ~261 $/an
Renewal: annual, auto-renew — review at the monthly knowledge audit before renewal month
Data: internal conversation only. No patient data, no secrets, no credentials (§ 13)
```

---

## 4. Create the workspace

1. Go to <https://slack.com/get-started#/createnew> and sign in with your `@remiai.be` address.
2. Workspace name: **REMI AI**. Slack asks "What's your team working on?" — answer anything, it
   only seeds the first channel, which you will rename in § 6.
3. Skip the invite prompt for now (you want the channels and the rules in place before anyone
   arrives — a workspace someone joins on day one with no canvas is a workspace they invent their
   own conventions in).
4. Upgrade to Pro immediately: **workspace name → Settings & administration → Manage subscription
   → Upgrade → Pro → annual**. Doing it before invites means no plan-change interruption later.
5. Set the workspace icon to the REMI logo, and the workspace description:

```text
REMI AI — le poste de pilotage de l'équipe. Les conversations vivent ici ; la vérité vit dans le dépôt (.icm/docs).
```

---

## 5. Admin settings — do this once, in order

**Settings & administration → Workspace settings.** Every row below is a deliberate choice, not a
default worth keeping.

| Setting                                   | Set to                                           | Why                                                                                       |
| ----------------------------------------- | ------------------------------------------------ | ----------------------------------------------------------------------------------------- |
| Channel management → create channels      | Everyone                                         | Three people. Conventions, not permissions, keep the list clean                           |
| Channel management → archive channels     | Everyone                                         | Same                                                                                      |
| Channel posting permissions               | Restrict `#hq-announcements` to Owners/Admins    | An announcements channel everyone posts in is a second `#hq-general`                      |
| Messages → retention                      | **Keep everything**                              | Full history is what you pay Pro for. The 24-hour rule moves what matters into git anyway |
| Messages → allow message editing/deletion | On, 24 h edit window                             | Enough to fix a typo, not enough to rewrite a decision thread                             |
| Apps → app installation                   | Require approval (you approve)                   | Free apps are the usual way a workspace leaks data                                        |
| Apps → allow Slack Connect                | Owners approve each invitation                   | § 14                                                                                      |
| Security → two-factor authentication      | **Require for everyone**                         | Non-negotiable. This workspace will link to a repo that will link to health data          |
| Invitations                               | Owners/Admins only                               | Three people                                                                              |
| Default channels for new members          | `#hq-general`, `#hq-announcements`, `#hq-intake` | Somebody joining lands in the three channels that explain the rest                        |
| Emails → send emails to channels          | Allow Owners/Admins                              | You need this for § 9.4 (the ship note)                                                   |
| Display → default to threads              | On                                               | Threads are the difference between a searchable workspace and a wall                      |

Paste this as the **workspace-wide custom "Slack etiquette" note** (Settings → _Customize_ → the
`#hq-general` canvas is a better home; this text is reused in § 8.1 so you only maintain one copy).

---

## 6. The channel map

### 6.1 The rules that keep the list from sprawling

**Prefix dictionary — six prefixes, no exceptions.** Lowercase, hyphenated, prefix first. Keeping
the dictionary short is the whole trick; a naming scheme you need to look up has already failed.

| Prefix    | Means                                                       |
| --------- | ----------------------------------------------------------- |
| `hq-`     | The company: everyone reads it, nothing technical required  |
| `dev-`    | Building the product                                        |
| `alert-`  | Machines talking. Humans reply in threads, never post first |
| `biz-`    | Money, growth, legal, partners                              |
| `ext-`    | An outsider is in this channel (Slack Connect or guest)     |
| `social-` | Not work                                                    |

**Language.** Channel _names_ are English — they are identifiers, and `CONVENTIONS.md` puts
identifiers in English. Everything a human writes in `hq-`, `biz-` and `ext-` channels is
**French**, per `CONVENTIONS.md` § Working languages: _"French is the language of the conversation
with them — Slack, email, meeting notes — whoever starts the thread."_ `dev-` and `alert-` channels
are English, because their contents are machine output and technical discussion, which the same
rule puts in English. That split is written into each channel's description below, so nobody has to
remember it.

**One channel per topic. Threads for everything.** A top-level message that is a reply is a bug.

**Archive at 90 days idle**, at the monthly audit. Archived channels stay searchable on Pro.

### 6.2 The eleven channels

| Channel             | Language | Who posts        | Job                                                                                  |
| ------------------- | -------- | ---------------- | ------------------------------------------------------------------------------------ |
| `#hq-general`       | FR       | Everyone         | The town square. Anything without a better home, plus the home canvas                |
| `#hq-announcements` | FR       | Owners/Admins    | Low volume, high signal: the bet, decisions taken, ship notes, milestones            |
| `#hq-decisions`     | FR       | Everyone         | The decision log. One thread per decision, DACI-lite, ends in a link to git          |
| `#hq-intake`        | FR       | Forms + everyone | The front door: ideas, requests, bugs, feedback. Raw capture only — triaged into git |
| `#hq-produit`       | FR       | Everyone         | Product truth with Morgane: braindump questions, demo sign-off, feature debate       |
| `#dev-pipeline`     | EN       | GitHub app       | PRs, reviews, gates for `k0d0minio/remi-ai`. The run radar                           |
| `#dev-notes`        | EN       | Humans           | Engineering talk. Deliberately separate from the bot channel                         |
| `#alert-prod`       | EN       | Vercel/CI/errors | Deploys, CI failures, runtime errors, database alerts                                |
| `#biz-money`        | FR       | Everyone         | Costs, the tool register, invoices, Startup Boost, funding, accountant               |
| `#biz-growth`       | FR       | Everyone         | Marketing, content, recruiting the founding practitioners                            |
| `#social-cafe`      | FR       | Everyone         | Not work. Keeps the other ten clean                                                  |

Plus `#ext-<name>` per outside party, created only when there is one (§ 14).

**Why bots and humans are split.** `#dev-pipeline` and `#alert-prod` will be noisy. If human
engineering conversation lives in the same channel, one of two things happens: you mute the channel
and miss the alerts, or you read every alert and lose the conversation. Separating them means
`#alert-prod` can carry a hard rule — **an unresolved alert is someone's job until it has a thread
reply** — that would be unenforceable in a mixed channel.

### 6.3 Create them

Nine channels to create (`#hq-general` is a rename, see below), all **public** — a private channel
in a company of three is a DM with extra steps.

For each: **+ → Create → Channel**, paste the name, then open the channel → click its name →
paste the **topic** and **description** from the blocks below.

First, rename the default channel: click `#general` → _Edit_ next to the name → `hq-general`.
Slack keeps its history and its everyone-is-a-member property.

```text
# hq-general
Topic: Le carré du village. Le canvas épinglé explique tout le reste.
Description: Tout ce qui n'a pas de meilleur endroit. Conversations en français. Le canvas épinglé est la page d'accueil de l'entreprise : qui fait quoi, où vit la vérité, le rythme de la semaine, le dictionnaire des canaux.
```

```text
# hq-announcements
Topic: Signal uniquement. Le pari de la quinzaine, les décisions, les livraisons.
Description: Canal à faible volume, réservé aux annonces : le pari en cours, les décisions prises (avec le lien vers le dépôt), les notes de livraison, les jalons. Publication réservée aux propriétaires — tout le monde répond en fil. Si vous hésitez entre ici et #hq-general, c'est #hq-general.
```

```text
# hq-decisions
Topic: Un fil = une décision. Pilote, approbateur, échéance, puis « Décision : » + lien.
Description: Le journal des décisions. Une décision coûteuse ou difficile à annuler s'ouvre ici via le workflow « Demande de décision » (DACI léger). Elle n'est prise que lorsque le fil porte une réponse « Décision : … » et un lien vers l'endroit du dépôt où elle a atterri. Les petites décisions réversibles ne passent pas par ici.
```

```text
# hq-intake
Topic: La porte d'entrée. Une idée, un bug, une demande — déposez, on trie.
Description: Capture brute : idées, demandes, bugs, retours terrain. Rien ne se décide ici. Chaque élément est trié sous 48 h vers un ticket dans .icm/intake/ ou vers le pipeline (/pipeline bug | tweak | chore), puis le message reçoit ✅ et le lien. Utilisez les formulaires épinglés plutôt que d'écrire librement.
```

```text
# hq-produit
Topic: Le produit avec Morgane — le braindump fait foi.
Description: Les questions produit, les débats de fonctionnalités, la validation des prototypes (les PR de démo arrivent ici automatiquement). La source de vérité reste .icm/docs/braindump/ : ce canal sert à décider ce qui y entre, jamais à le remplacer. Toute conclusion repart dans le dépôt sous 24 h.
```

```text
# dev-pipeline
Topic: GitHub — PRs, reviews, gates for k0d0minio/remi-ai. Bots only, threads for humans.
Description: The run radar. The GitHub app posts pull requests, reviews and comments here. Humans reply in threads only — engineering conversation belongs in #dev-notes. WIP limit: 2 open runs, at most 1 in Build. The two binding gates (Spec approved, Ready to merge) are ticked in the PR, never here.
```

```text
# dev-notes
Topic: Engineering talk. English. Working out loud beats a DM.
Description: The human half of the build: how something should work, what broke and why, what to do about it. Anything that turns into a decision moves to #hq-decisions; anything that turns into work becomes a ticket in .icm/intake/. Nothing here is authoritative — the spec is.
```

```text
# alert-prod
Topic: Machines only. An unresolved alert is somebody's job until it has a thread reply.
Description: Deploys (Vercel), CI failures (GitHub Actions), runtime errors and database alerts. Rules: never post here first, always reply in thread, and every alert ends in one of three replies — fixed (with the PR link), ignored (with the reason), or ticketed (with the ticket link). A channel of unanswered red is a channel nobody reads.
```

```text
# biz-money
Topic: Coûts, outils, factures, Startup Boost, financement.
Description: Tout ce qui coûte ou rapporte. Le registre des outils et des coûts vit dans le dépôt (REMI-012) : ici on en discute, on ajoute une ligne via le formulaire « Nouvel outil / nouveau coût », et le registre reste la référence. Jamais de coordonnées bancaires ni d'identifiants dans ce canal.
```

```text
# biz-growth
Topic: Marketing, contenu, recrutement des praticiennes fondatrices.
Description: L'acquisition et la relation : le contenu, le site, les praticiennes fondatrices (REMI-031), les retours du terrain. Un retour utilisable se transforme en ticket ; une praticienne recrutée se déclare via le formulaire dédié.
```

```text
# social-cafe
Topic: Pas du travail. C'est le but.
Description: Le canal qui garde les dix autres propres.
```

---

## 7. Invite the team

Only now — with channels, descriptions and the home canvas (§ 8.1) in place.

**Invite people → enter emails → set role**: Arnaud as **Owner**, Morgane as **Admin**. Add this as
the invitation message:

```text
Bienvenue dans le Slack de REMI AI.

Une seule règle à retenir : Slack porte ce qui se passe, le dépôt porte ce qui est vrai. Tout ce qui compte encore dans trois mois repart dans le dépôt sous 24 h, et le message Slack reçoit le lien.

Commence par le canvas épinglé dans #hq-general : il explique qui fait quoi, où vit la vérité, le rythme de la quinzaine et à quoi sert chaque canal. Dix minutes de lecture, et tu n'auras plus jamais à deviner où poster.
```

---

## 8. The knowledge centre

This is the part that makes Slack worth paying for, and the part everyone skips. A canvas is a
document attached to a channel. Attach one to every channel; pin it; keep it to _what this channel
is for_ and _where the real thing lives_.

**How to add one:** open the channel → the bookmark bar at the top → **+ → Canvas** (or the canvas
icon beside the channel name) → paste the block → then **pin it** (⋮ → _Pin to channel_).

Markdown pastes into a canvas and converts: `#` headings, `-` bullets, `[text](url)` links, tables
and checkboxes all survive. Paste, then check the links resolved.

### 8.1 The home canvas — `#hq-general`

This is the front page of the company. It is the one document a new person reads. Everything in it
is a pointer.

```markdown
# REMI AI — page d'accueil

## La règle unique

**Slack porte le flux. Le dépôt porte la mémoire.**
Tout ce qui comptera encore dans trois mois quitte Slack sous 24 h — vers `.icm/docs/` (la vérité),
`.icm/intake/` (le travail) ou `pipeline/runs/` (une réalisation en cours). Le message Slack reçoit
ensuite le lien et un ✅.

Slack ne valide jamais de code. Les deux seules approbations qui engagent sont des cases à cocher
dans la pull request : **Spec approved** et **Ready to merge**.

## Qui fait quoi

| Personne | Rôle                                  | Approuve                                              |
| -------- | ------------------------------------- | ----------------------------------------------------- |
| Morgane  | Fondatrice, produit et vision         | Produit, direction, positionnement, prix              |
| Arnaud   | Société, juridique, finances          | Légal, finances, RGPD, contrats, dépenses récurrentes |
| Jamie    | Construction, architecture, livraison | Architecture, code, outillage, pipeline               |

## Où vit la vérité — l'ordre de préséance

Quand deux documents se contredisent, le plus haut gagne. L'ordre complet est dans
`.icm/docs/README.md`.

1. `.icm/docs/braindump/` — les 40 documents de Morgane. Ce que REMI **est**.
2. `.icm/docs/remi-status-report.html` — le plan qui en découle, phases A–F.
3. `.icm/docs/correspondence/` — ce que Morgane a demandé, dans ses mots.
4. `.icm/docs/ENV.md` — variables d'environnement et secrets (noms, jamais valeurs).
5. `.icm/docs/history/` — l'historique technique. Périmé dès qu'il touche à la direction.

Le travail ordonné vit dans `.icm/intake/` : un ticket par unité de travail, phases A à F.
Les règles de code vivent dans `CONVENTIONS.md`. La mécanique de livraison vit dans `pipeline/`.

## Le rythme

| Quand                                | Quoi                                            | Où                |
| ------------------------------------ | ----------------------------------------------- | ----------------- |
| Lundi (semaine impaire), 9 h 30      | Le pari de la quinzaine — 30 min en huddle      | #hq-announcements |
| Chaque vendredi, 16 h                | Récapitulatif de ce qui est parti en production | #hq-announcements |
| Dernier vendredi après-midi du cycle | Refroidissement : nettoyage, docs, chores       | —                 |
| Premier lundi du mois, 10 h          | Audit de la connaissance — 30 min               | #hq-general       |

Limite de travail en cours : **2 réalisations ouvertes au maximum, 1 seule en construction.**

## Le dictionnaire des canaux

| Préfixe   | Sens                                                                    |
| --------- | ----------------------------------------------------------------------- |
| `hq-`     | L'entreprise. Tout le monde lit.                                        |
| `dev-`    | La construction du produit.                                             |
| `alert-`  | Les machines parlent. On répond en fil, on ne publie jamais en premier. |
| `biz-`    | Argent, croissance, juridique, partenaires.                             |
| `ext-`    | Une personne extérieure est présente.                                   |
| `social-` | Pas du travail.                                                         |

Français dans les canaux `hq-`, `biz-`, `ext-`. Anglais dans `dev-` et `alert-` (c'est la règle de
`CONVENTIONS.md` : la conversation avec Morgane et Arnaud est en français, le technique est en
anglais).

## Les six règles

1. **Un fil pour chaque réponse.** Un message de premier niveau qui répond à un autre est une erreur.
2. **Pas de décision en message privé.** Les MP servent à « tu es dispo à 15 h ? », rien d'autre.
3. **Une conclusion repart dans le dépôt sous 24 h**, avec le lien en retour dans le fil.
4. **Aucun secret dans Slack.** Ni clé, ni mot de passe, ni donnée patient. Si ça arrive : on
   révoque, on ne supprime pas seulement.
5. **Une alerte non résolue est la tâche de quelqu'un** jusqu'à ce qu'un fil dise « corrigé »,
   « ignoré parce que… » ou « ticket créé : … ».
6. **Un canal sans activité depuis 90 jours est archivé** lors de l'audit mensuel.

## Les émojis qui veulent dire quelque chose

| Émoji | Sens                                             |
| ----- | ------------------------------------------------ |
| 👀    | Je l'ai vu, je m'en occupe                       |
| ✅    | Fait — et le lien est dans le fil                |
| 🧵    | Réponds en fil, pas ici                          |
| 🚢    | Parti en production                              |
| 🧊    | Gelé volontairement — on n'y touche pas ce cycle |
| 🚨    | Bloqué : quelqu'un doit intervenir maintenant    |

## Premier jour

- [ ] Lire ce canvas en entier.
- [ ] Lire `.icm/docs/README.md` (l'ordre de préséance) et `.icm/intake/README.md` (les phases).
- [ ] Rejoindre #hq-announcements, #hq-decisions, #hq-intake, #hq-produit, #biz-money, #biz-growth.
- [ ] Régler ses notifications : tout en « mentions uniquement » sauf #hq-announcements et #alert-prod.
- [ ] Mettre son fuseau horaire et ses heures de travail dans son profil.
- [ ] Se présenter dans #hq-general.
```

### 8.2 The channel canvases

Short. Each one answers: what goes here, what does not, and where the real thing lives.

**`#hq-decisions`**

```markdown
# Comment on décide ici

Un fil = une décision. On ouvre le fil avec le workflow « Demande de décision » (raccourci ⚡ en bas
du champ de saisie).

## Ce qui passe par ici

Les décisions **coûteuses ou difficiles à annuler** : un fournisseur, un prix, une architecture, un
engagement juridique, une dépense récurrente. Les petites décisions réversibles se prennent dans le
fil concerné, sans cérémonie — c'est prévu par la méthode, pas un raccourci.

## Les quatre rôles (DACI)

- **Pilote** — celui qui pousse la décision et rédige. Une seule personne.
- **Approbateur** — celui qui tranche. Une seule personne. Voir le tableau ci-dessous.
- **Contributeurs** — ceux dont on veut l'avis avant de trancher.
- **Informés** — ceux qui doivent le savoir après.

| Domaine                                  | Approbateur      |
| ---------------------------------------- | ---------------- |
| Produit, direction, positionnement, prix | Morgane          |
| Juridique, finances, société, RGPD       | Arnaud           |
| Architecture, code, outillage, livraison | Jamie            |
| Toute dépense récurrente                 | Arnaud + Morgane |

## Une décision n'est prise que quand

Le fil porte une réponse qui commence par `Décision :`, signée par l'approbateur, **et** un lien
vers l'endroit du dépôt où elle a atterri : un ticket `.icm/intake/`, une page `.icm/docs/`, une
ligne de `CONVENTIONS.md`, ou un `spec.md`. Sans lien, ce n'est pas décidé — c'est une opinion.

## Format de la réponse finale

Décision : <ce qui est décidé, une phrase>
Approuvé par : <nom> le <date>
Atterri dans : <lien dépôt>
Conséquence : <ce qui change concrètement>
Révision : <date ou « jamais »>
```

**`#hq-intake`**

```markdown
# La porte d'entrée

Rien ne se décide ici. On dépose, on trie, ça devient un ticket ou ça meurt proprement.

## Déposer

Utilisez les raccourcis ⚡ : « Signaler un bug », « Proposer une idée ». Ils posent les bonnes
questions — un dépôt en texte libre finit toujours par une série d'allers-retours.

## Trier — sous 48 h, par Jamie

Chaque dépôt finit dans l'un de ces quatre états, écrit en réponse au fil :

| État           | Ce qui se passe                                                                    |
| -------------- | ---------------------------------------------------------------------------------- |
| 🎫 Ticket      | Devient un ticket dans `.icm/intake/` — le lien revient dans le fil                |
| ⚡ Voie rapide | Part directement en `/pipeline bug`, `tweak` ou `chore` — le lien de la PR revient |
| 🧊 Plus tard   | Réel mais pas maintenant : consigné dans le ticket de phase concerné               |
| ❌ Non         | Avec la raison, en une phrase. Un « non » écrit vaut mieux qu'un silence           |

Puis ✅ sur le message d'origine. Un dépôt sans ✅ après 48 h est en retard.

## Ce qui ne va pas ici

Les questions produit (→ #hq-produit), les incidents de production (→ #alert-prod), les décisions
(→ #hq-decisions).
```

**`#dev-pipeline`**

```markdown
# The run radar

GitHub posts here. Humans reply in threads. Engineering conversation lives in #dev-notes.

## The six stages

`scope → design → define → build → verify → ship` — the map is in `pipeline/CONTEXT.md`.
Fast lanes: `bug`, `tweak`, `chore` — they skip the front, keep the merge gate.

## The two gates that bind

Both are checkboxes in the PR body, and only a human ticks them:

- **Spec approved** — before Build starts.
- **Ready to merge** — authorises the squash-merge.
  Every other gate is a stop-and-wait confirmation in conversation. Slack can chase a gate. Slack is
  never the gate.

## Work in progress limit

**2 open runs. At most 1 in Build.** Checked at the Monday bet. Starting a third means finishing or
returning something first.

## Reading the labels

`stage:*` — where the run is. `type:*` — feature, bug, tweak, chore, design.
`complexity:*` — sets the code-review effort in Verify. `app:*` — which workspace it lands in.
Full vocabulary: `.github/labels.yml`.

## Waiting on a gate?

Use the ⚡ shortcut « Demander une validation » — it DMs the approver with the PR link and the gate
name. Chasing in a thread nobody is reading is how a run sits for four days.
```

**`#alert-prod`**

```markdown
# Alert triage

Never post here first. Every alert ends in a thread reply, one of three:

- **Fixed** — with the PR or commit link.
- **Ignored** — with the reason, in one sentence.
- **Ticketed** — with the link to the ticket in `.icm/intake/`.

An alert with no reply after one working day is escalated with 🚨 in #hq-general.

## What lands here

| Source                               | What it means                                                        |
| ------------------------------------ | -------------------------------------------------------------------- |
| Vercel                               | Deployment started, succeeded, failed, or was promoted to production |
| GitHub Actions                       | `Quality`, `Gates` or `Pipeline` workflow failed                     |
| Supabase (once REMI-013 lands)       | Database webhook: errors, capacity, auth anomalies                   |
| Error tracking (once REMI-017 lands) | Unhandled exceptions in production                                   |

## What is NOT an alert

A failing check on an open draft PR is normal — that is #dev-pipeline's business. This channel is
for `main`, for production, and for anything a customer could feel.
```

**`#biz-money`**

```markdown
# Argent et outils

## Le registre fait foi

Le registre des outils et des coûts vit dans le dépôt (ticket REMI-012). Ce canal sert à en
discuter et à alimenter le registre — jamais à le remplacer. Une dépense qui n'est pas dans le
registre n'existe pas, et c'est exactement comme ça qu'un abonnement oublié se paie pendant deux ans.

## Ajouter un coût

Raccourci ⚡ « Nouvel outil / nouveau coût ». Il demande : l'outil, à quoi il sert, le coût mensuel
HTVA, qui en est responsable, la date de renouvellement, et si des données personnelles y transitent
(cette dernière question conditionne un DPA — voir REMI-015).

## Toute dépense récurrente est une décision

Elle passe par #hq-decisions, approbateurs Arnaud + Morgane. Un essai gratuit qui devient payant est
une dépense récurrente.

## Jamais ici

Coordonnées bancaires, identifiants, factures contenant un numéro de compte complet. Les documents
sensibles vont dans le Drive, avec le lien ici.
```

---

## 9. Alerts and integrations

Five integrations, in the order they earn their keep. Each is "install, then paste".

### 9.1 GitHub — the run radar

Install: <https://slack.github.com> → _Add to Slack_. Then, in any channel:

```text
/github signin
```

**In `#dev-pipeline`** — the pipeline spine. The app subscribes you to `issues`, `pulls`,
`commits`, `releases` and `deployments` by default, so the second line matters as much as the
first: this repo puts specs in PRs and explicitly keeps issues out of the agent's way, so issue
noise here is pure cost.

```text
/github subscribe k0d0minio/remi-ai
/github unsubscribe k0d0minio/remi-ai issues commits releases deployments
/github subscribe k0d0minio/remi-ai reviews comments
```

That leaves exactly: pull requests opened and merged, reviews, and review comments — the three
events that mean "a human is needed".

**In `#alert-prod`** — what happens to `main` and to CI:

```text
/github subscribe k0d0minio/remi-ai
/github unsubscribe k0d0minio/remi-ai issues pulls releases deployments
/github subscribe k0d0minio/remi-ai commits:main
/github subscribe k0d0minio/remi-ai workflows:{name:"Quality" branch:"main"}
/github subscribe k0d0minio/remi-ai workflows:{name:"Gates" branch:"main"}
/github subscribe k0d0minio/remi-ai workflows:{name:"Pipeline" branch:"main"}
```

The three workflow names come from `.github/workflows/{quality,gates,pipeline}.yaml`. A squash-merge
onto `main` shows up as a commit here, which is your de-facto "shipped" signal — and it arrives
whether or not anyone remembered to announce it.

**In `#hq-produit`** — the Design stage's demo PRs, so Morgane sees a prototype the moment it is
live, in the channel where she already is:

```text
/github subscribe k0d0minio/remi-ai
/github unsubscribe k0d0minio/remi-ai issues commits releases deployments
/github subscribe k0d0minio/remi-ai +label:"type:design"
```

The label filter is the whole trick: `type:design` is exactly the label the Design front puts on
its `apps/demo`-only PRs, so this channel gets prototypes and nothing else.

Useful afterwards:

```text
/github subscribe list          # what this channel is subscribed to
/github unsubscribe k0d0minio/remi-ai   # stop everything in this channel
```

### 9.2 Vercel — deploys and previews

Install from <https://vercel.com/marketplace/slack> (or Vercel dashboard → _Integrations_ →
_Slack_), authorise, then in `#alert-prod`:

```text
/vercel subscribe
```

Pick, in the dialog: **deployment failed**, **deployment succeeded (production only)**, and
**comments**. Do not subscribe to preview-deployment successes — six apps × every push is exactly
the noise that trains people to mute a channel.

Preview URLs are how the Verify stage's smoke test happens, and how Morgane signs off a demo; they
arrive on the PR itself, which is already in `#dev-pipeline` and `#hq-produit`.

### 9.3 GitHub Actions failures

Already covered by the `workflows:` subscriptions in § 9.1. Resist adding a Slack-notify step to
`.github/workflows/*.yaml`: that would need an incoming-webhook secret in the repo, another row in
[`ENV.md`](ENV.md), and it would duplicate a signal you already get for free.

### 9.4 The ship note — Resend into a Slack channel

This one is the neatest fit in the whole setup, because the pipeline already sends it.
`pipeline/scripts/send-ship-note.sh` emails the Ship stage's note via Resend to whatever is in
`SHIP_NOTE_RECIPIENTS`, and its own header says the recipient is _"normally ONE address: a
channel's inbound email, so the note lands where the owners already read everything."_ That channel
is `#hq-announcements`.

1. Open `#hq-announcements` → click the channel name → **Integrations** tab → **Send emails to this
   channel** → **Get email address**.
2. Copy the address Slack generates (it looks like
   `remi-ai-aaa1234@remiai.slack.com`).
3. Set it as `SHIP_NOTE_RECIPIENTS` wherever the pipeline scripts run — your shell profile or the
   app's `.env.local`. **Not in this file, and not in git**: `ENV.md` catalogues names, never
   values, and that variable already has its row there.
4. While you are in that dialog, set the sender name to `REMI · livraisons` and the icon to 🚢, so
   ship notes are visually distinct from human announcements.
5. Test it end to end with a dry run first:

```bash
pipeline/scripts/send-ship-note.sh <slug>          # dry run — prints, sends nothing
pipeline/scripts/send-ship-note.sh <slug> --send   # sends
```

Slack caps you at 30 channel email addresses; you will use one — two if you later want practitioner
emails forwarded into `#hq-intake`.

### 9.5 Supabase — once REMI-013 lands

Supabase has no first-party Slack app. The route is a **database webhook → a Slack workflow**, and
it costs nothing extra because Workflow Builder's webhook trigger is on Pro.

Build the Slack side first (§ 10 explains the builder UI):

1. `#alert-prod` → **Automations → Workflows → New workflow → From a webhook**.
2. Add these variables (name → type), all text: `event`, `table`, `severity`, `detail`.
3. Add one step, _Send a message to a channel_ → `#alert-prod`:

```text
:rotating_light: Supabase — {{event}}
Table: {{table}} · Severity: {{severity}}
{{detail}}

Reply in thread: fixed / ignored (why) / ticketed (link).
```

4. Publish, copy the webhook URL, then create the Supabase database webhook (Dashboard → _Database_
   → _Webhooks_) pointing at it with a JSON body whose keys match the four variables exactly.
5. Test before trusting it:

```bash
curl -X POST -H 'Content-Type: application/json' \
  -d '{"event":"test","table":"none","severity":"info","detail":"Webhook wiring test — ignore."}' \
  '<the webhook URL Slack gave you>'
```

Treat that URL as a secret: anyone holding it can post into the channel. It belongs in Supabase's
config, not in the repo.

### 9.6 Error tracking — once REMI-017 lands

[REMI-017](../intake/REMI-017-error-tracking.md) is the ticket that picks an error tracker. Whatever
it picks (Sentry is the obvious candidate and has a first-party Slack app), the routing rule is
decided now so the ticket does not have to re-litigate it: **production, unhandled, first
occurrence → `#alert-prod`. Everything else → nowhere.** An error tracker that posts every
occurrence is a channel you mute in a week.

### 9.7 Google Calendar

Install the Google Calendar app for Slack and connect the `@remiai.be` account. It is what makes
§ 12's rhythm real rather than aspirational: the bet, the recap and the audit exist as calendar
events, and Slack reminds you.

```text
/gcal help
```

### 9.8 Optional — Claude in Slack

If you want to be able to ask questions of the codebase from Slack rather than from a terminal,
Claude Code can install its Slack app (`/install-slack-app` from the Claude Code CLI). It is genuinely
useful for "what does REMI-024 actually say" while you are on a phone. Two caveats, both about the
one rule: it reads the repo, so it answers from the source of truth rather than from Slack history,
and anything it produces that matters still has to land in git. Set it up **after** the rest works
— it is a nice-to-have, not part of the system.

---

## 10. Workflows and forms

### 10.1 How the builder works, once

**Automations → Workflows → New workflow.** A workflow is a **trigger** plus **steps**. Publish it,
then — for the form-style ones — add it to a channel so it appears under the ⚡ shortcuts button at
the bottom of the message box.

Three things worth knowing before you build ten of them:

- **Pro has no conditional branching.** Business+ adds "if this, then that" inside a workflow. Every
  recipe below is therefore linear: collect, post, done. Where a branch would be natural, a human
  reply in the thread does the branching instead (see the intake triage states in § 8.2).
- **Form answers become variables.** After a _Collect information_ step, each field is available in
  later steps as `{{Field name}}`. The blocks below use the exact field labels, so pasting them
  works — if you rename a field, rename it in the message too.
- **Publish, then test it yourself before telling anyone it exists.** A form that posts to the wrong
  channel teaches people not to use forms.

The eleven workflows below are the whole system. Build them in this order — the first four carry
most of the value.

### 10.2 « Signaler un bug » → `#hq-intake`

**Trigger:** _From a link in Slack_ (a shortcut). Add it to `#hq-intake` and `#hq-produit`.
**Step 1 — Collect information.** Fields:

```text
Field 1 — Qu'est-ce qui ne marche pas ?  (short answer, required)
Field 2 — Où l'avez-vous vu ?  (select, required)
         Options: web (le produit) · admin · marketing (le site public) · docs · support · demo · autre
Field 3 — Comment le reproduire, étape par étape ?  (long answer, required)
Field 4 — Qu'est-ce qui devrait se passer à la place ?  (long answer, required)
Field 5 — Gravité  (select, required)
         Options: bloquant (personne ne peut travailler / le client le voit) · gênant · cosmétique
Field 6 — Lien ou capture d'écran, si vous en avez  (short answer, optional)
```

**Step 2 — Send a message to `#hq-intake`:**

```text
:beetle: *Bug signalé par {{person who submitted}}*

*Ce qui ne marche pas :* {{Qu'est-ce qui ne marche pas ?}}
*Où :* {{Où l'avez-vous vu ?}} · *Gravité :* {{Gravité}}

*Reproduction :*
{{Comment le reproduire, étape par étape ?}}

*Attendu :*
{{Qu'est-ce qui devrait se passer à la place ?}}

*Complément :* {{Lien ou capture d'écran, si vous en avez}}

Tri sous 48 h : 🎫 ticket · ⚡ voie rapide · 🧊 plus tard · ❌ non — puis ✅ ici avec le lien.
```

Why these six fields and not three: they are precisely what the `bug` fast lane needs to reproduce
before fixing (`pipeline/lanes/bug/CONTEXT.md`). A bug report that arrives complete goes straight
into the lane; one that arrives as "ça marche pas" costs three round-trips, and those round-trips
happen at Morgane's speed, not yours.

**The triage reply**, pasted by whoever triages, so the loop always closes the same way:

```text
🎫 Ticket créé : <lien vers .icm/intake/REMI-0XX-….md>
⚡ Voie rapide : <lien de la PR>
🧊 Plus tard : consigné dans <ticket de phase>, revu au prochain pari
❌ Non : <la raison, une phrase>
```

### 10.3 « Proposer une idée » → `#hq-intake`

**Trigger:** shortcut in `#hq-intake`, `#hq-produit`, `#biz-growth`.
**Step 1 — Collect information:**

```text
Field 1 — L'idée, en une phrase  (short answer, required)
Field 2 — Quel problème ça résout, et pour qui ?  (long answer, required)
         Placeholder: Une patiente ? Une praticienne ? Nous ? Décrivez la personne et le moment.
Field 3 — Qu'est-ce qui se passe aujourd'hui sans ça ?  (long answer, required)
Field 4 — Est-ce que ça touche au produit, à l'acquisition, ou à notre façon de travailler ?  (select, required)
         Options: produit · acquisition · notre façon de travailler · je ne sais pas
Field 5 — Urgence ressentie  (select, required)
         Options: à faire maintenant · au prochain cycle · un jour peut-être
```

**Step 2 — Send a message to `#hq-intake`:**

```text
:bulb: *Idée de {{person who submitted}}* — {{L'idée, en une phrase}}

*Le problème :* {{Quel problème ça résout, et pour qui ?}}
*Aujourd'hui sans ça :* {{Qu'est-ce qui se passe aujourd'hui sans ça ?}}
*Domaine :* {{Est-ce que ça touche au produit, à l'acquisition, ou à notre façon de travailler ?}} · *Urgence :* {{Urgence ressentie}}

Une idée n'est pas un engagement : elle est triée sous 48 h et, si elle vit, elle entre dans une
future session de cadrage (`/pipeline scope`). Elle ne devient jamais du code directement.
```

Field 3 is the one that does the work. "What happens today without this" is the question that
separates a real problem from a preference, and it is the question a `scope` session opens with
anyway.

### 10.4 « Demande de décision » → `#hq-decisions`

**Trigger:** shortcut, added to every `hq-` and `biz-` channel.
**Step 1 — Collect information:**

```text
Field 1 — La décision à prendre, formulée comme une question  (short answer, required)
Field 2 — Les options envisagées  (long answer, required)
         Placeholder: Une par ligne. Trois maximum — au-delà, ce n'est pas encore une décision, c'est une exploration.
Field 3 — Ce qui se passe si on ne décide pas  (long answer, required)
Field 4 — Qui tranche ?  (select, required)
         Options: Morgane (produit, direction, prix) · Arnaud (juridique, finances, société) · Jamie (technique, livraison) · Arnaud + Morgane (dépense récurrente)
Field 5 — Décision facile à annuler ?  (select, required)
         Options: oui, réversible en une journée · non, on vit avec pendant des mois
Field 6 — Échéance souhaitée  (date, required)
```

**Step 2 — Send a message to `#hq-decisions`:**

```text
:balance_scale: *Décision demandée par {{person who submitted}}*

*Question :* {{La décision à prendre, formulée comme une question}}
*Approbateur :* {{Qui tranche ?}} · *Échéance :* {{Échéance souhaitée}} · *Réversible :* {{Décision facile à annuler ?}}

*Options :*
{{Les options envisagées}}

*Si on ne décide pas :*
{{Ce qui se passe si on ne décide pas}}

Contributeurs : répondez en fil avant l'échéance.
{{Qui tranche ?}} : la décision est prise quand ce fil porte une réponse « Décision : … » avec le lien vers le dépôt.
```

Field 5 is deliberate. A reversible decision that lands here should get a one-line answer and be
closed in an hour; the framework itself says not to ceremonialise cheap, reversible choices. Making
people declare it up front keeps the channel for the decisions that deserve it.

### 10.5 « Demander une validation » → a direct message

The chaser for the two binding gates. Runs stall in exactly one place: waiting for a human to tick
a checkbox they did not know was waiting.

**Trigger:** shortcut in `#dev-pipeline` and `#hq-produit`.
**Step 1 — Collect information:**

```text
Field 1 — Lien de la pull request  (short answer, required)
Field 2 — Quelle validation ?  (select, required)
         Options: Spec approved (avant la construction) · Ready to merge (autorise la fusion) · Validation de la démo (prototype en ligne) · Cadrage accepté
Field 3 — Ce qu'il faut regarder, en deux lignes  (long answer, required)
Field 4 — À qui ?  (person, required)
```

**Step 2 — Send a message to a person** → `{{À qui ?}}`:

```text
:white_check_mark: *{{person who submitted}} attend une validation de ta part.*

*Quoi :* {{Quelle validation ?}}
*Où :* {{Lien de la pull request}}

*À regarder :*
{{Ce qu'il faut regarder, en deux lignes}}

Rappel : cette validation se donne en cochant la case dans la pull request, pas en répondant ici.
Un « ok » dans Slack ne fait rien avancer — c'est la case qui débloque l'étape suivante.
```

**Step 3 — Send a message to `#dev-pipeline`** (so the wait is visible, not buried in a DM):

```text
:hourglass_flowing_sand: En attente de « {{Quelle validation ?}} » de {{À qui ?}} — {{Lien de la pull request}}
```

### 10.6 Le pari de la quinzaine → `#hq-announcements`

**Trigger:** _On a schedule_ — every second Monday, 09:15, Europe/Brussels. (Slack schedules weekly;
run it weekly and let the odd weeks be a two-minute confirmation, or set it fortnightly if your
scheduler offers it.)
**Step 1 — Send a message to `#hq-announcements`:**

```text
:dart: *Pari de la quinzaine — semaine du {{date}}*

Huddle à 9 h 30, 30 minutes, ordre du jour fixe :

1. *Ce qui est parti* depuis le dernier pari — deux minutes, sans commentaire.
2. *Ce qui est en cours* — limite : 2 réalisations ouvertes, 1 seule en construction. On en ferme
   une avant d'en ouvrir une autre.
3. *Le pari* — on tire de `.icm/intake/`, dans l'ordre des phases A → F. On nomme les tickets, on
   nomme le résultat visible attendu, on s'arrête là.
4. *Ce qu'on ne fait pas* — la liste courte de ce qui est explicitement gelé 🧊 pour la quinzaine.
5. *Bloquants* — ce qui attend une décision ou une validation de quelqu'un.

Le pari est écrit en réponse à ce message, une fois. Il ne change pas en cours de route, sauf
incident de production.
```

**Step 2 — Send a message to `#hq-announcements`** (the template to fill in as the reply — or paste
it manually; keeping it as a second step means it is always at hand):

```text
*Pari : du {{date}} au <date+2 semaines>*

*On construit :*
• <REMI-0XX — le résultat visible attendu>
• <REMI-0XX — le résultat visible attendu>

*On ne fait pas 🧊 :* <la liste courte>
*Décisions attendues :* <qui doit trancher quoi, avec le lien vers #hq-decisions>
*Refroidissement :* vendredi <date> après-midi — nettoyage, docs, chores.
```

### 10.7 Récap du vendredi → `#hq-announcements`

**Trigger:** _On a schedule_ — every Friday, 16:00, Europe/Brussels.

```text
:ship: *Récap de la semaine — {{date}}*

Trois réponses en fil, une ligne chacune :

1. *Parti en production cette semaine* — ce qu'une utilisatrice peut voir ou faire aujourd'hui et
   qui n'existait pas lundi. Les notes de livraison sont déjà arrivées dans ce canal ; ici on dit
   ce que ça change.
2. *Ce qui a glissé, et pourquoi* — sans justification, juste le fait. Un pari qui glisse deux fois
   d'affilée est un pari mal taillé, et c'est une information utile.
3. *Ce qui bloque lundi* — la décision, la validation ou l'information qui manque.

Ce que personne n'écrit ici disparaît. C'est la seule trace hebdomadaire qu'on garde.
```

### 10.8 « Nouvel outil / nouveau coût » → `#biz-money`

**Trigger:** shortcut in `#biz-money` and `#hq-general`.

```text
Field 1 — L'outil ou le service  (short answer, required)
Field 2 — À quoi il sert, en une phrase  (short answer, required)
Field 3 — Coût mensuel HTVA  (short answer, required)
         Placeholder: en euros, par mois, TVA non comprise — p. ex. 21,75 €
Field 4 — Qui en est responsable ?  (person, required)
Field 5 — Date de renouvellement ou de fin d'essai  (date, required)
Field 6 — Des données personnelles y transitent-elles ?  (select, required)
         Options: non · oui, données de l'équipe · oui, données de patientes ou de praticiennes · je ne sais pas
```

**Step 2 — Send a message to `#biz-money`:**

```text
:credit_card: *Nouvel outil déclaré par {{person who submitted}}*

*Outil :* {{L'outil ou le service}} — {{À quoi il sert, en une phrase}}
*Coût :* {{Coût mensuel HTVA}} /mois HTVA · *Responsable :* {{Qui en est responsable ?}}
*Renouvellement :* {{Date de renouvellement ou de fin d'essai}}
*Données personnelles :* {{Des données personnelles y transitent-elles ?}}

À faire : ajouter la ligne au registre des outils et des coûts (REMI-012) et répondre ici avec le
lien. Si des données de patientes ou de praticiennes transitent, un DPA est requis avant le premier
enregistrement réel (REMI-015) — ouvrez une décision dans #hq-decisions.
```

### 10.9 « Praticienne fondatrice » → `#biz-growth`

The beta recruitment loop ([REMI-031](../intake/REMI-031-founding-practitioner-beta.md)). ~15
practitioners is a **recruitment target**, not a signed pilot — this form is how the target stops
being a number and becomes a list.

```text
Field 1 — Nom de la praticienne  (short answer, required)
Field 2 — Où l'avons-nous rencontrée ?  (short answer, required)
Field 3 — Spécialité / type de pratique  (short answer, required)
Field 4 — Combien de patientes suit-elle, à peu près ?  (short answer, optional)
Field 5 — Où en est-on ?  (select, required)
         Options: premier contact · démo prévue · démo faite · intéressée, en attente · engagée pour la bêta · non
Field 6 — Prochaine action, et pour quand ?  (short answer, required)
Field 7 — Ce qu'elle a dit qui compte  (long answer, optional)
         Placeholder: Ses mots, pas notre résumé. C'est ce qui alimente le braindump et le produit.
```

**Step 2 — Send a message to `#biz-growth`:**

```text
:seedling: *{{Nom de la praticienne}}* — {{Où en est-on ?}}

*Pratique :* {{Spécialité / type de pratique}} · *Patientes :* {{Combien de patientes suit-elle, à peu près ?}}
*Rencontrée :* {{Où l'avons-nous rencontrée ?}}
*Prochaine action :* {{Prochaine action, et pour quand ?}}

*Ses mots :*
{{Ce qu'elle a dit qui compte}}

Ajouté par {{person who submitted}}. Le suivi vit dans la liste « Praticiennes fondatrices ».
```

Field 7 matters more than the rest combined: it is raw product research in the practitioner's own
words, and it is exactly the material that belongs in the braindump rather than in a CRM.

### 10.10 « Bienvenue » → automatic, on joining `#hq-general`

**Trigger:** _When a person joins a channel_ → `#hq-general`.
**Step:** _Send a message to a person_ → the person who joined:

```text
Bienvenue chez REMI AI :wave:

Une seule règle : *Slack porte ce qui se passe, le dépôt porte ce qui est vrai.* Tout ce qui compte
encore dans trois mois repart dans le dépôt sous 24 h.

Commence par le canvas épinglé dans #hq-general — qui fait quoi, où vit la vérité, le rythme de la
quinzaine, à quoi sert chaque canal. Puis règle tes notifications : mentions uniquement partout,
sauf #hq-announcements et #alert-prod.

Une question sur le produit ? #hq-produit. Une idée ou un bug ? le bouton ⚡ dans #hq-intake.
```

### 10.11 « 🚨 Bloqué » → escalation by emoji

**Trigger:** _When an emoji reaction is used_ → `:rotating_light:` → in any channel.
**Step:** _Send a message to `#hq-general`_:

```text
:rotating_light: *{{person who reacted}} signale un blocage* — {{link to message}}

Quelqu'un doit intervenir maintenant. Si ce n'est pas vous, ignorez ; si c'est vous, répondez dans
le fil d'origine, pas ici.
```

Three people do not need an escalation policy. They need one gesture that means _now_, that works
from a phone, and that does not require finding the right channel first.

### 10.12 Audit de la connaissance → `#hq-general`

**Trigger:** _On a schedule_ — first Monday of the month, 10:00 (set weekly on Mondays and skip, or
monthly if offered).

```text
:books: *Audit de la connaissance — 30 minutes, maintenant*

1. *Les canaux* — un canal sans activité depuis 90 jours est archivé. Maintenant, pas « bientôt ».
2. *Les canvas* — chaque canvas de canal décrit-il encore ce qui s'y passe ? Un canvas faux est
   pire que pas de canvas.
3. *La dérive documentaire* — `.icm/docs/README.md` dit que les pages business de `apps/docs`
   n'ont pas encore été réconciliées avec le braindump. Combien de pages reste-t-il ? Une de moins
   qu'au mois dernier ?
4. *Le registre des outils* — chaque abonnement est-il encore utilisé ? Un renouvellement dans les
   30 jours qu'on ne veut plus se résilie aujourd'hui.
5. *Les décisions sans lien* — dans #hq-decisions, tout fil qui n'a pas de « Décision : … + lien »
   est soit à trancher, soit à fermer.
6. *Les alertes sans réponse* — dans #alert-prod, toute alerte sans fil de réponse.

Chaque point : fait ou reporté avec une date. Pas de troisième option.
```

---

## 11. Lists — one board, and only one

Slack Lists (included on Pro) are a lightweight tracker. The temptation is to rebuild the backlog in
one. **Don't** — `.icm/intake/` is the backlog, it is ordered, it is in git, and the admin console's
tickets board already reads it. A second copy would be wrong within a week.

There is exactly one job a List does better than git: **work that is not code and has no ticket** —
the company admin that Arnaud carries, and the Startup Boost file. That work has owners and dates,
it does not belong in a repository, and it is currently nowhere.

**Create one List, `Opérations`**, saved to `#biz-money`, with these columns:

| Column      | Type   | Options                                                              |
| ----------- | ------ | -------------------------------------------------------------------- |
| Tâche       | Text   | —                                                                    |
| Responsable | Person | —                                                                    |
| État        | Select | à faire · en cours · en attente d'un tiers · fait                    |
| Échéance    | Date   | —                                                                    |
| Domaine     | Select | société · juridique / RGPD · finances · Startup Boost · fournisseurs |
| Lien        | Text   | vers le dépôt, le Drive ou le fil Slack                              |

Seed it with what is already known to be outstanding, from
[`history/info-gathering.md`](history/info-gathering.md) and the Phase A tickets:

```text
Numéro BCE/KBO, adresse du siège, numéro de TVA, date de constitution — Arnaud — société
Registrar / DNS de remiai.be — Arnaud — fournisseurs
Google Workspace : qui reçoit morgane@ et arnaud@ — Arnaud — société
DPA signés (Vercel, Supabase, Anthropic, autres) — Arnaud — juridique / RGPD (bloque REMI-015)
Comptable et avocat : noms et coordonnées — Arnaud — société
Critères d'éligibilité Startup Boost — Jamie + Arnaud — Startup Boost (REMI-010)
```

**A second List is optional and only if § 10.9 fills up: `Praticiennes fondatrices`**, columns Nom ·
Statut · Prochaine action · Échéance · Fil Slack. Fifteen rows is the entire beta (REMI-031). If it
ever needs more than a List, it needs a CRM, and that is a decision for #hq-decisions.

---

## 12. The rhythm

Four recurring events. Put all four in Google Calendar as recurring invitations, with the Slack
channel in the location field, so they exist even when someone is travelling.

| When                               | What                     | How long | Where                              |
| ---------------------------------- | ------------------------ | -------- | ---------------------------------- |
| Monday, every second week, 09:30   | Le pari de la quinzaine  | 30 min   | Huddle in `#hq-announcements`      |
| Friday, weekly, 16:00              | Récap de la semaine      | async    | Thread in `#hq-announcements`      |
| Last Friday afternoon of the cycle | Refroidissement          | ½ day    | No meeting — cleanup, docs, chores |
| First Monday of the month, 10:00   | Audit de la connaissance | 30 min   | `#hq-general`                      |

**Huddles, not video calls.** A huddle starts in the channel, records notes automatically on paid
plans, and leaves the notes attached where the conversation already is. For the bet, that means the
"what did we say last time" question answers itself.

**Everything else is async.** Three people in two or three locations do not need a daily
synchronous point; the Friday recap plus working out loud in `#dev-notes` covers it. If a stand-up
ever feels necessary, it is a symptom — usually of a bet that was too vague to be worked on alone.

**Notification defaults, so async actually works:** mentions only, everywhere, except
`#hq-announcements` and `#alert-prod` (all messages). Set working hours in each profile; Slack then
holds notifications outside them. A three-person company where everyone is reachable at 22:00 burns
out in a year, and the fix is a setting, not willpower.

---

## 13. Security, and what never goes in Slack

Slack is a US-hosted SaaS holding your internal conversation. That is fine for internal
conversation, and not fine for anything else. The lines:

**Never in Slack, in any channel, ever:**

| Never                                              | Where it goes instead                                            |
| -------------------------------------------------- | ---------------------------------------------------------------- |
| API keys, tokens, connection strings, passwords    | Vercel env vars / GitHub Actions secrets. `ENV.md` holds _names_ |
| Patient data — names, health details, screenshots  | Nowhere outside the product. Not even anonymised "examples"      |
| Practitioner personal data beyond a name and stage | The List (§ 11) at most; the real record goes in the product     |
| Bank details, full invoices, contracts             | The Drive, with the link in `#biz-money`                         |

If a secret does land in Slack: **rotate it, then delete the message.** Deleting alone is theatre —
it was in a message queue, a notification and possibly a phone lock screen. This is the same
discipline `ENV.md` already states for the repo, extended one tool sideways.

**The settings that back it up** (all in § 5): 2FA required, app installation by approval, Slack
Connect by owner approval, and message editing limited to a 24-hour window.

**Retention.** Keep everything. It is counterintuitive as a privacy stance, but the alternative —
a 90-day auto-delete — encourages treating Slack as durable storage while quietly destroying the
record. The correct control is not deleting Slack, it is not putting the sensitive thing there.

---

## 14. Outsiders — Slack Connect and guests

Pro includes Slack Connect with up to 250 external organisations. Three uses will come up:

| Who                                               | How                                                                                                      |
| ------------------------------------------------- | -------------------------------------------------------------------------------------------------------- |
| The accountant, the lawyer, a Startup Boost coach | **Slack Connect channel**, named `#ext-<nom>`. They keep their own Slack; you keep yours                 |
| A founding practitioner during the beta           | **Do not.** They belong in the product, not in your workspace. Feedback comes through the form and email |
| A contractor working on the code                  | **Multi-channel guest**, limited to `#dev-notes` and `#dev-pipeline`, removed on the last day            |

Rules for every `ext-` channel, pinned as its canvas:

```text
Ce canal est partagé avec une personne extérieure à REMI AI.

- Rien de confidentiel qui ne la concerne pas : pas de chiffres d'ensemble, pas de discussions
  d'équipe, pas de captures d'écran du produit contenant des données.
- Les décisions prises ici repartent dans #hq-decisions côté interne. Le canal externe n'est jamais
  le lieu de la décision, seulement de la conversation.
- Le canal est archivé à la fin de la mission, pas « un jour ».
```

---

## 15. The rollout — three sittings

Do not do this in one evening. The workspace people actually adopt is the one where every channel
already explains itself on the day they arrive.

**Sitting one — the shell (≈ 90 min, alone)**

- [ ] Create the workspace, upgrade to Pro annual (§ 3–4)
- [ ] Apply every admin setting in § 5
- [ ] Rename `#general` → `#hq-general`; create the other ten channels (§ 6.3)
- [ ] Paste every topic and description
- [ ] Paste the home canvas into `#hq-general` and pin it (§ 8.1)

**Sitting two — the wiring (≈ 90 min, alone)**

- [ ] GitHub app: install, sign in, run the three channel blocks (§ 9.1)
- [ ] Vercel app: install, `/vercel subscribe` in `#alert-prod` (§ 9.2)
- [ ] Channel email for `#hq-announcements`; set `SHIP_NOTE_RECIPIENTS`; dry-run the ship note (§ 9.4)
- [ ] Google Calendar app; create the four recurring events (§ 12)
- [ ] Paste the four channel canvases (§ 8.2)
- [ ] Build workflows 10.2, 10.3, 10.4, 10.5 — the four that carry the value
- [ ] Test each one yourself, end to end

**Sitting three — the people (≈ 45 min, together)**

- [ ] Invite Arnaud (Owner) and Morgane (Admin) with the § 7 message
- [ ] Walk the home canvas together, live, in a huddle. Ten minutes, and it prevents a year of
      "where do I put this"
- [ ] Everyone sets notifications, working hours, timezone, and a real profile photo
- [ ] Run the first `Pari de la quinzaine` in that same huddle — the system starts by being used,
      not by being announced
- [ ] Afterwards: build the remaining workflows (10.6–10.12) and the `Opérations` List (§ 11)

**Then, deliberately, for two weeks: no new channels.** The instinct when a workspace is new is to
create a channel per topic. Resist it; the eleven cover more than you think, and the monthly audit
is where the map changes.

---

## 16. Keeping it honest

**Monthly** — the audit workflow (§ 10.12) runs itself. Take it seriously; it is the only thing
standing between this system and the usual slow rot.

**When to change the plan.** Stay on Pro until one of these is true:

| Signal                                                 | Then                                                                                  |
| ------------------------------------------------------ | ------------------------------------------------------------------------------------- |
| Headcount passes ~8, or you hire someone non-technical | Consider Business+ for advanced Slack AI (channel recaps genuinely help at that size) |
| A client or investor requires SSO / SAML               | Business+                                                                             |
| You start processing patient data through a workflow   | Stop. That is a DPA and a data-protection decision first (REMI-015)                   |
| Slack becomes where people look for the truth          | The system has failed. Fix the docs, not the tool                                     |

**When to add a channel.** Only when a topic has produced sustained conversation in `#hq-general`
for two weeks _and_ somebody has muted something because of it. Channels are cheap to create and
expensive to maintain; that asymmetry is what kills workspaces.

**The failure mode to watch for.** Not silence — drift. The tell is a question answered twice in
Slack, differently, a month apart. When you see it, the answer belongs in `.icm/docs/` and the
Slack thread should have linked to it the first time. Fix the doc; then link.

---

## 17. What I assumed, and what you should confirm

Five things I could not settle from the repository, flagged rather than invented:

1. **Arnaud's domain.** I made him the approver for legal, finance, company and data protection,
   and a workspace Owner. That comes from `history/info-gathering.md`, where the DPAs, the company
   particulars and the accountant are all addressed to him. If he is more product-facing than that,
   the approver table in § 2.3 and the `#hq-decisions` canvas both need one edit.
2. **The two-week cycle.** Chosen because your Phase A is sized in days and Phase B in 1–2 weeks.
   If Phase C turns out to be a month of work, move to three-week cycles rather than letting a bet
   run over — a bet that routinely overruns stops being information.
3. **Slack Connect for founding practitioners.** I recommended against it (§ 14). If the beta plan
   in REMI-031 assumes a shared channel with practitioners, that is a real decision with a real
   data-protection dimension, and it belongs in `#hq-decisions` before the beta opens.
4. **The workspace email domain.** I assumed `@remiai.be` mailboxes exist and are monitored —
   `history/info-gathering.md` REQ-06 lists that as still unconfirmed. If they are not live yet,
   set the workspace up on them anyway and fix the mail routing; a workspace founded on a personal
   Gmail is painful to migrate later.
5. **Who pays.** Slack bills annually to one card. Section 3's register row assumes Arnaud holds
   billing and you hold workspace admin — worth stating out loud once, because a SaaS subscription
   nobody owns is the first row that goes stale in any tool register.

---

## 18. Sources

Slack plans and capabilities were checked in August 2026; plan boundaries move, so re-check
anything cost-relevant before buying.

- [Slack pricing](https://slack.com/pricing) — plan comparison and per-seat cost
- [Updates to feature availability and pricing for Slack plans](https://slack.com/help/articles/39264531104275-Updates-to-feature-availability-and-pricing-for-Slack-plans) — where Slack AI landed after the add-on was withdrawn
- [Manage Workflow Builder access and features](https://slack.com/help/articles/360035822734-Manage-Workflow-Builder-access-and-features) — plan availability
- [Send emails to Slack](https://slack.com/help/articles/206819278-Send-emails-to-Slack) — channel email addresses (paid plans, 30 per workspace)
- [Naming channels by convention](https://api.slack.com/best-practices/blueprints/channel-naming-conventions) — Slack's own prefix guidance
- [Customizing notifications for GitHub in Slack](https://docs.github.com/en/integrations/how-tos/slack/customize-notifications) — the exact `/github subscribe` feature list and filter syntax
- [Slack for Vercel](https://vercel.com/marketplace/slack) and [Run and track deploys from Slack](https://vercel.com/kb/guide/run-and-track-deploys-from-slack)
- [Creating webhook triggers](https://docs.slack.dev/tools/deno-slack-sdk/guides/creating-webhook-triggers/) — the Supabase route in § 9.5
- [Shape Up](https://basecamp.com/shapeup) — betting, appetite, cooldown
- [DACI, Atlassian Team Playbook](https://www.atlassian.com/team-playbook/plays/daci) — the decision roles, and when not to use them
- [The GitLab Handbook](https://handbook.gitlab.com/) and [Shared reality](https://handbook.gitlab.com/teamops/shared-reality/) — handbook-first, single source of truth
- [Architectural Decision Records](https://adr.github.io/) — the decision-record format § 8.2 borrows from

---

_This document is operational, not product truth. It holds no claim about what REMI is — where it
touches direction, [`.icm/docs/README.md`](README.md)'s precedence order wins, and this file should
be corrected._
