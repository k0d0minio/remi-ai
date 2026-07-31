"use client";

import { Menu } from "lucide-react";
import NextLink from "next/link";
import { useState } from "react";
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
import { nav } from "@/lib/content/landing";

/**
 * The one interactive part of the header, so the only part that is a client
 * component. `open` is tracked here rather than left to Radix's uncontrolled
 * mode because each link has to close the panel when it is followed.
 */
export const MobileNav = () => {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu aria-hidden="true" />
          <span className="sr-only">Open menu</span>
        </Button>
      </SheetTrigger>

      <SheetContent side="right" className="w-full sm:max-w-xs">
        <SheetHeader>
          <SheetTitle>Menu</SheetTitle>
        </SheetHeader>

        <nav aria-label="Main" className="flex flex-col gap-1 px-6">
          {nav.map((item) => (
            <SheetClose key={item.href} asChild>
              <Link as={NextLink} href={item.href} className="py-2.5 text-base">
                {item.label}
              </Link>
            </SheetClose>
          ))}
        </nav>

        <Separator className="mx-6 w-auto" />

        <div className="flex flex-col gap-3 px-6">
          <SheetClose asChild>
            <Button asChild variant="outline">
              <NextLink href="/contact">Contact</NextLink>
            </Button>
          </SheetClose>
          <SheetClose asChild>
            <Button asChild>
              <NextLink href="#pricing">Get started</NextLink>
            </Button>
          </SheetClose>
        </div>
      </SheetContent>
    </Sheet>
  );
};
