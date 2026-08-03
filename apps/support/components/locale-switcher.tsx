"use client";

import NextLink from "next/link";
import { usePathname } from "next/navigation";
import { locales, type Locale } from "@remi/services/shared";
import { LocaleSwitcher as LocaleSwitcherNav } from "@remi/ui/server";

type Props = {
  locale: Locale;
  label: string;
};

/**
 * EN | FR, preserving the current path — someone halfway through an answer
 * should get the same answer in the other language, not the home page. A client
 * component only because it needs `usePathname`; the switcher itself is a
 * server-safe primitive in @remi/ui.
 */
export const LocaleSwitcher = ({ locale, label }: Props) => {
  const pathname = usePathname();
  const rest = pathname.replace(/^\/(en|fr)(?=\/|$)/, "");

  return (
    <LocaleSwitcherNav
      as={NextLink}
      locales={locales}
      current={locale}
      hrefFor={(target) => `/${target}${rest}`}
      label={label}
    />
  );
};
