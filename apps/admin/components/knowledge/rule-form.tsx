"use client";

import { Plus, Save } from "lucide-react";
import { useActionState } from "react";
import { nutritionRuleKinds, type NutritionRule } from "@remi/services/shared";
import {
  Button,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@remi/ui";
import { Field, Input, Textarea, Typography } from "@remi/ui/server";
import { kindLabels } from "@/lib/knowledge/vocabulary";
import {
  createRuleAction,
  updateRuleAction,
  type RuleFormState,
} from "@/lib/knowledge/actions";

const initial: RuleFormState = { error: null, saved: false };

type Props = {
  /** Present when editing; absent on the corpus' create form. */
  rule?: NutritionRule;
};

/**
 * Four fields and a plain textarea. The body is markdown, typed as markdown —
 * there is no rich editor here on purpose: the text is destined for a prompt,
 * and what a prompt quotes should be what she typed, not what an editor decided
 * to emit.
 */
export const RuleForm = ({ rule }: Props) => {
  const [state, action, pending] = useActionState(
    rule ? updateRuleAction : createRuleAction,
    initial,
  );
  const revises = rule?.status === "validated";

  return (
    <form action={action} className="flex flex-col gap-4">
      {rule ? <input type="hidden" name="id" value={rule.id} /> : null}

      <Field id="rule-title" label="Titre">
        <Input
          id="rule-title"
          name="title"
          required
          maxLength={140}
          defaultValue={rule?.title}
          placeholder="ex. Sources d’oméga-3"
        />
      </Field>

      <Field id="rule-kind" label="Type">
        <Select name="kind" defaultValue={rule?.kind ?? "principle"}>
          <SelectTrigger id="rule-kind" className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {nutritionRuleKinds.map((kind) => (
              <SelectItem key={kind} value={kind}>
                {kindLabels[kind]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </Field>

      <Field
        id="rule-body"
        label="La règle"
        hint="En markdown — titres, listes, gras. C’est ce texte que REMI citera, mot pour mot."
      >
        <Textarea
          id="rule-body"
          name="body"
          required
          rows={14}
          maxLength={8000}
          defaultValue={rule?.body}
        />
      </Field>

      <Field
        id="rule-tags"
        label="Étiquettes"
        optional
        hint="Séparées par des virgules — « oméga-3, saison ». Huit au maximum, et ce sont elles qui permettent de retrouver la règle."
      >
        <Input
          id="rule-tags"
          name="tags"
          defaultValue={rule?.tags.join(", ")}
          placeholder="oméga-3, saison"
        />
      </Field>

      {revises ? (
        <Typography size="sm" tone="muted">
          Cette règle est validée : l’enregistrer crée la version{" "}
          {(rule?.version ?? 1) + 1} en brouillon, et garde celle-ci telle
          qu’elle a été validée. Le temps de valider la nouvelle, REMI ne cite
          ni l’une ni l’autre.
        </Typography>
      ) : null}

      <div className="flex flex-wrap items-center gap-3">
        <Button type="submit" disabled={pending} size="sm">
          {rule ? <Save aria-hidden="true" /> : <Plus aria-hidden="true" />}
          {pending
            ? "Enregistrement…"
            : revises
              ? "Créer une nouvelle version"
              : rule
                ? "Enregistrer"
                : "Créer la règle"}
        </Button>
        {state.error ? (
          <Typography size="sm" className="text-error-text" role="alert">
            {state.error}
          </Typography>
        ) : null}
        {state.saved && !state.error ? (
          <Typography size="sm" tone="muted" role="status">
            Enregistré.
          </Typography>
        ) : null}
      </div>
    </form>
  );
};
