import {
  foodDirectiveKinds,
  formatDate,
  type PatientFoodDirective,
} from "@remi/services/shared";
import { Badge, Typography } from "@remi/ui/server";
import { FoodDirectiveEditor } from "@/components/patients/food-directive-editor";
import {
  LIMIT_LEVEL_NOT_SET,
  TERM_NOT_RECOGNISED,
  evictionPeriodLabel,
  foodDirectiveKindLabels,
  foodLimitLevelLabels,
} from "@/components/patients/food-directive-labels";
import { SectionFold } from "@/components/patients/section-fold";

type Props = {
  patientId: string;
  pseudonym: string;
  /** The directives in force, in the order of the service. */
  directives: readonly PatientFoodDirective[];
  disabled: readonly PatientFoodDirective[];
  /** `YYYY-MM-DD` at the practice, to mark an eviction past its end date. */
  today: string;
};

/** What a row says after its term: the level, or the period. */
const detailOf = (row: PatientFoodDirective): string | null => {
  if (row.kind === "limit") {
    return row.limitLevel
      ? foodLimitLevelLabels[row.limitLevel]
      : LIMIT_LEVEL_NOT_SET;
  }
  return row.kind === "exclude" ? evictionPeriodLabel(row) : null;
};

type RowProps = { row: PatientFoodDirective; today: string };

const DirectiveRow = ({ row, today }: RowProps) => {
  const detail = detailOf(row);
  const pastEnd =
    row.kind === "exclude" &&
    row.disabledAt === null &&
    row.endsOn !== null &&
    row.endsOn < today;
  return (
    <li className="flex flex-col gap-1 py-2">
      <div className="flex flex-wrap items-center gap-2">
        <Typography as="span" size="sm" weight="medium" className="break-words">
          {row.term}
        </Typography>
        <Badge variant="warning" tone="subtle" size="sm">
          {TERM_NOT_RECOGNISED}
        </Badge>
        {detail ? (
          <Typography as="span" size="sm" tone="muted">
            {detail}
          </Typography>
        ) : null}
      </div>
      {pastEnd ? (
        <Typography size="sm" className="text-warning-text">
          Date de fin dépassée. L&apos;éviction reste appliquée tant que vous
          ne l&apos;avez pas désactivée.
        </Typography>
      ) : null}
      {row.disabledAt ? (
        <Typography size="xs" tone="muted">
          {`${foodDirectiveKindLabels[row.kind]} · désactivée le ${formatDate(row.disabledAt)}`}
        </Typography>
      ) : null}
    </li>
  );
};

/**
 * « Consignes alimentaires » (REM-54, story 13): the three fields in force,
 * the editor, then the disabled directives in a closed fold.
 *
 * REMI has no term base yet. Each term is stored as typed and has the mark
 * « non reconnu ». An eviction with that mark is not ignored: REMI cannot
 * confirm a food against it, so it shows nothing as safe (D-30).
 */
export const FoodDirectivesSection = ({
  patientId,
  pseudonym,
  directives,
  disabled,
  today,
}: Props) => (
  <>
    <FoodDirectiveEditor
      patientId={patientId}
      pseudonym={pseudonym}
      directives={directives}
    >
      <div className="flex flex-col gap-4">
        {foodDirectiveKinds.map((kind) => {
          const rows = directives.filter((row) => row.kind === kind);
          return (
            <div key={kind} className="flex flex-col gap-1">
              <Typography as="h3" size="sm" weight="medium">
                {foodDirectiveKindLabels[kind]}
              </Typography>
              {rows.length === 0 ? (
                <Typography size="sm" tone="muted">
                  {kind === "exclude"
                    ? "Aucune éviction saisie."
                    : "Aucune consigne saisie."}
                </Typography>
              ) : (
                <ul className="divide-border flex flex-col divide-y">
                  {rows.map((row) => (
                    <DirectiveRow key={row.id} row={row} today={today} />
                  ))}
                </ul>
              )}
            </div>
          );
        })}
        {directives.length > 0 ? (
          <Typography size="sm" tone="muted">
            « {TERM_NOT_RECOGNISED} » : REMI n&apos;a pas encore de base de
            termes, chaque terme est enregistré tel que vous l&apos;avez saisi.
            Une éviction non reconnue reste appliquée : ce que REMI ne peut pas
            vérifier n&apos;est pas proposé.
          </Typography>
        ) : null}
      </div>
    </FoodDirectiveEditor>

    {disabled.length > 0 ? (
      <SectionFold
        id="disabled-food-directives"
        label="Consignes désactivées"
        count={disabled.length}
      >
        <ul className="divide-border flex flex-col divide-y">
          {disabled.map((row) => (
            <DirectiveRow key={row.id} row={row} today={today} />
          ))}
        </ul>
      </SectionFold>
    ) : null}
  </>
);
