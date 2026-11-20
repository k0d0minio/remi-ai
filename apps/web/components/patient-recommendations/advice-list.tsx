import type { ValidatedAdvice } from "@remi/services/shared";
import { Typography } from "@remi/ui/server";

type Props = { items: readonly ValidatedAdvice[] };

/**
 * The practitioner's recommendations of one category: the title, and the
 * detail when there is one. The text shows as written, with its line breaks.
 */
export const AdviceList = ({ items }: Props) => (
  <ul className="flex flex-col gap-3">
    {items.map((item) => (
      <li key={item.id} className="flex flex-col gap-1">
        <Typography weight="medium" className="break-words">
          {item.title}
        </Typography>
        {item.detail.trim() !== "" ? (
          <Typography
            size="sm"
            tone="muted"
            className="whitespace-pre-line break-words"
          >
            {item.detail}
          </Typography>
        ) : null}
      </li>
    ))}
  </ul>
);
