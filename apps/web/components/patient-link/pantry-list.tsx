import type { PantryEssential } from "@remi/services/shared";
import { Card, CardContent, Typography } from "@remi/ui/server";
import type { Content } from "@/lib/content/types";

type Props = {
  essentials: readonly PantryEssential[];
  content: Content["patientLink"];
};

/**
 * The placard & frigo list in her order. The why is the point of the list
 * rather than a decoration — § H is justification logic, so an item renders
 * with its reason attached rather than in a bare checklist.
 */
export const PantryList = ({ essentials, content }: Props) => (
  <ul className="flex flex-col gap-3">
    {essentials.map((essential) => (
      <li key={essential.id}>
        <Card>
          <CardContent className="flex flex-col gap-2">
            <Typography as="h3" size="sm" weight="medium">
              {essential.item}
            </Typography>
            {essential.why.trim() !== "" ? (
              <Typography
                size="sm"
                tone="muted"
                className="whitespace-pre-line"
              >
                {content.whyLabel} : {essential.why}
              </Typography>
            ) : null}
          </CardContent>
        </Card>
      </li>
    ))}
  </ul>
);
