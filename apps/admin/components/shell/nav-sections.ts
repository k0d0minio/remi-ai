import {
  Flag,
  LayoutDashboard,
  LifeBuoy,
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
 * cohort first, then the tooling that acts on it.
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
];
