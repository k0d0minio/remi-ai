"use client";

import { Menu } from "lucide-react";
import NextLink from "next/link";
import { useState } from "react";
import { localePath, type Locale } from "@remi/services/shared";
import {
  Button,
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@remi/ui";
import { Link, Separator } from "@remi/ui/server";
import type { Content, NavItem } from "@/lib/content/types";

type Props = {
  locale: Locale;
  nav: NavItem[];
  header: Content["header"];
};

/**
 * The one stateful part of the header, so the only part that is a client
 * component. `open` is tracked here rather than left to Radix's uncontrolled
 * mode because each link has to close the panel when it is followed.
 *
 * The props are the plain-string slices of the dictionary, not the whole
 * `Content` object: the full dictionary holds icon components, and a function
 * cannot cross the server→client boundary — passing it all crashes the build
 * at prerender.
 */
export const MobileNav = ({ locale, nav, header }: Props) => {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu aria-hidden="true" />
          <span className="sr-only">{header.menuLabel}</span>
        </Button>
      </SheetTrigger>

      <SheetContent side="right" className="w-full sm:max-w-xs">
        <SheetHeader>
          <SheetTitle>{header.menuLabel}</SheetTitle>
        </SheetHeader>

        <nav aria-label="Main" className="flex flex-col gap-1 px-6">
          {nav.map((item) => (
            <SheetClose key={item.href} asChild>
              <Link
                as={NextLink}
                href={localePath(locale, item.href)}
                className="py-2.5 text-base"
              >
                {item.label}
              </Link>
            </SheetClose>
          ))}
        </nav>

        <Separator className="mx-6 w-auto" />

        <div className="flex flex-col gap-3 px-6">
          <SheetClose asChild>
            <Button asChild variant="outline">
              <NextLink href={localePath(locale, "/contact")}>
                {header.contact}
              </NextLink>
            </Button>
          </SheetClose>
          <SheetClose asChild>
            <Button asChild>
              <NextLink href={localePath(locale, header.cta.href)}>
                {header.cta.label}
              </NextLink>
            </Button>
          </SheetClose>
        </div>
      </SheetContent>
    </Sheet>
  );
};
