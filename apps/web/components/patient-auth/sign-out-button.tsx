import type { Locale } from "@remi/services/shared";
import { Button } from "@remi/ui";
import { signOutAction } from "@/lib/patient-auth/actions";

type Props = {
  locale: Locale;
  label: string;
  /**
   * `button`: a secondary button. `link`: a discreet text link, for a screen
   * where the sign-out must not compete with the primary action (REM-156).
   */
  appearance?: "button" | "link";
  /** Classes for the form, to place it in its parent. */
  className?: string;
};

/** Ends the patient's session on this device. A plain form: no client code. */
export const SignOutButton = ({
  locale,
  label,
  appearance = "button",
  className,
}: Props) => (
  <form action={signOutAction} className={className}>
    <input type="hidden" name="locale" value={locale} />
    {appearance === "link" ? (
      <Button
        type="submit"
        variant="link"
        size="sm"
        className="text-muted-foreground hover:text-foreground underline"
      >
        {label}
      </Button>
    ) : (
      <Button type="submit" variant="outline" size="lg" className="min-h-11">
        {label}
      </Button>
    )}
  </form>
);
