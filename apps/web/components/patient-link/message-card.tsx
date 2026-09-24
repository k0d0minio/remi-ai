import NextLink from "next/link";
import type { PatientMessageEntry } from "@remi/services/shared";
import { Card, CardContent, Link, Typography } from "@remi/ui/server";
import { MessageComposer } from "@/components/patient-link/message-composer";
import type { Content } from "@/lib/content/types";

type Props = {
  messages: readonly PatientMessageEntry[];
  token: string;
  locale: string;
  /** The Messages segment, locale-prefixed. */
  href: string;
  content: Content["patientLink"];
};

/**
 * The home's feedback card — her § 6 box, writable from the home, with the
 * way through to the whole thread. It sits beside the weekly check-in card
 * rather than replacing it (D-36), and renders for every patient: it is an
 * invitation, not a view of data.
 */
export const MessageCard = ({
  messages,
  token,
  locale,
  href,
  content,
}: Props) => (
  <Card>
    <CardContent className="flex flex-col gap-4">
      <Typography as="h2" size="lg" weight="semibold">
        {content.messages.title}
      </Typography>
      <MessageComposer
        messages={messages}
        token={token}
        locale={locale}
        id="message-home-body"
        content={content}
      />
      <Link
        as={NextLink}
        href={href}
        variant="primary"
        className="inline-flex min-h-11 items-center text-sm"
      >
        {content.messages.seeThread}
      </Link>
    </CardContent>
  </Card>
);
