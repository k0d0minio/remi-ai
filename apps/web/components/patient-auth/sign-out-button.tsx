import type { Locale } from "@remi/services/shared";
import { Button } from "@remi/ui";
import { signOutAction } from "@/lib/patient-auth/actions";

type Props = {
  locale: Locale;
  label: string;
};

/** Ends the patient's session on this device. A plain form: no client code. */
export const SignOutButton = ({ locale, label }: Props) => (
  <form action={signOutAction}>
    <input type="hidden" name="locale" value={locale} />
    <Button type="submit" variant="outline" size="lg" className="min-h-11">
      {label}
    </Button>
  </form>
);
