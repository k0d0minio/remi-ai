import { Typography } from "@remi/ui/server";

type Props = {
  quote: string;
  source: string;
};

/**
 * Morgane's own words, set apart from the summary of them. The dossier's claim
 * to authority is that it quotes rather than paraphrases, so a quotation that
 * looks like the prose around it defeats the point.
 */
export const PullQuote = ({ quote, source }: Props) => (
  <figure className="border-primary flex max-w-2xl flex-col gap-2 border-l-2 pl-4">
    <Typography as="blockquote" className="italic leading-relaxed">
      {quote}
    </Typography>
    <Typography as="figcaption" size="xs" tone="muted">
      {source}
    </Typography>
  </figure>
);
