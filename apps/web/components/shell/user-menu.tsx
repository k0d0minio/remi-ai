"use client";

import { Check, ChevronDown, LogOut, Repeat, User } from "lucide-react";
import { usePathname } from "next/navigation";
import { locales, type Locale } from "@remi/services/shared";
import {
  Avatar,
  AvatarFallback,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  ThemeToggle,
} from "@remi/ui";
import type { Content } from "@/lib/content/types";
import { setLocale, switchRole } from "@/lib/actions/session";
import type { Role } from "@/lib/auth/session";

type Props = {
  name: string;
  initials: string;
  role: Role;
  locale: Locale;
  content: Content;
};

const localeLabels: Record<Locale, string> = {
  en: "English",
  fr: "Français",
};

/**
 * The locale switch lives in here rather than as its own control: inside the
 * app, language is an account preference, not a piece of page navigation the way
 * it is on the public site. Theme joins it for the same reason.
 */
export const UserMenu = ({ name, initials, role, locale, content }: Props) => {
  const pathname = usePathname();
  const unprefixed = pathname.replace(`/${locale}`, "") || "/";
  const otherRole: Role = role === "practitioner" ? "person" : "practitioner";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        aria-label={content.userMenu.label}
        className="focus-visible:ring-ring/40 hover:bg-accent flex items-center gap-2 rounded-md p-1 pr-2 transition-colors duration-[--duration-fast] focus-visible:outline-none focus-visible:ring-[3px]"
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
        <DropdownMenuLabel>{content.userMenu.language}</DropdownMenuLabel>
        {locales.map((option) => (
          <DropdownMenuItem
            key={option}
            onSelect={() => setLocale(option, unprefixed)}
          >
            {option === locale ? (
              <Check aria-hidden="true" />
            ) : (
              <span className="size-4" />
            )}
            {localeLabels[option]}
          </DropdownMenuItem>
        ))}

        <DropdownMenuSeparator />
        <DropdownMenuLabel>{content.userMenu.appearance}</DropdownMenuLabel>
        {/*
         * A row inside the menu rather than three items: theme is one setting
         * with three states, and the segmented control shows which one is live
         * without the menu having to be reopened to check.
         */}
        <div className="px-2 py-1">
          <ThemeToggle
            label={content.userMenu.appearance}
            optionLabels={content.userMenu.themes}
          />
        </div>

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
