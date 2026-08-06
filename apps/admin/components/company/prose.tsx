import { Typography } from "@remi/ui/server";

type Props = {
  body: readonly string[];
};

/**
 * Narrower than the console's tables on purpose. The rest of this app is
 * scanned; these paragraphs are read, and a measure past roughly 75 characters
 * costs the reader the start of the next line.
 */
export const Prose = ({ body }: Props) => (
  <div className="flex max-w-2xl flex-col gap-4">
    {body.map((paragraph) => (
      <Typography key={paragraph} size="sm" className="leading-relaxed">
        {paragraph}
      </Typography>
    ))}
  </div>
);
