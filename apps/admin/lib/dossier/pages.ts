export type DossierPage = {
  href: string;
  /** Short enough for a sidebar row. The page's own full title lives in its header. */
  label: string;
  /** One line on the Synthèse page's index — what this page settles. */
  summary: string;
};

/**
 * The page the dossier opens on, and the only one written to be read first.
 * It is kept out of `dossierPages` because both readers — the sidebar and the
 * index it renders — treat it as the thing the others sit under, never as one
 * of them.
 */
export const dossierLead: DossierPage = {
  href: "/synthese",
  label: "Synthèse",
  summary:
    "Ce qui a changé, vos quatre questions répondues en une ligne chacune, et un ordre du jour pour l'appel.",
};

/**
 * The four pages behind the Synthèse, in the order they ask something of the
 * reader rather than in the order they argue — and the single home for that
 * order. The sidebar's Dossier section and the Synthèse's index are both
 * derived from this list, so a page cannot exist in one and be missing from
 * the other.
 */
export const dossierPages: readonly DossierPage[] = [
  {
    href: "/decisions",
    label: "Décisions",
    summary:
      "Cinq faits que nous n'avons pas, et sept choix que le développement prendrait par défaut si personne ne les prenait pour de bon. Deux décident du Startup Boost à eux seuls.",
  },
  {
    href: "/startup-boost",
    label: "Startup Boost",
    summary:
      "Les deux verrous d'éligibilité, l'appel noté critère par critère, et les cinq arguments à défendre devant le jury. Clôture le 15 septembre.",
  },
  {
    href: "/plan",
    label: "Plan V2",
    summary:
      "Ce qui a été retiré de l'ancien plan et ce qui survit, puis les six phases qui le remplacent — 27 tickets, en attente de votre relecture.",
  },
  {
    href: "/outils",
    label: "Outils",
    summary:
      "L'état réel de la stack, les trois outils de votre liste introuvables, et les comptes de la V1 qui sont peut-être encore facturés.",
  },
];
