/**
 * The dossier — one page, in the order a reader needs it.
 *
 * It was seven pages, then five; a reader preparing for a one-hour call does
 * not navigate, they scroll. Everything is stated from where the project stands
 * today, never as a delta to an earlier plan, and every section answers either
 * one of Morgane's four questions or the question "what do you need from me".
 */

import { ClipboardList, Sparkles, Utensils } from "lucide-react";
import type { FlowNode } from "@/components/company/flow-diagram";
import type { TrackStep } from "@/components/company/phase-track";
import type { Decision, FactRow, Item, PageHeader } from "@/lib/dossier/shared";

/** The in-page anchors, in the order the sections appear. */
export const sections = [
  { id: "produit", label: "Le produit" },
  { id: "plan", label: "Le plan" },
  { id: "boost", label: "Startup Boost" },
  { id: "outils", label: "Outils" },
  { id: "decisions", label: "Décisions" },
  { id: "appel", label: "L'appel" },
] as const;

export const dossier = {
  header: {
    eyebrow: "À lire avant l'appel",
    title: "Dossier de préparation",
    lead: "Vos quatre questions répondues, le plan de la V2, et la courte liste de ce qui ne dépend que de vous. Une page.",
  } satisfies PageHeader,

  brief: {
    title: "En bref",
    body: [
      "La V2 tient en six phases : décider, poser les fondations, la boucle patient, le dashboard praticien, le parser, puis l'argent et la bêta. Simplicité radicale d'abord, de la valeur en moins de 60 secondes. C'est une proposition, pas une décision — elle attend votre relecture.",
      "Il n'y a pas de budget à dépenser : le coût de la V2, c'est mon temps. La contrainte n'est donc pas une somme mais un ordre — ce qui se construit d'abord, et ce qui attend. C'est la conversation la plus utile que nous puissions avoir.",
      "Deux choses ont une échéance et ne peuvent pas attendre la relecture : la candidature Startup Boost, qui clôture le 15 septembre et dépend de deux faits que vous seule pouvez confirmer, et le sort des données patients restées dans le Supabase de la V1.",
    ],
  },

  loop: {
    title: "Ce que REMI fait, en un schéma",
    description:
      "Le dernier kilomètre entre le praticien et le quotidien du patient. Chaque phase du plan construit un morceau de cette boucle.",
    nodes: [
      {
        title: "Le praticien",
        body: "Il consulte et rédige ses recommandations, comme il le fait déjà.",
        icon: ClipboardList,
        via: "PDF ou compte rendu, lu automatiquement",
      },
      {
        title: "REMI",
        body: "Le parser en tire des règles structurées, puis en fait des micro-actions faisables en quelques minutes — avec leur pourquoi.",
        icon: Sparkles,
        via: "une action à la fois, adaptée au repas prévu",
      },
      {
        title: "Le patient",
        body: "Il dit ce qu'il s'apprête à manger et reçoit une amélioration réaliste, tenant compte de ses goûts, son budget et son temps.",
        icon: Utensils,
      },
    ] satisfies readonly FlowNode[],
    returnLabel:
      "Ce qu'il fait réellement remonte au praticien : adhérence, difficultés, retours — qui ajuste ses règles sans attendre la consultation suivante.",
  },

  track: {
    title: "Les six phases",
    description:
      "Chacune dépend de la précédente. C, D et E sont le produit lui-même ; A et B sont ce qu'il faut régler pour les construire sans se tromper.",
    steps: [
      {
        letter: "A",
        label: "Décider",
        note: "Quelques jours. Des arbitrages, pas du code.",
      },
      {
        letter: "B",
        label: "Fondations",
        note: "Comptes, données, socle légal.",
      },
      {
        letter: "C",
        label: "Boucle patient",
        note: "Le cœur de la V2. Valeur en 60 secondes.",
      },
      {
        letter: "D",
        label: "Dashboard praticien",
        note: "Ce qui fait qu'un praticien s'abonne.",
      },
      {
        letter: "E",
        label: "Parser",
        note: "Le cœur propriétaire.",
      },
      {
        letter: "F",
        label: "Argent et bêta",
        note: "Premiers revenus, praticiens fondateurs.",
      },
    ] satisfies readonly TrackStep[],
  },

  phases: {
    title: "Ce que contient chaque phase",
    lead: "Découpées en 27 tickets, qui ne seront ouverts qu'après votre relecture. Si la candidature Startup Boost se fait, elle tourne en parallèle de A et B — c'est de la rédaction, pas du développement, donc elle ne retarde pas le produit.",
    items: [
      {
        title: "A · Décider et déblayer le terrain",
        body: "Adopter Supabase, geler le périmètre de la V2, décider ce qui survit des six sites déployés, trancher le Startup Boost, régler le sort des comptes de la V1, et construire le registre des outils.",
        tag: { label: "quelques jours", intent: "info" },
      },
      {
        title: "B · Les fondations",
        body: "Brancher Supabase — comptes praticiens et patients, invitation par QR code. Modéliser la boucle ci-dessus. Et le socle de protection des données avant le premier enregistrement réel : hébergement européen, contrats de sous-traitance, durées de conservation.",
        tag: { label: "non négociable", intent: "error" },
      },
      {
        title: "C · La boucle patient",
        body: "Onboarding ultra-simplifié, « améliore mon assiette », hub du jour, mode « je mange autre chose », journal de compléments et suivi des micro-actions. Avec la discipline des coûts d'IA dès le premier jour : appels ciblés, coût suivi par génération.",
        tag: { label: "le cœur de la V2", intent: "success" },
      },
      {
        title: "D · Le dashboard praticien",
        body: "Vue de cohorte avec l'adhérence en un coup d'œil, détail par patient, ajustement des recommandations à distance, feedback rapide et messages de groupe. L'entrée des patients par QR code n'est pas une commodité : c'est le mécanisme d'acquisition.",
        tag: { label: "le plus stratégique", intent: "success" },
      },
      {
        title: "E · Le parser",
        body: "Collecter d'abord les formats réels de vos praticiens bêta, puis convertir PDF et notes de consultation en règles alimentaires structurées qui alimentent la boucle patient. C'est aussi la meilleure pièce à conviction « technologie propriétaire » du dossier Startup Boost.",
        tag: { label: "cœur propriétaire", intent: "success" },
      },
      {
        title: "F · L'argent et la bêta",
        body: "Abonnements praticiens, recrutement des ~15 praticiens fondateurs avec des retours toutes les deux semaines, et l'instrumentation de vos KPI — adhérence, rétention à J+7, J+30, J+90, usage praticien.",
        tag: { label: "la validation", intent: "info" },
      },
    ] satisfies readonly Item[],
  },

  numbers: {
    title: "Vos chiffres, et la vraie contrainte",
    description:
      "Vos objectifs, avec une note d'état honnête en face de chacun.",
    columns: ["Quoi", "Cible", "Note d'état"],
    statusColumn: "État",
    rows: [
      {
        cells: [
          "Lancement de la V2",
          "mi-2026",
          "Nous sommes en août et la V2 n'est pas lancée. À redater ensemble, pas à contourner.",
        ],
        tag: { label: "glissé", intent: "warning" },
      },
      {
        cells: [
          "Pilote bêta",
          "~15 praticiens fondateurs",
          "Une cible de recrutement — c'est la phase F. Personne n'a signé à ce jour.",
        ],
        tag: { label: "prévu", intent: "info" },
      },
      {
        cells: [
          "Adoption la première année",
          "10 à 30 praticiens actifs, 100 à 300 utilisateurs actifs",
          "Le socle porte cet ordre de grandeur sans question d'échelle.",
        ],
        tag: { label: "devant nous", intent: "neutral" },
      },
      {
        cells: [
          "Premiers revenus",
          "2 000 à 5 000 € de revenu récurrent mensuel, rétention supérieure à 50 % à 3 mois",
          "Aucun revenu à ce jour. C'est la phase F.",
        ],
        tag: { label: "devant nous", intent: "neutral" },
      },
      {
        cells: [
          "Tarification",
          "Praticiens : 39 € / 79 € / 199 € par mois. Patients : gratuit, premium ~9,99 €",
          "Des réflexions, pas des prix arrêtés. À trancher avant la phase F.",
        ],
        tag: { label: "à arrêter", intent: "warning" },
      },
      {
        cells: [
          "Ce que la V2 coûte",
          "Mon temps",
          "Il n'y a pas d'enveloppe à dépenser. Les seules dépenses réelles sont les abonnements aux outils ci-dessous, et c'est la seule raison pour laquelle ils méritent une page.",
        ],
        tag: { label: "la contrainte", intent: "warning" },
      },
    ] satisfies readonly FactRow[],
  },

  gates: {
    title: "Les deux verrous d'éligibilité",
    description:
      "Des faits, pas des arguments. Tant qu'ils ne sont pas réglés, la qualité du dossier ne change rien. L'appel clôture le 15 septembre 2026 ; c'est un prêt convertible de 100 000 € de Wallonie Entreprendre.",
    columns: ["Condition", "Où nous en sommes"],
    statusColumn: "État",
    rows: [
      {
        cells: [
          "Société de moins de 3 ans",
          "Presque certainement acquis : l'idée date de juillet 2025, la société est forcément plus jeune. Il faut juste que vous confirmiez la date figurant au registre des actionnaires — le scan envoyé est illisible par machine.",
        ],
        tag: { label: "probablement ok", intent: "success" },
      },
      {
        cells: [
          "Siège d'exploitation en Région wallonne",
          "À confirmer, et le critère porte sur le siège d'exploitation, pas sur le lieu de travail. Si le siège est à Bruxelles ou en Flandre, la candidature échoue sur l'éligibilité quelle que soit la qualité du pitch.",
        ],
        tag: { label: "à confirmer", intent: "error" },
      },
    ] satisfies readonly FactRow[],
    note: "Recommandation : lire le règlement complet de l'appel, pas seulement la page de présentation. L'éligibilité et les critères thématiques sont habituellement dans deux documents séparés, et c'est l'éligibilité qui disqualifie.",
  },

  criteria: {
    title: "Les cinq critères, notés honnêtement",
    description:
      "La note est la mienne, et volontairement sévère : surestimer un critère devant un jury coûte la crédibilité sur ceux que l'on tient.",
    columns: ["Critère de l'appel", "Comment REMI l'argumente"],
    statusColumn: "Adéquation",
    rows: [
      {
        cells: [
          "Besoin métier clairement identifié, valeur opérationnelle tangible",
          "Le terrain le plus solide. Les praticiens prescrivent des protocoles de plus en plus complexes, les patients n'arrivent pas à les appliquer, et aucun outil ne couvre l'espace entre deux consultations. Vous avez testé le MVP avec de vrais patients de FunMedDev : le problème est validé, pas supposé.",
        ],
        tag: { label: "solide", intent: "success" },
      },
      {
        cells: [
          "Fort potentiel de scalabilité, modèle réplicable",
          "Solide également. Chaque praticien qui s'abonne amène sa propre patientèle : un canal de distribution de plus, à coût d'acquisition quasi nul. Réplicable ville par ville, pays par pays.",
        ],
        tag: { label: "solide", intent: "success" },
      },
      {
        cells: [
          "IA souveraine — maîtrise des technologies, des données et des infrastructures",
          "Défendable, à condition de le rendre vrai avant de le revendiquer. Le choix du fournisseur d'IA décide seul de la solidité de cet argument — voir la section Outils ci-dessous, où ce choix est désormais documenté. À présenter comme un engagement adossé à des choix concrets, jamais comme une réalisation.",
        ],
        tag: { label: "conditionnel", intent: "warning" },
      },
      {
        cells: [
          "Deeptech, propriété intellectuelle propre",
          "Le point faible, et celui que le jury sondera. L'appel exclut les « projets intégrant principalement des technologies tierces ». Ce qui est réellement nôtre : la méthode comportementale, le parser qui transforme les documents du praticien en règles, et avec le temps le jeu de données d'adhérence. C'est un vrai savoir-faire, mais plus mince que du deeptech — mener le pitch sur les deux critères solides.",
        ],
        tag: { label: "faible", intent: "error" },
      },
      {
        cells: [
          "Cybersécurité innovante",
          "Ce n'est pas le métier de REMI. À ne pas revendiquer : postuler sur un critère indéfendable coûte la crédibilité sur ceux que l'on tient.",
        ],
        tag: { label: "hors sujet", intent: "neutral" },
      },
    ] satisfies readonly FactRow[],
  },

  arguments: {
    title: "Les cinq arguments, dans l'ordre où les dire",
    lead: "Écrits pour être dits à voix haute, pas lus. Chacun est défendable phrase par phrase.",
    items: [
      {
        title: "Le problème est prouvé, et il est comportemental",
        body: "« Les patients ne manquent pas d'information — ils n'arrivent pas à l'appliquer. Nous avons testé avec de vrais patients d'une clinique de médecine fonctionnelle et observé où ils décrochent : trop d'effort avant la moindre valeur, trop rigide, trop de charge mentale. »",
      },
      {
        title: "Nous occupons un espace vide : le dernier kilomètre",
        body: "« Les logiciels de cabinet gèrent le cabinet. Les applications de nutrition comptent les calories. Rien ne gère ce qui se passe entre deux consultations. REMI est construit exclusivement pour cet espace. »",
      },
      {
        title: "Le praticien est notre distribution",
        body: "« Nous n'achetons pas de patients avec de la publicité. Les praticiens s'abonnent, entre 39 et 199 € par mois, et chacun amène sa patientèle via un QR code. Coût d'acquisition proche de zéro, crédibilité intégrée, rétention ancrée dans une relation humaine. »",
      },
      {
        title: "La technologie en développement est réellement nôtre",
        body: "« Deux composants propriétaires : un parser qui convertit le PDF d'un praticien en règles actionnables, et un moteur comportemental qui en fait des micro-actions accompagnées de leur raisonnement. Les données d'adhérence que cela produit deviennent un actif que personne d'autre ne détient. »",
      },
      {
        title: "La souveraineté est un choix de conception démontrable",
        body: "« Les données de santé restent en Europe, sous droit européen. Notre fournisseur d'IA est choisi sur ce critère, pas seulement sur le prix — et c'est inscrit dans la façon dont la V2 est construite, pas rajouté après la croissance. »",
      },
    ] satisfies readonly Item[],
  },

  redLine: {
    title: "La seule chose à ne pas faire",
    body: "Nous n'avons aucun client payant et aucun pilote signé : les ~15 praticiens fondateurs sont une cible de recrutement, pas des contrats. Ce que nous pouvons honnêtement revendiquer : de vrais tests utilisateurs avec des patients de FunMedDev, un intérêt praticien validé, une bêta planifiée, et un incubateur qui accompagne déjà le projet. C'est une histoire de démarrage tout à fait normale. Inventer davantage devant un jury de financement public serait découvert, et serait fatal.",
  },

  stack: {
    title: "Ce que la stack utilise aujourd'hui",
    description:
      "Trois lignes en service, une à brancher, deux à décider. Ce sont les seules dépenses réelles du projet.",
    columns: ["Outil", "Ce qu'il fait pour nous"],
    statusColumn: "État",
    rows: [
      {
        cells: ["Vercel", "Héberge tous les sites."],
        tag: { label: "en service", intent: "success" },
      },
      {
        cells: [
          "GitHub",
          "Le code, avec les protections de relecture actives.",
        ],
        tag: { label: "en service", intent: "success" },
      },
      {
        cells: [
          "Resend",
          "Envoie les emails — le formulaire de contact passe réellement par lui.",
        ],
        tag: { label: "en service", intent: "success" },
      },
      {
        cells: [
          "Supabase",
          "Base de données, authentification et stockage de la V2. Pas encore connecté : c'est la phase B, et le code est construit prêt à le recevoir.",
        ],
        tag: { label: "à brancher", intent: "warning" },
      },
      {
        cells: [
          "Fournisseur de modèle d'IA",
          "Nécessaire pour « améliore mon assiette » et pour le parser. Aucun n'est branché — et ce choix décide seul de la solidité de l'argument de souveraineté.",
        ],
        tag: { label: "à choisir", intent: "warning" },
      },
      {
        cells: [
          "Prestataire de paiement",
          "Pour les abonnements praticiens, au moment de la monétisation. Rien ne presse : c'est la phase F.",
        ],
        tag: { label: "plus tard", intent: "neutral" },
      },
    ] satisfies readonly FactRow[],
  },

  sovereignty: {
    title: "Vos trois outils, et ce qu'ils valent pour la souveraineté",
    lead: "Aucun des trois n'est branché sur la V2 — mais ils ne sont pas interchangeables, et le sujet mérite mieux qu'un « je ne trouve pas ». Voici ce qu'ils sont réellement. La distinction qui gouverne tout : la résidence des données (où elles sont stockées) n'est pas la souveraineté (quel droit s'applique à l'entreprise qui les détient).",
    items: [
      {
        title: "Mistral — français, et le seul des trois réellement souverain",
        body: "Fondé à Paris en 2023, infrastructure en datacenters européens (notamment OVHcloud), entreprise soumise au droit français et européen. Résidence et souveraineté à la fois. Propose l'API, le cloud privé et le déploiement chez soi, ce qui laisse la porte ouverte si les données de santé exigent plus tard davantage d'isolement. Pour un jury wallon qui note « IA souveraine », c'est le choix qui rend l'argument démontrable plutôt que déclaratif. Si vous penchiez de ce côté, c'était le bon réflexe.",
        tag: { label: "recommandé", intent: "success" },
      },
      {
        title: "Euria — suisse, un assistant plutôt qu'une brique",
        body: "Développé par Infomaniak, hébergé exclusivement en Suisse (Genève et canton de Vaud), sous droit suisse, avec l'engagement formel de ne jamais entraîner de modèle sur les données clients. Techniquement solide et sérieux sur la confidentialité — mais deux réserves : c'est un assistant fini, pas une brique sur laquelle bâtir REMI, et la Suisse est hors Union européenne. Les transferts restent permis (décision d'adéquation de l'UE, confirmée en 2024), mais devant un jury qui finance l'IA souveraine européenne, « suisse » se défend moins bien que « français ».",
        tag: { label: "hors UE", intent: "warning" },
      },
      {
        title: "DigitalOcean — résidence européenne, souveraineté américaine",
        body: "Hébergeur américain (société du Delaware) avec des datacenters à Amsterdam, Francfort et Londres, et des GPU en Amsterdam. Les données peuvent donc rester physiquement dans l'UE — c'est de la résidence. Mais l'entreprise reste soumise au CLOUD Act américain, ce qui n'est pas de la souveraineté. Utilisable comme hébergeur ; à ne pas présenter au jury comme une pièce de l'argument souverain.",
        tag: { label: "à ne pas revendiquer", intent: "error" },
      },
    ] satisfies readonly Item[],
  },

  legacy: {
    title: "Les comptes de la V1 — peut-être encore facturés",
    description:
      "Chacun est potentiellement une carte débitée chaque mois pour un produit qui ne tourne plus. C'est la seule dépense que nous pouvons supprimer aujourd'hui.",
    columns: ["Outil", "Son rôle dans la V1"],
    statusColumn: "À faire",
    rows: [
      {
        cells: [
          "Supabase (projet V1)",
          "Toute la partie serveur : base de données, authentification, stockage, fonctions.",
        ],
        tag: { label: "vérifier les données", intent: "error" },
      },
      {
        cells: ["OpenRouter", "Les appels aux modèles d'IA."],
        tag: { label: "fermer ou reprendre", intent: "warning" },
      },
      {
        cells: [
          "LlamaParse",
          "La lecture des PDF. Directement pertinent à nouveau : c'est exactement le besoin du parser de la phase E.",
        ],
        tag: { label: "fermer ou reprendre", intent: "warning" },
      },
      {
        cells: ["Brevo", "Les emails transactionnels."],
        tag: { label: "fermer ou reprendre", intent: "warning" },
      },
      {
        cells: [
          "Lovable",
          "La plateforme sur laquelle la V1 a été construite.",
        ],
        tag: { label: "fermer ou reprendre", intent: "warning" },
      },
      {
        cells: [
          "DigitalOcean",
          "Introuvable de mon côté — mais si quelque chose y tourne encore depuis la V1, c'est une ligne de plus à fermer.",
        ],
        tag: { label: "à vérifier", intent: "warning" },
      },
    ] satisfies readonly FactRow[],
  },

  dataQuestion: {
    title: "La question qui prime sur toutes les autres",
    body: "Le projet Supabase de la V1 contient-il encore de vraies données de santé de patients, issues des tests FunMedDev ? Si oui, c'est une obligation de protection des données à traiter avant de fermer quoi que ce soit — fermer un compte n'efface ni les sauvegardes ni la responsabilité. C'est la seule ligne de ce dossier qui ne peut pas attendre l'appel suivant.",
  },

  needed: {
    title: "Ce dont j'ai besoin de vous",
    lead: "Quatre points courts. Les deux premiers décident du Startup Boost à eux seuls.",
    decisions: [
      {
        title: "Le siège d'exploitation est-il en Région wallonne ?",
        context:
          "Le critère d'éligibilité porte sur le siège d'exploitation, pas sur le lieu de travail.",
        consequence:
          "Une réponse négative ferme la candidature immédiatement — et nous fait économiser les semaines de rédaction de septembre.",
      },
      {
        title: "Quelle est la date de constitution de la société ?",
        context:
          "Elle doit avoir moins de trois ans, ce qui est presque certain — mais le registre des actionnaires envoyé est un scan, illisible par machine. Il faut un œil humain sur la date.",
        consequence:
          "C'est le second verrou d'éligibilité. Une ligne de votre part le lève.",
      },
      {
        title:
          "Le projet Supabase de la V1 contient-il encore de vraies données patients ?",
        context:
          "Le MVP a été testé avec de vrais patients de FunMedDev. Si leurs données de santé y sont toujours, c'est une obligation légale indépendante de toute décision produit.",
        consequence:
          "Si oui, cela se traite avant de fermer quoi que ce soit : fermer un compte n'efface ni les sauvegardes ni la responsabilité.",
      },
      {
        title: "Les accès que vous aviez proposé d'envoyer",
        context:
          "Lovable et GitHub, plus Vercel et le Supabase de la V1 si possible. Des invitations en tant qu'utilisateur, jamais des mots de passe par email.",
        consequence:
          "Sans eux, l'inventaire des abonnements encore facturés reste une question que je ne peux que reposer.",
      },
    ] satisfies readonly Decision[],
  },

  open: {
    title: "Les choix laissés ouverts volontairement",
    lead: "Le développement les prendrait par défaut si personne ne les prenait pour de bon — et un choix pris par défaut est un choix que plus personne ne revoit. Les options sont posées pour donner une forme à la discussion, pas pour la fermer.",
    openNote:
      "Pas d'options préparées sur celle-ci — elle se tranche en conversation, et une option inventée ici fermerait la question plutôt que de l'ouvrir.",
    decisions: [
      {
        title: "Quel fournisseur de modèle d'IA ?",
        context:
          "Aucun n'est branché et le choix est entièrement ouvert. Il décide du coût par génération et, surtout, de la solidité de l'argument de souveraineté — voir la comparaison ci-dessus.",
        consequence:
          "La note du jury sur le critère « IA souveraine », et la lourdeur du registre de traitement des données de santé.",
        options: [
          {
            label: "Mistral, ou un autre fournisseur de l'Union européenne",
            detail:
              "Données dans l'UE et entreprise sous droit européen : l'argument devient démontrable. Le déploiement privé reste possible plus tard si les données de santé l'exigent.",
            recommended: true,
          },
          {
            label: "Le meilleur rapport qualité-prix, où qu'il soit",
            detail:
              "Plus de latitude technique, sans doute moins cher au départ — au prix de l'argument de souveraineté et d'un contrat de sous-traitance plus lourd à documenter.",
          },
        ],
      },
      {
        title: "Combien des six sites gardons-nous ?",
        context:
          "Six applications déployées, c'est six surfaces à tenir cohérentes à chaque changement, pour une seule paire de mains.",
        consequence:
          "Le temps disponible pour les phases C à E — c'est-à-dire pour le produit lui-même.",
        options: [
          {
            label: "Produit, espace praticien, une page marketing",
            detail:
              "Le reste est mis en pause plutôt que supprimé — documentation, centre d'aide et démonstration restent dans le dépôt, simplement plus déployés. Réversible en une journée.",
            recommended: true,
          },
          {
            label: "Tout garder",
            detail:
              "Défendable si le centre d'aide et le site public servent réellement le recrutement des praticiens fondateurs.",
          },
        ],
      },
      {
        title: "L'intelligence artificielle doit-elle voir les prénoms ?",
        context:
          "L'IA peut travailler sur des données pseudonymisées — « la personne » — ou recevoir les vrais prénoms. Même pseudonymisée, l'expérience reste chaleureuse : le prénom est réinséré à l'affichage, chez nous, sans jamais partir chez le fournisseur.",
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
              "Des textes plus directs, et une donnée personnelle de plus à documenter et à protéger.",
          },
        ],
      },
      {
        title: "Qu'est-ce qui compte comme adhérence ?",
        context:
          "C'est l'indicateur central du dashboard praticien, et sa définition reste à fixer. Une micro-action cochée ? Un repas amélioré ? Une semaine sans rupture ? Chaque définition produit un chiffre différent, et un praticien qui voit « 62 % » doit savoir de quoi il s'agit.",
        consequence:
          "Ce que le dashboard affiche, et ce que « rétention supérieure à 50 % » voudra dire au bilan.",
      },
      {
        title: "Une personne peut-elle avoir deux praticiens ?",
        context:
          "Le journal de compléments évoque une standardisation multi-praticiens, ce qui suggère que oui. Mais si deux praticiens donnent des recommandations contradictoires à la même personne, REMI doit savoir laquelle appliquer — et ce n'est pas au code d'en décider.",
        consequence:
          "Le modèle de données de la phase B, peu coûteux à faire correctement au départ et pénible à reprendre ensuite.",
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
              "Le plus sûr, et la seule dépense en argent réel que ce plan comporte à ce stade.",
          },
        ],
      },
    ] satisfies readonly Decision[],
  },

  agenda: {
    title: "Ordre du jour proposé",
    lead: "Une heure suffit dans cet ordre : ce qui a une échéance d'abord, le produit ensuite, le rythme de travail à la fin. Répondez comme il vous arrange — un message, une note, ou directement pendant l'appel.",
    items: [
      {
        title: "Startup Boost : go ou no-go",
        body: "Siège wallon et date de constitution. Ces deux réponses décident à elles seules si nous engageons septembre dans un dossier.",
        tag: { label: "10 min", intent: "neutral" },
      },
      {
        title: "Les données de la V1, puis les comptes",
        body: "Le Supabase de la V1 contient-il encore de vraies données patients ? Puis : DigitalOcean, Mistral, Euria — qui détient le compte, et est-ce que cela facture ?",
        tag: { label: "10 min", intent: "neutral" },
      },
      {
        title: "Le plan V2 : valider les six phases",
        body: "L'ordre proposé vous convient-il ? C'est la conversation la plus structurante de l'appel.",
        tag: { label: "15 min", intent: "neutral" },
      },
      {
        title: "Le périmètre : six sites, faut-il tous les garder ?",
        body: "Votre priorité numéro un est la simplicité radicale, et six applications déployées ne va pas naturellement avec une seule paire de mains.",
        tag: { label: "10 min", intent: "neutral" },
      },
      {
        title: "Le fournisseur d'IA et le socle légal",
        body: "Le choix du fournisseur porte l'argument de souveraineté. Et avant le premier compte réel : hébergement européen, sous-traitance, conservation, responsable de traitement.",
        tag: { label: "10 min", intent: "neutral" },
      },
      {
        title: "Le rythme de travail",
        body: "Slack est créé — il ne manque que l'invitation. Un point hebdomadaire de trente minutes pour les arbitrages, le reste en asynchrone : est-ce le bon rythme ?",
        tag: { label: "5 min", intent: "neutral" },
      },
    ] satisfies readonly Item[],
  },
} as const;
