import {
  CircleHelp,
  Flag,
  Handshake,
  LayoutDashboard,
  LifeBuoy,
  Milestone,
  Rocket,
  ScrollText,
  Stethoscope,
} from "lucide-react";
import type { ComponentType } from "react";

export type NavItem = {
  href: string;
  label: string;
  icon: ComponentType<{ className?: string }>;
};

export type NavSection = {
  title: string;
  items: NavItem[];
};

/**
 * The console's whole surface, in the order an operator works through it: the
 * cohort first, then the tooling that acts on it, and last the founders' shelf
 * — the pages written for Morgane and Arnaud to review, in French per the
 * working-languages rule in `CONVENTIONS.md`. None of those act on the cohort,
 * so they get their own section rather than sitting among the tools an
 * operator reaches for daily.
 *
 * The icon is the component rather than a name, unlike the product app's nav —
 * admin has no locale dictionaries, so there is no serialisable-data constraint
 * to route around here.
 */
export const navSections: NavSection[] = [
  {
    title: "Operations",
    items: [
      { href: "/", label: "Overview", icon: LayoutDashboard },
      { href: "/practitioners", label: "Practitioners", icon: Stethoscope },
      { href: "/pilot", label: "Pilot", icon: Rocket },
    ],
  },
  {
    title: "Platform",
    items: [
      { href: "/support", label: "Support", icon: LifeBuoy },
      { href: "/flags", label: "Flags", icon: Flag },
      { href: "/audit", label: "Audit", icon: ScrollText },
    ],
  },
  {
    title: "Company",
    items: [
      { href: "/roadmap", label: "Feuille de route", icon: Milestone },
      { href: "/questions", label: "Questions ouvertes", icon: CircleHelp },
      { href: "/offer", label: "Offre CTO", icon: Handshake },
    ],
  },
];
