import { Check } from "lucide-react";
import { Container, Link, Typography } from "@remi/ui/server";
import { SignupFlow } from "@/components/signup-flow";
import { SIGNUP } from "@/lib/content/landing";
import { SITE } from "@/lib/site";

/** The sign-up: the pitch on the left, the conversational flow on the right. */
export const SignupSection = () => (
  <section
    id="inscription"
    className="from-background to-primary-subtle bg-linear-to-b scroll-mt-16 py-16 md:py-24"
  >
    <Container className="grid gap-8 lg:grid-cols-2 lg:items-center lg:gap-14">
      <div className="flex flex-col gap-4">
        <Typography as="h2" size="3xl" weight="bold" balance>
          {SIGNUP.title}
        </Typography>
        <Typography variant="lead">{SIGNUP.lead}</Typography>
        <ul className="flex flex-col gap-2">
          {SIGNUP.ticks.map((tick) => (
            <li key={tick} className="flex items-center gap-2.5 text-sm font-semibold">
              <span className="bg-success-subtle text-success-text grid size-5.5 shrink-0 place-items-center rounded-full">
                <Check aria-hidden="true" className="size-3.5" />
              </span>
              {tick}
            </li>
          ))}
        </ul>
        <Typography size="sm" tone="muted">
          {SIGNUP.callBefore}
          <Link href={SITE.contactPhoneHref} variant="primary" className="font-bold whitespace-nowrap">
            {SITE.contactPhone}
          </Link>
          {SIGNUP.callAfter}
        </Typography>
      </div>
      <SignupFlow />
    </Container>
  </section>
);
