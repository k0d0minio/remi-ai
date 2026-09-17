"use client";

import { ArrowDown, ArrowUp, Trash2 } from "lucide-react";
import { Button } from "@remi/ui";

type Props = {
  onMoveUp: () => void;
  onMoveDown: () => void;
  onRemove: () => void;
  canMoveUp: boolean;
  canMoveDown: boolean;
  /** How this row reads, so each control says which row it acts on. */
  rowLabel: string;
};

/**
 * Move and remove, for one row of a section edit mode.
 *
 * Buttons rather than a drag handle: reordering has to work from a keyboard
 * and from a phone, and a drag affordance does neither without a pile of
 * machinery. Each one is `type="button"` — they act on the local list, and a
 * bare button inside a form submits it.
 */
export const SectionRowControls = ({
  onMoveUp,
  onMoveDown,
  onRemove,
  canMoveUp,
  canMoveDown,
  rowLabel,
}: Props) => (
  <div className="flex items-center gap-1">
    <Button
      type="button"
      variant="ghost"
      size="sm"
      onClick={onMoveUp}
      disabled={!canMoveUp}
      aria-label={`Monter ${rowLabel}`}
    >
      <ArrowUp aria-hidden="true" />
    </Button>
    <Button
      type="button"
      variant="ghost"
      size="sm"
      onClick={onMoveDown}
      disabled={!canMoveDown}
      aria-label={`Descendre ${rowLabel}`}
    >
      <ArrowDown aria-hidden="true" />
    </Button>
    <Button
      type="button"
      variant="ghost"
      size="sm"
      onClick={onRemove}
      aria-label={`Retirer ${rowLabel}`}
    >
      <Trash2 aria-hidden="true" />
    </Button>
  </div>
);
