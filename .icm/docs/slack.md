# Slack for REMI AI

A three-person workspace: Jamie, Morgane, Arnaud. Two of the three have never used Slack.

This is the whole setup — about 45 minutes of clicking, then a page Morgane and Arnaud can learn in
five minutes. Every block in a fenced box is meant to be copied and pasted as-is.

---

## 1. What Slack is for here

The delivery pipeline in the repository already does the heavy lifting: it holds the scope, the
spec, the build, the checks and the release. None of that needs to be rebuilt in Slack, and trying
would produce a second half-accurate copy of everything.

So Slack does exactly three things, and they are the three verbs on the wall:

| Verb        | Meaning                                                                  |
| ----------- | ------------------------------------------------------------------------ |
| **Voir**    | Where each thing stands, without asking anyone                           |
| **Dire**    | An idea, a problem, a question — in one place, at any hour               |
| **Valider** | Say yes or no when Jamie needs a decision, a look at a prototype, a fact |

Everything below serves one of those three. If something you are about to add serves none of them,
leave it out — that is the mistake this version of the document exists to correct.

**What that means in practice.** Three channels, one page, one board, two buttons, two moments a
week. No process vocabulary, no ceremonies, nothing to remember. Jamie carries what is said in
Slack into the repository, because that is his job and the agents cannot read Slack.

---

## 2. Slack in five minutes — for Morgane and Arnaud

Paste this into the workspace as the first pinned message in `#equipe`. It is written for someone
opening Slack for the first time.

```text
*Slack en 5 minutes*

*1. C'est une messagerie par sujet, pas par personne.*
On écrit dans un canal (#equipe, #produit) plutôt qu'à quelqu'un en particulier. Comme ça, la
réponse profite à tout le monde et se retrouve six mois plus tard.

*2. Répondre = « répondre dans le fil ».*
Passez la souris sur un message → l'icône de bulle « Répondre dans le fil ». Ça garde chaque
conversation ensemble. C'est LA habitude à prendre ; le reste est du détail.

*3. Pour qu'on vous lise, mentionnez.*
Écrivez @jamie dans le message. Sans mention, on lit quand on passe ; avec mention, ça sonne.

*4. Les émojis servent à répondre sans écrire.*
Passez la souris → l'icône sourire.
👀 = je l'ai vu, je m'en occupe · ✅ = c'est fait / d'accord · 🚀 = c'est en ligne

*5. La recherche marche vraiment.*
La barre en haut. Cherchez un mot, vous retrouvez la conversation. Rien ne se perd, donc rien
n'a besoin d'être classé.

*6. Sur téléphone.*
Installez l'application, connectez-vous, et laissez les notifications activées : elles sont
réglées pour ne sonner que quand quelque chose vous attend.

*7. Vous n'avez pas à tout lire.*
Le canal #technique est bruyant et automatique : il est en sourdine pour vous, exprès. Tout ce
qui vous concerne arrive dans #equipe ou #produit, en français.
```

---

## 3. Three channels

| Channel      | Who writes       | What goes there                                                                                                   |
| ------------ | ---------------- | ----------------------------------------------------------------------------------------------------------------- |
| `#equipe`    | all three        | Everything human: news, questions, money, admin, what shipped. The home page is pinned here                       |
| `#produit`   | all three        | One thread per feature — the discussion before it is built, the prototype to look at, the questions that block it |
| `#technique` | machines + Jamie | GitHub, deploys, errors. Muted for Morgane and Arnaud, on purpose                                                 |

Three is the point. Two beginners in ten channels post nothing, because every message starts with
"where does this go?" — and a question nobody knows where to ask does not get asked.

**Create them:** rename the default `#general` to `equipe` (click the name → _Edit_), then
**+ → Create → Channel** for the other two. All public. Then paste each description in (click the
channel name → _Edit_ → Description).

```text
# equipe
Le canal principal. Tout ce qui n'est pas une discussion sur une fonctionnalité précise : les nouvelles, les questions, l'administratif, l'argent, ce qui part en ligne. En français. Le message épinglé « Comment on travaille » explique tout le reste.
```

```text
# produit
Une fonctionnalité = un fil. C'est ici qu'on décide ce qu'on construit, avant de le construire : le problème, pour qui, ce qu'on ne fait pas. C'est ici aussi qu'arrivent les maquettes à regarder et les questions qui bloquent. Le tableau « Où on en est » épinglé donne l'état de tout.
```

```text
# technique
Salle des machines : GitHub, déploiements, erreurs. En anglais, automatique, bruyant. Morgane et Arnaud : mettez ce canal en sourdine, vous n'avez jamais besoin de le lire. Tout ce qui vous concerne est traduit dans #equipe ou #produit.
```

---

## 4. One page — the pinned canvas in `#equipe`

The only document in the workspace. Short enough to read in one sitting, and it answers every
"how does this work here" question.

Open `#equipe` → the **+** in the bookmark bar → **Canvas** → paste → then ⋮ → _Pin to channel_.
Markdown converts on paste.

```markdown
# Comment on travaille

## Les trois canaux

- **#equipe** — tout le reste : nouvelles, questions, administratif, argent.
- **#produit** — une fonctionnalité = un fil. On en discute avant de la construire.
- **#technique** — les machines. En sourdine pour Morgane et Arnaud.

## Qui décide quoi

| Personne | Tranche sur                                                          |
| -------- | -------------------------------------------------------------------- |
| Morgane  | Le produit : quoi construire, pour qui, dans quel ordre, à quel prix |
| Arnaud   | La société : juridique, finances, contrats, protection des données   |
| Jamie    | La technique : comment c'est construit, avec quels outils            |

Si ça ne rentre dans aucune case, on en parle dans #equipe et on tranche à trois.

## Comment une fonctionnalité arrive

1. **On en parle** dans #produit. Jamie ouvre un fil : le problème, pour qui, ce qu'on ne fait
   pas dans cette version. Tout le monde répond dans le fil.
2. **Morgane valide** le fil : « OK on fait ça ». Rien n'est construit avant.
3. **Une maquette** cliquable arrive dans #produit. C'est le moment le moins cher pour dire
   « non, pas comme ça ». Fausses données : cliquez partout, rien n'est enregistré.
4. **Construction.** Le tableau « Où on en est » suit l'état. Pas de bruit pendant ce temps.
5. **En ligne.** Un message dans #equipe dit ce qu'une personne peut faire maintenant.

Entre les deux, Jamie pose parfois une **question qui bloque** : une question avec une date et
une réponse par défaut. Sans réponse à la date, il part sur la réponse par défaut — c'est
rattrapable, mais ça coûte, et le coût est écrit dans le message.

## Ce qu'on attend de vous

- Répondre aux questions qui portent une date, avant cette date. Même « je ne sais pas ».
- Regarder les maquettes quand elles arrivent. Deux minutes sur téléphone suffisent.
- Dire les choses ici plutôt qu'en message privé, pour que ça serve à tout le monde.

## Les deux rendez-vous

- **Lundi, 20 minutes**, en visio depuis #equipe : ce qui est parti, ce qu'on fait cette semaine,
  ce qui vous attend.
- **Vendredi, à l'écrit** : Jamie poste le récapitulatif de la semaine. Vous répondez quand vous
  voulez.

## Deux choses à savoir

- **La vérité produit reste le braindump de Morgane.** Ce qu'on décide ici s'y ajoute, ne le
  remplace pas.
- **Jamais de mot de passe, de clé, ni de donnée patiente dans Slack.** Si ça arrive une fois,
  on change la clé — on ne se contente pas de supprimer le message.
```

---

## 5. One board — « Où on en est »

The answer to _voir_. A Slack list, pinned in `#produit`, that Morgane and Arnaud can read in ten
seconds and filter on their own name to see what is waiting on them.

Create it from `#produit`: **+ → List**. Four columns, no more.

| Column          | Type   | Values                                                                                              |
| --------------- | ------ | --------------------------------------------------------------------------------------------------- |
| Quoi            | Text   | In plain French, from the user's point of view — « Améliore mon assiette », not a ticket number     |
| Où ça en est    | Select | on en discute · validé, à construire · maquette à regarder · en construction · en ligne · abandonné |
| Qui doit agir   | Person | Empty when nothing is waiting on a person                                                           |
| Quoi exactement | Text   | « regarder la maquette », « répondre sur l'adhérence » — never empty when _Qui doit agir_ is set    |

Two things it is not: it is not the backlog (that lives in `.icm/intake/`, ordered, and Jamie works
from it), and it does not hold specifications. It holds **state and expectations**, which is all
anybody outside the terminal needs.

**It also carries the admin.** Arnaud's outstanding items are rows like any other — that is why the
board is not called "features". Seed it with what is genuinely pending today:

```text
Numéro BCE, adresse du siège, numéro de TVA, date de constitution — Arnaud — bloque les pages légales et le dossier Startup Boost
Accès au registrar / DNS de remiai.be — Arnaud — bloque la mise en ligne sur le domaine de la marque
Qui reçoit morgane@ et arnaud@ — Arnaud — bloque le formulaire de contact du site
DPA signés (Vercel, Supabase, Anthropic) — Arnaud — bloque le premier enregistrement patient réel
Comptable et avocat : noms et coordonnées — Arnaud
Startup Boost : on y va ou pas — Arnaud + Jamie
Périmètre gelé de la V2 — Morgane — bloque le découpage des prochaines fonctionnalités
```

Jamie updates it at the Monday call and whenever something changes state. If keeping it current
ever takes more than two minutes, a column is too many.

---

## 6. Two buttons

Forms, not free text, because a beginner facing an empty message box writes one line and a beginner
facing three questions writes something usable. Two is the limit — a menu of eleven shortcuts is its
own kind of paralysis.

**Automations → Workflows → New workflow** for each. Publish, then add to the channel so it appears
under the ⚡ button at the bottom of the message box.

### Button 1 — « J'ai quelque chose à dire » → `#equipe`

One button for an idea, a bug, or a question. Sorting them is Jamie's job, not theirs.

Trigger: _From a link in Slack_ (a shortcut), added to `#equipe` and `#produit`.
Step 1, _Collect information_:

```text
Field 1 — C'est quoi ?  (select, required)
         Options: une idée · quelque chose qui ne marche pas · une question
Field 2 — Dites-le avec vos mots  (long answer, required)
         Placeholder: Pas besoin d'être précis ni technique. Si c'est un problème : ce que vous faisiez, et ce qui s'est passé.
Field 3 — C'est urgent ?  (select, required)
         Options: non, quand tu peux · cette semaine · maintenant, ça bloque
```

Step 2, _Send a message to a channel_ → `#equipe`:

```text
:speech_balloon: *{{person who submitted}} — {{C'est quoi ?}}*

{{Dites-le avec vos mots}}

Urgence : {{C'est urgent ?}}
```

Jamie replies in the thread with what became of it, and puts ✅ on the original. Every message gets
an answer within a day, even if the answer is "non, et voilà pourquoi" — a founder whose first three
messages went unanswered stops writing.

### Button 2 — « Une question qui bloque » → `#produit`

Jamie's button, not theirs. It is here because it is the single mechanism that keeps a build from
stalling silently.

Trigger: shortcut in `#produit` and `#technique`.

```text
Field 1 — La question, en une phrase, sans jargon  (short answer, required)
Field 2 — Pourquoi ça bloque  (long answer, required)
Field 3 — Les options  (long answer, required)
         Placeholder: Une par ligne, avec ce que chacune change concrètement.
Field 4 — Qui peut répondre ?  (person, required)
Field 5 — Avant le  (date, required)
Field 6 — Sans réponse, je pars sur  (short answer, required)
Field 7 — Et revenir en arrière coûtera  (short answer, required)
```

```text
:raising_hand: *Question pour {{Qui peut répondre ?}} — avant le {{Avant le}}*

*{{La question, en une phrase, sans jargon}}*

Pourquoi ça bloque : {{Pourquoi ça bloque}}

Les options :
{{Les options}}

Sans réponse d'ici là, je pars sur : {{Sans réponse, je pars sur}}
Revenir en arrière ensuite coûtera : {{Et revenir en arrière coûtera}}
```

Fields 6 and 7 are the whole design. A question with no default waits forever; a question with a
default and a stated cost gets answered, because the reader can see what their silence buys.

---

## 7. Two moments a week

### Monday, 20 minutes, a huddle in `#equipe`

Click the headphones icon at the bottom of the channel — that starts a call, no link to send, and
Slack writes the notes automatically on paid plans.

Three questions, in order, and nothing else:

1. Qu'est-ce qui est parti en ligne depuis lundi dernier ?
2. Qu'est-ce qu'on fait cette semaine ?
3. Qu'est-ce qui attend Morgane ou Arnaud ?

Then Jamie updates the board and the meeting is over. Twenty minutes is not a target, it is a
ceiling: past that, the conversation belongs in a `#produit` thread where it can be read later.

### Friday, in writing, in `#equipe`

Set this as a scheduled workflow (**New workflow → On a schedule** → Friday 16:00 → _Send a message_
→ `#equipe`), so it happens whether or not anyone remembers:

```text
:calendar: *Récap de la semaine*

Jamie répond en fil, en trois lignes :
• *En ligne cette semaine* — ce qu'une personne peut faire aujourd'hui et qui n'existait pas lundi.
• *Ce qui a pris du retard* — juste le fait, sans justification.
• *Ce qui bloque lundi* — la décision ou la réponse qui manque.

Morgane, Arnaud : si quelque chose vous surprend, dites-le dans le fil.
```

That is the entire rhythm. No fortnightly cycles, no retrospectives, no monthly audit — with three
people, a weekly call and a weekly written trace are enough, and anything more becomes the work.

---

## 8. The setup itself

### 8.1 Plan and cost

**Pro**, $7.25 per person per month billed annually — 3 × $7.25 × 12 ≈ **$261/year** (≈ 240 € HTVA).
It is the cheapest paid tier and it carries everything above: full message history (the free plan
hides messages past 90 days, which would break the "search finds it" promise in the primer), lists,
canvases, unlimited apps, group huddles, and the channel email address § 8.4 needs.

Add the row to the tool and cost register ([REMI-012](../intake/REMI-012-tool-and-cost-register.md)):

```text
Outil : Slack Pro
À quoi ça sert : communication de l'équipe, décisions produit, suivi
Responsable : Arnaud (facturation) / Jamie (administration)
Coût : ~21,75 $/mois HTVA (3 sièges, facturation annuelle) — ~261 $/an
Renouvellement : annuel, reconduction automatique
Données : conversation interne uniquement. Aucune donnée patiente, aucun secret
```

### 8.2 Create it

1. <https://slack.com/get-started#/createnew>, with your `@remiai.be` address.
2. Name: **REMI AI**. URL: `remiai.slack.com` if free.
3. Upgrade to Pro annual straight away: workspace name → _Settings & administration_ → _Manage
   subscription_.
4. Build the three channels, the canvas, the board and the two buttons **before** inviting anyone.
5. Then invite: Arnaud as **Owner** (never a single-owner workspace — that is a bus-factor
   incident), Morgane as **Admin**.

### 8.3 The settings worth changing

Everything else can keep its default. **Settings & administration → Workspace settings**:

| Setting                          | Set to                | Why                                              |
| -------------------------------- | --------------------- | ------------------------------------------------ |
| Two-factor authentication        | **Required**          | This workspace will sit next to health data      |
| Retention                        | Keep everything       | Search is the filing system                      |
| App installation                 | Require approval      | Free apps are how a workspace leaks              |
| Default channels for new members | `#equipe`, `#produit` | Someone joining lands where things are explained |
| Emails → send emails to channels | Allow Owners/Admins   | Needed for § 8.4                                 |

### 8.4 Two integrations, both into `#technique`

Everything automatic is English and constant, so none of it goes where Morgane and Arnaud read.

**GitHub** — install from <https://slack.github.com>, then in `#technique`:

```text
/github signin
/github subscribe k0d0minio/remi-ai
/github unsubscribe k0d0minio/remi-ai issues commits releases deployments
/github subscribe k0d0minio/remi-ai reviews comments
/github subscribe k0d0minio/remi-ai workflows:{name:"Quality" branch:"main"}
```

**Vercel** — install from <https://vercel.com/marketplace/slack>, then in `#technique`:

```text
/vercel subscribe
```

Pick _deployment failed_ and _deployment succeeded (production only)_. Not preview builds: six apps
× every push is exactly the noise that trains someone to mute a channel they need.

**The one automatic message the founders see** is the release note, and only because it is written
for them. The pipeline already emails it (`pipeline/scripts/send-ship-note.sh`), so point it at
`#equipe`: open `#equipe` → channel name → **Integrations** → _Send emails to this channel_ → **Get
email address**, then set that address as `SHIP_NOTE_RECIPIENTS` where the scripts run — not in this
file and not in git ([`ENV.md`](ENV.md) catalogues names, never values). Set the sender name to
`REMI` and the icon to 🚀 in the same dialog.

Test it before trusting it:

```bash
pipeline/scripts/send-ship-note.sh <slug>          # dry run, sends nothing
pipeline/scripts/send-ship-note.sh <slug> --send
```

### 8.5 What this asks of the repository

Two things, both small, and both because the audience changed:

1. **The release note is written in French**, for Morgane and Arnaud, and its first heading is the
   one-line answer to _what can someone do now that they could not before_ — not a slug.
   `CONVENTIONS.md` § Working languages already requires French for anything they read; this is a
   one-line change to `pipeline/stages/06_ship/CONTEXT.md`, riding the next release.
2. **Open questions get asked in Slack.** Every intake ticket carries an "Open questions — flag
   these on pickup" section, and the rule is to raise them rather than invent an answer. Button 2
   is where they get raised. A question in a PR body Morgane never opens has not been asked.

---

## 9. The rollout

**One sitting, about 45 minutes, alone:**

- [ ] Create the workspace, upgrade to Pro (§ 8.1–8.2)
- [ ] The five settings in § 8.3
- [ ] Rename `#general` → `#equipe`; create `#produit` and `#technique`; paste the three descriptions
- [ ] Paste the canvas into `#equipe` and pin it (§ 4)
- [ ] Pin the "Slack en 5 minutes" message in `#equipe` (§ 2)
- [ ] Create the board and fill it with what exists today, including the seven admin rows (§ 5)
- [ ] Build the two buttons and test each one on yourself (§ 6)
- [ ] GitHub and Vercel into `#technique`; the release note into `#equipe` (§ 8.4)

**Then, with the other two — 30 minutes, on a call:**

- [ ] Invite them
- [ ] Install the mobile app together, on the call. This is the step that decides whether the
      workspace gets used; everything else is decoration if Slack lives only on a laptop that is
      closed by six
- [ ] Walk through the pinned page and the board, out loud
- [ ] Mute `#technique` for both of them, there and then
- [ ] Have each of them use Button 1 once, for anything at all, and answer both messages while they
      are watching

**First fortnight:** open one real feature thread in `#produit` and let it run its course to a
« OK on fait ça ». One completed loop teaches the system better than the page does.

---

## 10. What was deliberately left out

An earlier version of this document had ten channels, two lists, fourteen workflows, a fortnightly
betting cycle, a decision-log channel with named approvers, a monthly documentation audit and an
emoji protocol. It described a good system for a company of fifteen. For three people — two of whom
are learning Slack itself — it was a second job.

What was cut, and the signal that would justify bringing it back:

| Cut                                         | Bring it back when…                                                              |
| ------------------------------------------- | -------------------------------------------------------------------------------- |
| Seven of the ten channels                   | A topic has crowded `#equipe` for two weeks and someone has muted something      |
| A separate decisions channel with approvers | You cannot remember why something was decided, twice in a month                  |
| A separate actions list                     | Admin rows crowd the features off the board                                      |
| Fortnightly cycles, cooldown, WIP limits    | There are more than two people building, so "who is on what" stops being obvious |
| Twelve of the fourteen forms                | The same request keeps arriving badly formed                                     |
| The monthly documentation audit             | Someone asks Jamie a question the board already answers                          |

Every one of those is worth adding **the day the pain is real** and not before. The way to keep this
workspace usable is to add nothing on the strength of an argument alone.

---

## 11. What I assumed

1. **Arnaud carries the company side** — legal, finance, contracts, data protection — which is why
   he decides those and why the admin rows are his. Inferred from
   [`history/info-gathering.md`](history/info-gathering.md), where the DPAs, the company particulars
   and the accountant are addressed to him. If that is wrong, the canvas's "qui décide quoi" table
   and the board rows are the two places to fix.
2. **Both are reachable within about two working days.** If either is materially less available,
   Button 2's default answer becomes the normal path rather than the fallback — worth saying out
   loud rather than discovering.
3. **The `@remiai.be` mailboxes are live.** `info-gathering.md` REQ-06 still lists that as
   unconfirmed. Found the workspace on them anyway; migrating off a personal Gmail later is painful.
4. **Practitioners stay out of Slack** during the beta. They belong in the product; feedback reaches
   the team through Button 1 and email. A shared channel with outside practitioners would be a real
   decision with a data-protection dimension, not a convenience.

---

## 12. Sources

Checked August 2026; Slack moves plan boundaries, so re-check anything cost-relevant before buying.

- [Slack pricing](https://slack.com/pricing)
- [Send emails to Slack](https://slack.com/help/articles/206819278-Send-emails-to-Slack) — channel email addresses, paid plans only
- [Manage Workflow Builder access and features](https://slack.com/help/articles/360035822734-Manage-Workflow-Builder-access-and-features)
- [Customizing notifications for GitHub in Slack](https://docs.github.com/en/integrations/how-tos/slack/customize-notifications) — the `/github subscribe` syntax
- [Slack for Vercel](https://vercel.com/marketplace/slack)

---

_Operational, not product truth. Where this touches direction, [`.icm/docs/README.md`](README.md)'s
precedence order wins and this file gets corrected._
