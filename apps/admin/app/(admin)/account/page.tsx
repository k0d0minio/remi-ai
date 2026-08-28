import type { Metadata } from "next";
import { formatDate } from "@remi/services/shared";
import {
  Badge,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Typography,
} from "@remi/ui/server";
import { NameForm, PasswordForm } from "@/components/operators/account-forms";
import {
  roleDescriptions,
  roleIntents,
  roleLabels,
} from "@/components/operators/vocabulary";
import { requireOperator } from "@/lib/auth/session";

export const metadata: Metadata = {
  title: "Mon compte",
};

/** Reads the database on every hit — never prerendered. */
export const dynamic = "force-dynamic";

/**
 * Your own account. Deliberately the only page in the console where an
 * operator changes their own credentials — an owner can grant and revoke
 * access from `/team`, but nobody sets anybody else's password.
 */
const Account = async () => {
  const operator = await requireOperator();

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-6">
      <div className="flex flex-col gap-2">
        <Typography as="h1" size="2xl" weight="semibold">
          Mon compte
        </Typography>
        <div className="flex flex-wrap items-center gap-2">
          <Typography size="sm" tone="muted">
            {operator.email} · compte créé le {formatDate(operator.createdAt)}
          </Typography>
          <Badge variant={roleIntents[operator.role]} tone="subtle" size="sm">
            {roleLabels[operator.role]}
          </Badge>
        </div>
        <Typography size="sm" tone="muted">
          {roleDescriptions[operator.role]}
        </Typography>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Identité</CardTitle>
          <CardDescription>
            L&apos;adresse email ne se change pas ici : elle identifie le
            compte. Pour en changer, il faut une nouvelle invitation.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <NameForm name={operator.name} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Mot de passe</CardTitle>
          <CardDescription>
            Le mot de passe actuel est demandé même quand la session est ouverte
            : un écran laissé sans surveillance ne doit pas suffire à reprendre
            le compte.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <PasswordForm />
        </CardContent>
      </Card>
    </div>
  );
};

export default Account;
