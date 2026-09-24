"use client";

import { Trash2 } from "lucide-react";
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
  deletePatientAction,
  type DeletePatientState,
} from "@/lib/patients/actions";

type Props = {
  patientId: string;
  pseudonym: string;
};

const initial: DeletePatientState = { error: null };

/**
 * The one truly destructive act on this page, so it takes a dialog, not a
 * second click: the profile, its recommendations, its pantry essentials, its
 * notes, its anamnesis, its documents and their files, and its patient link
 * all go, and there is no undo. The audit trail records who did it and which
 * profile it was, which is the only thing that survives. When the file store
 * refuses, nothing is deleted and the dialog says why.
 */
export const DeletePatient = ({ patientId, pseudonym }: Props) => {
  const [state, action, pending] = useActionState(deletePatientAction, initial);
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button type="button" variant="error" size="sm">
          <Trash2 aria-hidden="true" />
          Supprimer ce profil
        </Button>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Supprimer {pseudonym} ?</DialogTitle>
          <DialogDescription>
            Le profil, toutes ses recommandations, ses essentiels, ses notes de
            consultation, son anamnèse, ses documents et leurs fichiers, et son
            lien patient sont supprimés. Toute personne détenant le lien perd
            l&apos;accès. Il n&apos;y a pas de retour en arrière.
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
            <Button type="submit" variant="error" disabled={pending}>
              {pending ? "Suppression…" : "Supprimer le profil"}
            </Button>
          </form>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
