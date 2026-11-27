import type { ReactNode } from "react";

type Props = {
  /**
   * The one primary action of the screen: a `Button` (primary, `lg`). The
   * block gives it the full width of the form.
   */
  primary: ReactNode;
  /** The secondary actions under it, as discreet text links. */
  links?: ReactNode;
};

/**
 * The actions under a questionnaire screen (REM-156): the primary action at the
 * full width of the form, and the secondary actions under it, centred. Every
 * step and the end screen (REM-168) use this block, so the actions stay at the
 * same place on each screen.
 */
export const QuestionnaireActions = ({ primary, links }: Props) => (
  <div className="flex flex-col gap-2 [&>*:first-child]:w-full">
    {primary}
    {links ? (
      <div className="flex flex-wrap items-center justify-center gap-x-6">
        {links}
      </div>
    ) : null}
  </div>
);
