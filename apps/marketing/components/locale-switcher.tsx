"use client";

import NextLink from "next/link";
import { usePathname } from "next/navigation";
import { buttonVariants } from "@remi/ui";
import { cn } from "@remi/ui/utils";
import { locales, type Locale } from "@/lib/i18n";

type Props = {
  locale: Locale;
};

/**
 * EN | FR, preserving the current path. A client component only because it
 * needs `usePathname` to know where the visitor is — the links themselves are
 * plain anchors, so switching language never loses the page.
 */
export const LocaleSwitcher = ({ locale }: Props) => {
  const pathname = usePathname();
  const rest = pathname.replace(/^\/(en|fr)(?=\/|$)/, "");

  return (
    <nav aria-label="Language" className="flex items-center gap-1">
      {locales.map((target) => (
        <NextLink
          key={target}
          href={`/${target}${rest}`}
          hrefLang={target}
          aria-current={target === locale ? "true" : undefined}
          className={cn(
            buttonVariants({ variant: "ghost", size: "sm" }),
            "px-2 uppercase",
            target === locale ? "text-foreground" : "text-muted-foreground",
          )}
        >
          {target}
        </NextLink>
      ))}
    </nav>
  );
};
