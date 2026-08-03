import NextLink from "next/link";
import { localePath, type Locale } from "@remi/services/shared";
import { Badge, Wordmark } from "@remi/ui/server";
import { NavLinks } from "@/components/shell/nav-links";
import type { Content, NavItem } from "@/lib/content/types";
import type { Role } from "@/lib/auth/session";

type Props = {
  items: NavItem[];
  locale: Locale;
  role: Role;
  content: Content;
};

/**
 * A server component. Only the link list needs the client, and only because it
 * reads the current route — the shell around it costs nothing.
 */
export const AppSidebar = ({ items, locale, role, content }: Props) => (
  <aside className="border-border bg-card hidden w-60 shrink-0 flex-col gap-6 border-r p-4 md:flex">
    <div className="flex items-center gap-2 px-2">
      <NextLink
        href={localePath(locale, "/")}
        className="focus-visible:ring-ring/40 rounded-sm focus-visible:outline-none focus-visible:ring-[3px]"
      >
<Wordmark />
      </NextLink>
      <Badge variant="info" tone="subtle" size="sm">
        {content.roles[role]}
      </Badge>
    </div>

    <nav aria-label={content.shell.navLabel}>
      <NavLinks items={items} locale={locale} />
    </nav>
  </aside>
);
