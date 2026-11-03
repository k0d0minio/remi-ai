import { FLOW } from "@/lib/content/landing";

type Props = {
  value: string;
  onChange: (value: string) => void;
};

/** The trap for robots: hidden from people, filled by scripts. */
export const Honeypot = ({ value, onChange }: Props) => (
  <div className="absolute -left-[9999px] h-px w-px overflow-hidden" aria-hidden="true">
    <label>
      {FLOW.honeypot}
      <input
        type="text"
        name="website"
        tabIndex={-1}
        autoComplete="off"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </label>
  </div>
);
