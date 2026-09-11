# 03 — Morgane's feedback on the first version (received 2026-09-10)

Her covering message, verbatim, sent with two documents now filed in
[`collaboration/`](../collaboration/): `remi-v2-feedback-on-first-version.docx` (what must change
before she can use the console daily) and `remi-v2-explication-systeme.docx` (the product logic of
the version she built before this repository). Both rank in [`README.md`](../README.md) § Precedence.

The one-line reading: **the data structure is right, the interaction layer is unusable** — encoding
a patient one field and one row at a time costs more than it gives back. She asks for the
practitioner page to follow her consultation workflow, for bulk entry, and for the patient page to
become the place where REMI keeps its promise: « Je vais manger » / « J'ai mangé », recipes, feedback.
She also asks for a reading of the old version's logic — what to keep, simplify, drop, rebuild — and
for AI-carried features (100 % personalised recipes, meal suggestions) to be tested now rather than
after the manual base is complete.

---

> Je t'envoie mon feedback sur la version actuelle mais le point le plus important pour moi c'est
> que je ne peux utiliser cette version en l'état. Cela prendrait beaucoup trop de temps d'encoder
> un profil tel que demandé (un par un). Tu trouveras les points qui me semblent importants à
> ajuster pour qu'elle soit réellement utilisable au quotidien côté praticien et surtout pour
> pouvoir tester correctement l'expérience patient d'ici décembre.
>
> Je joins aussi le document « REMI V2 – Explication système », qui reprend la logique produit de
> la version que j'avais construite auparavant.
>
> Je ne souhaite pas qu'on reproduise cette ancienne version à l'identique. Je suis d'accord avec
> l'approche actuelle : repartir sur une base technique propre, construire progressivement, tester
> avec mes consultants/patients et faire évoluer REMI selon leurs retours.
>
> Par contre, je pense qu'il est important de ne pas repartir de zéro sur la logique produit.
> Plusieurs parcours avaient déjà été réfléchis : le parcours praticien, la structuration des
> recommandations, l'espace patient, « Je vais manger / J'ai mangé », les feedbacks, la
> progression et les recettes personnalisées.
>
> Je ne sais pas si tu as déjà eu l'occasion de parcourir/tester cette ancienne version, mais
> j'aimerais beaucoup que tu regardes sa logique globale et que tu me donnes ton avis :
>
> - ce que tu garderais ;
> - ce que tu simplifierais ;
> - ce que tu supprimerais ;
> - ce que tu construirais différemment aujourd'hui.
>
> Pour moi, la bonne approche serait : repartir proprement techniquement si nécessaire, mais
> conserver les apprentissages et les bonnes idées de ce qui existe déjà, puis affiner les
> parcours au fur et à mesure des retours utilisateurs.
>
> Dernier point important : je suis totalement d'accord avec le principe que REMI doit d'abord
> avoir une base solide qui fonctionne sans dépendre de l'IA, et que l'IA doit ensuite booster le
> produit. Mais pour certaines fonctions comme les recettes 100 % personnalisées ou « Je vais
> manger → Suggestions », l'IA fait directement partie de la valeur du produit, donc j'aimerais
> qu'on commence à les tester dès maintenant. Est-ce que l'idée serait pas de remplir la base de
> donnée de REMI avec les informations importantes et que IA puisse aller les rechercher facilement

---

## What was decided from it (Jamie, 2026-09-10)

The decisions of record that turned this feedback into the backlog live in
[`.icm/intake/practitioner-workflow/breakdown.md § Decisions`](../../intake/practitioner-workflow/breakdown.md)
and bind every epic cut that day. The reply to her four questions about the old version was given
in a Claude session and never sent; it is now filed as [04](04-reply-on-the-old-version.md), a
draft for the 11 September call.
