import type { PantryEssential } from "@remi/services/shared";
import { PantryItem } from "@/components/patients/pantry-item";

type Props = {
  /** Already ordered by the service — her order, not insertion order. */
  essentials: readonly PantryEssential[];
};

/**
 * The placard/frigo list, flat.
 *
 * No grouping is derived here and none is stored: § H frames the idea as
 * placard vs frigo but does not make it data, and whether Morgane thinks in
 * sections is hers to answer. Until she does, the only order is the one she
 * set, which is what makes the move controls meaningful.
 */
export const PantryList = ({ essentials }: Props) => (
  <ul className="flex flex-col gap-3">
    {essentials.map((essential, index) => (
      <PantryItem
        key={essential.id}
        essential={essential}
        canMoveUp={index > 0}
        canMoveDown={index < essentials.length - 1}
      />
    ))}
  </ul>
);
