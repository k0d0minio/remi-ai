import {
  FileText,
  Flag,
  LayoutDashboard,
  LifeBuoy,
  Rocket,
  ScrollText,
  Stethoscope,
} from "lucide-react";
import type { ComponentType } from "react";
import { dossierLead, dossierPages } from "@/lib/dossier/pages";

export type NavItem = {
  href: string;
  label: string;
  /**
   * Absent on the pages under a section's lead — the lead carries the only
   * icon there, and a row without one indents to sit beneath it.
   */
  icon?: ComponentType<{ className?: string }>;
};

export type NavSection = {
  title: string;
  /**
   * Set where the section is one destination with its pages under it rather
   * than a flat list of peers. The dossier is the only such section: an
   * operator either opens it or does not, and the four pages behind the
   * Synthèse should not compete with the tools they work in daily.
   */
  lead?: NavItem;
  items: readonly NavItem[];
};

/**
 * The console's whole surface, in the order an operator works through it: the
 * cohort first, then the tooling that acts on it, and last the dossier written
 * for Morgane and Arnaud to review, in French per the working-languages rule in
 * `CONVENTIONS.md`. None of those pages act on the cohort, so they sit under
 * one entry rather than among the tools an operator reaches for daily.
 *
 * The Dossier section is derived from `lib/dossier/pages` rather than restated
 * here: the dossier's reading order and the sidebar's order are one fact.
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
    lead: { href: dossierLead.href, label: dossierLead.label, icon: FileText },
    items: dossierPages.map(({ href, label }) => ({ href, label })),
  },
];
