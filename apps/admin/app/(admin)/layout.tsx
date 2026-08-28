import type { ReactNode } from "react";
import { canManageOperators } from "@remi/services/shared";
import { AdminHeader } from "@/components/shell/admin-header";
import { AdminSidebar } from "@/components/shell/admin-sidebar";
import { roleLabels } from "@/components/operators/vocabulary";
import { requireOperator } from "@/lib/auth/session";

/**
 * The operator boundary. Every route in the console lives inside this group, so
 * the shell — and the session check beside it — is resolved once here rather
 * than page by page: a route that forgets to check cannot exist, because there
 * is nowhere for it to live outside the group. Server actions still guard
 * themselves — the layout guards what renders, not what can be called.
 */
const AdminLayout = async ({ children }: { children: ReactNode }) => {
  const operator = await requireOperator();
  const canManage = canManageOperators(operator.role);

  return (
    <div className="min-h-dvh lg:pl-60">
      <AdminSidebar canManageOperators={canManage} />
      <AdminHeader
        operatorName={operator.name}
        operatorEmail={operator.email}
        operatorRoleLabel={roleLabels[operator.role]}
        canManageOperators={canManage}
      />
      <main id="content" className="px-4 py-8 md:px-8">
        {children}
      </main>
    </div>
  );
};

export default AdminLayout;
