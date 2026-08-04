import type { Metadata } from "next";
import { Typography } from "@remi/ui/server";
import { FlagTable } from "@/components/flags/flag-table";
import { featureFlags } from "@/lib/fixtures";

export const metadata: Metadata = {
  title: "Flags",
};

const Flags = () => (
  <div className="flex flex-col gap-6">
    <div className="flex flex-col gap-1">
      <Typography as="h1" size="2xl" weight="semibold">
        Flags
      </Typography>
      <Typography size="sm" tone="muted">
        What is actually switched on, and for whom — which is a different
        question from what the roadmap says is coming.
      </Typography>
    </div>

    <FlagTable flags={featureFlags} />
  </div>
);

export default Flags;
