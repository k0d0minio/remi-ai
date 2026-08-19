"use client";

import NextLink from "next/link";
import { usePathname } from "next/navigation";
import { Typography } from "@remi/ui/server";
import { cn } from "@remi/ui/utils";
import { navSections, type NavItem } from "@/components/shell/nav-sections";

type Props = {
  /** Fired when a link is chosen, so the mobile panel can close itself. */
  onNavigate?: () => void;
};

// Overview owns the root, so it matches exactly; every other link owns its
// subtree.
const matches = (href: string, pathname: string) =>
  href === "/"
    ? pathname === "/"
    : pathname === href || pathname.startsWith(`${href}/`);

type LinkProps = {
  item: NavItem;
  active: boolean;
  onNavigate?: () => void;
};

/**
 * One row. An item without an icon is a page under a section's lead, so it
 * indents to where the lead's label starts — the hierarchy is read off the
 * alignment rather than off a second type scale.
 */
const NavLink = ({ item, active, onNavigate }: LinkProps) => {
  const Icon = item.icon;

  return (
    <NextLink
      href={item.href}
      onClick={onNavigate}
      aria-current={active ? "page" : undefined}
      className={cn(
        "focus-visible:ring-ring/40 flex items-center gap-3 rounded-md text-sm transition-colors duration-[--duration-fast] focus-visible:outline-none focus-visible:ring-[3px]",
        // A sub-item's left padding clears the lead's icon and gap, so its
        // label starts exactly where the lead's does.
        Icon ? "px-3 py-2" : "py-1.5 pl-10 pr-3",
        active
          ? "bg-primary-subtle text-primary font-medium"
          : "text-muted-foreground hover:bg-accent hover:text-foreground",
      )}
    >
      {Icon ? <Icon className="size-4 shrink-0" /> : null}
      {item.label}
    </NextLink>
  );
};

/**
 * A client island purely because the current route decides which link is
 * highlighted. The sidebar and header around it stay on the server.
 */
export const NavLinks = ({ onNavigate }: Props) => {
  const pathname = usePathname();

  return (
    <div className="flex flex-col gap-6">
      {navSections.map((section) => {
        // The lead is the section's first link, not a thing beside the list —
        // it only reads as a lead because it is the row carrying the icon.
        const rows = section.lead
          ? [section.lead, ...section.items]
          : section.items;

        return (
          <div key={section.title} className="flex flex-col gap-1">
            <Typography
              as="h2"
              variant="eyebrow"
              tone="muted"
              className="px-3 pb-1"
            >
              {section.title}
            </Typography>

            <ul className="flex flex-col gap-0.5">
              {rows.map((item) => (
                <li key={item.href}>
                  <NavLink
                    item={item}
                    active={matches(item.href, pathname)}
                    onNavigate={onNavigate}
                  />
                </li>
              ))}
            </ul>
          </div>
        );
      })}
    </div>
  );
};
