import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getMealShareSetting } from "@remi/services/server";
import { formatDateTime } from "@remi/services/shared";
import {
  Alert,
  AlertDescription,
  AlertTitle,
  Typography,
} from "@remi/ui/server";
import { MealShareEditor } from "@/components/meal-shares/meal-share-editor";
import { requireOperator } from "@/lib/auth/session";
import { ensureDatabase } from "@/lib/database";

export const metadata: Metadata = {
  title: "Parts des repas",
};

/** Reads the database on every hit. */
export const dynamic = "force-dynamic";

/**
 * The table of the meal shares (REM-197): for each meal and each orientation,
 * the part of the day's energy and of the day's protein. A console account
 * reads it and corrects it. The table holds no patient data.
 *
 * The service checks the role again and writes the audit event of a change.
 */
const MealShares = async () => {
  const operator = await requireOperator();
  ensureDatabase();
  const setting = await getMealShareSetting(operator);
  if (!setting.ok) {
    notFound();
  }
  const { table, source, setByName, setAt, storedValueRefused } = setting.data;

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-8">
      <div className="flex flex-col gap-1">
        <Typography as="h1" size="2xl" weight="semibold">
          Parts des repas
        </Typography>
        <Typography size="sm" tone="muted">
          Le protocole validé donne des objectifs pour la journée entière.
          Cette table indique quelle part de l&apos;énergie et des protéines
          de la journée chaque repas porte, selon son orientation. REMI
          l&apos;utilise pour donner à chaque repas son objectif. Elle
          s&apos;applique à tous les dossiers.
        </Typography>
        <Typography size="sm" tone="muted">
          Une part est un poids, pas un quota strict. Quand un repas est
          désactivé ou supprimé par le jeûne intermittent, sa part passe aux
          autres repas en proportion, et la somme des repas reste égale aux
          objectifs de la journée.
        </Typography>
      </div>

      {storedValueRefused ? (
        <Alert variant="warning">
          <AlertTitle>La table enregistrée n&apos;est pas lisible</AlertTitle>
          <AlertDescription>
            REMI utilise les valeurs par défaut. Enregistrez une table
            corrigée pour la remplacer.
          </AlertDescription>
        </Alert>
      ) : null}

      <MealShareEditor
        table={table}
        source={source}
        setByName={setByName}
        setAtLabel={setAt ? formatDateTime(setAt) : null}
      />
    </div>
  );
};

export default MealShares;
