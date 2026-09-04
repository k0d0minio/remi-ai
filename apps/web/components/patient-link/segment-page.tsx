import type { ReactNode } from "react";
import { Typography } from "@remi/ui/server";

type Props = { title: string; children: ReactNode };

/**
 * One segment's section: its heading and its content, in the single-column
 * reading measure the shell sets. Every segment renders through this so the
 * six pages cannot drift apart in spacing or heading level.
 */
export const SegmentPage = ({ title, children }: Props) => (
  <section className="flex flex-col gap-4">
    <Typography as="h2" size="lg" weight="semibold">
      {title}
    </Typography>
    {children}
  </section>
);
