import { SITE, formatPrice } from "@/lib/site";
import { OFFERS } from "./landing";

/**
 * The legal texts, from Morgane's `content/legal.ts` of 2 November 2026. The
 * CGU, CGV and privacy policy come from the previous site with the pilot
 * offers added. A lawyer validates them before sales open. The
 * « [À COMPLÉTER] » fields come from `lib/site.ts`.
 */

export type LegalSection = {
  title: string;
  paragraphs: string[];
};

export type LegalDoc = {
  title: string;
  /** Shown under the title. */
  updated?: string;
  /** The orange « draft » banner. */
  intro?: string;
  /** A first paragraph in the normal register. */
  lead?: string;
  sections: LegalSection[];
  /** The closing line. */
  outro?: string;
};

const c = SITE.company;

const UPDATED = "02.11.2026";
const OUTRO = `Ce document a valeur informative. Pour toute question, contactez ${SITE.contactEmail}.`;

const editor: LegalSection = {
  title: "Éditeur",
  paragraphs: [
    `${c.legalName} — ${c.legalForm}\n${c.address}\nEmail : ${SITE.contactEmail}\nTéléphone : ${SITE.contactPhone}`,
  ],
};

const contact: LegalSection = {
  title: "Contact",
  paragraphs: [SITE.contactEmail],
};

/** The offers, from `landing.ts`, so the CGV and the page agree. */
const offersText = OFFERS.map(
  (offer) =>
    `${offer.name} : ${formatPrice(offer.price)} (forfait unique, 8 semaines) — ${offer.includes.join(" ; ")}.`,
).join("\n");

export const PRIVACY: LegalDoc = {
  title: "Politique de confidentialité et de protection des données",
  updated: UPDATED,
  lead: `${c.legalName} est responsable de traitement des données personnelles collectées via www.remiai.be, conformément au RGPD (Règlement UE 2016/679) et à la loi belge du 30 juillet 2018.`,
  sections: [
    {
      title: "Responsable de traitement",
      paragraphs: [
        `${c.legalName}\n${c.address}\nContact RGPD : ${SITE.contactEmail} · ${SITE.contactPhone}`,
      ],
    },
    {
      title: "Données collectées",
      paragraphs: [
        "Données d’identification : nom, prénom, email, téléphone (facultatif), identifiants\nDonnées de facturation : adresse (si applicable)\nDonnées d’usage : historique des interactions, préférences\nDonnées fournies volontairement : habitudes de vie, objectifs\nDonnées médicales / génétiques : strictement volontaires, consentement explicite requis, non transmises à des tiers hors intervenants nécessaires à votre parcours (laboratoire d’analyse, médecin spécialisé), avec votre accord.",
        "Les formulaires d’inscription de ce site ne collectent aucune donnée de santé ni donnée génétique : merci de ne pas en indiquer dans les champs libres.",
      ],
    },
    {
      title: "Finalités",
      paragraphs: [
        "Fourniture et amélioration du service, gestion des inscriptions au programme pilote, facturation, sécurité et conformité. Les coordonnées laissées sur ce site servent uniquement à vous recontacter au sujet du programme pilote REMI (patients ou praticiens). La base légale est votre consentement (art. 6.1.a RGPD), que vous pouvez retirer à tout moment.",
      ],
    },
    {
      title: "Durées de conservation",
      paragraphs: [
        "Données du compte : durée d’activité du compte\nDonnées d’inscription au programme pilote : 12 mois maximum, sauf retrait anticipé du consentement\nDonnées d’interactions : jusqu’à 24 mois\nDonnées de facturation : 7 à 10 ans\nDonnées médicales / génétiques : supprimées sous 30 jours après effacement par l’utilisateur",
      ],
    },
    {
      title: "Vos droits",
      paragraphs: [
        `Vous disposez d’un droit d’accès, de rectification, d’effacement, de limitation, d’opposition et de portabilité de vos données.\nContact : ${SITE.contactEmail}\nRéclamation APD : autoriteprotectiondonnees.be`,
      ],
    },
    {
      title: "Hébergement et transferts",
      paragraphs: [
        "Les données sont hébergées dans l’Union européenne. Elles ne sont jamais vendues à des tiers à des fins commerciales.",
      ],
    },
    {
      title: "Cookies",
      paragraphs: [
        "Ce site n’utilise ni cookie publicitaire ni outil de mesure d’audience.",
      ],
    },
  ],
  outro: OUTRO,
};

export const CGU: LegalDoc = {
  title: "Conditions Générales d’Utilisation",
  updated: UPDATED,
  sections: [
    editor,
    {
      title: "1. Objet et champ d’application",
      paragraphs: [
        "Les présentes Conditions Générales d’Utilisation (« CGU ») régissent l’utilisation de l’application REMI AI par toute personne y accédant (« l’Utilisateur »). Elles s’appliquent à deux catégories d’Utilisateurs :",
        "Le Praticien (B2B) : professionnel de la santé ou du bien-être (nutritionniste, diététicien, médecin, etc.) qui utilise REMI AI dans le cadre de sa pratique professionnelle et en fait bénéficier ses propres patients.\nLe Patient (B2C) : personne physique qui accède à l’application sur invitation et sous la supervision de son Praticien, ou qui rejoint le programme pilote Patients proposé par REMI AI.",
        "REMI AI est une plateforme numérique de bien-être et d’accompagnement lifestyle fournissant des contenus générés par intelligence artificielle, visant à sensibiliser, informer et accompagner le Patient dans l’amélioration de son hygiène de vie, de ses habitudes alimentaires quotidiennes et de son bien-être général, en lien avec le suivi assuré par son Praticien. Le Service ne constitue en aucun cas un dispositif médical, un service de santé, un avis médical, un diagnostic ou un traitement médical. Il ne se substitue en aucun cas à la consultation et au suivi direct par le Praticien. L’accès au Service est strictement réservé aux personnes majeures disposant de la pleine capacité juridique.",
      ],
    },
    {
      title: "2. Acceptation des CGU",
      paragraphs: [
        "Par son inscription sur l’application, l’Utilisateur confirme son acceptation entière et sans réserve des présentes CGU. Toute utilisation du Service postérieure à la publication des présentes CGU vaut acceptation sans réserve.",
      ],
    },
    {
      title: "3. Description du Service et Programmes Pilotes (Bêta)",
      paragraphs: [
        "Le Service comprend notamment un accès à un espace personnel, l’interaction avec un assistant numérique dédié au suivi du bien-être, la génération de contenus personnalisés à finalité pédagogique et motivationnelle, ainsi que des recommandations générales d’hygiène de vie, d’alimentation équilibrée et de gestion du stress, sans visée médicale. Lorsque l’Utilisateur participe à une offre identifiée comme « Pilote », « Bêta » ou « Proof of Concept », il reconnaît que le Service est en cours de développement actif et peut présenter des dysfonctionnements ; que REMI AI peut modifier, ajouter ou supprimer des fonctionnalités à tout moment ; et que toutes suggestions ou retours d’expérience communiqués sont cédés gratuitement à REMI AI.",
      ],
    },
    {
      title: "4. Fonctionnement de l’intelligence artificielle et transparence",
      paragraphs: [
        "L’Utilisateur est informé qu’il interagit avec un système automatisé, que les contenus générés peuvent comporter des approximations, et qu’ils ont exclusivement une finalité de bien-être et d’accompagnement lifestyle. Le Service ne fournit pas d’avis médical, diagnostique ou thérapeutique. Le Patient s’engage à ne pas utiliser les contenus générés pour prendre des décisions médicales et doit systématiquement se référer à son Praticien.",
      ],
    },
    {
      title: "5. Usage autorisé et obligations des Utilisateurs",
      paragraphs: [
        "Tout Utilisateur s’engage à utiliser le Service dans le respect des lois, à ne pas le détourner de sa finalité de bien-être, et à ne pas tenter de le contourner, copier ou altérer. Le Praticien s’engage en outre à informer ses Patients de la nature non-médicale de l’outil, à conserver son indépendance professionnelle, et à assumer l’entière responsabilité du suivi thérapeutique et nutritionnel de ses Patients.",
      ],
    },
    {
      title: "6. Responsabilités",
      paragraphs: [
        "REMI AI fournit un service de bien-être constituant une obligation de moyens, et ne garantit pas l’absence totale d’erreurs dans les contenus générés. REMI AI ne peut être tenue responsable de l’interprétation ou de l’utilisation faite des contenus, ni des conséquences de choix personnels ou thérapeutiques basés sur ceux-ci. Le Praticien est seul responsable de l’usage professionnel qu’il fait de l’application et de la prise en charge de ses Patients.",
      ],
    },
    {
      title: "7. Propriété intellectuelle",
      paragraphs: [
        "L’ensemble de l’application, de ses structures et de ses contenus sont protégés par le droit d’auteur et de propriété intellectuelle de REMI AI. Toute reproduction ou exploitation non autorisée est interdite.",
      ],
    },
    {
      title: "8. Force majeure",
      paragraphs: [
        "REMI AI ne pourra être tenue responsable de la non-exécution de ses obligations en cas de force majeure.",
      ],
    },
    {
      title: "9. Loi applicable et juridiction compétente",
      paragraphs: [
        "Les présentes CGU sont soumises au droit belge. Tout litige relève de la compétence des tribunaux du ressort du siège social de REMI AI (Brabant wallon), sauf disposition impérative contraire.",
      ],
    },
    contact,
  ],
  outro: OUTRO,
};

export const CGV: LegalDoc = {
  title: "Conditions Générales de Vente",
  updated: UPDATED,
  intro:
    "Les clauses propres aux offres pilotes (prix, paiement, rétractation, durée) sont à faire valider par un juriste avant l’ouverture des ventes.",
  sections: [
    editor,
    {
      title: "1. Objet",
      paragraphs: [
        "Les présentes Conditions Générales de Vente (« CGV ») régissent les modalités de souscription et de paiement des offres REMI AI, plateforme numérique de bien-être et d’accompagnement lifestyle fournissant des contenus générés par intelligence artificielle.",
      ],
    },
    {
      title: "2. Souscription",
      paragraphs: [
        "Le Service est accessible via une offre souscrite par le Patient (programme pilote Patients) ou par le Praticien. L’inscription en ligne sur le site est une simple manifestation d’intérêt, sans engagement ni paiement. La souscription n’est ferme qu’après confirmation par REMI AI et acceptation des présentes CGV et des CGU.",
      ],
    },
    {
      title: "3. Offres et prix",
      paragraphs: [
        `Programme pilote Patients (démarrage à partir du ${SITE.pilotStartLabel}). Les tarifs en vigueur sont les suivants (prix en EUR, TVA comprise le cas échéant) :`,
        offersText,
        "Le test ADN est une analyse ciblée de quelques variantes en lien avec la nutrition, et non un séquençage complet de l’ADN. Il ne permet ni de prévenir ni de traiter une maladie ; son contenu exact est confirmé avec le laboratoire.",
        "Offres Praticiens : l’inscription sur liste d’attente est sans engagement. Les tarifs et conditions sont communiqués avant toute souscription.",
        "REMI AI se réserve le droit de modifier ses tarifs à tout moment ; toute évolution s’appliquera uniquement aux souscriptions futures et fera l’objet d’une information préalable.",
      ],
    },
    {
      title: "4. Paiement et facturation",
      paragraphs: [
        "Le paiement s’effectue par voie électronique, en une seule fois, après confirmation de la souscription. Les formules pilotes sont des forfaits uniques : il ne s’agit pas d’un abonnement et il n’y a pas de renouvellement automatique. Une facture électronique est émise à chaque paiement.",
      ],
    },
    {
      title: "5. Droit de rétractation",
      paragraphs: [
        "Conformément à la directive 2011/83/UE et aux articles VI.47 à VI.53 du Code de droit économique belge, le droit de rétractation de 14 jours s’applique uniquement aux Utilisateurs ayant la qualité de consommateur (B2C). Le Praticien agissant dans le cadre de son activité professionnelle (B2B) ne bénéficie pas du droit de rétractation légal, son engagement étant ferme pour la période souscrite, sauf disposition contraire prévue pour une offre Pilote.",
      ],
    },
    {
      title: "6. Durée, suspension et résiliation",
      paragraphs: [
        "Chaque formule est conclue pour une durée de 8 semaines à compter de la date de démarrage communiquée, sans reconduction automatique. REMI AI peut suspendre ou résilier le contrat en cas de non-respect des CGV/CGU, de fraude ou de non-paiement.",
      ],
    },
    {
      title: "7. Responsabilité",
      paragraphs: [
        "REMI AI ne peut être tenue responsable de l’interprétation des contenus générés ni des décisions prises sur leur base. L’Utilisateur est invité à consulter un professionnel de santé qualifié en cas de doute sur sa santé.",
      ],
    },
    {
      title: "8. Propriété intellectuelle",
      paragraphs: [
        "Tous les contenus sont protégés par le droit d’auteur. Toute reproduction non autorisée est interdite.",
      ],
    },
    {
      title: "9. Loi applicable",
      paragraphs: [
        "Droit belge. Les tribunaux du ressort du siège social de REMI AI sont compétents en cas de litige, sauf disposition impérative contraire pour les consommateurs.",
      ],
    },
    contact,
  ],
  outro: OUTRO,
};

export const LEGAL_NOTICE: LegalDoc = {
  title: "Mentions légales",
  intro: "Projet de texte — à compléter avant publication.",
  sections: [
    {
      title: "Éditeur du site",
      paragraphs: [
        `${c.legalName} — ${c.legalForm}`,
        `Siège : ${c.address}`,
        `Numéro d’entreprise : ${c.registrationNumber}`,
        `Responsable de la publication : ${c.publisher}`,
        `Contact : ${SITE.contactEmail} · ${SITE.contactPhone}`,
      ],
    },
    { title: "Hébergeur", paragraphs: [c.host] },
    {
      title: "Nature du service",
      paragraphs: [
        "REMI n’est pas un dispositif de diagnostic médical et ne remplace pas l’avis d’un professionnel de santé. Aucun résultat médical n’est garanti.",
      ],
    },
  ],
};

export const legalSlugs = [
  "mentions-legales",
  "cgu",
  "cgv",
  "confidentialite",
] as const;

export type LegalSlug = (typeof legalSlugs)[number];

export const isLegalSlug = (value: string): value is LegalSlug =>
  (legalSlugs as readonly string[]).includes(value);

export const legalDocs: Record<LegalSlug, LegalDoc> = {
  "mentions-legales": LEGAL_NOTICE,
  cgu: CGU,
  cgv: CGV,
  confidentialite: PRIVACY,
};
