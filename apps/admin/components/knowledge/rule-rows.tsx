import NextLink from "next/link";
import { formatDate, type NutritionRule } from "@remi/services/shared";
import { Badge, Typography } from "@remi/ui/server";
import {
  kindLabels,
  statusIntents,
  statusLabels,
} from "@/lib/knowledge/vocabulary";

type Props = {
  rules: readonly NutritionRule[];
};

/**
 * The corpus as rows rather than a table — they survive a phone screen, which
 * is where the console gets opened between consultations. Same call as the
 * recipe library next door.
 *
 * The status badge leads, because it is the only thing on the row that decides
 * whether REMI may quote the rule.
 */
export const RuleRows = ({ rules }: Props) => (
  <ul className="flex flex-col gap-3">
    {rules.map((rule) => (
      <li
        key={rule.id}
        className="border-border flex flex-col gap-2 rounded-lg border p-4"
      >
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant={statusIntents[rule.status]} tone="subtle" size="sm">
            {statusLabels[rule.status]}
          </Badge>
          <NextLink
            href={`/knowledge/${rule.id}`}
            className="focus-visible:ring-ring/40 rounded-sm focus-visible:outline-none focus-visible:ring-[3px]"
          >
            <Typography as="h3" size="sm" weight="medium">
              {rule.title}
            </Typography>
          </NextLink>
          <Badge variant="outline" size="sm">
            {kindLabels[rule.kind]}
          </Badge>
          {rule.tags.map((tag) => (
            <Badge key={tag} variant="neutral" tone="subtle" size="sm">
              {tag}
            </Badge>
          ))}
        </div>

        <Typography size="sm" tone="muted" className="line-clamp-2">
          {rule.body}
        </Typography>

        <Typography size="xs" tone="muted">
          version {rule.version} · modifiée le {formatDate(rule.updatedAt)}
        </Typography>
      </li>
    ))}
  </ul>
);
