import type { AuditKind, Intent } from "@/lib/fixtures";

/**
 * One mapping, read by the filter and by the rows it narrows. Order matters: the
 * filter renders it in this order, which is the order an operator reaches for
 * after an incident — who could reach what first, what changed second.
 */
export const auditKinds: AuditKind[] = [
  "access",
  "flag",
  "invite",
  "content",
  "export",
  "support",
];

export const auditKindLabels: Record<AuditKind, string> = {
  access: "access",
  flag: "flag",
  invite: "invite",
  content: "content",
  export: "export",
  support: "support",
};

/**
 * Colour marks what an entry costs to get wrong, not what it is about. Access
 * and export are the two that move data or the reach over it, so they carry the
 * weight; a plan template edit is a fact, not a risk.
 */
export const auditKindIntents: Record<AuditKind, Intent> = {
  access: "warning",
  flag: "info",
  invite: "info",
  content: "neutral",
  export: "warning",
  support: "neutral",
};
