/**
 * The founding-CTO offer, as data.
 *
 * A private page inside the operator console rather than a document, so it can
 * be opened and talked through in the room instead of sent ahead and read
 * alone. It sits in the sidebar under "Company" so it can be reached mid
 * conversation; what keeps it private is the console's access gate, not
 * obscurity.
 *
 * Written in French because the two people it is for read it in French, and a
 * conversation about a percentage point should not also be a translation
 * exercise. Belgian register throughout — "jours prestés", "table de
 * capitalisation" — and French typography: a space before `%` and `€`, a space
 * as the thousands separator, a comma for the decimal, guillemets for quotes.
 *
 * Every figure traces to one of three sources — the €120/hour invoiced rate,
 * the two-days-a-week commitment, or the repository's own commit history — and
 * each is restated with its working beside it, so nothing here has to be taken
 * on trust.
 */

export const author = "Jamie Nisbet";

/** The date of the conversation this page was written for. */
export const preparedOn = "6 août 2026";

export type Row = { label: string; value: string; detail: string };
export type Point = { label: string; body: string };

export const offer = {
  header: {
    eyebrow: "Confidentiel — pour notre conversation",
    title: "L'offre de CTO fondateur",
    lead: "Pourquoi je pense que le chiffre est plus proche de 10 % que de 5 % — et ce que je proposerais si ce n'est pas possible.",
    preparedFor: "Pour Morgane et Arnaud",
  },

  agreement: {
    title: "Ce sur quoi nous sommes déjà d'accord",
    body: [
      "Avant toute chose : j'ai envie de construire ça, avec vous. La demande, chez REMI, est réelle et elle ne vient pas de moi — la relation avec FunMedDev, les praticiens qui ont déjà dit oui, et le jugement clinique derrière le cadre thérapeutique viennent tous de vous deux. LivingMatrix a atteint 600 cabinets à 129 $ par mois par exactement ce type de canal, et personne n'a encore joué ce coup-là en Europe. Cela mérite d'être dit franchement, plutôt que d'être contourné dans une négociation.",
      "Ce qui suit, c'est un argument, trois faits et deux alternatives. Si vous n'êtes pas d'accord avec une ligne, dites-le et nous le réglerons ensemble, ici. C'est une conversation, pas une prise de position.",
    ],
  },

  reconciliation: {
    title: "Le seul point qui ne colle pas",
    lead: "Deux chiffres sont ressortis de notre appel — une valorisation de 2,5 millions d'euros, et 5 %. Je ne pense pas que les deux puissent être justes en même temps.",
    rows: [
      {
        label: "Ce que valent deux jours par semaine",
        value: "176 000 € / an",
        detail:
          "Slicing Pie, le modèle de référence pour les fondateurs à temps partiel, valorise une contribution à son taux de marché et double la part qui n'est pas payée en cash, parce que c'est le travail non payé qui porte le risque. 120 € de l'heure, deux jours par semaine, doublés.",
      },
      {
        label: "Ce que cela achète à une valorisation de 2,5 M€",
        value: "≈ 7 % la première année",
        detail:
          "176 000 € rapportés à 2,5 millions d'euros. Et c'est la première année seule, avant même que la deuxième ne commence.",
      },
      {
        label: "Ce qui est sur la table",
        value: "5 %",
        detail:
          "Ce qui valorise une année de contribution à risque en dessous de ce que votre propre valorisation dit que cette contribution vaut.",
      },
    ] satisfies Row[],
    conclusion: [
      "Donc soit la valorisation est de 2,5 millions d'euros et la participation est supérieure à 5 %, soit la participation est de 5 % et la valorisation est nettement plus basse. Les deux conversations me vont sincèrement — je ne pense simplement pas que l'on puisse tenir les deux chiffres à la fois.",
      "Et les deux choses qui portent une valorisation de 2,5 millions d'euros — une équipe complète et un produit qui tourne — sont précisément les deux choses que je viendrais apporter. Pour l'instant, elles sont comptées dans le prix avant d'exister.",
    ],
  },

  evidence: {
    title: "Trois faits derrière tout ça",
    rows: [
      {
        label: "La fourchette de référence",
        value: "10–20 %",
        detail:
          "Un CTO à temps partagé et rémunéré obtient 1–8 %. Un cofondateur technique non rémunéré, à temps plein, qui rejoint tard obtient 20–35 %. Un CTO fondateur non rémunéré, deux jours par semaine, qui a en plus écrit tout le code, se situe entre les deux. 10 %, c'est le bas de cette fourchette, pas le haut.",
      },
      {
        label: "Ce à quoi je renonce la première année",
        value: "88 320 €",
        detail:
          "120 € de l'heure facturés, 92 jours prestés sur l'année — deux jours par semaine, six semaines de congé — et rien de facturé. C'est ce que coûte réellement « pas de cash avant la levée », et cela se répète la deuxième année si le tour tarde.",
      },
      {
        label: "Déjà construit, d'une seule main",
        value: "29 511 lignes",
        detail:
          "Six applications déployées, un design system, une couche de services et un pipeline de livraison, répartis sur 310 fichiers TypeScript — chaque commit du journal sous un seul nom. Cédé par écrit à la société le jour où nous signons.",
      },
    ] satisfies Row[],
  },

  asking: {
    title: "Ce que je demande",
    points: [
      {
        label: "Participation",
        body: "10 % en pleine dilution, émis en totalité le jour où nous signons. Pas de vesting, pas de cliff — l'essentiel de ce que ces parts paient est déjà écrit et entre vos mains, il n'y a donc rien à acquérir progressivement sur quatre ans.",
      },
      {
        label: "Temps",
        body: "Deux jours par semaine en moyenne, sur un planning que vous pouvez consulter. Un plancher que je peux honnêtement tenir, pas un plafond.",
      },
      {
        label: "Cash avant la levée",
        body: "Aucun. Pas de salaire, pas d'honoraires, rien qui s'accumule discrètement en arrière-plan.",
      },
      {
        label: "Ce que 10 % solde",
        body: "À 10 %, j'annule les factures déjà accumulées et je ne demande aucune prime de signature. Ces factures représentent un an à deux jours par semaine à 120 € de l'heure — 92 jours prestés, 88 320 € — facturés avec 20 % de remise, soit 70 656 €. À 10 %, rien de tout cela n'est facturé. Pas de somme forfaitaire maintenant pour couvrir le risque, pas de rattrapage plus tard : les parts sont le tout, et l'ardoise repart à zéro le jour où nous signons.",
      },
    ] satisfies Point[],
  },

  alternatives: {
    title: "Si 10 % n'est pas possible",
    lead: "Si la table de capitalisation ne peut vraiment pas bouger, je préfère de loin trouver la forme qui fonctionne plutôt que de laisser un point de pourcentage tout arrêter. À 5 %, la participation ne couvre plus le risque à elle seule : il faut donc qu'une de ces deux options l'accompagne. L'une ou l'autre convient ; je n'ai pas besoin des deux.",
    points: [
      {
        label: "Une prime de signature",
        body: "Nous signons à 5 %, émis en totalité le jour même, et 10 000–20 000 € sont versés à la signature. Pas des honoraires pour les jours à venir — un versement unique en regard du risque que je porte en prenant une part minoritaire dans quelque chose qui n'est pas encore financé.",
      },
      {
        label: "Les factures accumulées, payées sur la levée",
        body: "Nous signons à 5 %, émis en totalité le jour même, et les 70 656 € déjà accumulés sont réglés sur le premier tour qui se clôture — plafonnés de sorte qu'ils ne puissent jamais entamer la levée. Ce chiffre, c'est le taux facturé moins 20 %, pas la majoration Slicing Pie.",
      },
    ] satisfies Point[],
  },

  closing: {
    title: "Où j'en suis",
    body: [
      "Rien de tout ceci n'est un ultimatum, et il n'existe aucune version de demain où je claque la porte pour un point de pourcentage. J'aime travailler avec vous deux, et je pense que REMI vaut plusieurs années de ma vie.",
      "Ce que je ne veux pas, c'est signer la version où tout le risque technique repose de mon côté de la table, à un prix fixé par une valorisation que je serais moi-même en train de créer. Dites-moi où vous n'êtes pas d'accord, et réglons cela ici plutôt qu'une fois les avocats dans la boucle.",
    ],
  },
} as const;
