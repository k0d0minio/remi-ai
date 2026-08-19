/**
 * Part five: the short list that only Morgane and Arnaud can settle.
 *
 * Two kinds of thing, kept apart on purpose. The first section is facts we do
 * not have and cannot look up. The second is choices the build would otherwise
 * make by default — the braindump does not settle them, and an implementation
 * that just picks one buries the decision in code where nobody sees it again.
 *
 * Display-only: options are laid out a/b/c to give the discussion a shape,
 * never to close it, and nothing here is a form. The answers happen in
 * conversation.
 */

import type { Decision, PageHeader } from "@/lib/dossier/shared";

export const decisions = {
  header: {
    eyebrow: "Ce qui ne dépend que de vous",
    title: "Décisions attendues",
    lead: "Tout le reste du dossier peut avancer sans attendre ces réponses ; c'est volontaire. Les cinq premières sont des faits que nous n'avons pas et que nous ne pouvons pas aller chercher. Les suivantes sont des choix que le développement prendrait par défaut si personne ne les prenait pour de bon — et un choix pris par défaut est un choix que plus personne ne revoit.",
  } satisfies PageHeader,

  needed: {
    title: "Ce dont nous avons besoin de vous",
    lead: "Cinq points courts. Les deux premiers décident du Startup Boost à eux seuls.",
    decisions: [
      {
        title: "Le siège d'exploitation est-il en Région wallonne ?",
        context:
          "Le critère d'éligibilité du Startup Boost porte sur le siège d'exploitation, pas sur le lieu de travail. Rien dans vos documents ne le dit.",
        consequence:
          "Une réponse négative ferme la candidature immédiatement, quelle que soit la qualité du dossier — et nous fait économiser les semaines de rédaction de septembre.",
      },
      {
        title: "Quelle est la date de constitution de la société ?",
        context:
          "La société doit avoir moins de trois ans. Elle l'a presque certainement, puisque l'idée date de juillet 2025 — mais le registre des actionnaires que vous avez envoyé est un scan, illisible par machine. Il faut un œil humain sur la date.",
        consequence:
          "C'est le second verrou d'éligibilité. Une ligne de votre part le lève.",
      },
      {
        title: "DigitalOcean, Mistral, Euria — qu'est-ce que c'est ?",
        context:
          "Aucun des trois n'apparaît dans le code ni dans vos propres documents. Pour chacun : de quoi s'agit-il, qui détient le compte, et est-ce que cela facture aujourd'hui ?",
        consequence:
          "Des abonnements potentiellement payés chaque mois pour rien — et, dans le cas de Mistral, un choix de fournisseur d'IA européen qui servirait directement l'argument de souveraineté du dossier.",
      },
      {
        title:
          "Le projet Supabase de la V1 contient-il encore de vraies données patients ?",
        context:
          "Le MVP a été testé avec de vrais patients de FunMedDev. Si leurs données de santé sont toujours dans l'ancien projet, c'est une obligation de protection des données, indépendante de toute décision produit.",
        consequence:
          "Si oui, cela se traite avant de fermer quoi que ce soit : fermer un compte n'efface ni les sauvegardes ni la responsabilité.",
      },
      {
        title: "Les accès que vous aviez proposé d'envoyer",
        context:
          "Lovable et GitHub, plus Vercel et le Supabase de la V1 si possible. Des invitations en tant qu'utilisateur, jamais des mots de passe par email.",
        consequence:
          "Sans eux, l'inventaire des coûts et le sort des comptes de la V1 restent des questions ouvertes que je ne peux que reposer.",
      },
    ] satisfies readonly Decision[],
  },

  open: {
    title: "Les choix laissés ouverts volontairement",
    lead: "Là où des options se dessinent, elles sont posées — a, b, c — pour donner une forme à la discussion, pas pour la fermer. Rien n'est interactif : les réponses se prennent en conversation.",
    openNote:
      "Pas d'options préparées sur celle-ci — elle se tranche en conversation, et une option inventée ici fermerait la question plutôt que de l'ouvrir.",
    decisions: [
      {
        title: "Combien des six sites gardons-nous ?",
        context:
          "L'installation actuelle fait tourner six applications déployées. Votre priorité numéro un est la simplicité radicale et l'itération rapide, et six surfaces à maintenir ne va pas naturellement avec un budget de 10 000 €.",
        consequence:
          "Le périmètre de maintenance des douze prochains mois, et le temps disponible pour les phases C à E.",
        options: [
          {
            label: "Produit, espace praticien, une page marketing",
            detail:
              "Le reste est mis en pause plutôt que supprimé — la documentation, le centre d'aide et la démonstration restent dans le dépôt, simplement plus déployés. Réversible en une journée le jour où ils redeviennent utiles.",
            recommended: true,
          },
          {
            label: "Tout garder",
            detail:
              "Défendable si le centre d'aide et le site public servent réellement le recrutement des praticiens fondateurs. Coûte de l'attention à chaque changement, pour six surfaces à tenir cohérentes.",
          },
        ],
      },
      {
        title: "Quel fournisseur de modèle d'IA ?",
        context:
          "Aucun n'est branché et le choix est entièrement ouvert. Vos documents fixent la contrainte — appels ciblés, maîtrise des coûts — mais pas le fournisseur.",
        consequence:
          "Le coût par génération, et la solidité de l'argument de souveraineté devant le jury du Startup Boost.",
        options: [
          {
            label: "Un fournisseur européen",
            detail:
              "Mistral par exemple. Les données restent dans l'Union européenne, l'argument de souveraineté devient démontrable plutôt que déclaratif, et le registre de traitement s'en trouve simplifié.",
            recommended: true,
          },
          {
            label: "Le meilleur rapport qualité-prix, où qu'il soit",
            detail:
              "Plus de latitude technique et sans doute moins cher au départ, au prix de l'argument de souveraineté et d'un contrat de sous-traitance plus lourd à documenter.",
          },
        ],
      },
      {
        title: "L'intelligence artificielle doit-elle voir les prénoms ?",
        context:
          "Quand REMI génère un plan ou un texte, l'IA peut travailler sur des données pseudonymisées — « la personne », sans prénom ni détail identifiant — ou recevoir les vrais prénoms. Précision qui compte : même pseudonymisée, l'expérience reste chaleureuse, le prénom étant réinséré à l'affichage, chez nous, sans jamais partir chez le fournisseur.",
        consequence:
          "La quantité de données personnelles qui circulent chez un sous-traitant, et un argument que vous portez ou non auprès des praticiens.",
        options: [
          {
            label: "Pseudonymiser",
            detail:
              "L'IA ne voit jamais un prénom ni un détail identifiant. Moins de données personnelles chez un tiers, un registre plus simple, un argument fort auprès des praticiens — pour un coût technique modeste.",
            recommended: true,
          },
          {
            label: "Les prénoms réels",
            detail:
              "L'IA peut écrire des textes qui utilisent le prénom naturellement, au-delà de la salutation. Plus direct, et une donnée personnelle de plus à documenter et à protéger.",
          },
        ],
      },
      {
        title: "Qu'est-ce qui compte comme adhérence ?",
        context:
          "L'adhérence est l'indicateur central du dashboard praticien et de vos propres KPI, mais vos documents n'en donnent pas la définition. Une micro-action cochée ? Un repas amélioré ? Une semaine sans rupture ? Chaque définition produit un chiffre différent, et un praticien qui voit « 62 % » doit savoir de quoi il s'agit.",
        consequence:
          "Ce que le dashboard praticien affiche, et ce que « rétention supérieure à 50 % » voudra dire au moment du bilan.",
      },
      {
        title: "Une personne peut-elle avoir deux praticiens ?",
        context:
          "Le journal de compléments évoque une « standardisation multi-praticiens », ce qui suggère que oui. Mais si deux praticiens donnent des recommandations contradictoires à la même personne, REMI doit savoir laquelle appliquer — et ce n'est pas au code d'en décider.",
        consequence:
          "Le modèle de données de la phase B, qu'il est peu coûteux de faire correctement au départ et pénible de reprendre ensuite.",
      },
      {
        title: "Le socle légal : quand l'avocat entre-t-il en scène ?",
        context:
          "Avant le premier compte réel, il faut une entité qui assume le rôle de responsable de traitement, et un socle de documents : politique de confidentialité, conditions d'utilisation, contrat praticien, registre de traitement, consentement explicite pour les données de santé.",
        consequence:
          "La date à laquelle le premier praticien fondateur peut réellement créer un compte.",
        options: [
          {
            label: "Modèles sérieux maintenant, avocat avant la facturation",
            detail:
              "Partir de modèles solides pour la période gratuite de la bêta, et faire relire l'ensemble avant que l'argent commence à circuler — le moment où l'à-peu-près cesse d'être acceptable.",
            recommended: true,
          },
          {
            label: "Avocat maintenant",
            detail:
              "Faire rédiger l'ensemble avant le premier compte réel. Le plus sûr, au prix d'un budget immédiat sur une enveloppe de 10 000 €.",
          },
        ],
      },
      {
        title: "Slack, et le rythme de décision",
        context:
          "L'espace Slack est créé — il ne manque que l'invitation. La proposition : tout le travail produit y vit, en français, avec les listes et canvas de Slack plutôt qu'un outil de plus ; ce qui est décidé descend ensuite dans la documentation du projet, qui reste la référence.",
        consequence:
          "Le délai entre une question et sa réponse — et donc la vitesse réelle des phases A et B, qui sont faites de décisions plus que de code.",
        options: [
          {
            label:
              "Un point hebdomadaire de trente minutes, plus Slack en continu",
            detail:
              "Trente minutes par semaine pour les arbitrages, tout le reste en asynchrone. Les questions de ce dossier fourniraient l'ordre du jour des premières semaines.",
            recommended: true,
          },
          {
            label: "Tout au fil de l'eau",
            detail:
              "Aucune réunion fixe. Fonctionne tant que les réponses arrivent vite ; sinon le travail s'arrête à la première question.",
          },
        ],
      },
    ] satisfies readonly Decision[],
  },

  closing: {
    title: "Comment répondre",
    body: [
      "Dans l'ordre qui vous arrange et sous la forme qui vous arrange — un message, une note, un appel. Les cinq premiers points sont ceux qui débloquent le plus : deux décident du Startup Boost, un porte une obligation légale, et deux conditionnent l'inventaire des coûts.",
      "Si un point mérite plus de détail — ou un vrai dossier — dites-le, et il arrivera sous cette forme.",
    ],
  },
} as const;
