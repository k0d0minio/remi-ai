import { CircleAlert } from "lucide-react";
import { Alert, AlertDescription } from "@remi/ui/server";
import { MESSAGES } from "@/lib/content/landing";
import type { SubmitResult } from "@/lib/leads/state";

/** Why the submit did not go through, in the visitor's words. */
export const SubmitError = ({ result }: { result: SubmitResult | null }) => {
  if (!result || result.ok) {
    return null;
  }
  return (
    <Alert variant="error">
      <CircleAlert />
      <AlertDescription>
        {result.reason === "network" ? MESSAGES.network : MESSAGES.server}
      </AlertDescription>
    </Alert>
  );
};
