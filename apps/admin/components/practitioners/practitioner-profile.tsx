import {
  Badge,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Typography,
} from "@remi/ui/server";
import { cn } from "@remi/ui/utils";
import {
  practitionerStatusIntents,
  practitionerStatusLabels,
} from "@/components/practitioners/status";
import type { Practitioner } from "@/lib/fixtures";

type Props = {
  practitioner: Practitioner;
};

/**
 * Who the account belongs to, in the order a support call needs it: the address
 * to reply to first, then the practice, then the dates that settle "since when".
 */
export const PractitionerProfile = ({ practitioner }: Props) => {
  const rows = [
    { label: "Email", value: practitioner.email },
    { label: "Practice", value: practitioner.practice },
    { label: "City", value: practitioner.city },
    { label: "Specialty", value: practitioner.specialty },
    { label: "Invited", value: practitioner.invitedOn },
    { label: "Joined", value: practitioner.joinedDate ?? "not yet accepted" },
    { label: "Last sign-in", value: practitioner.activity.lastSignIn },
  ];

  return (
    <Card elevation="flat">
      <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-x-4 gap-y-2">
        <CardTitle>Profile</CardTitle>
        <Badge
          variant={practitionerStatusIntents[practitioner.status]}
          tone="subtle"
          size="sm"
        >
          {practitionerStatusLabels[practitioner.status]}
        </Badge>
      </CardHeader>

      <CardContent>
        <dl className="flex flex-col">
          {rows.map((row, index) => (
            <div
              key={row.label}
              className={cn(
                "flex flex-wrap items-baseline justify-between gap-x-4 gap-y-0.5 py-2.5",
                index > 0 && "border-border border-t",
              )}
            >
              <Typography as="dt" size="sm" tone="muted">
                {row.label}
              </Typography>
              <Typography as="dd" size="sm" className="text-right">
                {row.value}
              </Typography>
            </div>
          ))}
        </dl>
      </CardContent>
    </Card>
  );
};
