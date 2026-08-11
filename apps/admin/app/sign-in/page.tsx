import type { Metadata } from "next";
import { redirect } from "next/navigation";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Typography,
  Wordmark,
} from "@remi/ui/server";
import { SignInForm } from "@/components/auth/sign-in-form";
import { currentOperator } from "@/lib/auth/session";

export const metadata: Metadata = {
  title: "Sign in",
  robots: { index: false, follow: false },
};

/**
 * The only route outside the `(admin)` group, and the one page the group's gate
 * can redirect to without looping back into itself.
 *
 * It reads the session too, so an operator who is already signed in lands on the
 * console rather than on a form asking them to do it again.
 */
const Page = async ({
  searchParams,
}: {
  searchParams: Promise<{ failed?: string }>;
}) => {
  if (await currentOperator()) {
    redirect("/");
  }

  const { failed } = await searchParams;

  return (
    <main className="flex min-h-dvh items-center justify-center px-6 py-12">
      <div className="flex w-full max-w-sm flex-col gap-8">
        <div className="flex flex-col gap-2">
          <Wordmark />
          <Typography size="sm" tone="muted">
            Internal operations — operators only.
          </Typography>
        </div>

        <Card elevation="floating">
          <CardHeader>
            <CardTitle>Sign in</CardTitle>
          </CardHeader>
          <CardContent>
            <SignInForm failed={Boolean(failed)} />
          </CardContent>
        </Card>
      </div>
    </main>
  );
};

export default Page;
