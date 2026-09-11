# 04 — Jamie's reply on the old version (prepared 2026-09-11, for the call)

Morgane's covering message ([03](03-feedback-on-first-version.md)) asked four things about the
version she built before this repository: what to keep, simplify, drop, and build differently. The
answer had been given inside a Claude session on 10 September and never left it. This is the
answer, written to be said on the 11 September call with Morgane and Arnaud and sent afterwards.
**Status: draft, not yet sent.** Once sent, replace this line with the date.

It reads the old version as she described it in
[`collaboration/remi-v2-explication-systeme.docx`](../collaboration/remi-v2-explication-systeme.docx),
and it is honest about one thing that document says in passing: « Page suivi », « Page Feedback »,
« Ma progression » and « Page Recettes » were **designed, not built**. Most of the patient
journeys she lists as already thought through are being built for the first time — from her
design.

---

Morgane,

J'ai lu « REMI V2 – Explication système » en entier. Voici ce que j'en garde, ce que je simplifie,
ce que je laisse de côté pour l'instant, et ce que je construis autrement. Le fil conducteur : ta
logique produit est la bonne ; ce qui change, c'est la manière dont l'IA s'y branche.

**Ce que je garde, tel quel**

- Les notes brutes restent toujours accessibles et l'IA ne les remplace jamais. C'est déjà la
  règle du résumé vivant, et ce sera celle de la « Nouvelle consultation ».
- Les recommandations du praticien sont prioritaires sur tout. Chaque sortie de l'IA est vérifiée
  contre elles par du code, pas seulement par le prompt.
- Le profil que le patient remplit lui-même : régime, allergies, intolérances, aime cuisiner,
  temps disponible (faible / moyen / important), budget (économique / standard / confort). Le
  champ « temps disponible » manque aujourd'hui ; il arrive.
- « Je vais manger / J'ai mangé » au centre de l'accueil patient, et la réponse en quatre temps :
  ce qui est bien, ce qui manque, une amélioration simple, pourquoi pour toi.
- La page Recommandations comme référence que REMI personnalise — objectifs, non-alimentaire, à
  privilégier / limiter / éviter.
- Le feedback recette à quatre boutons (J'aime · Pas pour moi · Trop long · À refaire) et
  « Mes recettes préférées ».
- Le « comment ça se passe ? » tous les 1–2 jours, avec une réponse d'un geste, et la page
  « Ma progression » que l'ancienne version n'avait pas encore.

**Ce que je simplifie**

- Les 7 jours × 4 repas générés d'avance deviennent une fournée de quelques recettes, déclenchée par
  toi, qui apprend des quatre boutons. Moins de tokens, et surtout des recettes qui tiennent compte
  de ce que le patient a aimé ou refusé.
- Le check-in se fait dans la page quand le patient l'ouvre, sans email ni notification pour
  commencer. On mesure d'abord si les gens reviennent.
- L'invitation par « mailto » devient, quand les comptes patients arrivent, un lien envoyé par REMI
  (Resend est déjà branché). D'ici là, le lien patient reste la clé, en lecture et en écriture.
- « Structurer avec IA » ne remplace plus une page : la synthèse proposée arrive comme brouillon
  dans le champ que tu es déjà en train de lire, et les lignes proposées dans une grille que tu
  vérifies avant d'enregistrer.

**Ce que je laisse de côté pour l'instant**

- L'inscription praticien, la validation admin, Stripe, les 3 mois gratuits. Tu restes
  opératrice de la console jusqu'aux portes ouvertes ; l'espace praticien vient après, comme la
  lettre de direction le prévoyait.
- L'import PDF par un patient autonome. À confirmer avec toi et Arnaud pour le 1er décembre — voir
  la question ci-dessous.
- Le bouton « signaler » (tu posais toi-même la question) et la règle du patient « archivé » (tu
  disais y réfléchir).
- Les génotypes et le tableau du Dr Mouton : la logique est prête à les recevoir (des nutriments
  à favoriser en plus, rien d'autre ne change), mais le contenu du tableau est protégé. Soit on
  obtient les droits, soit tu l'écris avec tes mots dans ta base de connaissances. C'est une
  décision à prendre ensemble, pas un détail technique.

**Ce que je construis autrement aujourd'hui**

- Ta dernière question — « remplir la base de données de REMI avec les informations importantes
  et que l'IA puisse aller les rechercher » — c'est exactement l'architecture : la table CIQUAL
  importée et interrogeable, et tes propres règles de nutrition écrites une fois, validées par toi,
  retrouvées par thème et collées dans chaque prompt. Le « pourquoi » que lit le patient est le
  tien, pas celui du modèle.
- L'IA n'est jamais crue sur parole pour la sécurité : allergies, intolérances et régime sont
  vérifiés par du code après génération. Une recette qui échoue n'est pas affichée.
- Chaque génération est journalisée avec son coût, pour qu'Arnaud et toi sachiez ce que coûte un
  patient par mois.
- Le modèle est Mistral, hébergé en Europe : les données de santé qui partent dans un prompt ne
  quittent pas l'UE.
- Les recettes vivent dans une bibliothèque partagée avec des variantes par patient, pour que la
  même recette ne soit jamais écrite dix fois. La génération écrit dans cette bibliothèque et
  attribue au patient dans le même geste.
- Pour « tester dès maintenant » : dès la semaine prochaine, un bouton « Copier le contexte » sur
  la fiche patient te donne le profil, les objectifs, la consigne et le protocole prêts à coller
  dans l'outil que tu utilises déjà. Le même bloc de contexte servira ensuite au modèle dans REMI.

**Une question pour toi et Arnaud**

La lettre de direction dit qu'au 1er décembre un patient doit pouvoir « créer son profil et
intégrer les recommandations reçues de son praticien » seul. Le plan actuel suppose que c'est toi
qui crées chaque profil, y compris pour l'équipe FunMedDev. Les deux sont possibles ; ils ne
demandent pas le même travail. Lequel voulez-vous pour décembre ?

Jamie
