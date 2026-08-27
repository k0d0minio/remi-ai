import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { hasOperator } from "@remi/services/server";
import { Card, CardContent, Typography, Wordmark } from "@remi/ui/server";
import { BootstrapForm } from "@/components/auth/bootstrap-form";
import { SignInForm } from "@/components/auth/sign-in-form";
import { getOperatorSession } from "@/lib/auth/session";

export const metadata: Metadata = {
  title: "Sign in",
};

/** Reads the database on every hit — never prerendered. */
export const dynamic = "force-dynamic";

/**
 * The one route outside the `(admin)` group, because it IS the boundary the
 * group enforces: everything else redirects here until a session exists.
 *
 * First run — no operator in the database yet — it offers account creation
 * instead, guarded by `OPERATOR_EMAIL`; see `bootstrapAction`.
 */
const SignIn = async () => {
  const operator = await getOperatorSession();
  if (operator) {
    redirect("/patients");
  }
  const bootstrap = !(await hasOperator());

  return (
    <main className="flex min-h-dvh items-center justify-center px-4 py-8">
      <div className="flex w-full max-w-sm flex-col gap-6">
        <div className="flex flex-col items-center gap-2 text-center">
          <Wordmark />
          <Typography size="sm" tone="muted">
            Internal operations — operators only.
          </Typography>
        </div>

        <Card>
          <CardContent className="flex flex-col gap-4">
            <Typography as="h1" size="lg" weight="semibold">
              {bootstrap ? "Create the operator account" : "Sign in"}
            </Typography>
            {bootstrap ? (
              <Typography size="sm" tone="muted">
                No operator account exists yet. Creating it works once, and only
                for the email this deployment allows.
              </Typography>
            ) : null}
            {bootstrap ? <BootstrapForm /> : <SignInForm />}
          </CardContent>
        </Card>
      </div>
    </main>
  );
};

export default SignIn;
