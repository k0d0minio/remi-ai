import { redirect } from "next/navigation";
import type { ReactNode } from "react";
import { localePath, type Locale } from "@remi/services/shared";
import { AppHeader } from "@/components/shell/app-header";
import { AppSidebar } from "@/components/shell/app-sidebar";
import { getSession } from "@/lib/auth/session";
import { getContent } from "@/lib/content";

type Params = { locale: Locale };

/**
 * The auth boundary. Every signed-in route is inside this group, so the session
 * is resolved once here rather than page by page — a route that forgets to check
 * cannot exist, because there is nowhere for it to live outside the group.
 */
const AppLayout = async ({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<Params>;
}) => {
  const { locale } = await params;
  const session = await getSession();

  if (!session) {
    redirect(localePath(locale, "/"));
  }

  const content = getContent(locale);
  const items =
    session.role === "practitioner"
      ? content.practitionerNav
      : content.personNav;

  return (
    <div className="flex min-h-dvh">
      <AppSidebar
        items={items}
        locale={locale}
        role={session.role}
        content={content}
      />

      <div className="flex min-w-0 flex-1 flex-col">
        <AppHeader
          items={items}
          locale={locale}
          role={session.role}
          name={session.name}
          content={content}
        />
        <main id="content" className="flex-1 px-4 py-8 md:px-8">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AppLayout;
