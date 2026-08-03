/**
 * The console's data, standing in for reads that do not exist yet. Admin has no
 * backend, so these shapes are the contract the real queries will have to
 * satisfy — the screen is designed against them, and swapping in
 * `@remi/services/server` later changes the source, not the components.
 */

/** The shared intent vocabulary — the same five names as `Badge` and `Card`. */
export type Intent = "success" | "warning" | "error" | "info" | "neutral";

export type Operator = {
  name: string;
  email: string;
  role: string;
};

export type Deployment = {
  environment: string;
  release: string;
  /** When the figures on this page were last read. */
  checkedAt: string;
};

export type OperationsStat = {
  label: string;
  value: string;
  detail: string;
  badge: { label: string; intent: Intent };
  /**
   * Percent complete. Present only on the cohort stat — it is the one figure
   * measured against a fixed ceiling rather than counted upward.
   */
  progress?: number;
};

export type AttentionItem = {
  id: string;
  title: string;
  detail: string;
  /** The nav section an operator would go to in order to act on this. */
  area: string;
  age: string;
  status: string;
  intent: Intent;
};

export type SystemApp = {
  name: string;
  description: string;
  uptime: string;
  status: { label: string; intent: Intent };
};

export const operator: Operator = {
  name: "Dana Okafor",
  email: "dana@remi.internal",
  role: "Operations lead",
};

export const deployment: Deployment = {
  environment: "production",
  release: "2026.08.02-1",
  checkedAt: "today at 09:12",
};

/** The founding cohort is capped at fifteen — the number the pilot is sized to. */
export const operationsStats: OperationsStat[] = [
  {
    label: "Pilot practitioners onboarded",
    value: "11 / 15",
    detail: "Four spots left in the founding cohort.",
    badge: { label: "on track", intent: "success" },
    progress: 73,
  },
  {
    label: "Active patients",
    value: "128",
    detail: "Seen by a practitioner in the last 30 days.",
    badge: { label: "+14 this week", intent: "success" },
  },
  {
    label: "Plans published",
    value: "342",
    detail: "Across every practitioner in the cohort.",
    badge: { label: "+27 this week", intent: "info" },
  },
  {
    label: "Signals this week",
    value: "1,204",
    detail: "Meals, steps and check-ins logged by patients.",
    badge: { label: "6% below last week", intent: "warning" },
  },
];

export const attentionItems: AttentionItem[] = [
  {
    id: "plan-export",
    title: "Plan export failing for one practitioner",
    detail:
      "Three retries in a row on the same account. The download returns an empty file rather than an error.",
    area: "Support",
    age: "2 hours ago",
    status: "open",
    intent: "error",
  },
  {
    id: "cohort-invites",
    title: "Three onboarding invites still unopened",
    detail:
      "Sent six days ago to the last practitioners in the founding cohort. None has signed in yet.",
    area: "Pilot",
    age: "6 days ago",
    status: "needs a nudge",
    intent: "warning",
  },
  {
    id: "digest-bounces",
    title: "Weekly digest bounced for four patients",
    detail:
      "All four addresses are on the same domain, which suggests a receiving-side block rather than four bad addresses.",
    area: "Support",
    age: "yesterday",
    status: "investigating",
    intent: "warning",
  },
  {
    id: "flag-rollout",
    title: "Plan editor v2 is still on for the whole cohort",
    detail:
      "The flag was opened for a two-week trial that ended on Friday. It has had no owner since.",
    area: "Flags",
    age: "3 days ago",
    status: "review",
    intent: "info",
  },
  {
    id: "audit-export",
    title: "July audit export has not been downloaded",
    detail:
      "Generated on schedule and available for another 21 days before it is purged.",
    area: "Audit",
    age: "5 days ago",
    status: "reminder",
    intent: "neutral",
  },
];

export const systemApps: SystemApp[] = [
  {
    name: "Web",
    description: "The product — the signed-in surface.",
    uptime: "99.98%",
    status: { label: "operational", intent: "success" },
  },
  {
    name: "Marketing",
    description: "The public site.",
    uptime: "100%",
    status: { label: "operational", intent: "success" },
  },
  {
    name: "Docs",
    description: "The reference site.",
    uptime: "100%",
    status: { label: "operational", intent: "success" },
  },
  {
    name: "Support",
    description: "Help centre and ticket intake.",
    uptime: "99.95%",
    status: { label: "operational", intent: "success" },
  },
  {
    name: "Demo",
    description: "The prototype sandbox.",
    uptime: "99.90%",
    status: { label: "operational", intent: "success" },
  },
];
