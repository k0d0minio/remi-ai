import { ArrowRight } from "lucide-react";
import NextLink from "next/link";
import { Button } from "@remi/ui";
import { CtaBand } from "@remi/ui/server";

export const CtaSection = () => (
  <CtaBand
    title="Start with one week of honest logging"
    body="No card, no commitment. If it does not change how you eat, nothing has been lost but a week of typing."
    actions={
      <>
        <Button asChild size="xl" variant="secondary">
          <NextLink href="/contact">
            Start free
            <ArrowRight aria-hidden="true" />
          </NextLink>
        </Button>
      </>
    }
  />
);
