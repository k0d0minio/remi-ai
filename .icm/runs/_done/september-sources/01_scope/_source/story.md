<!-- Source: fourteen client assets dropped in `.icm/raw/` and extracted by `.icm/scripts/process-raw.sh`
     on 2026-09-23 — five call transcripts (Morgane, Arnaud, Jamie; 20, 25, 28 Aug, 1 and 11 Sept 2026,
     machine-transcribed, French), Morgane's « Ce que les consultants doivent voir » (14 Sept 2026), her
     « REMI V2 Features » catalogue (20 Aug 2026) and the Startup Boost technical roadmap (≈ 12–15 Sept
     2026), via document and call recording. Six further assets in the same drop were already filed in
     `.icm/docs/` (sha256-identical) and are listed, not re-recorded.
     Recorded as received. Never edited — what was settled on top of it lives in scope.md.
     Every extraction is a machine's reading: the transcripts mishear names and cut sentences; anything a
     decision rests on was checked against the archived original in `.icm/raw/_processed/`.
     The transcripts and the two long documents are recorded by link plus description — the extracted
     text under `.icm/processed/` is the verbatim record, byte-identical to what arrived, and reproducing
     ~330 KB here would hide the one short document that is reproduced in full. -->

# Story: the September sources

The operator's request, 2026-09-23, in session: « Let's process all the raw input and get to actually
planning the build of this project. There seems to have been a lot of different directions and focus
points over time. Take precedence using the transcript from the latest call. »

## 2026-08-20 — call, Jamie + Morgane (~49 min)

- Extracted text: `.icm/processed/2026-09-23-remi-ai-appel-20-aout.txt` · original:
  `.icm/raw/_processed/2026-09-23-remi-ai-appel-20-aout.txt`
- What it shows: the Startup Boost application (deadline 15 Sept, the "sovereign AI" criterion); Jamie
  proposes Neon over Supabase, Morgane defers; « partons de zéro » with a new feature list due Monday
  24 Aug; automatic protocol generation judged too complex and deferred; the first ~15 practitioners to
  be onboarded by hand; Slack to be set up.

## 2026-08-20 — document, Morgane (+ Arnaud): « REMI V2 — Vision produit, fonctionnalités & priorités du Proof of Concept »

- Extracted text: `.icm/processed/2026-09-23-remi-v2-features.txt` · original:
  `.icm/raw/_processed/2026-09-23-remi-v2-features.docx` · filed as
  `.icm/docs/collaboration/remi-v2-features.docx`
- What it shows: the complete V2 / POC feature catalogue in 41 sections with P0 / P1 / P2 and a V3
  vision — practitioner sign-up and pilot, patient onboarding, 100 % personalised recipes, weekly
  generation, favourites, shopping list, « Que manger maintenant ? », weekly reviews, a practitioner
  follow-up board, automatic synthesis between consultations, pre-consultation questionnaires,
  progression, meal photos, **export of the patient record as a trust principle**, pilot metrics, and
  the AI principles (suggest, never impose; « éviter toute fausse précision nutritionnelle »). Written the
  evening of the 20 Aug call; the direction letter of 24 Aug (`new-development-direction.docx`)
  explicitly steps back from this list.

## 2026-08-25 — call, Morgane + Jamie, Arnaud from [13:26] (~37 min)

- Extracted text: `.icm/processed/2026-09-23-remi-ai-appel-25-aout.txt` · original:
  `.icm/raw/_processed/2026-09-23-remi-ai-appel-25-aout.txt`
- What it shows: the Slack operating model; the weekly call moved to Friday afternoon; Morgane's
  document puts the patient first, Jamie reframes it as an admin console where Morgane manages the
  profiles and shares links; photos parked by Morgane [12:31]; a rough admin (login + create patient)
  promised for Friday; the open day of 19 December named. The 25 Aug call summary already filed as
  `.icm/docs/call-summary.pdf` covers the same call.

## 2026-08-28 — call, all three, Arnaud leaves at [27:01] (~54 min)

- Extracted text: `.icm/processed/2026-09-23-remi-ai-appel-28-aout.txt` · original:
  `.icm/raw/_processed/2026-09-23-remi-ai-appel-28-aout.txt`
- What it shows: `admin.remi-ai.tech` delivered; Morgane confirms Neon [22:07]; Jamie wants sovereign
  AI « dès le départ » [22:12] with the vendor left open on price and quality [22:59]; patients
  pseudonymised, age not date of birth, **« il faudra qu'ils aient absolument 18 ans »** [28:11]–[29:18];
  the Fagron deck and the Belgian rule that **a doctor must order the genotype test** [9:31]–[9:59];
  the previous agency's recipe prompt-engineering code on DigitalOcean to be handed over; templated
  « envoyer mail » with the patient's link once `remi-ai.be` is live [36:43]; homework: Morgane diagrams
  her data tables; her 8-week programme as the consultation cadence [34:04].

## 2026-09-01 — call, all three (~38 min)

- Extracted text: `.icm/processed/2026-09-23-remi-ai-appel-1-sept.txt` · original:
  `.icm/raw/_processed/2026-09-23-remi-ai-appel-1-sept.txt`
- What it shows: the English pitch rehearsal for Fagron (FunMedDev as first clinical partner, « around
  thirty patients », the « pasta tonight » mechanic, REMI as practitioner co-pilot); development: build
  the database and her login from her tables document, a copy-a-prompt button instead of AI
  integration [26:55], a view-only token link with no authentication [32:19]–[32:46] (the decision D-2
  later reversed), eleven tickets by Friday 4 Sept; Morgane asks for a co-founder / confidentiality
  agreement and a GDPR file [33:07].

## 2026-09-11 — call, all three (~87 min) — **the source that takes precedence**

- Extracted text: `.icm/processed/2026-09-23-remi-ai-appel-11-sept.txt` · original:
  `.icm/raw/_processed/2026-09-23-remi-ai-appel-11-sept.txt`
- What it shows, in order:
  - [1:58]–[7:00] Jamie on her disappointment opening the first console; the page will be
    re-orchestrated around what she updates most; Morgane proposes an hour with Robin, who analysed the
    old build; Jamie prefers to align on the product, not the old code.
  - [7:14]–[9:00] Arnaud: REMI must be fast and fluid, no data wall at sign-up, refine progressively.
    Morgane: fill **general** reference data (CIQUAL, seasonal vegetables, supplements) rather than
    patient-specific data; maybe one AI selects products, another creates recipes.
  - [9:24]–[17:45] Jamie: the admin side becomes the practitioner surface later, for now it is « le
    côté Morgane »; data architecture before AI; at each key point a **copy-paste prompt button**
    (V1 … V4) with the pseudonymised patient context, tested in ChatGPT / Claude; no accounts before
    December, tokenised links per patient.
  - [15:22] Morgane: entering « un complément ou une recommandation à la fois » is what is slow; these
    are information texts, not fields.
  - [20:11]–[21:11] Morgane: fixed data first (allergies, first goals, first recommendations), then
    consultation follow-ups where the plan adapts to what proved easy or hard (« il m'a fallu 10 jours
    avant qu'elle commence »).
  - [23:24]–[26:58] two ways to test AI; the copy button is chosen; API usage is dearer than
    subscriptions, so AI in the platform is deferred as long as possible.
  - [27:04]–[28:51] Morgane: give patients the page **now** — « la vision des 3 objectifs », « mettre
    du texte ou figer des documents ou des liens vers des documents », « un commentaire ou un feedback de
    leur part », « les 15 aliments que je leur ai proposés, les challenges que j'ai déjà donnés, les
    recettes que j'ai déjà données ». Jamie: that is the tokenised link.
  - [29:15]–[34:10] Mistral is markedly dearer because EU-sovereign; Arnaud on Mammouth; Morgane:
    « au début, on va essayer que ce soit le moins cher et puis quand on aura beaucoup plus de patients,
    on changera »; Jamie: **start with the Vercel AI Gateway** if EU sovereignty is not a hard
    constraint now; Morgane: « Mais parfait … la data sera le deuxième problème quand on aura beaucoup
    de succès ».
  - [34:36]–[36:34] the objective for end of next week: a nicer, easier « côté Morgane », the link she
    can send, a V1 of the prompt buttons; her feedback should name which parts of an output were good
    or bad, not the whole; she will send what patients should see on the page.
  - [36:56]–[43:20] recipes: a library the model adapts from, or generated per patient? Morgane prefers
    100 % bespoke from food data; « peut-être pour la première version, partir sur une base de 20
    recettes anti-inflammatoires qu'il doit transformer. Mais … moi je l'ai toujours laissé créer ses
    propres recettes »; Arnaud: recipes must stay edible (the pumpkin soup with chocolate); Morgane:
    macros per person, cooking appetite, budget, no absurd pairings, detail level per person (the
    banana-peeling incoherence); Jamie: ratios rather than recipes, and the architecture of recipes,
    ingredients and how the model touches them is the whole game.
  - [43:40] Arnaud: two weeks of focus, then the three meet in Portugal.
  - [44:33]–[58:00] Startup Boost: four days left to apply; Morgane needs Jamie's written technical
    roadmap; Jamie's answers on the call — solid infrastructure, active development on the admin side,
    next 3–6 months patient interface first then AI integration and prompt testing then the
    practitioner side, what is proprietary is the code with the emphasis on the context and prompting
    layer, 2027 milestones; Morgane's most valuable data: CIQUAL depth, Dr Mouton's genotype table,
    what patients report, later practitioners' own recommendations, behaviour and motivation;
    « Rémi ne peut jamais donner des recommandations, elle aide à appliquer les recommandations »
    [49:51]; caution on medical-device regulation; Fagron's data will not be REMI's.
  - [1:00:11]–[1:08:56] why AI testing is done in her subscription first: API prices versus
    subsidised chat prices; the €100 k answer is testing capacity and a recipe engine.
  - [1:08:58]–[1:12:40] Morgane's idea of a practitioner knowledge-sharing forum to feed REMI; Jamie:
    only if validated by other practitioners, « à réfléchir »; Arnaud: risk of pollution, second phase.
  - [1:12:42]–[1:14:07] 2027: accounts for practitioners and patients as the base; then the value of
    the AI.
  - [1:18:15]–[1:19:19] recap: nicer layout early next week, links shareable by end of next week, V1
    prompt buttons; she exports every prompt she tests; in 3–4 weeks Jamie analyses them all.
  - [1:19:23]–[1:26:57] Robin: an hour later, once there is something to show; speech-to-text for
    consultations raised by Morgane [1:24:05]; « one week at a time ».

## 2026-09-14 — document, Morgane: « Ce que les consultants doivent voir » — reproduced in full

- Extracted text: `.icm/processed/2026-09-23-remi-ai-ce-que-les-consultants-voient.txt` · original:
  `.icm/raw/_processed/2026-09-23-remi-ai-ce-que-les-consultants-voient.docx` · filed as
  `.icm/docs/collaboration/what-the-consultants-see.docx`
- Her written answer to what she promised on the 11 Sept call [35:59], three days later. The text as
  extracted (a docx loses its numbering and its bullets; nothing else is changed):

> Ce que les consultants doivent voir
> 1. Les 3 objectifs
> Les trois objectifs définis ensemble au début de l'accompagnement doivent être clairement visibles.
> Exemple :
> Diminuer les fringales
> Améliorer l'énergie
> Réduire les ballonnements
> Ils doivent rester visibles comme fil conducteur de l'accompagnement.
> Possibilité de côté chaque semaine ? 0 à 5
> 2. Les challenges
> Je voudrais pouvoir lancer des challenges personnalisés à chaque consultant.
> Exemples :
> Boire 1,5 L d'eau par jour
> Manger plus lentement
> Ajouter une source de protéines au petit-déjeuner
> Tester deux nouveaux lunchs cette semaine
> Le challenge en cours doit être facilement visible.
> Idéalement, le consultant pourrait claiquer sur:
> « Challenge acquis » « Prêt(e) pour le prochain »
> Cela me permettrait de voir quand la personne estime avoir intégré l'habitude et qu'elle souhaite avancer.
> De mon côté, je dois pouvoir :
> créer un nouveau challenge ;
> modifier le challenge ;
> voir si le consultant l'a validé ;
> voir s'il indique qu'il est prêt pour le suivant.
> 3. Les recettes
> Je voudrais qu'ils puissent retrouver facilement les recettes que je leur propose.
> Deux possibilités selon ce qui est le plus simple techniquement :
> Option 1
> Les recettes sont directement visibles dans REMI.
> Option 2
> Je peux simplement ajouter les PDF des recettes que je leur envoie actuellement.
> Un onglet ou une section « Mes recettes » serait suffisant.
> Je n'ai pas besoin pour l'instant d'un système complexe de notation recette par recette.
> 4. Les documents personnels
> Je voudrais pouvoir ajouter certains documents propres au consultant.
> Par exemple :
> sa liste personnalisée des 15 aliments ;
> un feedback sur ses repas ;
> un document avec des recommandations spécifiques ;
> d'autres documents créés pendant l'accompagnement.
> La liste des 15 aliments ne doit donc pas nécessairement devenir une fonctionnalité spécifique de REMI.
> Un document accessible dans son espace est suffisant.
> (5. Mes ressources
> Je voudrais une section pédagogique où je peux ajouter les contenus (ou lien) que je crée pour eux.
> Par exemple :
> vidéo sur l'importance de l'eau ;
> vidéo sur les oméga-3 ;
> vidéo sur les matières grasses ;
> documents pédagogiques ;
> liens éventuels.
> L'objectif est qu'ils puissent retrouver facilement ces contenus sans devoir retourner chercher dans WhatsApp.) pas prioritaire je peux envoyer sur whatsapp
> 6. Feedback du consultant
> Je voudrais un endroit très simple où le consultant peut laisser un commentaire général.
> Par exemple :
> « Comment se passe votre accompagnement cette semaine ? Vous pouvez également indiquer ici ce que vous avez pensé des recettes, des challenges ou des recommandations proposées. »
> Il ne faut pas nécessairement créer des commentaires partout dans l'application.
> Un espace général de feedback peut suffire.
> 7. Ce que je voudrais voir de mon côté
> Ce dont j'ai surtout besoin en complément :
> voir les feedbacks laissés par les consultants ;
> voir lorsqu'un challenge est validé ;
> voir lorsqu'un consultant indique qu'il est prêt pour le challenge suivant ;
> pouvoir consulter le profil du consultant comme lui le voit ;
> éventuellement voir simplement son activité dans son espace.
> L'idée est que je puisse facilement comprendre où en est chaque personne sans devoir aller rechercher les informations dans WhatsApp.

## ≈ 2026-09-12 → 15 — document, Morgane with Arnaud on Jamie's input: « Roadmap technique & utilisation du financement Startup Boost »

- Extracted text: `.icm/processed/2026-09-23-remi-roadmap-technique-startup-boost.txt` · original:
  `.icm/raw/_processed/2026-09-23-remi-roadmap-technique-startup-boost.docx` · filed as
  `.icm/docs/collaboration/startup-boost-technical-roadmap.docx`
- What it shows: thirteen sections for the Startup Boost application — technical positioning (no own
  LLM; the value is the specialised layer that structures data, contextualises, orchestrates
  interchangeable models and controls quality), MVP-1 learnings (a full weekly programme is too
  prescriptive; start from what people actually eat), « Depuis septembre 2026, Morgane suit 7
  consultants dans un programme de 8 semaines », the new product logic (recommendation → daily action),
  the technical foundation before automation, a human-in-the-loop scoring grid (1–5 per criterion,
  expert correction) proposed as a proprietary benchmark, a validation layer between generation and
  the user, a roadmap Q4 2026 → 2028, the genotype as an additional source that stays
  vendor-independent, what can be proprietary, a proposed split of the €100 000, the key message, and
  § 13's points to finalise before the pitch deck (name the architecture without the term « ICM »,
  data sources and rights, cost 2027 AI development and testing with Jamie, the benchmark's storage,
  the validation layer's scope, Fagron's role, eligible expenses).

## Already filed — listed, not re-recorded

Six assets in the same drop are byte-identical to documents already in `.icm/docs/` and scoped on
2026-09-10 (#92) and 2026-09-11 (#94):

| Dropped as                                                  | Filed as                                                        |
| ----------------------------------------------------------- | --------------------------------------------------------------- |
| `Feedback Jamie.docx`                                       | `collaboration/remi-v2-feedback-on-first-version.docx`          |
| `Nouvelle méthodologie de développement de REMI.docx`       | `new-development-direction.docx`                                |
| `REMI V2 - Explication système.docx`                        | `collaboration/remi-v2-explication-systeme.docx`                |
| `Tabs - REMI V2.docx`                                       | `collaboration/remi-v2-structure-brainstorm.docx`               |
| `REMI___Personalized_nutrition_that_adapts_to_real_life.pptx` | `collaboration/pitch-deck.pptx`                               |
| `REMI_x_Fagron_Meeting_Playbook_Confidentiel.docx`          | `collaboration/fagron-meeting-playbook.docx`                    |
