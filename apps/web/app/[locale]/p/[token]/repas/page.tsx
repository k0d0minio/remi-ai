import { notFound } from "next/navigation";
import { isLocale } from "@remi/services/shared";
import { Card, CardContent, Typography } from "@remi/ui/server";
import { MealEntryForm } from "@/components/patient-link/meal-entry-form";
import { MealList } from "@/components/patient-link/meal-list";
import { SegmentPage } from "@/components/patient-link/segment-page";
import { getContent } from "@/lib/content";
import { loadPatientLink } from "@/lib/patient-link/load";

/** Reads the database on every hit — never prerendered. */
export const dynamic = "force-dynamic";

type Params = { locale: string; token: string };

/**
 * Repas: « Je vais manger » / « J'ai mangé » first, then every non-archived
 * entry newest first with the response beneath it. Learnings and observations
 * stay in the console.
 *
 * Unlike the other five segments this one never 404s on an empty record and is
 * never hidden from the navigation: it is where a patient writes their first
 * meal, so a version of it that appeared only once one existed could never be
 * reached (`lib/patient-link/load.ts` → `visibleSegments`). The entry control
 * leads and the history follows, because § 8's feature is the writing — the
 * journal is « en arrière-plan pour garder l'historique ».
 */
const Segment = async ({ params }: { params: Promise<Params> }) => {
  const { locale, token } = await params;
  if (!isLocale(locale)) {
    notFound();
  }
  const content = getContent(locale).patientLink;

  const data = await loadPatientLink(token);
  if (!data) {
    notFound();
  }

  return (
    <div className="flex flex-col gap-8">
      <SegmentPage title={content.mealEntry.formTitle}>
        <div className="flex flex-col gap-4">
          <Typography size="sm" tone="muted">
            {content.mealEntry.formLead}
          </Typography>
          <Card>
            <CardContent>
              <MealEntryForm token={token} locale={locale} content={content} />
            </CardContent>
          </Card>
        </div>
      </SegmentPage>

      <SegmentPage title={content.mealsTitle}>
        {data.meals.length > 0 ? (
          <MealList
            meals={data.meals}
            locale={locale}
            token={token}
            content={content}
          />
        ) : (
          <Typography size="sm" tone="muted">
            {content.mealEntry.empty}
          </Typography>
        )}
      </SegmentPage>
    </div>
  );
};

export default Segment;
