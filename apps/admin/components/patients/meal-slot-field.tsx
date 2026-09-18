import { mealSlots, type MealSlot } from "@remi/services/shared";
import { ChoiceChip, Typography } from "@remi/ui/server";
import { mealSlotLabels } from "@/components/patients/vocabulary";

type Props = {
  /** Unique per form on the page — two journals would otherwise share a group. */
  name: string;
  selected: MealSlot | null;
};

/**
 * The slot, as chips rather than a dropdown.
 *
 * Morgane logs these from a phone, often standing in the WhatsApp thread, and a
 * chip is one tap where a select is three. « Aucun » is a chip of its own and
 * the default, because an entry with no slot is a real entry — it renders and
 * sorts like any other — not a form she forgot to finish.
 */
export const MealSlotField = ({ name, selected }: Props) => (
  <fieldset className="flex flex-col gap-2">
    <legend className="mb-1">
      <Typography as="span" size="sm" weight="medium">
        Moment
      </Typography>
    </legend>
    <div className="flex flex-wrap gap-2">
      <ChoiceChip
        name={name}
        value=""
        label="Aucun"
        defaultChecked={selected === null}
      />
      {mealSlots.map((slot) => (
        <ChoiceChip
          key={slot}
          name={name}
          value={slot}
          label={mealSlotLabels[slot]}
          defaultChecked={selected === slot}
        />
      ))}
    </div>
  </fieldset>
);
