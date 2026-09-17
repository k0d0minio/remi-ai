import { ArchiveRestore, ArchiveX, BadgeCheck } from "lucide-react";
import type { NutritionRule } from "@remi/services/shared";
import { Button } from "@remi/ui";
import { archiveRuleAction, validateRuleAction } from "@/lib/knowledge/actions";

type Props = {
  rule: NutritionRule;
};

/**
 * The two state changes a rule has, and neither of them is a delete.
 *
 * Validating is one-way: there is no « dévalider » button, because withdrawing
 * a rule is archiving it and changing its wording is an edit, which opens a new
 * version. Un-validating in place would leave the corpus with no record that
 * the wording was ever agreed to.
 *
 * Neither control appears on a superseded row — that version is history, and
 * history does not take actions.
 */
export const RuleActions = ({ rule }: Props) => {
  const archived = rule.archivedAt !== null;
  const superseded = rule.supersededBy !== null;

  if (superseded) {
    return null;
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      {rule.status === "draft" && !archived ? (
        <form action={validateRuleAction}>
          <input type="hidden" name="id" value={rule.id} />
          <Button type="submit" size="sm">
            <BadgeCheck aria-hidden="true" />
            Valider
          </Button>
        </form>
      ) : null}

      <form action={archiveRuleAction}>
        <input type="hidden" name="id" value={rule.id} />
        <input
          type="hidden"
          name="archived"
          value={archived ? "false" : "true"}
        />
        <Button type="submit" size="sm" variant="ghost">
          {archived ? (
            <ArchiveRestore aria-hidden="true" />
          ) : (
            <ArchiveX aria-hidden="true" />
          )}
          {archived ? "Remettre en service" : "Archiver"}
        </Button>
      </form>
    </div>
  );
};
