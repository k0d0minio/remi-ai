import { redirect } from "next/navigation";
import type { ReactNode } from "react";
import { AdminHeader } from "@/components/shell/admin-header";
import { AdminSidebar } from "@/components/shell/admin-sidebar";
import { currentOperator, operatorLabel } from "@/lib/auth/session";

/**
 * The operator boundary, and the authoritative half of the gate. Every route in
 * the console lives inside this group, so the session is resolved once here
 * rather than page by page: a route that forgets to check cannot exist, because
 * there is nowhere for it to live outside the group.
 *
 * `middleware.ts` has already turned away anyone with no cookie, but it is a
 * cheap filter and nothing more. This is where the token is exchanged for a row
 * in Neon and the role is read off that row — server-side, on every request. A
 * role carried in a cookie or a header would be a role the client can write,
 * which is the exact defect v1 shipped.
 *
 * Reading cookies makes every page below this dynamic. That is the trade this
 * gate is: the console stops being static HTML anyone can fetch.
 */
const AdminLayout = async ({ children }: { children: ReactNode }) => {
  const session = await currentOperator();

  if (!session) {
    redirect("/sign-in");
  }

  return (
    <div className="min-h-dvh lg:pl-60">
      <AdminSidebar />
      <AdminHeader
        name={operatorLabel(session)}
        email={session.actor.email}
        role={session.role}
      />
      <main id="content" className="px-4 py-8 md:px-8">
        {children}
      </main>
    </div>
  );
};

export default AdminLayout;
