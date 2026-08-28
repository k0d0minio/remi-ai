import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { hasOperator } from "@remi/services/server";
import { Card, CardContent, Typography, Wordmark } from "@remi/ui/server";
import { BootstrapForm } from "@/components/auth/bootstrap-form";
import { SignInForm } from "@/components/auth/sign-in-form";
import { getOperatorSession } from "@/lib/auth/session";
import { ensureDatabase } from "@/lib/database";

export const metadata: Metadata = {
  title: "Connexion",
};

/** Reads the database on every hit — never prerendered. */
export const dynamic = "force-dynamic";

/**
 * The boundary the `(admin)` group enforces: everything else redirects here
 * until a session exists. It shares that position with `/invitation/[token]`,
 * the other route reached by someone who has none.
 *
 * First run — no operator in the database yet — it offers account creation
 * instead, guarded by `OPERATOR_EMAIL`; see `bootstrapAction`. Once one account
 * exists, new ones arrive by invitation only.
 */
const SignIn = async () => {
  ensureDatabase();
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
            Console interne — accès réservé.
          </Typography>
        </div>

        <Card>
          <CardContent className="flex flex-col gap-4">
            <Typography as="h1" size="lg" weight="semibold">
              {bootstrap ? "Créer le premier compte" : "Connexion"}
            </Typography>
            {bootstrap ? (
              <Typography size="sm" tone="muted">
                Aucun compte n&apos;existe encore. Cette création ne fonctionne
                qu&apos;une fois, et uniquement pour l&apos;adresse autorisée
                sur ce déploiement.
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
