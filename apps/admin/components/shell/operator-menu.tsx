"use client";

import { ChevronDown, LogOut, UserCog } from "lucide-react";
import NextLink from "next/link";
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
import { Badge, Typography } from "@remi/ui/server";
import { signOutAction } from "@/lib/auth/actions";

type Props = {
  name: string;
  initials: string;
  email: string;
  /** Already translated by the caller — this island holds no vocabulary. */
  roleLabel: string;
};

/**
 * Who is holding the console, and the way out of it. The role is shown because
 * the question an operator asks of this menu is "what am I allowed to do from
 * here" — and on this console the answer differs between two people.
 */
export const OperatorMenu = ({ name, initials, email, roleLabel }: Props) => (
  <DropdownMenu>
    <DropdownMenuTrigger
      aria-label="Menu du compte"
      className="focus-visible:ring-ring/40 hover:bg-accent flex items-center gap-2 rounded-md p-1 pr-2 transition-colors duration-[--duration-fast] focus-visible:outline-none focus-visible:ring-[3px]"
    >
      <Avatar size="sm">
        <AvatarFallback>{initials}</AvatarFallback>
      </Avatar>
      <span className="hidden text-sm sm:inline">{name}</span>
      <ChevronDown aria-hidden="true" className="size-4 opacity-60" />
    </DropdownMenuTrigger>

    <DropdownMenuContent align="end" className="w-64">
      <DropdownMenuLabel>
        <span className="flex flex-col items-start gap-1">
          <Typography as="span" size="sm" weight="medium">
            {name}
          </Typography>
          <Typography as="span" size="xs" tone="muted" weight="normal">
            {email}
          </Typography>
          <Badge variant="neutral" tone="subtle" size="sm">
            {roleLabel}
          </Badge>
        </span>
      </DropdownMenuLabel>

      <DropdownMenuSeparator />
      <DropdownMenuItem asChild>
        <NextLink href="/account">
          <UserCog aria-hidden="true" />
          Mon compte
        </NextLink>
      </DropdownMenuItem>

      <DropdownMenuSeparator />
      <DropdownMenuItem destructive onSelect={() => void signOutAction()}>
        <LogOut aria-hidden="true" />
        Se déconnecter
      </DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>
);
