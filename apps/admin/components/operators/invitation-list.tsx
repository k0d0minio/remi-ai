import { X } from "lucide-react";
import { formatDate, type OperatorRoleName } from "@remi/services/shared";
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
import { revokeInvitationAction } from "@/lib/operators/actions";
import { roleIntents, roleLabels } from "@/components/operators/vocabulary";

export type InvitationRow = {
  id: string;
  email: string;
  role: OperatorRoleName;
  expiresAt: Date;
  invitedByEmail: string;
};

type Props = {
  invitations: readonly InvitationRow[];
};

/**
 * Invitations sent and not yet used. A server component — revoking is a plain
 * form post, and there is nothing here a hook would improve.
 *
 * Only pending invitations reach this list; the caller filters out the used and
 * expired ones. An expired invitation is not an account and not a pending
 * offer, so listing it would just be a row nobody can act on.
 */
export const InvitationList = ({ invitations }: Props) => (
  <Card>
    <CardHeader>
      <CardTitle>Invitations en attente</CardTitle>
      <CardDescription>
        Tant qu&apos;une invitation n&apos;est pas utilisée, elle ne donne aucun
        accès. La retirer désactive le lien immédiatement.
      </CardDescription>
    </CardHeader>

    <CardContent>
      <ul className="flex flex-col gap-2">
        {invitations.map((invitation) => (
          <li
            key={invitation.id}
            className="border-border flex flex-wrap items-center gap-x-4 gap-y-2 rounded-lg border px-4 py-3"
          >
            <div className="flex min-w-0 flex-col gap-0.5">
              <Typography as="span" size="sm" weight="medium">
                {invitation.email}
              </Typography>
              <Typography as="span" size="xs" tone="muted">
                envoyée par {invitation.invitedByEmail} · expire le{" "}
                {formatDate(invitation.expiresAt)}
              </Typography>
            </div>

            <div className="ml-auto flex items-center gap-2">
              <Badge
                variant={roleIntents[invitation.role]}
                tone="subtle"
                size="sm"
              >
                {roleLabels[invitation.role]}
              </Badge>
              <form action={revokeInvitationAction}>
                <input type="hidden" name="id" value={invitation.id} />
                <input type="hidden" name="email" value={invitation.email} />
                <Button
                  type="submit"
                  variant="ghost"
                  size="sm"
                  aria-label={`Retirer l'invitation de ${invitation.email}`}
                >
                  <X aria-hidden="true" />
                </Button>
              </form>
            </div>
          </li>
        ))}
      </ul>
    </CardContent>
  </Card>
);
