"use client";

import {
  ChefHat,
  Footprints,
  LayoutDashboard,
  NotebookPen,
  Stethoscope,
  Sun,
  Users,
} from "lucide-react";
import NextLink from "next/link";
import { usePathname } from "next/navigation";
import type { ComponentType } from "react";
import { cn } from "@remi/ui/utils";

type Item = {
  href: string;
  label: string;
  icon: ComponentType<{ className?: string }>;
};

const practitionerItems: Item[] = [
  { href: "/practitioner", label: "Ma pratique", icon: LayoutDashboard },
  {
    href: "/practitioner/clients",
    label: "Personnes accompagnées",
    icon: Users,
  },
  {
    href: "/practitioner/frame",
    label: "Cadre thérapeutique",
    icon: Stethoscope,
  },
];

const personItems: Item[] = [
  { href: "/person", label: "Aujourd'hui", icon: Sun },
  { href: "/person/meals", label: "Repas", icon: ChefHat },
  { href: "/person/steps", label: "Étapes", icon: Footprints },
  { href: "/person/plan", label: "Mon plan", icon: NotebookPen },
];

type Props = {
  onNavigate?: () => void;
};

export const DemoNav = ({ onNavigate }: Props) => {
  const pathname = usePathname();
  const items = pathname.startsWith("/person")
    ? personItems
    : practitionerItems;

  return (
    <ul className="flex flex-col gap-1">
      {items.map((item) => {
        const active =
          pathname === item.href ||
          (item.href !== "/practitioner" &&
            item.href !== "/person" &&
            pathname.startsWith(`${item.href}/`));
        const Icon = item.icon;

        return (
          <li key={item.href}>
            <NextLink
              href={item.href}
              onClick={onNavigate}
              aria-current={active ? "page" : undefined}
              className={cn(
                "focus-visible:ring-ring/40 flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors duration-[--duration-fast] focus-visible:outline-none focus-visible:ring-[3px]",
                active
                  ? "bg-primary-subtle text-primary font-medium"
                  : "text-muted-foreground hover:bg-accent hover:text-foreground",
              )}
            >
              <Icon className="size-4 shrink-0" />
              {item.label}
            </NextLink>
          </li>
        );
      })}
    </ul>
  );
};
