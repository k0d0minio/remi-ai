import type { Metadata } from "next";
import { Typography } from "@remi/ui/server";
import { AttentionList } from "@/components/dashboard/attention-list";
import { StatTiles } from "@/components/dashboard/stat-tiles";
import { SystemStatus } from "@/components/dashboard/system-status";
import {
  attentionItems,
  deployment,
  operationsStats,
  systemApps,
} from "@/lib/fixtures";

export const metadata: Metadata = {
  title: "Overview",
};

const Overview = () => (
  <div className="flex flex-col gap-8">
    <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-2">
      <div className="flex flex-col gap-1">
        <Typography as="h1" size="2xl" weight="semibold">
          Overview
        </Typography>
        <Typography size="sm" tone="muted">
          Where the pilot stands, and what is waiting on an operator.
        </Typography>
      </div>

      <Typography size="xs" tone="muted" className="tabular-nums">
        Last checked {deployment.checkedAt}
      </Typography>
    </div>

    <StatTiles stats={operationsStats} />

    <div className="grid items-start gap-6 xl:grid-cols-[1.6fr_1fr]">
      <AttentionList items={attentionItems} />
      <SystemStatus apps={systemApps} />
    </div>
  </div>
);

export default Overview;
