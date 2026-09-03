import { ArrowLeft } from "lucide-react";
import NextLink from "next/link";
import { notFound } from "next/navigation";
import {
  getPatient,
  listArchivedPantryEssentials,
  listArchivedPatientRecipes,
  listArchivedPatientRecommendations,
  listPantryEssentials,
  listPatientAnamnesis,
  listPatientNotes,
  listPatientRecipes,
  listPatientRecommendations,
  listRecipes,
} from "@remi/services/server";
import { ageInYears, appHref } from "@remi/services/shared";
import {
  Badge,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Typography,
} from "@remi/ui/server";
import { AnamnesisBlock } from "@/components/patients/anamnesis-block";
import { AssignRecipeForm } from "@/components/patients/assign-recipe-form";
import { DeletePatient } from "@/components/patients/delete-patient";
import { NoteTimeline } from "@/components/patients/note-timeline";
import { PantryAddForm } from "@/components/patients/pantry-add-form";
import { PantryList } from "@/components/patients/pantry-list";
import { PatientForm } from "@/components/patients/patient-form";
import { RecipeAssignments } from "@/components/patients/recipe-assignments";
import { RecommendationAddForm } from "@/components/patients/recommendation-add-form";
import { RecommendationGroups } from "@/components/patients/recommendation-groups";
import { ShareLinkCard } from "@/components/patients/share-link-card";
import {
  patientSexLabels,
  patientStatusIntents,
  patientStatusLabels,
} from "@/components/patients/vocabulary";
import { ensureDatabase } from "@/lib/database";

/** Reads the database on every hit — never prerendered. */
export const dynamic = "force-dynamic";

type Params = { id: string };

/**
 * One patient, everything Morgane does with them on one scrolling page: the
 * link she shares, the protocol she encodes, the essentials she picks for their
 * placard, the consultations behind it, the anamnesis under those, the profile
 * they are all written against, and — last and behind a dialog — deletion.
 * Ordered by how often each is reached for mid-consultation, phone first.
 */
const PatientDetail = async ({ params }: { params: Promise<Params> }) => {
  // The page's own graph, not the layout's — the two render in parallel.
  ensureDatabase();
  const { id } = await params;
  const result = await getPatient(id);
  if (!result.ok) {
    notFound();
  }
  const patient = result.data;

  const [
    recommendations,
    archived,
    essentials,
    archivedEssentials,
    assignedRecipes,
    pastRecipes,
    library,
    notes,
    anamnesis,
  ] = await Promise.all([
    listPatientRecommendations(patient.id),
    listArchivedPatientRecommendations(patient.id),
    listPantryEssentials(patient.id),
    listArchivedPantryEssentials(patient.id),
    listPatientRecipes(patient.id),
    listArchivedPatientRecipes(patient.id),
    // The picker offers the active library only — an archived recipe is out of
    // circulation, which is exactly what archiving it meant.
    listRecipes(),
    listPatientNotes(patient.id),
    listPatientAnamnesis(patient.id),
  ]);
  const shareUrl = appHref("web", `/p/${patient.shareToken}`, patient.locale);
  const age = ageInYears(patient.birthDate);

  // The default consultation date, resolved server-side: a date input seeded
  // from the browser's clock disagrees with the server the moment someone is
  // working across midnight or from another timezone.
  const today = new Date().toISOString().slice(0, 10);

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-6">
      <div className="flex flex-col gap-2">
        <NextLink
          href="/patients"
          className="text-muted-foreground hover:text-foreground focus-visible:ring-ring/40 inline-flex w-fit items-center gap-1.5 rounded-sm text-sm transition-colors duration-[--duration-fast] focus-visible:outline-none focus-visible:ring-[3px]"
        >
          <ArrowLeft aria-hidden="true" className="size-4" />
          Patients
        </NextLink>
        <div className="flex flex-wrap items-center gap-3">
          <Typography as="h1" size="2xl" weight="semibold">
            {patient.pseudonym}
          </Typography>
          <Badge
            variant={patientStatusIntents[patient.status]}
            tone="subtle"
            size="sm"
          >
            {patientStatusLabels[patient.status]}
          </Badge>
        </div>
        <Typography size="sm" tone="muted">
          {[
            patient.fullName,
            age !== null ? `${age} ans` : null,
            patient.sex !== "unspecified"
              ? patientSexLabels[patient.sex]
              : null,
            patient.heightCm ? `${patient.heightCm} cm` : null,
            patient.weightKg ? `${patient.weightKg} kg` : null,
          ]
            .filter((part) => part !== null && part !== "")
            .join(" · ") || "Profil à compléter"}
        </Typography>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lien patient</CardTitle>
          <CardDescription>
            Leur vue du profil et des recommandations — pour la personne suivie,
            et pour les consultantes et consultants qui testent
            l&apos;interface.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ShareLinkCard
            patientId={patient.id}
            url={shareUrl}
            email={patient.email}
            lastOpenedAt={patient.linkLastOpenedAt}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Recommandations</CardTitle>
          <CardDescription>
            Le protocole, encodé entrée par entrée — c&apos;est ce que montre le
            lien patient.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-6">
          {recommendations.length === 0 ? (
            <Typography size="sm" tone="muted">
              Rien d&apos;encodé pour le moment.
            </Typography>
          ) : (
            <RecommendationGroups recommendations={recommendations} />
          )}

          <RecommendationAddForm patientId={patient.id} />
        </CardContent>
      </Card>

      {archived.length > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>Recommandations archivées</CardTitle>
            <CardDescription>
              Ce qui a été suivi puis arrêté. Invisible sur le lien patient,
              gardé pour la suite du dossier.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <RecommendationGroups recommendations={archived} />
          </CardContent>
        </Card>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle>Essentiels placard / frigo</CardTitle>
          <CardDescription>
            La courte liste d&apos;aliments à avoir sous la main, avec le
            pourquoi de chacun — pour cette personne.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-6">
          {essentials.length === 0 ? (
            <Typography size="sm" tone="muted">
              Aucun essentiel pour le moment.
            </Typography>
          ) : (
            <PantryList essentials={essentials} />
          )}

          <PantryAddForm patientId={patient.id} />
        </CardContent>
      </Card>

      {archivedEssentials.length > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>Essentiels archivés</CardTitle>
            <CardDescription>
              Ce qui est sorti de la liste lors d&apos;une mise à jour. Gardé
              pour la suite du dossier.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <PantryList essentials={archivedEssentials} />
          </CardContent>
        </Card>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle>Recettes</CardTitle>
          <CardDescription>
            Les recettes que cette personne a en ce moment, avec le mot qui va
            avec chacune. Elles s&apos;écrivent une fois dans « Recettes » et
            s&apos;attribuent ici.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-6">
          {assignedRecipes.length === 0 ? (
            <Typography size="sm" tone="muted">
              Aucune recette attribuée pour le moment.
            </Typography>
          ) : (
            <RecipeAssignments entries={assignedRecipes} />
          )}

          <AssignRecipeForm
            patientId={patient.id}
            recipes={library}
            today={today}
          />
        </CardContent>
      </Card>

      {pastRecipes.length > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>Recettes précédentes</CardTitle>
            <CardDescription>
              Ce qui est sorti du lot au fil des semaines, avec sa date.
              C&apos;est l&apos;historique des adaptations, pas une corbeille.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <RecipeAssignments entries={pastRecipes} />
          </CardContent>
        </Card>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle>Consultations</CardTitle>
          <CardDescription>
            Vos notes de séance, de la plus récente à la plus ancienne. Elles ne
            s&apos;affichent jamais sur le lien patient.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <NoteTimeline patientId={patient.id} notes={notes} today={today} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Anamnèse</CardTitle>
          <CardDescription>
            Le terrain, catégorie par catégorie. Ce que vous n&apos;avez pas
            encore exploré reste visiblement vide. Ne s&apos;affiche jamais sur
            le lien patient.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AnamnesisBlock patientId={patient.id} entries={anamnesis} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Profil</CardTitle>
          <CardDescription>
            Le tableau de fond contre lequel les recommandations et les recettes
            sont personnalisées, et le consentement recueilli pour le tenir.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <PatientForm patient={patient} />
        </CardContent>
      </Card>

      <Card variant="error">
        <CardHeader>
          <CardTitle>Zone sensible</CardTitle>
          <CardDescription>
            La suppression retire le profil, ses recommandations, ses
            essentiels, ses notes, son anamnèse, ses recettes attribuées et le
            lien patient — définitivement. Les recettes elles-mêmes restent dans
            la bibliothèque.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DeletePatient patientId={patient.id} pseudonym={patient.pseudonym} />
        </CardContent>
      </Card>
    </div>
  );
};

export default PatientDetail;
