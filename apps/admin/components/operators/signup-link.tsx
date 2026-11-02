import { CopyButton } from "@remi/ui";
import { Typography } from "@remi/ui/server";

type Props = {
  /** Built server-side by `appHref`, so only the links catalogue knows the origin. */
  url: string;
};

/**
 * The practitioner's permanent sign-up link (story 1), as text and a copy
 * button. The text stays selectable because `CopyButton` swallows a denied
 * clipboard. The page passes only its own operator's link, so no practitioner
 * sees another's.
 */
export const SignupLink = ({ url }: Props) => (
  <div className="flex flex-col gap-2">
    <Typography
      size="sm"
      className="border-border bg-muted select-all break-all rounded-md border px-3 py-2 font-mono"
    >
      {url}
    </Typography>
    <div className="flex flex-wrap items-center gap-2">
      <CopyButton value={url} label="Copier le lien" copiedLabel="Copié" />
      <Typography size="xs" tone="muted">
        Le lien ne change pas. Collez-le dans vos confirmations de rendez-vous :
        chaque inscription par ce lien vous rattache le patient.
      </Typography>
    </div>
  </div>
);
