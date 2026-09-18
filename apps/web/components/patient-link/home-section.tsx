import type { ReactNode } from "react";
import NextLink from "next/link";
import { Link, Typography } from "@remi/ui/server";

type Props = {
  title: string;
  children: ReactNode;
  /** Where the full segment lives, and the label that goes to it. */
  seeAll?: { href: string; label: string };
};

/**
 * One block of the home: its heading, a preview of what the segment holds, and
 * the way through to the rest of it.
 *
 * The home shows the head of each list rather than the whole thing — her § 6
 * asks for a page a patient reads in a minute, not the six segments stacked —
 * so every block that has a segment behind it says so rather than quietly
 * truncating.
 */
export const HomeSection = ({ title, children, seeAll }: Props) => (
  <section className="flex flex-col gap-4">
    <Typography as="h2" size="lg" weight="semibold">
      {title}
    </Typography>
    {children}
    {seeAll ? (
      <Link
        as={NextLink}
        href={seeAll.href}
        variant="primary"
        className="inline-flex min-h-11 items-center text-sm"
      >
        {seeAll.label}
      </Link>
    ) : null}
  </section>
);
