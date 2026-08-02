"use client";

import { Menu } from "lucide-react";
import { useState } from "react";
import type { Locale } from "@remi/services/shared";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@remi/ui";
import { Typography } from "@remi/ui/server";
import { NavLinks } from "@/components/shell/nav-links";
import type { Content, NavItem } from "@/lib/content/types";

type Props = {
  items: NavItem[];
  locale: Locale;
  content: Content;
};

export const MobileNav = ({ items, locale, content }: Props) => {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger
        aria-label={content.shell.openNav}
        className="focus-visible:ring-ring/40 hover:bg-accent rounded-md p-2 transition-colors duration-[--duration-fast] focus-visible:outline-none focus-visible:ring-[3px] md:hidden"
      >
        <Menu aria-hidden="true" className="size-5" />
      </SheetTrigger>

      <SheetContent side="left" className="w-72">
        <SheetHeader>
          <SheetTitle>
            <Typography as="span" variant="display" size="xl">
              REMI
            </Typography>
          </SheetTitle>
        </SheetHeader>
        <nav aria-label={content.shell.navLabel} className="px-3">
          <NavLinks
            items={items}
            locale={locale}
            onNavigate={() => setOpen(false)}
          />
        </nav>
      </SheetContent>
    </Sheet>
  );
};
