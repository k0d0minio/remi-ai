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
import { Typography } from "@remi/ui/server";
import { DemoNav } from "@/components/demo-nav";
import { SurfaceSwitcher } from "@/components/surface-switcher";

export const DemoMobileNav = () => {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger
        aria-label="Ouvrir la navigation"
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
        <div className="flex flex-col gap-4 px-3">
          <SurfaceSwitcher />
          <nav aria-label="Principale">
            <DemoNav onNavigate={() => setOpen(false)} />
          </nav>
        </div>
      </SheetContent>
    </Sheet>
  );
};
