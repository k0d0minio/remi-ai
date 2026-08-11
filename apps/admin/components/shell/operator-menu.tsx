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
import { signOut } from "@/lib/actions/auth";

type Props = {
  name: string;
  initials: string;
  email: string;
  role: string;
};

/**
 * Who is holding the console. It shows the operator's grant rather than account
 * settings, because the question an operator asks of this menu is "what am I
 * allowed to do from here".
 *
 * Sign out is the one live item. Everything the menu says about the operator is
 * a prop, resolved from the session in the group's layout — this component
 * looks nothing up, which is why it can stay a client island around a server
 * action without a session ever crossing into the browser.
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
      {/*
       * A real form around a real submit button: the action revokes the session
       * row in Postgres before clearing the cookie, so signing out ends the
       * session rather than only this browser's memory of it.
       */}
      <form action={signOut}>
        <DropdownMenuItem asChild destructive>
          <button type="submit" className="w-full cursor-pointer">
            <LogOut aria-hidden="true" />
            Sign out
          </button>
        </DropdownMenuItem>
      </form>
    </DropdownMenuContent>
  </DropdownMenu>
);
