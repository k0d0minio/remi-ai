"use client";

import { Plus } from "lucide-react";
import { useActionState } from "react";
import { recommendationCategories } from "@remi/services/shared";
import {
  Button,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@remi/ui";
import { Field, Input, Textarea, Typography } from "@remi/ui/server";
import {
  addRecommendationAction,
  type RecommendationFormState,
} from "@/lib/patients/actions";
import { categoryLabels } from "@/components/patients/vocabulary";

const initial: RecommendationFormState = { error: null };

type Props = {
  patientId: string;
};

/**
 * Always on screen rather than behind an "add" button: encoding a protocol is
 * the most frequent thing Morgane does on this page, often several entries in
 * a row from a phone. The fields clear themselves after each successful add.
 */
export const RecommendationAddForm = ({ patientId }: Props) => {
  const [state, action, pending] = useActionState(
    addRecommendationAction,
    initial,
  );

  return (
    <form action={action} className="flex flex-col gap-4">
      <input type="hidden" name="patientId" value={patientId} />

      <div className="grid gap-4 sm:grid-cols-[14rem_1fr]">
        <Field id="new-recommendation-category" label="Category">
          <Select name="category" defaultValue="nutrition">
            <SelectTrigger id="new-recommendation-category">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {recommendationCategories.map((category) => (
                <SelectItem key={category} value={category}>
                  {categoryLabels[category]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>

        <Field id="new-recommendation-title" label="Recommendation">
          <Input
            id="new-recommendation-title"
            name="title"
            required
            placeholder="e.g. Omega-3 — 2 g daily with a meal"
          />
        </Field>
      </div>

      <Field
        id="new-recommendation-detail"
        label="Detail"
        optional
        hint="The full instruction, written as the patient should read it."
      >
        <Textarea id="new-recommendation-detail" name="detail" rows={3} />
      </Field>

      <div className="flex flex-wrap items-center gap-3">
        <Button type="submit" size="sm" disabled={pending}>
          <Plus aria-hidden="true" />
          {pending ? "Adding…" : "Add recommendation"}
        </Button>
        {state.error ? (
          <Typography size="sm" className="text-error-text" role="alert">
            {state.error}
          </Typography>
        ) : null}
      </div>
    </form>
  );
};
