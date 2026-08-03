"use client";

import { Menu } from "lucide-react";
import { useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@remi/ui";
import { Badge, Wordmark } from "@remi/ui/server";
import { NavLinks } from "@/components/shell/nav-links";

/**
 * The sidebar is fixed and hidden below `lg`, so the same links need a second
 * home on a narrow screen. The console is desktop work, but an operator reading
 * an alert on a phone should still be able to reach the section it names.
 */
export const MobileNav = () => {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger
        aria-label="Open the console navigation"
        className="focus-visible:ring-ring/40 hover:bg-accent rounded-md p-2 transition-colors duration-[--duration-fast] focus-visible:outline-none focus-visible:ring-[3px] lg:hidden"
      >
        <Menu aria-hidden="true" className="size-5" />
      </SheetTrigger>

      <SheetContent side="left" className="w-72">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Wordmark />
            <Badge variant="warning">admin</Badge>
          </SheetTitle>
        </SheetHeader>
        <nav aria-label="Console sections" className="px-3">
          <NavLinks onNavigate={() => setOpen(false)} />
        </nav>
      </SheetContent>
    </Sheet>
  );
};
