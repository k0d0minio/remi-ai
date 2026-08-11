import { Button } from "@remi/ui";
import { Alert, AlertDescription, Field, Input } from "@remi/ui/server";
import { signIn } from "@/lib/actions/auth";

type Props = {
  /** Set when the previous attempt failed. Never says which part failed. */
  failed?: boolean;
};

/**
 * A server component: a plain `<form action={…}>` posting to a server action
 * needs no hook, no handler and no JavaScript, so the console's entry screen
 * ships none.
 *
 * Unlike `apps/web`'s form, both fields are `required` and both are read — there
 * is a real store behind them now.
 */
export const SignInForm = ({ failed }: Props) => (
  <form action={signIn} className="flex flex-col gap-5">
    {failed ? (
      <Alert variant="error">
        <AlertDescription>
          That email and password are not valid.
        </AlertDescription>
      </Alert>
    ) : null}

    <Field id="email" label="Email">
      <Input
        id="email"
        name="email"
        type="email"
        size="lg"
        required
        autoComplete="email"
        autoFocus
      />
    </Field>

    <Field id="password" label="Password">
      <Input
        id="password"
        name="password"
        type="password"
        size="lg"
        required
        autoComplete="current-password"
      />
    </Field>

    <Button type="submit" size="lg" className="w-full">
      Sign in
    </Button>
  </form>
);
