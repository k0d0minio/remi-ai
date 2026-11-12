"use client";

import NextLink from "next/link";
import { usePathname } from "next/navigation";
import { BottomNav } from "@remi/ui/server";
import { navIcons } from "@/components/shell/nav-icons";
import type { NavItem } from "@/lib/content/types";

type Props = {
  /** The tabs with their hrefs already under the locale. */
  tabs: NavItem[];
  label: string;
};

/**
 * A client island only because the current path decides the active tab. A
 * page below a tab (a recipe under « Recettes ») keeps that tab marked.
 */
export const PatientTabBar = ({ tabs, label }: Props) => {
  const pathname = usePathname();
  const current =
    tabs.find(
      (tab) => pathname === tab.href || pathname.startsWith(`${tab.href}/`),
    )?.href ?? "";

  return (
    <BottomNav
      as={NextLink}
      label={label}
      current={current}
      items={tabs.map((tab) => {
        const Icon = navIcons[tab.icon];
        return {
          href: tab.href,
          label: tab.label,
          icon: Icon ? <Icon /> : null,
        };
      })}
    />
  );
};
