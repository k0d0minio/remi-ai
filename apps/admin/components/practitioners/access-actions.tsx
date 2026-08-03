import { KeyRound, ShieldOff } from "lucide-react";
import { Button } from "@remi/ui";
import {
  Badge,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Typography,
} from "@remi/ui/server";
import type { Practitioner } from "@/lib/fixtures";

type Props = {
  practitioner: Practitioner;
};

/**
 * The two operator actions on an account, drawn but not wired: admin has no
 * backend, so nothing here can act yet and the note under the buttons says so
 * outright. When they are wired they will confirm first and record who did it —
 * the rule in apps/admin/AGENTS.md — which is why they sit on their own card
 * rather than as icons in the header, where a mis-click is one pixel away.
 *
 * An invited practitioner has no account behind the invite, so both controls are
 * genuinely unavailable rather than merely inert.
 */
const states = {
  suspended: { label: "suspended", intent: "error" },
  invited: { label: "no account yet", intent: "info" },
  onboarded: { label: "full access", intent: "success" },
} as const;

export const AccessActions = ({ practitioner }: Props) => {
  const suspended = practitioner.status === "suspended";
  const pending = practitioner.status === "invited";
  const state = states[practitioner.status];

  return (
    <Card variant={suspended ? "error" : "neutral"} elevation="flat">
      <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-x-4 gap-y-2">
        <div className="flex flex-col gap-1.5">
          <CardTitle>Access</CardTitle>
          <CardDescription>What this account can reach today.</CardDescription>
        </div>
        <Badge variant={state.intent} tone="subtle" size="sm">
          {state.label}
        </Badge>
      </CardHeader>

      <CardContent className="flex flex-col gap-4">
        <Typography size="sm" tone="muted">
          {practitioner.accessNote}
        </Typography>

        <div className="flex flex-wrap gap-3">
          <Button
            type="button"
            variant={suspended ? "secondary" : "error"}
            size="sm"
            disabled={pending}
          >
            <ShieldOff aria-hidden="true" />
            {suspended ? "Restore access" : "Suspend access"}
          </Button>

          <Button type="button" variant="outline" size="sm" disabled={pending}>
            <KeyRound aria-hidden="true" />
            Reset access
          </Button>
        </div>

        <Typography size="xs" tone="muted">
          Neither button does anything yet. Both will ask for confirmation and
          record who acted once the service layer is behind them.
        </Typography>
      </CardContent>
    </Card>
  );
};
