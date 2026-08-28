"use client";

import NextLink from "next/link";
import { usePathname } from "next/navigation";
import { Typography } from "@remi/ui/server";
import { cn } from "@remi/ui/utils";
import { navSections } from "@/components/shell/nav-sections";

type Props = {
  canManageOperators: boolean;
  /** Fired when a link is chosen, so the mobile panel can close itself. */
  onNavigate?: () => void;
};

// Accueil owns the root, so it matches exactly; every other link owns its
// subtree.
const matches = (href: string, pathname: string) =>
  href === "/"
    ? pathname === "/"
    : pathname === href || pathname.startsWith(`${href}/`);

/**
 * A client island purely because the current route decides which link is
 * highlighted. The sidebar and header around it stay on the server.
 *
 * The owner-only rows are filtered by a boolean prop rather than by reading the
 * session here: a role is not serialisable across the boundary as anything an
 * operator's browser should be trusted with, and hiding a link is a courtesy in
 * any case. The route itself is guarded server-side, which is the real check.
 */
export const NavLinks = ({ canManageOperators, onNavigate }: Props) => {
  const pathname = usePathname();

  const sections = navSections
    .map((section) => ({
      ...section,
      items: section.items.filter(
        (item) => !item.ownerOnly || canManageOperators,
      ),
    }))
    .filter((section) => section.items.length > 0);

  return (
    <div className="flex flex-col gap-6">
      {sections.map((section) => (
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
            {section.items.map((item) => {
              const active = matches(item.href, pathname);
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
        </div>
      ))}
    </div>
  );
};
