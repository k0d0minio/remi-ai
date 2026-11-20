"use client";

import { FlaskConical, RotateCcw, Save } from "lucide-react";
import { useActionState, useState } from "react";
import type { AiModelRole, ModelCheck } from "@remi/services/shared";
import { Button } from "@remi/ui";
import {
  Alert,
  AlertDescription,
  AlertTitle,
  Badge,
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
  resetRoleModelAction,
  saveRoleModelAction,
  testRoleModelAction,
  type ModelSaveState,
  type ModelTestState,
} from "@/lib/ai-models/actions";
import {
  checkLabels,
  retentionLabel,
  roleDescriptions,
  roleLabels,
} from "@/components/ai-models/vocabulary";

export type RoleRow = {
  role: AiModelRole;
  model: string;
  defaultModel: string;
  source: "default" | "setting";
  setByName: string | null;
  /** The date and time, written on the server. */
  setAtLabel: string | null;
};

/** One model of the gateway's list, with what the page shows beside it. */
export type ModelFact = {
  id: string;
  name: string;
  zdr: string | null;
  /** The checks that the model fails. A save needs an empty list. */
  failed: readonly ModelCheck[];
  /** A text model that passes the checks: the field offers it. */
  selectable: boolean;
};

type Props = {
  roles: readonly RoleRow[];
  /** Null when the gateway's list is not available. */
  models: readonly ModelFact[] | null;
};

const OPTIONS_ID = "ai-model-options";

const noSave: ModelSaveState = { error: null, saved: null };
const noTest: ModelTestState = { result: null };

/**
 * The three AI roles. Each card shows the model in use and where it comes
 * from, and lets an admin test a model, save it or go back to the default.
 *
 * What a card says about a typed model is a help only. The server decides: the
 * save action checks the gateway's list again.
 */
export const RoleModelList = ({ roles, models }: Props) => (
  <div className="flex flex-col gap-6">
    {models ? (
      <datalist id={OPTIONS_ID}>
        {models
          .filter((model) => model.selectable)
          .map((model) => (
            <option key={model.id} value={model.id}>
              {model.name}
            </option>
          ))}
      </datalist>
    ) : null}
    {roles.map((row) => (
      <RoleModelCard
        // A saved value changes the key: the field then shows the new model.
        key={`${row.role}:${row.source}:${row.model}`}
        row={row}
        models={models}
      />
    ))}
  </div>
);

const factOf = (models: readonly ModelFact[] | null, id: string) =>
  models?.find((model) => model.id === id) ?? null;

type FactsProps = {
  models: readonly ModelFact[] | null;
  modelId: string;
};

/** What the gateway's list says about one model id. */
const ModelFacts = ({ models, modelId }: FactsProps) => {
  if (!models || modelId === "") {
    return null;
  }
  const fact = factOf(models, modelId);
  const failed: readonly ModelCheck[] = fact ? fact.failed : ["not_listed"];
  return (
    <div className="flex flex-col gap-1">
      {fact ? (
        <Typography size="xs" tone="muted">
          {fact.name} · conservation des données : {retentionLabel(fact.zdr)}
        </Typography>
      ) : null}
      {failed.length > 0 ? (
        <Typography size="xs" className="text-error-text">
          Enregistrement impossible :{" "}
          {failed.map((check) => checkLabels[check]).join(" ; ")}.
        </Typography>
      ) : (
        <Typography size="xs" tone="muted">
          Sortie structurée : oui · aucun fournisseur n&apos;entraîne ses
          modèles sur les données.
        </Typography>
      )}
    </div>
  );
};

type CardProps = {
  row: RoleRow;
  models: readonly ModelFact[] | null;
};

const RoleModelCard = ({ row, models }: CardProps) => {
  const [typed, setTyped] = useState(row.model);
  const [saveState, saveAction, saving] = useActionState(
    saveRoleModelAction,
    noSave,
  );
  const [resetState, resetAction, resetting] = useActionState(
    resetRoleModelAction,
    noSave,
  );
  const [testState, testAction, testing] = useActionState(
    testRoleModelAction,
    noTest,
  );

  const busy = saving || resetting || testing;
  const inputId = `ai-model-${row.role}`;
  const typedId = typed.trim();
  const current = factOf(models, row.model);
  const currentFailed: readonly ModelCheck[] = models
    ? (current?.failed ?? ["not_listed"])
    : [];
  const error = saveState.error ?? resetState.error;
  const test = testState.result;

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {roleLabels[row.role]}{" "}
          <code className="text-muted-foreground text-xs font-normal">
            {row.role}
          </code>
        </CardTitle>
        <CardDescription>{roleDescriptions[row.role]}</CardDescription>
      </CardHeader>

      <CardContent className="flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <div className="flex flex-wrap items-center gap-2">
            <Typography as="span" size="sm" tone="muted">
              Modèle utilisé :
            </Typography>
            <code className="bg-muted break-all rounded-md px-2 py-1 text-xs">
              {row.model}
            </code>
            <Badge
              variant={row.source === "setting" ? "info" : "neutral"}
              tone="subtle"
              size="sm"
            >
              {row.source === "setting"
                ? "défini dans la console"
                : "valeur par défaut du code"}
            </Badge>
          </div>
          {row.source === "setting" ? (
            <Typography size="xs" tone="muted">
              Défini par {row.setByName || "un compte supprimé"}
              {row.setAtLabel ? `, le ${row.setAtLabel}` : ""}. Valeur par
              défaut : {row.defaultModel}.
            </Typography>
          ) : null}
          {current ? (
            <Typography size="xs" tone="muted">
              Conservation des données : {retentionLabel(current.zdr)}.
            </Typography>
          ) : null}
        </div>

        {currentFailed.length > 0 ? (
          <Alert variant="warning">
            <AlertTitle>Ce modèle ne passe pas les contrôles</AlertTitle>
            <AlertDescription>
              {currentFailed.map((check) => checkLabels[check]).join(" ; ")}.
              Choisissez un autre modèle.
            </AlertDescription>
          </Alert>
        ) : null}

        <form className="flex flex-col gap-3">
          <input type="hidden" name="role" value={row.role} />
          <Field
            id={inputId}
            label="Identifiant du modèle"
            hint="Format « créateur/modèle », par exemple mistral/mistral-nemo."
          >
            <Input
              id={inputId}
              name="model"
              list={models ? OPTIONS_ID : undefined}
              value={typed}
              onChange={(event) => setTyped(event.target.value)}
              autoComplete="off"
              autoCapitalize="none"
              spellCheck={false}
              required
            />
          </Field>

          {typedId === row.model ? null : (
            <ModelFacts models={models} modelId={typedId} />
          )}

          <div className="flex flex-wrap items-center gap-2">
            <Button
              type="submit"
              variant="outline"
              formAction={testAction}
              disabled={busy}
            >
              <FlaskConical aria-hidden="true" />
              {testing ? "Test en cours…" : "Tester"}
            </Button>
            <Button
              type="submit"
              formAction={saveAction}
              disabled={busy || !models}
            >
              <Save aria-hidden="true" />
              {saving ? "Enregistrement…" : "Enregistrer"}
            </Button>
            {row.source === "setting" ? (
              <Button
                type="submit"
                variant="ghost"
                formAction={resetAction}
                formNoValidate
                disabled={busy}
              >
                <RotateCcw aria-hidden="true" />
                Revenir à la valeur par défaut
              </Button>
            ) : null}
          </div>
        </form>

        {test ? (
          <Alert variant={test.ok ? "success" : "error"} role="status">
            <AlertTitle>
              Test de {test.model === "" ? "ce modèle" : test.model}
            </AlertTitle>
            <AlertDescription>{test.message}</AlertDescription>
          </Alert>
        ) : null}

        {error ? (
          <Typography size="sm" className="text-error-text" role="alert">
            {error}
          </Typography>
        ) : null}
      </CardContent>
    </Card>
  );
};
