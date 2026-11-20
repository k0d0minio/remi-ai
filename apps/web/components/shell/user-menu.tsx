"use client";

import {
  BookOpen,
  ChevronDown,
  LogOut,
  Repeat,
  User,
} from "lucide-react";
import { appHref, type Locale } from "@remi/services/shared";
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
import type { Content } from "@/lib/content/types";
import { switchRole } from "@/lib/actions/session";
import type { Role } from "@/lib/auth/session";

type Props = {
  name: string;
  initials: string;
  role: Role;
  locale: Locale;
  content: Content;
};

/** No language choice: the app is French only (Jamie, 2026-11-20). */
export const UserMenu = ({ name, initials, role, locale, content }: Props) => {
  const otherRole: Role = role === "practitioner" ? "patient" : "practitioner";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        aria-label={content.userMenu.label}
        className="focus-visible:ring-ring hover:bg-accent flex items-center gap-2 rounded-md p-1 pr-2 transition-colors duration-[--duration-fast] focus-visible:outline-none focus-visible:ring-[3px]"
      >
        <Avatar size="sm">
          <AvatarFallback>{initials}</AvatarFallback>
        </Avatar>
        <span className="hidden text-sm sm:inline">{name}</span>
        <ChevronDown aria-hidden="true" className="size-4 opacity-60" />
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end">
        <DropdownMenuLabel>{content.userMenu.account}</DropdownMenuLabel>
        <DropdownMenuItem disabled>
          <User aria-hidden="true" />
          {content.roles[role]}
        </DropdownMenuItem>


        <DropdownMenuSeparator />
        <DropdownMenuLabel>{content.userMenu.help}</DropdownMenuLabel>
        {/*
         * The docs are a separate deployment, so this is a plain anchor inside
         * the item rather than a router link — and it opens in a new tab,
         * because leaving the app to read an answer and losing the screen you
         * were asking about is the whole reason people stop opening the help.
         */}
        <DropdownMenuItem asChild>
          <a href={appHref("docs")} target="_blank" rel="noreferrer">
            <BookOpen aria-hidden="true" />
            {content.userMenu.documentation}
          </a>
        </DropdownMenuItem>

        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={() => switchRole(otherRole, locale)}>
          <Repeat aria-hidden="true" />
          {content.roles.switchTo}
        </DropdownMenuItem>
        <DropdownMenuItem disabled destructive>
          <LogOut aria-hidden="true" />
          {content.userMenu.signOut}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
