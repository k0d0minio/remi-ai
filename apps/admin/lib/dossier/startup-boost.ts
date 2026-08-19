/**
 * Q1 and Q2 of Morgane's emails: is REMI a credible Startup Boost candidate,
 * and what are the arguments to defend in front of the jury.
 *
 * Scored honestly rather than favourably. The criteria are quoted from the call
 * itself; the arguments are written as sentences she can say out loud, and every
 * claim is one the project can defend under a jury's question.
 */

import type { FactRow, Item, PageHeader } from "@/lib/dossier/shared";

export const startupBoost = {
  header: {
    eyebrow: "Réponses aux questions 1 et 2",
    title: "Startup Boost",
    lead: "Startup Boost est un prêt convertible de 100 000 € de Wallonie Entreprendre ; l'appel en cours porte sur l'IA et la cybersécurité et clôture le 15 septembre 2026. Réponse courte : oui, REMI est un candidat crédible — deux critères solides, un conditionnel, un faible, un à ne pas revendiquer — et deux faits d'éligibilité à confirmer avant d'y consacrer une heure de plus.",
  } satisfies PageHeader,

  gates: {
    title: "Les deux verrous d'éligibilité",
    description:
      "Des faits, pas des arguments. Tant qu'ils ne sont pas réglés, la qualité du dossier ne change rien.",
    columns: ["Condition", "Où nous en sommes"],
    statusColumn: "État",
    rows: [
      {
        cells: [
          "Société de moins de 3 ans",
          "Presque certainement acquis : l'idée elle-même date de juillet 2025, donc la société est forcément plus jeune. La date exacte de constitution doit figurer dans le registre des actionnaires que vous avez envoyé — c'est un PDF scanné, il faut juste que vous confirmiez la date qui y figure.",
        ],
        tag: { label: "probablement ok", intent: "success" },
      },
      {
        cells: [
          "Siège d'exploitation en Région wallonne",
          "À confirmer. Si le siège est à Bruxelles ou en Flandre, la candidature échoue sur l'éligibilité quelle que soit la qualité du pitch. Une ligne de vous tranche la question.",
        ],
        tag: { label: "à confirmer", intent: "error" },
      },
    ] satisfies readonly FactRow[],
    note: "Recommandation : lire le règlement complet de l'appel, pas seulement la page de présentation. Les règles d'éligibilité et les critères thématiques sont habituellement dans deux documents séparés, et c'est l'éligibilité qui disqualifie.",
  },

  criteria: {
    title: "Les cinq critères, notés honnêtement",
    description:
      "Les critères sont ceux du texte de l'appel. La note est la mienne, et elle est volontairement sévère : surestimer un critère devant un jury coûte la crédibilité sur ceux que l'on tient.",
    columns: ["Critère de l'appel", "Comment REMI l'argumente"],
    statusColumn: "Adéquation",
    rows: [
      {
        cells: [
          "Solutions sectorielles répondant à un besoin métier clairement identifié, avec une valeur opérationnelle tangible",
          "Le terrain le plus solide de REMI. Le besoin est documenté par votre propre travail de terrain : les praticiens prescrivent des protocoles de plus en plus complexes, les patients n'arrivent pas à les appliquer, et aucun outil existant ne couvre l'espace entre deux consultations. Vous avez testé le MVP avec de vrais patients de FunMedDev et interrogé des praticiens — le problème est validé, pas supposé. La valeur opérationnelle est concrète : visibilité sur l'adhérence, temps gagné, fidélisation des patients.",
        ],
        tag: { label: "solide", intent: "success" },
      },
      {
        cells: [
          "Fort potentiel de scalabilité, modèle réplicable, marchés nationaux ou internationaux",
          "Solide également. Un modèle d'abonnement où chaque praticien amène ses propres patients est réplicable par construction : chaque nouveau praticien est un canal de distribution supplémentaire à coût d'acquisition quasi nul. Votre plan à moyen terme — 300 praticiens payants, expansion européenne — a exactement la forme que ce critère demande.",
        ],
        tag: { label: "solide", intent: "success" },
      },
      {
        cells: [
          "IA souveraine — maîtrise des technologies clés, des données stratégiques et des infrastructures critiques",
          "Défendable, à condition de le rendre vrai avant de le revendiquer. Nous maîtrisons la plateforme, nous pouvons héberger toutes les données dans l'Union européenne et choisir un fournisseur d'IA européen. Les données de comportement de santé accumulées dans le temps deviennent un actif stratégique qui nous appartient. Mais rien de tout cela n'est déployé : c'est un engagement que nous pouvons prendre, pas un acquis que nous pouvons montrer. À présenter comme un engagement adossé à des choix concrets — hébergement européen, contrats de sous-traitance européens — jamais comme une réalisation.",
        ],
        tag: { label: "conditionnel", intent: "warning" },
      },
      {
        cells: [
          "Deeptech, propriété intellectuelle propre, savoir-faire au-delà de la simple intégration d'outils existants",
          "Le point faible, et celui que le jury sondera. L'appel exclut explicitement les « projets intégrant principalement des technologies tierces » et les « chatbots génériques reposant sur des modèles existants ». Aujourd'hui, la réalité technique de REMI, c'est des outils standards plus des appels à un modèle d'IA. Ce qui est réellement nôtre : la méthode comportementale (micro-actions, transition progressive, la couche du « pourquoi »), le parser qui transforme les documents du praticien en règles structurées, et avec le temps le jeu de données d'adhérence que personne d'autre ne possède. C'est un vrai savoir-faire, mais c'est plus mince que du deeptech. Recommandation : mener le pitch sur les deux critères solides, présenter le parser et le moteur comportemental comme le cœur propriétaire en développement, et ne jamais surévaluer.",
        ],
        tag: { label: "faible", intent: "error" },
      },
      {
        cells: [
          "Cybersécurité innovante",
          "Ce n'est pas le métier de REMI. À ne pas revendiquer : postuler sur un critère que l'on ne peut pas défendre coûte la crédibilité sur ceux que l'on tient.",
        ],
        tag: { label: "hors sujet", intent: "neutral" },
      },
    ] satisfies readonly FactRow[],
  },

  arguments: {
    title: "Les cinq arguments, dans l'ordre où les dire",
    lead: "Chacun est défendable phrase par phrase. Ils sont écrits pour être dits à voix haute, pas lus.",
    items: [
      {
        title:
          "Le problème est prouvé, et il est comportemental, pas informationnel",
        body: "« Les patients ne manquent pas d'information — ils n'arrivent pas à l'appliquer. Nous avons testé notre première version avec de vrais patients d'une clinique de médecine fonctionnelle et observé exactement où ils décrochent : trop d'effort avant la moindre valeur, trop rigide, trop de charge mentale. Cet apprentissage de terrain est notre avantage : nous savons pourquoi les applications de santé perdent leurs utilisateurs. »",
      },
      {
        title: "Nous occupons un espace vide : le dernier kilomètre",
        body: "« Les logiciels de gestion de cabinet gèrent le cabinet. Les applications de nutrition comptent les calories. Rien ne gère ce qui se passe réellement entre deux consultations — si le patient applique quoi que ce soit. REMI est construit exclusivement pour cet espace. »",
      },
      {
        title: "Le modèle économique fait du praticien notre distribution",
        body: "« Nous n'achetons pas de patients avec de la publicité. Les praticiens s'abonnent, entre 39 et 199 € par mois, et chacun amène sa patientèle via un QR code. Coût d'acquisition proche de zéro, crédibilité intégrée, rétention ancrée dans une relation humaine. C'est ce qui rend le modèle réplicable ville par ville, pays par pays. »",
      },
      {
        title: "La technologie en développement est réellement nôtre",
        body: "« Deux composants propriétaires : un parser qui convertit le PDF ou les notes d'un praticien en règles structurées et actionnables, et un moteur comportemental qui transforme ces règles en micro-actions quotidiennes accompagnées de leur raisonnement. Avec le temps, les données d'adhérence que cela produit — ce que les gens parviennent réellement à changer, et ce qui les fait abandonner — deviennent un actif que personne d'autre ne détient sur ce marché. »",
      },
      {
        title:
          "La souveraineté est un choix de conception que nous pouvons démontrer",
        body: "« Les données de santé restent dans l'Union européenne. Nos choix d'infrastructure et de fournisseur d'IA se font sur cette base, et c'est inscrit dans la façon dont la V2 est construite — pas rajouté après la croissance. »",
      },
    ] satisfies readonly Item[],
  },

  hardQuestions: {
    title: "Les deux questions dures du jury, et leurs réponses honnêtes",
    lead: "Elles viendront. Mieux vaut les avoir préparées que les découvrir.",
    items: [
      {
        title:
          "« N'est-ce pas simplement une application qui appelle un modèle d'IA ? »",
        body: "« Le modèle est une commodité ; le parser, la méthode comportementale et la boucle de données praticien–patient ne le sont pas. C'est là que se trouvent le travail et la valeur. »",
      },
      {
        title: "« Quelle traction ? »",
        body: "« MVP testé sur le terrain avec des patients de clinique, demande praticienne validée par des entretiens, une bêta de praticiens fondateurs d'une quinzaine de personnes lancée avec la V2, et un accompagnement d'incubateur en place. Le revenu démarre avec la V2 — c'est précisément ce que ce financement accélère. »",
      },
    ] satisfies readonly Item[],
  },

  redLine: {
    title: "La seule chose à ne pas faire",
    body: "Nous n'avons aucun client payant et aucun pilote signé : les ~15 praticiens fondateurs sont une cible de recrutement, pas des contrats. Ce que nous pouvons honnêtement revendiquer : de vrais tests utilisateurs avec des patients de FunMedDev, un intérêt praticien validé, une bêta de praticiens fondateurs planifiée, et un incubateur qui accompagne déjà le projet. C'est une histoire de démarrage tout à fait normale. Inventer davantage devant un jury de financement public serait découvert, et serait fatal.",
  },

  conclusion: {
    title: "Conclusion",
    body: [
      "Cela vaut la peine de postuler si le siège wallon est confirmé, avec un pitch mené par le besoin de marché et la scalabilité, un cadrage honnête de la technologie propriétaire en développement, et le compte de résultat prévisionnel que votre comptable devra produire — le dossier de candidature exige des projections financières.",
      "Si l'application se fait, elle tourne en parallèle des phases A et B du plan : c'est du travail de rédaction et de projection financière — vous, votre comptable, et moi pour les annexes techniques — pas du développement. Les phases C à E sont exactement ce que les 100 000 € accéléreraient, ce qui rend la demande facile à justifier : terminer le moteur d'exécution et mener la bêta des praticiens fondateurs à plein régime.",
    ],
  },
} as const;
