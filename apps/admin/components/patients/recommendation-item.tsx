"use client";

import { Pencil } from "lucide-react";
import { useState } from "react";
import type { PatientRecommendation } from "@remi/services/shared";
import { recommendationCategories } from "@remi/services/shared";
import { Badge, Field, Input, Textarea, Typography } from "@remi/ui/server";
import {
  Button,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@remi/ui";
import {
  deleteRecommendationAction,
  updateRecommendationAction,
} from "@/lib/patients/actions";
import { categoryLabels } from "@/components/patients/vocabulary";

type Props = {
  recommendation: PatientRecommendation;
};

/**
 * One encoded recommendation: read view by default, an inline form behind the
 * pencil. Delete confirms with a second click instead of a dialog — small
 * enough to redo, destructive enough not to be one tap.
 */
export const RecommendationItem = ({ recommendation }: Props) => {
  const [editing, setEditing] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (editing) {
    return (
      <li className="border-border flex flex-col gap-4 rounded-lg border p-4">
        <form
          action={async (formData: FormData) => {
            const result = await updateRecommendationAction(
              { error: null },
              formData,
            );
            setError(result.error);
            if (!result.error) {
              setEditing(false);
            }
          }}
          className="flex flex-col gap-4"
        >
          <input type="hidden" name="id" value={recommendation.id} />
          <input
            type="hidden"
            name="patientId"
            value={recommendation.patientId}
          />

          <div className="grid gap-4 sm:grid-cols-[14rem_1fr]">
            <Field id={`category-${recommendation.id}`} label="Category">
              <Select name="category" defaultValue={recommendation.category}>
                <SelectTrigger id={`category-${recommendation.id}`}>
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

            <Field id={`title-${recommendation.id}`} label="Recommendation">
              <Input
                id={`title-${recommendation.id}`}
                name="title"
                required
                defaultValue={recommendation.title}
              />
            </Field>
          </div>

          <Field id={`detail-${recommendation.id}`} label="Detail" optional>
            <Textarea
              id={`detail-${recommendation.id}`}
              name="detail"
              rows={3}
              defaultValue={recommendation.detail}
            />
          </Field>

          <div className="flex flex-wrap items-center gap-2">
            <Button type="submit" size="sm">
              Save
            </Button>
            <Button
              type="button"
              size="sm"
              variant="ghost"
              onClick={() => {
                setEditing(false);
                setError(null);
              }}
            >
              Cancel
            </Button>
            {error ? (
              <Typography size="sm" className="text-error-text" role="alert">
                {error}
              </Typography>
            ) : null}
          </div>
        </form>
      </li>
    );
  }

  return (
    <li className="border-border flex flex-col gap-2 rounded-lg border p-4">
      <div className="flex flex-wrap items-center gap-2">
        <Badge variant="info" tone="subtle" size="sm">
          {categoryLabels[recommendation.category]}
        </Badge>
        <Typography as="h3" size="sm" weight="medium">
          {recommendation.title}
        </Typography>
      </div>

      {recommendation.detail ? (
        <Typography size="sm" tone="muted" className="whitespace-pre-line">
          {recommendation.detail}
        </Typography>
      ) : null}

      <div className="flex flex-wrap items-center gap-2">
        <Button
          type="button"
          size="sm"
          variant="ghost"
          onClick={() => setEditing(true)}
        >
          <Pencil aria-hidden="true" />
          Edit
        </Button>

        {confirmingDelete ? (
          <>
            <form action={deleteRecommendationAction}>
              <input type="hidden" name="id" value={recommendation.id} />
              <input
                type="hidden"
                name="patientId"
                value={recommendation.patientId}
              />
              <Button type="submit" size="sm" variant="error">
                Confirm delete
              </Button>
            </form>
            <Button
              type="button"
              size="sm"
              variant="ghost"
              onClick={() => setConfirmingDelete(false)}
            >
              Cancel
            </Button>
          </>
        ) : (
          <Button
            type="button"
            size="sm"
            variant="ghost"
            onClick={() => setConfirmingDelete(true)}
          >
            Delete
          </Button>
        )}
      </div>
    </li>
  );
};
