"use client";

import NextLink from "next/link";
import { usePathname } from "next/navigation";
import { localePath, type Locale } from "@remi/services/shared";
import { cn } from "@remi/ui/utils";
import { navIcons } from "@/components/shell/nav-icons";
import type { NavItem } from "@/lib/content/types";

type Props = {
  items: NavItem[];
  locale: Locale;
  /** Fired when a link is chosen, so the mobile panel can close itself. */
  onNavigate?: () => void;
};

/**
 * A client island purely because the current route decides which link is
 * highlighted. The sidebar and header around it stay on the server.
 */
export const NavLinks = ({ items, locale, onNavigate }: Props) => {
  const pathname = usePathname();

  return (
    <ul className="flex flex-col gap-1">
      {items.map((item) => {
        const href = localePath(locale, item.href);
        const active = pathname === href || pathname.startsWith(`${href}/`);
        const Icon = navIcons[item.icon];

        return (
          <li key={item.href}>
            <NextLink
              href={href}
              onClick={onNavigate}
              aria-current={active ? "page" : undefined}
              className={cn(
                "focus-visible:ring-ring/40 flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors duration-[--duration-fast] focus-visible:outline-none focus-visible:ring-[3px]",
                active
                  ? "bg-primary-subtle text-primary font-medium"
                  : "text-muted-foreground hover:bg-accent hover:text-foreground",
              )}
            >
              {Icon ? <Icon className="size-4 shrink-0" /> : null}
              {item.label}
            </NextLink>
          </li>
        );
      })}
    </ul>
  );
};
