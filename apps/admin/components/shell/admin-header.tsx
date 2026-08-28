import { initials } from "@remi/services/shared";
import { ThemeToggle } from "@remi/ui";
import { Typography } from "@remi/ui/server";
import { MobileNav } from "@/components/shell/mobile-nav";
import { OperatorMenu } from "@/components/shell/operator-menu";

type Props = {
  /** From the session the `(admin)` layout resolved — strings, never the record. */
  operatorName: string;
  operatorEmail: string;
  operatorRoleLabel: string;
  canManageOperators: boolean;
};

/** Sticky, so the way out of a long patient page is always one reach away. */
export const AdminHeader = ({
  operatorName,
  operatorEmail,
  operatorRoleLabel,
  canManageOperators,
}: Props) => (
  <header className="border-border bg-background/80 sticky top-0 z-30 flex h-14 items-center gap-3 border-b px-4 backdrop-blur-md md:px-8">
    <MobileNav canManageOperators={canManageOperators} />

    <Typography as="span" size="sm" tone="muted" className="hidden sm:inline">
      Console REMI
    </Typography>

    <div className="ml-auto flex items-center gap-3">
      {/*
       * Admin has no locale dictionaries — it ships in French only — so the
       * labels are written here rather than looked up.
       */}
      <ThemeToggle
        label="Apparence"
        optionLabels={{
          system: "Système",
          light: "Clair",
          dark: "Sombre",
        }}
      />
      <OperatorMenu
        name={operatorName}
        initials={initials(operatorName)}
        email={operatorEmail}
        roleLabel={operatorRoleLabel}
      />
    </div>
  </header>
);
