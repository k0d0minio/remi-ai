"use client";

import { Mail, Send } from "lucide-react";
import { useActionState } from "react";
import { operatorRoles } from "@remi/services/shared";
import {
  Button,
  CopyButton,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@remi/ui";
import {
  Alert,
  AlertDescription,
  AlertTitle,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Field,
  Input,
  Typography,
} from "@remi/ui/server";
import {
  inviteOperatorAction,
  type InviteFormState,
} from "@/lib/operators/actions";
import {
  roleDescriptions,
  roleLabels,
} from "@/components/operators/vocabulary";

const initial: InviteFormState = { error: null, invited: null };

type Props = {
  /** False when the deployment has no mail credentials — see `lib/mailer.ts`. */
  mailerReady: boolean;
};

/**
 * Inviting someone, and the link that comes back.
 *
 * The link is shown on success whether or not the email went out. That is not
 * belt and braces — an invite that only exists in an inbox is one spam filter
 * away from nobody being able to get in, and the person sending it is sitting
 * in a conversation with the recipient anyway.
 */
export const InviteForm = ({ mailerReady }: Props) => {
  const [state, action, pending] = useActionState(
    inviteOperatorAction,
    initial,
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Inviter quelqu&apos;un</CardTitle>
        <CardDescription>
          La personne invitée choisit elle-même son mot de passe. Le lien est
          valable sept jours et ne sert qu&apos;une fois.
        </CardDescription>
      </CardHeader>

      <CardContent className="flex flex-col gap-4">
        {!mailerReady ? (
          <Alert variant="warning">
            <AlertTitle>
              L&apos;envoi d&apos;emails n&apos;est pas configuré
            </AlertTitle>
            <AlertDescription>
              L&apos;invitation sera bien créée, mais aucun email ne partira :
              transmettez le lien vous-même.
            </AlertDescription>
          </Alert>
        ) : null}

        <form action={action} className="flex flex-col gap-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field id="invite-email" label="Adresse email">
              <Input
                id="invite-email"
                name="email"
                type="email"
                autoComplete="off"
                required
                placeholder="prenom@exemple.be"
              />
            </Field>

            <Field id="invite-name" label="Nom" optional>
              <Input id="invite-name" name="name" autoComplete="off" />
            </Field>
          </div>

          <Field
            id="invite-role"
            label="Accès"
            hint={roleDescriptions.operator}
          >
            <Select name="role" defaultValue="operator">
              <SelectTrigger id="invite-role">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {operatorRoles.map((role) => (
                  <SelectItem key={role} value={role}>
                    {roleLabels[role]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>

          <div className="flex flex-wrap items-center gap-3">
            <Button type="submit" disabled={pending}>
              <Send aria-hidden="true" />
              {pending ? "Envoi…" : "Envoyer l'invitation"}
            </Button>
            {state.error ? (
              <Typography size="sm" className="text-error-text" role="alert">
                {state.error}
              </Typography>
            ) : null}
          </div>
        </form>

        {state.invited ? (
          <Alert variant="success">
            <AlertTitle>
              {state.invited.emailed ? (
                <>
                  <Mail aria-hidden="true" className="inline size-4" />{" "}
                  Invitation envoyée à {state.invited.email}
                </>
              ) : (
                <>Invitation créée pour {state.invited.email}</>
              )}
            </AlertTitle>
            <AlertDescription>
              <span className="flex flex-col gap-2">
                <span>
                  {state.invited.emailed
                    ? "Si l'email n'arrive pas, transmettez ce lien directement :"
                    : "Transmettez ce lien à la personne invitée :"}
                </span>
                <span className="flex flex-wrap items-center gap-2">
                  <code className="bg-muted min-w-0 flex-1 break-all rounded-md px-2 py-1 text-xs">
                    {state.invited.url}
                  </code>
                  <CopyButton
                    value={state.invited.url}
                    label="Copier"
                    copiedLabel="Copié"
                  />
                </span>
              </span>
            </AlertDescription>
          </Alert>
        ) : null}
      </CardContent>
    </Card>
  );
};
