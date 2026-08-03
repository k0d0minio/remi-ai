"use client";

import { ChevronDown, LogOut, ScrollText, ShieldCheck } from "lucide-react";
import {
  Avatar,
  AvatarFallback,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@remi/ui";
import { Typography } from "@remi/ui/server";

type Props = {
  name: string;
  initials: string;
  email: string;
  role: string;
};

/**
 * Who is holding the console. It shows the operator's grant rather than account
 * settings, because the question an operator asks of this menu is "what am I
 * allowed to do from here" — every item is inert until there is a session
 * behind it.
 */
export const OperatorMenu = ({ name, initials, email, role }: Props) => (
  <DropdownMenu>
    <DropdownMenuTrigger
      aria-label="Operator menu"
      className="focus-visible:ring-ring/40 hover:bg-accent flex items-center gap-2 rounded-md p-1 pr-2 transition-colors duration-[--duration-fast] focus-visible:outline-none focus-visible:ring-[3px]"
    >
      <Avatar size="sm">
        <AvatarFallback>{initials}</AvatarFallback>
      </Avatar>
      <span className="hidden text-sm sm:inline">{name}</span>
      <ChevronDown aria-hidden="true" className="size-4 opacity-60" />
    </DropdownMenuTrigger>

    <DropdownMenuContent align="end" className="w-60">
      <DropdownMenuLabel>
        <span className="flex flex-col gap-0.5">
          <Typography as="span" size="sm" weight="medium">
            {name}
          </Typography>
          <Typography as="span" size="xs" tone="muted" weight="normal">
            {email}
          </Typography>
        </span>
      </DropdownMenuLabel>

      <DropdownMenuSeparator />
      <DropdownMenuItem disabled>
        <ShieldCheck aria-hidden="true" />
        {role}
      </DropdownMenuItem>
      <DropdownMenuItem disabled>
        <ScrollText aria-hidden="true" />
        My audit trail
      </DropdownMenuItem>

      <DropdownMenuSeparator />
      <DropdownMenuItem disabled destructive>
        <LogOut aria-hidden="true" />
        Sign out
      </DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>
);
