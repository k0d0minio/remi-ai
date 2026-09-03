import {
  Footprints,
  LayoutDashboard,
  NotebookPen,
  Stethoscope,
  Sun,
  Users,
} from "lucide-react";
import type { ComponentType } from "react";

/**
 * The dictionary carries an icon *name* rather than a component, because a
 * locale file must stay serialisable data — importing lucide into it would put
 * every icon in both bundles. The shell resolves the name here.
 *
 * The vocabulary follows the marketing site's: `NotebookPen` for plan authoring,
 * `Footprints` for small steps, `Stethoscope` for the practitioner's authority.
 */
export const navIcons: Record<string, ComponentType<{ className?: string }>> = {
  practice: LayoutDashboard,
  clients: Users,
  frame: Stethoscope,
  today: Sun,
  steps: Footprints,
  plan: NotebookPen,
};
