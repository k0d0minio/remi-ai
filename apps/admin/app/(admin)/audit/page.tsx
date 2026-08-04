import type { Metadata } from "next";
import { Typography } from "@remi/ui/server";
import { AuditLog } from "@/components/audit/audit-log";
import { auditEntries } from "@/lib/fixtures";

export const metadata: Metadata = {
  title: "Audit",
};

const Audit = () => (
  <div className="flex flex-col gap-6">
    <div className="flex flex-col gap-1">
      <Typography as="h1" size="2xl" weight="semibold">
        Audit
      </Typography>
      <Typography size="sm" tone="muted">
        Every operator action, newest first. The rest of the console shows what
        the state is; this shows how it got there.
      </Typography>
    </div>

    <AuditLog entries={auditEntries} />
  </div>
);

export default Audit;
