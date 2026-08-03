import type { Locale } from "@remi/services/shared";
import { Button } from "@remi/ui";
import { Field, Input, Typography } from "@remi/ui/server";
import { signIn } from "@/lib/actions/session";
import type { Role } from "@/lib/auth/session";
import type { Content } from "@/lib/content/types";

/** Person first: it is the surface most demos open on. */
const roles: Role[] = ["person", "practitioner"];

type Props = {
  locale: Locale;
  content: Content;
};

/**
 * A server component, not a client island: a plain `<form action={…}>` posts to
 * the server action with no hook and no handler, and the segmented control is
 * two radios styled with `peer-checked`. Nothing here needs JavaScript, so
 * nothing here ships any.
 *
 * The email and the password are not read — there is no auth vendor to check
 * them against yet — and neither is `required`, so a demo enters in one click.
 * They are here because the shape of the screen is what is being built.
 */
export const SignInForm = ({ locale, content }: Props) => (
  <form action={signIn} className="flex flex-col gap-5">
    <input type="hidden" name="locale" value={locale} />

    <Field id="email" label={content.signIn.email}>
      <Input
        id="email"
        name="email"
        type="email"
        size="lg"
        autoComplete="email"
        placeholder={content.signIn.emailPlaceholder}
      />
    </Field>

    <Field id="password" label={content.signIn.password}>
      <Input
        id="password"
        name="password"
        type="password"
        size="lg"
        autoComplete="current-password"
      />
    </Field>

    <fieldset className="flex flex-col gap-2">
      <Typography as="legend" size="sm" weight="medium" className="mb-2">
        {content.signIn.roleLegend}
      </Typography>

      <div className="bg-muted grid grid-cols-2 gap-1 rounded-lg p-1">
        {roles.map((role) => (
          <label key={role} className="flex">
            <input
              type="radio"
              name="role"
              value={role}
              defaultChecked={role === "person"}
              className="peer sr-only"
            />
            <span className="text-muted-foreground peer-checked:bg-card peer-checked:text-foreground peer-checked:shadow-sm peer-focus-visible:ring-ring/40 flex min-h-9 w-full cursor-pointer items-center justify-center rounded-md px-3 py-1.5 text-center text-sm font-medium leading-tight transition-colors duration-[--duration-fast] peer-focus-visible:ring-[3px]">
              {content.roles[role]}
            </span>
          </label>
        ))}
      </div>

      <Typography size="xs" tone="muted">
        {content.signIn.roleHint}
      </Typography>
    </fieldset>

    <Button type="submit" size="lg" className="w-full">
      {content.signIn.submit}
    </Button>
  </form>
);
