"use client";

import NextLink from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@remi/ui/utils";

const surfaces = [
  { href: "/practitioner", label: "Praticien" },
  { href: "/person", label: "Personne accompagnée" },
] as const;

/**
 * The two sides of the loop, side by side. It exists only in the demo: in the
 * product, which side you are on is decided by who you are, not by a toggle. Its
 * job here is to let a stakeholder see both halves of the same story in one
 * sitting.
 */
export const SurfaceSwitcher = () => {
  const pathname = usePathname();

  return (
    <div className="bg-muted flex rounded-lg p-1" role="group">
      {surfaces.map((surface) => {
        const active = pathname.startsWith(surface.href);

        return (
          <NextLink
            key={surface.href}
            href={surface.href}
            aria-current={active ? "true" : undefined}
            className={cn(
              "focus-visible:ring-ring/40 flex-1 rounded-md px-3 py-1.5 text-center text-xs font-medium transition-colors duration-[--duration-fast] focus-visible:outline-none focus-visible:ring-[3px]",
              active
                ? "bg-background text-foreground shadow-xs"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {surface.label}
          </NextLink>
        );
      })}
    </div>
  );
};
