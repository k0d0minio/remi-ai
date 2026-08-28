import NextLink from "next/link";
import { Badge, Separator, Typography, Wordmark } from "@remi/ui/server";
import { NavLinks } from "@/components/shell/nav-links";

type Props = {
  /** Owners see the accounts section; operators have no route to hide behind. */
  canManageOperators: boolean;
};

/**
 * A server component. Only the link list needs the client, and only because it
 * reads the current route — the shell around it costs nothing.
 *
 * Fixed rather than in flow: an operator scrolling a long table should never
 * lose the way back out of it. The main column pays for it with `lg:pl-60`.
 */
export const AdminSidebar = ({ canManageOperators }: Props) => (
  <aside className="border-border bg-card fixed inset-y-0 left-0 z-40 hidden w-60 flex-col gap-6 overflow-y-auto border-r p-4 lg:flex">
    <div className="flex items-center gap-2 px-2">
      <NextLink
        href="/"
        className="focus-visible:ring-ring/40 rounded-sm focus-visible:outline-none focus-visible:ring-[3px]"
      >
        <Wordmark />
      </NextLink>
      <Badge variant="warning">admin</Badge>
    </div>

    <nav aria-label="Sections de la console">
      <NavLinks canManageOperators={canManageOperators} />
    </nav>

    <div className="mt-auto flex flex-col gap-2 px-2">
      <Separator tone="subtle" />
      <Typography as="p" size="xs" tone="muted">
        Console interne. Les données de cette console sont celles de vraies
        patientes et de vrais patients.
      </Typography>
    </div>
  </aside>
);
