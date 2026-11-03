"use client";

import { Menu } from "lucide-react";
import NextLink from "next/link";
import { useState } from "react";
import { localePath } from "@remi/services/shared";
import {
  Button,
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@remi/ui";
import { Link } from "@remi/ui/server";
import { HEADER, NAV } from "@/lib/content/landing";

const home = localePath("fr", "/");

/**
 * The one stateful part of the header, so the only part that is a client
 * component. `open` is tracked here because each link has to close the panel
 * when it is followed.
 */
export const MobileNav = () => {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="lg:hidden">
          <Menu aria-hidden="true" />
          <span className="sr-only">{HEADER.menuLabel}</span>
        </Button>
      </SheetTrigger>

      <SheetContent side="right" className="w-full sm:max-w-xs">
        <SheetHeader>
          <SheetTitle>{HEADER.menuLabel}</SheetTitle>
        </SheetHeader>

        <nav aria-label="Navigation principale" className="flex flex-col gap-1 px-6">
          {NAV.map((item) => (
            <SheetClose key={item.href} asChild>
              <Link as={NextLink} href={`${home}${item.href}`} className="py-2.5 text-base">
                {item.label}
              </Link>
            </SheetClose>
          ))}
        </nav>

        <div className="flex flex-col gap-3 px-6 pt-4">
          <SheetClose asChild>
            <Button asChild>
              <NextLink href={`${home}#inscription`}>{HEADER.cta}</NextLink>
            </Button>
          </SheetClose>
        </div>
      </SheetContent>
    </Sheet>
  );
};
