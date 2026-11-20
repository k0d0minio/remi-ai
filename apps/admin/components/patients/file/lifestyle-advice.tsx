import type { LifestyleAdvice } from "@remi/services/shared";
import {
  DisabledLifestyleAdvices,
  LifestyleAdviceEditor,
} from "@/components/patients/lifestyle-advice-editor";
import { SectionFold } from "@/components/patients/section-fold";

type Props = {
  patientId: string;
  /** The advice in force, in the order of the service. */
  advices: readonly LifestyleAdvice[];
  disabled: readonly LifestyleAdvice[];
};

/**
 * « Hygiène de vie » (REM-65, story 17): the six categories with the advice
 * in force, then the disabled advice in a closed fold. The patient reads an
 * advice only after the next validation, as written (D-30).
 */
export const LifestyleAdviceSection = ({
  patientId,
  advices,
  disabled,
}: Props) => (
  <>
    <LifestyleAdviceEditor patientId={patientId} advices={advices} />

    {disabled.length > 0 ? (
      <SectionFold
        id="disabled-lifestyle-advices"
        label="Conseils désactivés"
        count={disabled.length}
      >
        <DisabledLifestyleAdvices patientId={patientId} advices={disabled} />
      </SectionFold>
    ) : null}
  </>
);
