import {
  CircleHelp,
  Compass,
  FileText,
  GitCompare,
  Landmark,
  Milestone,
  Wrench,
} from "lucide-react";
import type { ComponentType } from "react";

export type DossierPage = {
  href: string;
  label: string;
  icon: ComponentType<{ className?: string }>;
  /** One line on the Synthèse page's index — what this page settles. */
  summary: string;
};

/** The Synthèse page's own route, excluded from the index it renders. */
export const synthesisHref = "/synthese";

/**
 * The dossier, in reading order — and the single home for that order. The
 * sidebar's Company section is derived from this list rather than restating it,
 * so a page cannot exist in the navigation and be missing from the index, or
 * the reverse.
 */
export const dossierPages: readonly DossierPage[] = [
  {
    href: synthesisHref,
    label: "Synthèse",
    icon: FileText,
    summary:
      "Ce qui a changé cette semaine, les quatre questions répondues en une ligne chacune, et un ordre du jour proposé pour l'appel.",
  },
  {
    href: "/produit",
    label: "Le produit",
    icon: Compass,
    summary:
      "Ce que REMI est, dans vos propres mots : le dernier kilomètre, les trois principes de la V2, son périmètre, et les chiffres que vous pilotez.",
  },
  {
    href: "/ecarts",
    label: "Écarts constatés",
    icon: GitCompare,
    summary:
      "Où ce qui a été construit s'écarte de votre vision : ce qui se reporte, ce qui ne se reporte pas, et pourquoi l'ancien plan a été retiré.",
  },
  {
    href: "/startup-boost",
    label: "Startup Boost",
    icon: Landmark,
    summary:
      "L'appel noté critère par critère, les deux verrous d'éligibilité, les cinq arguments à défendre devant le jury et la ligne à ne pas franchir.",
  },
  {
    href: "/outils",
    label: "Outils et coûts",
    icon: Wrench,
    summary:
      "L'état réel de la stack, les trois outils de votre liste introuvables, et les comptes de la V1 qui sont peut-être encore facturés.",
  },
  {
    href: "/plan",
    label: "Plan V2",
    icon: Milestone,
    summary:
      "Les six phases proposées — décider, fonder, la boucle patient, le dashboard praticien, le parser, l'argent — et les 27 tickets qui en sortent.",
  },
  {
    href: "/decisions",
    label: "Décisions attendues",
    icon: CircleHelp,
    summary:
      "La courte liste de ce qui ne dépend que de vous, et les choix laissés ouverts volontairement plutôt que tranchés par défaut.",
  },
];
