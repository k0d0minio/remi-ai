"use client";

import { Trash2 } from "lucide-react";
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
import { deletePatientAction } from "@/lib/patients/actions";

type Props = {
  patientId: string;
  pseudonym: string;
};

/**
 * The one truly destructive act on this page, so it takes a dialog, not a
 * second click: the profile, its recommendations, its notes and its patient
 * link all go, and there is no undo. The audit trail records who did it and
 * which profile it was, which is the only thing that survives.
 */
export const DeletePatient = ({ patientId, pseudonym }: Props) => (
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
          Le profil, toutes ses recommandations, ses notes de consultation et
          son lien patient sont supprimés. Toute personne détenant le lien perd
          l&apos;accès. Il n&apos;y a pas de retour en arrière.
        </DialogDescription>
      </DialogHeader>

      <DialogFooter>
        <DialogClose asChild>
          <Button type="button" variant="outline">
            Annuler
          </Button>
        </DialogClose>
        <form action={deletePatientAction}>
          <input type="hidden" name="id" value={patientId} />
          <Button type="submit" variant="error">
            Supprimer le profil
          </Button>
        </form>
      </DialogFooter>
    </DialogContent>
  </Dialog>
);
