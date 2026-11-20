"use client";

import { Power } from "lucide-react";
import { useActionState } from "react";
import {
  Button,
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@remi/ui";
import { Typography } from "@remi/ui/server";
import {
  activateCareAction,
  type ActivateCareState,
} from "@/lib/patients/care-activation";

type Props = {
  patientId: string;
  /** « Version 2, validée le 18 novembre 2026 »: what the activation applies. */
  versionLine: string;
  /** How many elements stay not applied. The dialog says it again. */
  unrecognisedCount: number;
  /** One blocker or more: the button does nothing. */
  blocked: boolean;
};

const initial: ActivateCareState = { error: null };

const unrecognisedLine = (count: number) =>
  count === 1
    ? "1 élément non reconnu reste non appliqué."
    : `${count} éléments non reconnus restent non appliqués.`;

/**
 * « Activer l'accompagnement » behind a confirmation (story 19): the
 * practitioner alone starts the activation, after the recap. The server
 * action checks the blockers again. There is no undo, and the dialog says so.
 */
export const ActivateCareButton = ({
  patientId,
  versionLine,
  unrecognisedCount,
  blocked,
}: Props) => {
  const [state, action, pending] = useActionState(activateCareAction, initial);
  if (blocked) {
    return (
      <Button type="button" disabled className="w-full sm:w-fit">
        <Power aria-hidden="true" />
        Activer l&apos;accompagnement
      </Button>
    );
  }
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button type="button" className="w-full sm:w-fit">
          <Power aria-hidden="true" />
          Activer l&apos;accompagnement
        </Button>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Activer l&apos;accompagnement ?</DialogTitle>
          <DialogDescription>
            {`${versionLine} s'applique. L'espace de la personne s'ouvre et le dossier passe à « Accompagnement actif ». `}
            {unrecognisedCount > 0
              ? `${unrecognisedLine(unrecognisedCount)} `
              : null}
            Il n&apos;y a pas de retour en arrière.
          </DialogDescription>
        </DialogHeader>

        {state.error ? (
          <Typography size="sm" className="text-error-text" role="alert">
            {state.error}
          </Typography>
        ) : null}

        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="outline">
              Annuler
            </Button>
          </DialogClose>
          <form action={action}>
            <input type="hidden" name="id" value={patientId} />
            <Button type="submit" disabled={pending}>
              {pending ? "Activation…" : "Confirmer l'activation"}
            </Button>
          </form>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
