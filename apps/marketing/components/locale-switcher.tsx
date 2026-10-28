"use client";

import NextLink from "next/link";
import { usePathname } from "next/navigation";
import { locales, type Locale } from "@remi/services/shared";
import { LocaleSwitcher as LocaleSwitcherNav } from "@remi/ui/server";

type Props = {
  locale: Locale;
};

/**
 * EN | FR, preserving the current path. A client component only because it
 * needs `usePathname` to know where the visitor is — the switcher itself is a
 * server-safe primitive in @remi/ui, so this file is the whole of the client
 * cost.
 */
export const LocaleSwitcher = ({ locale }: Props) => {
  const pathname = usePathname();
  const rest = pathname.replace(/^\/(en|fr)(?=\/|$)/, "");

  return (
    <LocaleSwitcherNav
      as={NextLink}
      locales={locales}
      current={locale}
      hrefFor={(target) => `/${target}${rest}`}
      label="Language"
    />
  );
};
