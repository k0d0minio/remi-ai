import { initials } from "@remi/services/shared";
import { ThemeToggle } from "@remi/ui";
import { Badge, Typography } from "@remi/ui/server";
import { MobileNav } from "@/components/shell/mobile-nav";
import { OperatorMenu } from "@/components/shell/operator-menu";
import { deployment } from "@/lib/fixtures";

type Props = {
  /** From the session the `(admin)` layout resolved — strings, never the record. */
  operatorName: string;
  operatorEmail: string;
};

/**
 * Sticky, so the environment an operator is acting against stays on screen. A
 * console where "which environment is this" scrolls away is how a staging
 * habit gets performed on production data.
 */
export const AdminHeader = ({ operatorName, operatorEmail }: Props) => (
  <header className="border-border bg-background/80 sticky top-0 z-30 flex h-14 items-center gap-3 border-b px-4 backdrop-blur-md md:px-8">
    <MobileNav />

    <Typography as="span" size="sm" tone="muted" className="hidden sm:inline">
      Internal operations
    </Typography>

    <div className="ml-auto flex items-center gap-3">
      {/*
       * Admin has no locale dictionaries — it ships in English only — so the
       * labels are written here rather than looked up.
       */}
      <ThemeToggle
        label="Appearance"
        optionLabels={{
          system: "Match system",
          light: "Light",
          dark: "Dark",
        }}
      />
      <Badge variant="neutral" tone="subtle" size="sm">
        {deployment.environment}
      </Badge>
      <OperatorMenu
        name={operatorName}
        initials={initials(operatorName)}
        email={operatorEmail}
        role="Operator"
      />
    </div>
  </header>
);
