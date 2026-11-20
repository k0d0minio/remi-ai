import type { Locale } from "@remi/services/shared";
import { Typography } from "@remi/ui/server";
import { ConsentControls } from "@/components/patient-consents/consent-controls";
import type { ConsentEntry, ConsentEntryText } from "@/lib/consents/entries";
import { fill } from "@/lib/content/fill";
import type { Content } from "@/lib/content/types";

type Props = {
  locale: Locale;
  entries: readonly ConsentEntry[];
  /** The name of each consent: the one that the sign-up shows. */
  names: Content["signupLink"]["consent"]["names"];
  /** « Version {version} du {date} », as the sign-up writes it. */
  textLine: string;
  text: Content["patientConsents"];
};

/**
 * « Mes consentements » (REM-43): each consent with its decision, its date
 * and the version of its text. The Profil tab shows it, and so does the
 * consent screen of a patient whose care consent is not in force. One column,
 * for a phone screen.
 */
export const ConsentList = ({
  locale,
  entries,
  names,
  textLine,
  text,
}: Props) => {
  const lined = (shown: ConsentEntryText | null) =>
    shown
      ? {
          ...shown,
          line: fill(textLine, { version: shown.version, date: shown.date }),
        }
      : null;

  return (
    <ul className="flex flex-col gap-3">
      {entries.map((entry) => {
        const name = names[entry.key];
        const decision =
          entry.state === "none" || !entry.decidedOn
            ? text.states.none
            : fill(text.states[entry.state], { date: entry.decidedOn });
        return (
          <li
            key={entry.key}
            className="bg-card flex flex-col gap-3 rounded-2xl border p-4"
          >
            <div className="flex flex-col gap-1">
              <Typography as="h4" size="base" weight="semibold">
                {name}
              </Typography>
              <Typography size="sm">{decision}</Typography>
              {entry.textVersion ? (
                <Typography size="sm" tone="muted">
                  {entry.accepted
                    ? fill(text.version, { version: entry.textVersion })
                    : text.legacyVersion}
                </Typography>
              ) : null}
            </div>
            <ConsentControls
              locale={locale}
              consentKey={entry.key}
              name={name}
              accepted={lined(entry.accepted)}
              withdrawable={entry.withdrawable}
              current={lined(entry.current)}
              text={text}
            />
          </li>
        );
      })}
    </ul>
  );
};
