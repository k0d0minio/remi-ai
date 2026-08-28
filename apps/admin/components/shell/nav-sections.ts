import {
  FileText,
  Flag,
  LayoutDashboard,
  LifeBuoy,
  Rocket,
  ScrollText,
  Stethoscope,
  Users,
} from "lucide-react";
import type { ComponentType } from "react";

export type NavItem = {
  href: string;
  label: string;
  icon: ComponentType<{ className?: string }>;
};

export type NavSection = {
  title: string;
  items: readonly NavItem[];
};

/**
 * The console's whole surface, in the order an operator works through it: the
 * cohort first, then the tooling that acts on it, and last the dossier written
 * for Morgane and Arnaud to review, in French per the working-languages rule in
 * `CONVENTIONS.md`.
 *
 * The dossier is one route and one row. It was seven, then five; a document
 * read once before a call earns a single entry, not a section of its own to
 * navigate.
 *
 * The icon is the component rather than a name, unlike the product app's nav —
 * admin has no locale dictionaries, so there is no serialisable-data constraint
 * to route around here.
 */
export const navSections: readonly NavSection[] = [
  {
    title: "Operations",
    items: [
      { href: "/", label: "Overview", icon: LayoutDashboard },
      { href: "/patients", label: "Patients", icon: Users },
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
    title: "Dossier",
    items: [
      { href: "/dossier", label: "Préparation de l'appel", icon: FileText },
    ],
  },
];
