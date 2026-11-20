"use client";

import { useState } from "react";
import {
  defaultProteinCoefficient,
  formatNumber,
  proteinTarget,
  proteinTargetBounds,
  type ProteinTargetDefaults,
} from "@remi/services/shared";
import { Button } from "@remi/ui";
import { Field, Input, Typography } from "@remi/ui/server";

type Props = {
  /** The values of the row that the detail opens with. Never a guess. */
  defaults: ProteinTargetDefaults;
};

/** A number as a French field shows it: « 0,83 ». */
const fieldText = (value: number) => String(value).replace(".", ",");

/** An empty field or text that is no number is null. */
const fieldNumber = (text: string) => {
  const value = text.trim().replace(",", ".");
  const parsed = Number(value);
  return value !== "" && Number.isFinite(parsed) ? parsed : null;
};

const grams = (value: number) => `${formatNumber(value, "fr-BE")} g/jour`;

const { referenceWeightKg: weightRange, coefficient: coefficientRange } =
  proteinTargetBounds;

/**
 * The three values of the protein target (story 8): the reference weight, the
 * coefficient and the final value in g/jour. The final value follows the two
 * others until the practitioner types one. A typed value stays as typed: a
 * later change of the two others then shows the computed value as a proposal,
 * and changes nothing until the practitioner takes it.
 *
 * `proteinTarget` computes here and in the service, so the value on screen is
 * the value that « Valider » writes. The fields are the children of
 * `CalculationDetail`, which holds the form.
 */
export const ProteinTargetFields = ({ defaults }: Props) => {
  const [weight, setWeight] = useState(fieldText(defaults.referenceWeightKg));
  const [coefficient, setCoefficient] = useState(
    fieldText(defaults.coefficient),
  );
  // Null: the final value follows the reference weight and the coefficient.
  const [typed, setTyped] = useState<string | null>(
    defaults.direct ? String(defaults.value) : null,
  );

  const parameters = {
    referenceWeightKg: fieldNumber(weight),
    coefficient: fieldNumber(coefficient),
    additionGramsPerDay: defaults.additionGramsPerDay,
  };
  const computed = proteinTarget({ ...parameters, directValue: null });
  const proposed = computed.state === "computed" ? computed.proposedValue : null;
  const invalid = computed.state === "invalid" ? computed.fields : [];
  const typedValue = typed === null ? null : fieldNumber(typed);
  const typedTarget =
    typedValue === null
      ? null
      : proteinTarget({ ...parameters, directValue: typedValue });
  const typedInvalid =
    typed !== null &&
    (typedValue === null ||
      (typedTarget?.state === "invalid" &&
        typedTarget.fields.includes("value")));
  const finalText = typed ?? (proposed === null ? "" : String(proposed));

  return (
    <>
      <Typography size="xs" tone="muted">
        {`Référence EFSA : ${formatNumber(defaultProteinCoefficient, "fr-BE")} g/kg/jour`}
      </Typography>
      <div className="grid gap-4 sm:grid-cols-3">
        <Field
          id="protein-reference-weight"
          label="Poids de référence (kg)"
          hint={`De ${weightRange.min} à ${weightRange.max} kg`}
          error={
            invalid.includes("referenceWeightKg")
              ? `Indiquez un poids de ${weightRange.min} à ${weightRange.max} kg.`
              : undefined
          }
        >
          <Input
            id="protein-reference-weight"
            name="referenceWeightKg"
            inputMode="decimal"
            autoComplete="off"
            value={weight}
            onChange={(event) => setWeight(event.target.value)}
          />
        </Field>
        <Field
          id="protein-coefficient"
          label="Coefficient (g/kg/jour)"
          hint={`De ${fieldText(coefficientRange.min)} à ${fieldText(coefficientRange.max)} g/kg/jour`}
          error={
            invalid.includes("coefficient")
              ? `Indiquez un coefficient de ${fieldText(coefficientRange.min)} à ${fieldText(coefficientRange.max)}.`
              : undefined
          }
        >
          <Input
            id="protein-coefficient"
            name="coefficient"
            inputMode="decimal"
            autoComplete="off"
            value={coefficient}
            onChange={(event) => setCoefficient(event.target.value)}
          />
        </Field>
        <Field
          id="protein-value"
          label="Valeur finale (g/jour)"
          hint={
            typed === null
              ? "Calculée. Vous pouvez saisir une autre valeur."
              : "Valeur saisie par vous"
          }
          error={
            typedInvalid
              ? `Indiquez un nombre entier de ${proteinTargetBounds.value.min} à ${proteinTargetBounds.value.max} g/jour.`
              : undefined
          }
        >
          <Input
            id="protein-value"
            name="value"
            inputMode="numeric"
            autoComplete="off"
            value={finalText}
            onChange={(event) =>
              setTyped(event.target.value === "" ? null : event.target.value)
            }
          />
        </Field>
      </div>
      {typedValue !== null && proposed !== null && typedValue !== proposed ? (
        <div role="status" className="flex flex-wrap items-center gap-3">
          <Typography size="sm">
            {`Valeur calculée avec ces paramètres : ${grams(proposed)}. Votre valeur reste ${grams(typedValue)} tant que vous ne la remplacez pas.`}
          </Typography>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setTyped(null)}
          >
            Utiliser la valeur calculée
          </Button>
        </div>
      ) : null}
      {defaults.additionGramsPerDay > 0 ? (
        <Typography size="xs" tone="muted">
          {`La valeur calculée comprend + ${grams(defaults.additionGramsPerDay)} pour la grossesse ou l'allaitement.`}
        </Typography>
      ) : null}
      <Typography size="xs" tone="muted">
        Le poids de référence sert à ce calcul uniquement. Le poids du dossier,
        l&apos;IMC et les besoins énergétiques ne changent pas.
      </Typography>
    </>
  );
};
