import type { Metadata } from "next";
import { listInvitations, listOperators } from "@remi/services/server";
import { Typography } from "@remi/ui/server";
import { InviteForm } from "@/components/operators/invite-form";
import { InvitationList } from "@/components/operators/invitation-list";
import { OperatorList } from "@/components/operators/operator-list";
import { requireOwner } from "@/lib/auth/session";
import { ensureDatabase } from "@/lib/database";
import { mailerReady } from "@/lib/mailer";

export const metadata: Metadata = {
  title: "Équipe",
};

/** Reads the database on every hit — never prerendered. */
export const dynamic = "force-dynamic";

/**
 * Who can reach this console, and how someone new gets in.
 *
 * Owner-only, guarded here as well as in every action on it: this page is the
 * one place in the console where a mistake hands someone access to real patient
 * records rather than changing a record.
 */
const Team = async () => {
  const operator = await requireOwner();
  ensureDatabase();

  const [operators, invitations] = await Promise.all([
    listOperators(),
    listInvitations(),
  ]);
  const pending = invitations.filter(
    (invitation) =>
      invitation.acceptedAt === null &&
      invitation.expiresAt.getTime() > Date.now(),
  );

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-8">
      <div className="flex flex-col gap-1">
        <Typography as="h1" size="2xl" weight="semibold">
          Équipe
        </Typography>
        <Typography size="sm" tone="muted">
          Les comptes qui ont accès à cette console — et donc aux dossiers des
          patients.
        </Typography>
      </div>

      <InviteForm mailerReady={mailerReady()} />

      <OperatorList
        operators={operators.map((entry) => ({
          id: entry.id,
          name: entry.name,
          email: entry.email,
          role: entry.role,
          createdAt: entry.createdAt,
          isSelf: entry.id === operator.id,
        }))}
      />

      {pending.length > 0 ? (
        <InvitationList
          invitations={pending.map((invitation) => ({
            id: invitation.id,
            email: invitation.email,
            role: invitation.role,
            expiresAt: invitation.expiresAt,
            invitedByEmail: invitation.invitedByEmail,
          }))}
        />
      ) : null}
    </div>
  );
};

export default Team;
