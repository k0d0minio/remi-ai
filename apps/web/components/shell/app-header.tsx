import { initials, type Locale } from "@remi/services/shared";
import { MobileNav } from "@/components/shell/mobile-nav";
import { UserMenu } from "@/components/shell/user-menu";
import type { Content, NavItem } from "@/lib/content/types";
import type { Role } from "@/lib/auth/session";

type Props = {
  items: NavItem[];
  locale: Locale;
  role: Role;
  name: string;
  content: Content;
};

export const AppHeader = ({ items, locale, role, name, content }: Props) => (
  <header className="border-border bg-background/80 sticky top-0 z-30 flex h-14 items-center justify-between gap-4 border-b px-4 backdrop-blur-md">
    <MobileNav items={items} locale={locale} content={content} />

    <div className="ml-auto">
      <UserMenu
        name={name}
        initials={initials(name)}
        role={role}
        locale={locale}
        content={content}
      />
    </div>
  </header>
);
