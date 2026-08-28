"use client";

import { Mail, RefreshCw } from "lucide-react";
import { useActionState, useState } from "react";
import { formatDateTime } from "@remi/services/shared";
import { Button, CopyButton } from "@remi/ui";
import { Typography } from "@remi/ui/server";
import {
  emailShareLinkAction,
  regenerateShareTokenAction,
  type ShareFormState,
} from "@/lib/patients/actions";

const initial: ShareFormState = { error: null, sent: false };

type Props = {
  patientId: string;
  /** Built server-side by `appHref`, so only the links catalogue knows the origin. */
  url: string;
  /** Null until the patient has an address on file — the email button needs one. */
  email: string | null;
  lastOpenedAt: Date | null;
};

/**
 * The shareable patient link — what Morgane sends to patients and to the
 * consultants testing the interface. The URL is the whole credential, so
 * regenerating is the recovery move when one leaks, and it takes a second
 * click: the old link dies the moment the new one exists.
 */
export const ShareLinkCard = ({
  patientId,
  url,
  email,
  lastOpenedAt,
}: Props) => {
  const [confirming, setConfirming] = useState(false);
  const [state, sendEmail, sending] = useActionState(
    emailShareLinkAction,
    initial,
  );

  return (
    <div className="flex flex-col gap-3">
      <Typography
        size="sm"
        className="border-border bg-muted select-all break-all rounded-md border px-3 py-2 font-mono"
      >
        {url}
      </Typography>

      <div className="flex flex-wrap items-center gap-2">
        <CopyButton value={url} label="Copier le lien" copiedLabel="Copié" />

        <form action={sendEmail}>
          <input type="hidden" name="id" value={patientId} />
          <Button
            type="submit"
            size="sm"
            variant="outline"
            disabled={sending || !email}
          >
            <Mail aria-hidden="true" />
            {sending ? "Envoi…" : "Envoyer par email"}
          </Button>
        </form>

        {confirming ? (
          <>
            <form
              action={async (formData: FormData) => {
                await regenerateShareTokenAction(formData);
                setConfirming(false);
              }}
            >
              <input type="hidden" name="id" value={patientId} />
              <Button type="submit" size="sm" variant="error">
                <RefreshCw aria-hidden="true" />
                Remplacer le lien
              </Button>
            </form>
            <Button
              type="button"
              size="sm"
              variant="ghost"
              onClick={() => setConfirming(false)}
            >
              Annuler
            </Button>
          </>
        ) : (
          <Button
            type="button"
            size="sm"
            variant="ghost"
            onClick={() => setConfirming(true)}
          >
            <RefreshCw aria-hidden="true" />
            Régénérer
          </Button>
        )}
      </div>

      {state.error ? (
        <Typography size="sm" className="text-error-text" role="alert">
          {state.error}
        </Typography>
      ) : null}
      {state.sent && !sending ? (
        <Typography size="sm" tone="muted" role="status">
          Lien envoyé à {email}.
        </Typography>
      ) : null}

      {!email ? (
        <Typography size="xs" tone="muted">
          Ajoutez une adresse email au profil pour pouvoir envoyer le lien
          directement.
        </Typography>
      ) : null}

      <Typography size="xs" tone="muted">
        {lastOpenedAt
          ? `Dernière ouverture le ${formatDateTime(lastOpenedAt)}.`
          : "Le lien n'a pas encore été ouvert."}
      </Typography>

      {confirming ? (
        <Typography size="xs" tone="muted">
          Régénérer tue le lien actuel : toute personne qui le détient perd
          l&apos;accès et aura besoin du nouveau.
        </Typography>
      ) : (
        <Typography size="xs" tone="muted">
          Toute personne détenant ce lien voit le profil et les recommandations.
          Ne le transmettez que par un canal privé.
        </Typography>
      )}
    </div>
  );
};
