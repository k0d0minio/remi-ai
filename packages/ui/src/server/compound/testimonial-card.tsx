import type { ReactNode } from "react";
import { cn } from "../../lib/utils";
import { Card, CardContent, CardFooter } from "../card";
import { StarRating } from "../star-rating";
import { Typography } from "../typography";

type Props = {
  quote: ReactNode;
  author: string;
  /** Role and organisation — the part that makes the quote worth anything. */
  role?: string;
  /** The author's `Avatar`, rendered by the caller: it is a client component. */
  avatar?: ReactNode;
  /** Whole stars out of five. Omitted where there is no real rating to show. */
  rating?: number;
  className?: string;
};

export const TestimonialCard = ({
  quote,
  author,
  role,
  avatar,
  rating,
  className,
}: Props) => (
  <Card
    elevation="flat"
    className={cn("h-full justify-between gap-6", className)}
  >
    <CardContent className="flex flex-col gap-4">
      {rating === undefined ? null : <StarRating value={rating} size="sm" />}
      <Typography as="blockquote" size="lg" className="text-pretty">
        {quote}
      </Typography>
    </CardContent>

    <CardFooter className="gap-3">
      {avatar}
      <div className="flex flex-col">
        <Typography size="sm" weight="medium">
          {author}
        </Typography>
        {role ? (
          <Typography size="sm" tone="muted">
            {role}
          </Typography>
        ) : null}
      </div>
    </CardFooter>
  </Card>
);
