import { mealSlots, type MealSlot } from "@remi/services/shared";
import { Typography } from "@remi/ui/server";
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
      <SlotChip
        name={name}
        value=""
        label="Aucun"
        checked={selected === null}
      />
      {mealSlots.map((slot) => (
        <SlotChip
          key={slot}
          name={name}
          value={slot}
          label={mealSlotLabels[slot]}
          checked={selected === slot}
        />
      ))}
    </div>
  </fieldset>
);

const SlotChip = ({
  name,
  value,
  label,
  checked,
}: {
  name: string;
  value: string;
  label: string;
  checked: boolean;
}) => (
  <label className="cursor-pointer">
    <input
      type="radio"
      name={name}
      value={value}
      defaultChecked={checked}
      className="peer sr-only"
    />
    <span className="border-border bg-card text-muted-foreground peer-checked:border-primary peer-checked:bg-primary/10 peer-checked:text-foreground peer-focus-visible:ring-ring/40 inline-flex min-h-11 items-center rounded-full border px-4 text-sm transition-colors duration-[--duration-fast] peer-focus-visible:outline-none peer-focus-visible:ring-[3px]">
      {label}
    </span>
  </label>
);
