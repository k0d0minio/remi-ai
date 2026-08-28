import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getInvitationByToken } from "@remi/services/server";
import {
  Alert,
  AlertDescription,
  AlertTitle,
  Card,
  CardContent,
  Typography,
  Wordmark,
} from "@remi/ui/server";
import { AcceptForm } from "@/components/operators/accept-form";
import {
  roleDescriptions,
  roleLabels,
} from "@/components/operators/vocabulary";
import { getOperatorSession } from "@/lib/auth/session";
import { ensureDatabase } from "@/lib/database";

export const metadata: Metadata = {
  title: "Invitation",
};

/** Reads the database on every hit — never prerendered. */
export const dynamic = "force-dynamic";

type Params = { token: string };

/**
 * Accepting an invitation — the second route outside the `(admin)` group, and
 * for the same reason as `/sign-in`: it is reached by someone who has no
 * session yet, so it cannot live behind the guard.
 *
 * The token in the path is the whole credential. It resolves to an invitation
 * or it does not, and the three ways it can fail are told apart on purpose: an
 * expired link is something the reader can act on, unlike a wrong one.
 */
const Invitation = async ({ params }: { params: Promise<Params> }) => {
  const { token } = await params;

  // Someone already signed in following an invite link has no business
  // creating a second account from this browser.
  if (await getOperatorSession()) {
    redirect("/");
  }

  ensureDatabase();
  const result = await getInvitationByToken(token);

  return (
    <main className="flex min-h-dvh items-center justify-center px-4 py-8">
      <div className="flex w-full max-w-sm flex-col gap-6">
        <div className="flex flex-col items-center gap-2 text-center">
          <Wordmark />
          <Typography size="sm" tone="muted">
            Console interne — accès sur invitation.
          </Typography>
        </div>

        <Card>
          <CardContent className="flex flex-col gap-4">
            {result.ok ? (
              <>
                <div className="flex flex-col gap-1">
                  <Typography as="h1" size="lg" weight="semibold">
                    Créer votre accès
                  </Typography>
                  <Typography size="sm" tone="muted">
                    {roleLabels[result.data.role]} —{" "}
                    {roleDescriptions[result.data.role]}
                  </Typography>
                </div>
                <AcceptForm
                  token={token}
                  email={result.data.email}
                  suggestedName={result.data.name}
                />
              </>
            ) : (
              <>
                <Typography as="h1" size="lg" weight="semibold">
                  Ce lien ne fonctionne pas
                </Typography>
                <Alert variant="warning">
                  <AlertTitle>{result.message}</AlertTitle>
                  <AlertDescription>
                    Demandez une nouvelle invitation à la personne qui gère la
                    console.
                  </AlertDescription>
                </Alert>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </main>
  );
};

export default Invitation;
