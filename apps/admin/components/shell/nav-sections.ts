import { ChefHat, Home, ScrollText, Users, UsersRound } from "lucide-react";
import type { ComponentType } from "react";

export type NavItem = {
  href: string;
  label: string;
  icon: ComponentType<{ className?: string }>;
  /** Hidden from anyone who cannot manage accounts. */
  ownerOnly?: boolean;
};

export type NavSection = {
  title: string;
  items: readonly NavItem[];
};

/**
 * The console's whole surface. It is deliberately five rows: this console is
 * Morgane's patient tool and the accounts that reach it, and nothing else. The
 * practitioner, pilot, support and flag screens that used to live here were
 * fixtures with no data behind them — they were deleted rather than hidden.
 *
 * Routes stay English and copy is French, per `CONVENTIONS.md`: a path is an
 * identifier, a label is what the reader reads.
 *
 * The icon is the component rather than a name, unlike the product app's nav —
 * admin has no locale dictionaries, so there is no serialisable-data constraint
 * to route around here.
 */
export const navSections: readonly NavSection[] = [
  {
    title: "Suivi",
    items: [
      { href: "/", label: "Accueil", icon: Home },
      { href: "/patients", label: "Patients", icon: Users },
      // Beside Patients rather than under one: the library belongs to no
      // patient, which is the whole reason it is a library.
      { href: "/recipes", label: "Recettes", icon: ChefHat },
    ],
  },
  {
    title: "Console",
    items: [
      { href: "/team", label: "Équipe", icon: UsersRound, ownerOnly: true },
      { href: "/audit", label: "Journal", icon: ScrollText },
    ],
  },
];
