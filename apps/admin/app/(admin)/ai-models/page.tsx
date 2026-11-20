import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  failedChecks,
  listCatalogueModels,
  listRoleModels,
} from "@remi/services/server";
import { canManageOperators, formatDateTime } from "@remi/services/shared";
import {
  Alert,
  AlertDescription,
  AlertTitle,
  Typography,
} from "@remi/ui/server";
import { RoleModelList } from "@/components/ai-models/role-model-list";
import { NO_KEY_MESSAGE } from "@/components/ai-models/vocabulary";
import { aiReady } from "@/lib/ai";
import { requireOperator } from "@/lib/auth/session";
import { ensureDatabase } from "@/lib/database";

export const metadata: Metadata = {
  title: "Modèles d'IA",
};

/** Reads the database and the gateway's list on every hit. */
export const dynamic = "force-dynamic";

/**
 * The model of each AI role (Jamie, 2026-11-20). Admin only, and guarded here
 * as well as in each action and in the service. A practitioner who types the
 * address gets the not-found page: the page does not say that it exists.
 *
 * The current values come from the database, so they show when the gateway
 * cannot be reached. The list of the gateway is then absent, and a save is
 * refused.
 */
const AiModels = async () => {
  const operator = await requireOperator();
  if (!canManageOperators(operator.role)) {
    notFound();
  }
  ensureDatabase();
  const ready = aiReady();

  const [roles, catalogue] = await Promise.all([
    listRoleModels(operator),
    listCatalogueModels(operator),
  ]);
  if (!roles.ok || !catalogue.ok) {
    notFound();
  }

  const models =
    catalogue.data?.map((model) => {
      const failed = failedChecks(model);
      return {
        id: model.id,
        name: model.name,
        zdr: model.zdr,
        failed,
        selectable: model.type === "language" && failed.length === 0,
      };
    }) ?? null;

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-8">
      <div className="flex flex-col gap-1">
        <Typography as="h1" size="2xl" weight="semibold">
          Modèles d&apos;IA
        </Typography>
        <Typography size="sm" tone="muted">
          Le modèle que REMI utilise pour chaque rôle. Un changement
          s&apos;applique dès la demande suivante. Un modèle dont les
          fournisseurs peuvent entraîner leurs modèles sur les données est
          toujours refusé : les demandes contiennent des données de santé.
        </Typography>
      </div>

      {!ready ? (
        <Alert variant="warning">
          <AlertTitle>La passerelle d&apos;IA n&apos;est pas configurée</AlertTitle>
          <AlertDescription>{NO_KEY_MESSAGE}</AlertDescription>
        </Alert>
      ) : null}

      {ready && !models ? (
        <Alert variant="warning">
          <AlertTitle>La liste des modèles n&apos;est pas disponible</AlertTitle>
          <AlertDescription>
            La passerelle n&apos;a pas répondu. Les valeurs actuelles restent
            affichées, et l&apos;enregistrement est refusé tant que la liste
            ne revient pas. « Revenir à la valeur par défaut » reste possible.
          </AlertDescription>
        </Alert>
      ) : null}

      <RoleModelList
        roles={roles.data.map((row) => ({
          role: row.role,
          model: row.model,
          defaultModel: row.defaultModel,
          source: row.source,
          setByName: row.setByName,
          setAtLabel: row.setAt ? formatDateTime(row.setAt) : null,
        }))}
        models={models}
      />
    </div>
  );
};

export default AiModels;
