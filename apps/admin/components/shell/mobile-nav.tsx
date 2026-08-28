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

type Props = {
  canManageOperators: boolean;
};

/**
 * The sidebar is fixed and hidden below `lg`, so the same links need a second
 * home on a narrow screen. Morgane works from her phone between consultations,
 * so this is not the afterthought it usually is in a console.
 */
export const MobileNav = ({ canManageOperators }: Props) => {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger
        aria-label="Ouvrir la navigation"
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
        <nav aria-label="Sections de la console" className="px-3">
          <NavLinks
            canManageOperators={canManageOperators}
            onNavigate={() => setOpen(false)}
          />
        </nav>
      </SheetContent>
    </Sheet>
  );
};
