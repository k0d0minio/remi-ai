"use client";

import {
  Camera,
  ChefHat,
  Footprints,
  LayoutDashboard,
  MessageCircle,
  MessagesSquare,
  NotebookPen,
  Sparkles,
  Stethoscope,
  Sun,
  TrendingUp,
  Users,
} from "lucide-react";
import NextLink from "next/link";
import { usePathname } from "next/navigation";
import type { ComponentType } from "react";
import { Badge } from "@remi/ui/server";
import { cn } from "@remi/ui/utils";

type Item = {
  href: string;
  label: string;
  icon: ComponentType<{ className?: string }>;
  /** Marks a screen that is prototyped here but not yet in the product. */
  upcoming?: boolean;
};

const practitionerItems: Item[] = [
  { href: "/practitioner", label: "Ma pratique", icon: LayoutDashboard },
  {
    href: "/practitioner/clients",
    label: "Personnes accompagnées",
    icon: Users,
  },
  {
    href: "/practitioner/analytics",
    label: "Cohorte",
    icon: TrendingUp,
    upcoming: true,
  },
  {
    href: "/practitioner/messages",
    label: "Messagerie",
    icon: MessagesSquare,
    upcoming: true,
  },
  {
    href: "/practitioner/frame",
    label: "Cadre thérapeutique",
    icon: Stethoscope,
  },
];

const patientItems: Item[] = [
  { href: "/patient", label: "Aujourd'hui", icon: Sun },
  { href: "/patient/journal", label: "Journal", icon: Camera, upcoming: true },
  { href: "/patient/meals", label: "Repas", icon: ChefHat },
  { href: "/patient/steps", label: "Étapes", icon: Footprints },
  {
    href: "/patient/messages",
    label: "Mes messages",
    icon: MessageCircle,
    upcoming: true,
  },
  {
    href: "/patient/recap",
    label: "Mon bilan",
    icon: Sparkles,
    upcoming: true,
  },
  { href: "/patient/plan", label: "Mon plan", icon: NotebookPen },
];

type Props = {
  onNavigate?: () => void;
};

export const DemoNav = ({ onNavigate }: Props) => {
  const pathname = usePathname();
  const items = pathname.startsWith("/patient")
    ? patientItems
    : practitionerItems;

  return (
    <ul className="flex flex-col gap-1">
      {items.map((item) => {
        const active =
          pathname === item.href ||
          (item.href !== "/practitioner" &&
            item.href !== "/patient" &&
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
              <span className="min-w-0 truncate">{item.label}</span>
              {item.upcoming ? (
                <Badge
                  variant="info"
                  tone="subtle"
                  size="sm"
                  className="ml-auto"
                >
                  à venir
                </Badge>
              ) : null}
            </NextLink>
          </li>
        );
      })}
    </ul>
  );
};
