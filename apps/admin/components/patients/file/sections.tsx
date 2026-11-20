import type { ReactNode } from "react";
import type {
  PatientFileGroup,
  PatientFileLayout,
  PatientFileSectionId,
} from "@remi/services/shared";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Typography,
} from "@remi/ui/server";
import { SectionRow } from "@/components/patients/file/section-row";
import {
  fileGroupLabels,
  fileGroupSegments,
} from "@/components/patients/vocabulary";

/**
 * One section as the page gives it to the layout. The layout decides whether
 * the section is an open block or a folded row. The section does not know.
 */
export type FileSectionView = {
  title: string;
  description: string;
  /** One line for the folded row: a count or a short state. */
  summary: string;
  /** The section holds nothing: its folded row is one quiet line. */
  empty: boolean;
  /** How many items the section holds, for the index. */
  count?: number;
  /** A block that stays open above the section, folded or not. */
  lead?: ReactNode;
  body: ReactNode;
};

export type FileSectionViews = Record<PatientFileSectionId, FileSectionView>;

type WorkProps = {
  sections: PatientFileLayout["work"];
  views: FileSectionViews;
};

/** The work column: the open blocks of the present status, in order. */
export const WorkColumn = ({ sections, views }: WorkProps) => (
  <>
    {sections.map((id) => {
      const view = views[id];
      return (
        <div key={id} data-segment="suivi">
          <div className="flex flex-col gap-6">
            {view.lead}
            <section id={id} className="scroll-mt-60">
              <Card>
                <CardHeader>
                  <CardTitle>{view.title}</CardTitle>
                  <CardDescription>{view.description}</CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col gap-6">
                  {view.body}
                </CardContent>
              </Card>
            </section>
          </div>
        </div>
      );
    })}
  </>
);

type RowsProps = {
  rows: PatientFileLayout["rows"];
  views: FileSectionViews;
};

/**
 * Every other section as one row: its name, one line, and it opens in place.
 * The rows of a group share one frame, so the page does not stack cards.
 */
export const SectionRows = ({ rows, views }: RowsProps) => (
  <>
    {rows.map(({ group, sections }) => (
      <div key={group} data-segment={fileGroupSegments[group]}>
        <div className="flex flex-col gap-3">
          {sections.map((id) =>
            views[id].lead ? <div key={id}>{views[id].lead}</div> : null,
          )}
          <RowGroupTitle group={group} />
          <div className="border-border bg-card divide-border divide-y rounded-2xl border">
            {sections.map((id) => {
              const view = views[id];
              return (
                <SectionRow
                  key={id}
                  id={id}
                  title={view.title}
                  summary={view.summary}
                  quiet={view.empty}
                  description={view.description}
                >
                  {view.body}
                </SectionRow>
              );
            })}
          </div>
        </div>
      </div>
    ))}
  </>
);

const RowGroupTitle = ({ group }: { group: PatientFileGroup }) => (
  <Typography as="h2" variant="eyebrow" tone="muted" className="px-1">
    {fileGroupLabels[group]}
  </Typography>
);
