import { Check } from "lucide-react";

/** The green tick above a « merci ». */
export const DoneBadge = () => (
  <span className="bg-success text-success-foreground grid size-14 place-items-center rounded-full">
    <Check aria-hidden="true" className="size-7" />
  </span>
);
