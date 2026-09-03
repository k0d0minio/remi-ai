import type { PatientSupplement } from "@remi/services/shared";
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@remi/ui/server";
import { SupplementItem } from "@/components/patients/supplement-item";

type Props = {
  /** Already ordered by the service: position, then created-at. */
  supplements: readonly PatientSupplement[];
};

/**
 * The prescribed protocol as a compact table — brainstorm § G's four columns.
 *
 * One flat list, not category-grouped like the recommendations: the order is
 * Morgane's alone, so every active row can move. The same component renders the
 * archived fold, where each row derives its own archived state and drops the
 * reorder controls.
 */
export const SupplementProtocol = ({ supplements }: Props) => (
  <Table>
    <TableHeader>
      <TableRow>
        <TableHead>Complément</TableHead>
        <TableHead>Dose</TableHead>
        <TableHead>Moment</TableHead>
        <TableHead>Pourquoi</TableHead>
        <TableHead className="text-right">
          <span className="sr-only">Actions</span>
        </TableHead>
      </TableRow>
    </TableHeader>
    <TableBody>
      {supplements.map((supplement, index) => (
        <SupplementItem
          key={supplement.id}
          supplement={supplement}
          canMoveUp={index > 0}
          canMoveDown={index < supplements.length - 1}
        />
      ))}
    </TableBody>
  </Table>
);
