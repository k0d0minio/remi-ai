import { Sparkles } from "lucide-react";
import { Badge } from "@remi/ui/server";

type Props = {
  confidence: number;
};

/**
 * The recognition's own estimate of how sure it is, always on screen next to
 * what it claims to have seen.
 *
 * Three bands rather than a bare percentage, because "61 %" means nothing until
 * it is named — and the name is what tells the patient whether to correct REMI
 * before her practitioner reads the entry.
 */
const band = (confidence: number) => {
  if (confidence >= 90) {
    return { variant: "success", label: "reconnaissance sûre" } as const;
  }

  if (confidence >= 75) {
    return { variant: "info", label: "reconnaissance probable" } as const;
  }

  return { variant: "warning", label: "reconnaissance incertaine" } as const;
};

export const JournalConfidenceBadge = ({ confidence }: Props) => {
  const { variant, label } = band(confidence);

  return (
    <Badge variant={variant} tone="subtle" size="sm">
      <Sparkles aria-hidden="true" />
      {confidence} % · {label}
    </Badge>
  );
};
