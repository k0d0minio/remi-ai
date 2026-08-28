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
 * second click: the profile, its recommendations and its patient link all go,
 * and there is no undo and — until REMI-014 lands the audit trail — no trace.
 */
export const DeletePatient = ({ patientId, pseudonym }: Props) => (
  <Dialog>
    <DialogTrigger asChild>
      <Button type="button" variant="error" size="sm">
        <Trash2 aria-hidden="true" />
        Delete this patient
      </Button>
    </DialogTrigger>

    <DialogContent>
      <DialogHeader>
        <DialogTitle>Delete {pseudonym}?</DialogTitle>
        <DialogDescription>
          This removes the profile, every encoded recommendation and the patient
          link. Anyone holding the link loses access. There is no undo.
        </DialogDescription>
      </DialogHeader>

      <DialogFooter>
        <DialogClose asChild>
          <Button type="button" variant="outline">
            Cancel
          </Button>
        </DialogClose>
        <form action={deletePatientAction}>
          <input type="hidden" name="id" value={patientId} />
          <Button type="submit" variant="error">
            Delete patient
          </Button>
        </form>
      </DialogFooter>
    </DialogContent>
  </Dialog>
);
