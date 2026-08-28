"use client";

import { Trash2 } from "lucide-react";
import { useActionState } from "react";
import {
  formatDate,
  operatorRoles,
  type OperatorRoleName,
} from "@remi/services/shared";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@remi/ui";
import {
  Badge,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Typography,
} from "@remi/ui/server";
import {
  removeOperatorAction,
  setOperatorRoleAction,
  type OperatorActionState,
} from "@/lib/operators/actions";
import {
  roleDescriptions,
  roleIntents,
  roleLabels,
} from "@/components/operators/vocabulary";

const initial: OperatorActionState = { error: null };

export type OperatorRow = {
  id: string;
  name: string;
  email: string;
  role: OperatorRoleName;
  createdAt: Date;
  /** The signed-in operator's own row — it loses the destructive controls. */
  isSelf: boolean;
};

type Props = {
  operators: readonly OperatorRow[];
};

/**
 * The accounts, and the two things an owner does to one: change what it can
 * reach, or remove it.
 *
 * Your own row keeps neither control. Demoting yourself out of this page while
 * standing on it, or deleting the account you are signed in as, are both
 * recoverable only from the database — and the service refuses the last-owner
 * cases anyway, so hiding them here just stops the console offering an action
 * it will then refuse.
 */
export const OperatorList = ({ operators }: Props) => (
  <Card>
    <CardHeader>
      <CardTitle>Comptes</CardTitle>
      <CardDescription>
        {roleLabels.owner} : {roleDescriptions.owner} — {roleLabels.operator} :{" "}
        {roleDescriptions.operator}
      </CardDescription>
    </CardHeader>

    <CardContent>
      <ul className="flex flex-col gap-2">
        {operators.map((operator) => (
          <li
            key={operator.id}
            className="border-border flex flex-wrap items-center gap-x-4 gap-y-3 rounded-lg border px-4 py-3"
          >
            <div className="flex min-w-0 flex-col gap-0.5">
              <span className="flex flex-wrap items-center gap-2">
                <Typography as="span" size="sm" weight="medium">
                  {operator.name}
                </Typography>
                {operator.isSelf ? (
                  <Badge variant="neutral" tone="subtle" size="sm">
                    vous
                  </Badge>
                ) : null}
              </span>
              <Typography as="span" size="xs" tone="muted">
                {operator.email} · depuis le {formatDate(operator.createdAt)}
              </Typography>
            </div>

            <div className="ml-auto flex flex-wrap items-center gap-2">
              {operator.isSelf ? (
                <Badge
                  variant={roleIntents[operator.role]}
                  tone="subtle"
                  size="sm"
                >
                  {roleLabels[operator.role]}
                </Badge>
              ) : (
                <>
                  <RoleControl operator={operator} />
                  <RemoveControl operator={operator} />
                </>
              )}
            </div>
          </li>
        ))}
      </ul>
    </CardContent>
  </Card>
);

/**
 * Applies on change — a save button beside a two-option select is ceremony.
 * The action is dispatched directly rather than through a `<form>`: there is
 * nothing to submit that the select does not already say, and the server
 * action re-reads the role from the payload and re-checks the guard anyway.
 */
const RoleControl = ({ operator }: { operator: OperatorRow }) => {
  const [state, action, pending] = useActionState(
    setOperatorRoleAction,
    initial,
  );

  const change = (role: string) => {
    const data = new FormData();
    data.set("id", operator.id);
    data.set("role", role);
    action(data);
  };

  return (
    <div className="flex flex-col items-end gap-1">
      <Select
        defaultValue={operator.role}
        disabled={pending}
        onValueChange={change}
      >
        <SelectTrigger
          aria-label={`Accès de ${operator.name}`}
          className="w-44"
        >
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
      {state.error ? (
        <Typography size="xs" className="text-error-text" role="alert">
          {state.error}
        </Typography>
      ) : null}
    </div>
  );
};

const RemoveControl = ({ operator }: { operator: OperatorRow }) => {
  const [state, action, pending] = useActionState(
    removeOperatorAction,
    initial,
  );

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          aria-label={`Retirer ${operator.name}`}
        >
          <Trash2 aria-hidden="true" />
        </Button>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Retirer {operator.name} ?</DialogTitle>
          <DialogDescription>
            Le compte perd immédiatement l&apos;accès à la console et aux
            dossiers des patients. Les profils, les recommandations et les notes
            déjà enregistrés ne bougent pas. Pour redonner l&apos;accès, il
            faudra une nouvelle invitation.
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
            <input type="hidden" name="id" value={operator.id} />
            <input type="hidden" name="email" value={operator.email} />
            <Button type="submit" variant="error" disabled={pending}>
              Retirer le compte
            </Button>
          </form>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
