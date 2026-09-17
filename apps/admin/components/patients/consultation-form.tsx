"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import NextLink from "next/link";
import { useRouter } from "next/navigation";
import type { PatientGoal, PatientGoalCheckIn } from "@remi/services/shared";
import { goalDirections } from "@remi/services/shared";
import {
  Button,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@remi/ui";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Field,
  Input,
  Textarea,
  Typography,
} from "@remi/ui/server";
import {
  recordConsultationAction,
  type ConsultationFormState,
} from "@/lib/patients/actions";
import { goalDirectionLabels } from "@/components/patients/vocabulary";

/** Radix refuses `""` as an item value, so "no direction" needs its own token. */
const NONE = "none";

/** One goal as this screen needs it: the goal, and what she is moving from. */
export type ConsultationGoal = {
  goal: PatientGoal;
  lastCheckIn: PatientGoalCheckIn | null;
};

type Props = {
  patientId: string;
  pseudonym: string;
  today: string;
  goals: readonly ConsultationGoal[];
  instruction: string;
  summary: string;
  nextConsultationPrep: string;
  /** Where the three "Agir" links go — built server-side from the section ids. */
  protocolLinks: readonly { label: string; href: string }[];
};

type CheckInDraft = { direction: string; measure: string; note: string };

type Draft = {
  occurredAt: string;
  title: string;
  body: string;
  checkIns: Record<string, CheckInDraft>;
  instruction: string;
  summary: string;
  nextConsultationPrep: string;
};

const initial: ConsultationFormState = { error: null, saved: false };

const draftKey = (patientId: string) => `remi:consultation:${patientId}`;

const emptyCheckIn: CheckInDraft = { direction: NONE, measure: "", note: "" };

/** Long enough that typing never queues a write per keystroke, short enough
 * that a tab closed mid-sentence loses at most the word in progress. */
const AUTOSAVE_DELAY_MS = 400;

/**
 * The "Nouvelle consultation" screen — Morgane's post-consultation write-up in
 * her own order (comprendre · décider · agir · suivre) and one save.
 *
 * Every field is kept in `localStorage` while she types and restored when the
 * screen reopens: the "Agir" links take her off this screen and back, and a
 * draft that held only the note would lose the check-ins she had already
 * entered. It is local on purpose — a closed tab is the failure this prevents,
 * and a beta does not need a drafts table to prevent it. It is cleared only
 * once the save has come back successful, never before.
 */
export const ConsultationForm = ({
  patientId,
  pseudonym,
  today,
  goals,
  instruction,
  summary,
  nextConsultationPrep,
  protocolLinks,
}: Props) => {
  const router = useRouter();
  const [state, formAction, pending] = useActionState(
    recordConsultationAction,
    initial,
  );

  const blank: Draft = {
    occurredAt: today,
    title: "",
    body: "",
    checkIns: Object.fromEntries(
      goals.map((entry) => [entry.goal.id, emptyCheckIn]),
    ),
    instruction,
    summary,
    nextConsultationPrep,
  };

  const [draft, setDraft] = useState<Draft>(blank);
  const [restored, setRestored] = useState(false);
  const pendingWrite = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Read on mount rather than in the initial state so the server-rendered
  // markup and the first client render agree; a restored draft seeded into the
  // first render would be a hydration mismatch. A stored draft always means
  // she typed — nothing is written until she does — so its presence is the
  // whole test for the notice.
  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(draftKey(patientId));
      if (!stored) {
        return;
      }
      const parsed = JSON.parse(stored) as Partial<Draft>;
      setDraft((current) => ({ ...current, ...parsed }));
      setRestored(true);
    } catch {
      // A malformed or unreadable draft is one she never sees again, not an
      // error on a screen she opened to write a note.
      window.localStorage.removeItem(draftKey(patientId));
    }
  }, [patientId]);

  useEffect(() => {
    if (state.saved) {
      window.localStorage.removeItem(draftKey(patientId));
      router.push(`/patients/${patientId}`);
    }
  }, [state.saved, patientId, router]);

  // Nothing queued survives the unmount — the pending write would land after
  // the store was cleared on a successful save and resurrect the draft.
  useEffect(
    () => () => {
      if (pendingWrite.current) {
        clearTimeout(pendingWrite.current);
      }
    },
    [],
  );

  const update = (patch: Partial<Draft>) => {
    const next = { ...draft, ...patch };
    setDraft(next);
    setRestored(false);
    if (pendingWrite.current) {
      clearTimeout(pendingWrite.current);
    }
    pendingWrite.current = setTimeout(() => {
      try {
        window.localStorage.setItem(draftKey(patientId), JSON.stringify(next));
      } catch {
        // A full or disabled store costs the safety net, not the save.
      }
    }, AUTOSAVE_DELAY_MS);
  };

  const updateCheckIn = (goalId: string, patch: Partial<CheckInDraft>) =>
    update({
      checkIns: {
        ...draft.checkIns,
        [goalId]: { ...(draft.checkIns[goalId] ?? emptyCheckIn), ...patch },
      },
    });

  const discard = () => {
    if (pendingWrite.current) {
      clearTimeout(pendingWrite.current);
    }
    setDraft(blank);
    setRestored(false);
    window.localStorage.removeItem(draftKey(patientId));
  };

  return (
    <form action={formAction} className="flex flex-col gap-6">
      <input type="hidden" name="patientId" value={patientId} />
      <input type="hidden" name="pseudonym" value={pseudonym} />

      {restored ? (
        <div className="border-border bg-muted/40 flex flex-wrap items-center justify-between gap-3 rounded-md border px-4 py-3">
          <Typography size="sm">
            Brouillon restauré — ce que vous aviez commencé à écrire.
          </Typography>
          <Button type="button" size="sm" variant="ghost" onClick={discard}>
            Repartir de zéro
          </Button>
        </div>
      ) : null}

      {/* 1 · Comprendre — the note. The one thing here with no other home. */}
      <Card>
        <CardHeader>
          <CardTitle>La consultation</CardTitle>
          <CardDescription>
            Vos notes, telles que vous les écrivez. Elles restent dans le
            dossier et ne partent jamais sur le lien patient.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="grid gap-4 sm:grid-cols-[12rem_1fr]">
            <Field id="consultation-date" label="Date">
              <Input
                id="consultation-date"
                name="occurredAt"
                type="date"
                required
                value={draft.occurredAt}
                onChange={(event) => update({ occurredAt: event.target.value })}
              />
            </Field>
            <Field id="consultation-title" label="Titre" optional>
              <Input
                id="consultation-title"
                name="title"
                maxLength={200}
                value={draft.title}
                onChange={(event) => update({ title: event.target.value })}
              />
            </Field>
          </div>
          <Field id="consultation-body" label="Notes">
            <Textarea
              id="consultation-body"
              name="body"
              rows={10}
              maxLength={20000}
              value={draft.body}
              onChange={(event) => update({ body: event.target.value })}
            />
          </Field>
        </CardContent>
      </Card>

      {/* 2 · Décider — the check-ins, the consigne, the résumé. */}
      <Card>
        <CardHeader>
          <CardTitle>Les objectifs</CardTitle>
          <CardDescription>
            Un point d&apos;étape par objectif. Laissez vide ce qui n&apos;a pas
            bougé — rien ne sera écrit.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-6">
          {goals.length === 0 ? (
            <Typography size="sm" tone="muted">
              Aucun objectif actif — ajoutez-en depuis la vue de travail.
            </Typography>
          ) : (
            goals.map((entry) => {
              const values = draft.checkIns[entry.goal.id] ?? emptyCheckIn;
              const last = entry.lastCheckIn;
              return (
                <div key={entry.goal.id} className="flex flex-col gap-3">
                  <input
                    type="hidden"
                    name="checkInGoalId"
                    value={entry.goal.id}
                  />
                  <div className="flex flex-col gap-0.5">
                    <Typography size="sm" weight="medium">
                      {entry.goal.title}
                    </Typography>
                    <Typography size="sm" tone="muted">
                      {last
                        ? `Dernier point : ${last.checkedOn}${
                            last.measure ? ` · ${last.measure}` : ""
                          }${
                            last.direction
                              ? ` · ${goalDirectionLabels[last.direction]}`
                              : ""
                          }`
                        : "Aucun point d'étape pour le moment."}
                    </Typography>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-[10rem_10rem_1fr]">
                    <Field
                      id={`direction-${entry.goal.id}`}
                      label="Évolution"
                      optional
                    >
                      <Select
                        name={`direction-${entry.goal.id}`}
                        value={values.direction}
                        onValueChange={(value) =>
                          updateCheckIn(entry.goal.id, { direction: value })
                        }
                      >
                        <SelectTrigger id={`direction-${entry.goal.id}`}>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value={NONE}>non précisé</SelectItem>
                          {goalDirections.map((direction) => (
                            <SelectItem key={direction} value={direction}>
                              {goalDirectionLabels[direction]}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </Field>
                    <Field
                      id={`measure-${entry.goal.id}`}
                      label="Mesure"
                      optional
                    >
                      <Input
                        id={`measure-${entry.goal.id}`}
                        name={`measure-${entry.goal.id}`}
                        maxLength={160}
                        value={values.measure}
                        onChange={(event) =>
                          updateCheckIn(entry.goal.id, {
                            measure: event.target.value,
                          })
                        }
                      />
                    </Field>
                    <Field id={`note-${entry.goal.id}`} label="Note" optional>
                      <Textarea
                        id={`note-${entry.goal.id}`}
                        name={`note-${entry.goal.id}`}
                        rows={2}
                        value={values.note}
                        onChange={(event) =>
                          updateCheckIn(entry.goal.id, {
                            note: event.target.value,
                          })
                        }
                      />
                    </Field>
                  </div>
                </div>
              );
            })
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>La consigne et le résumé</CardTitle>
          <CardDescription>
            Les deux textes sont préremplis avec ce qui est en vigueur. Une
            consigne modifiée remplace la précédente, qui reste consultable.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <Field
            id="consultation-instruction"
            label="Consigne du moment"
            optional
            hint="Vider le champ retire la consigne en cours."
          >
            <Textarea
              id="consultation-instruction"
              name="instruction"
              rows={3}
              maxLength={2000}
              value={draft.instruction}
              onChange={(event) => update({ instruction: event.target.value })}
            />
          </Field>
          <Field id="consultation-summary" label="Résumé vivant" optional>
            <Textarea
              id="consultation-summary"
              name="summary"
              rows={8}
              maxLength={8000}
              value={draft.summary}
              onChange={(event) => update({ summary: event.target.value })}
            />
          </Field>
        </CardContent>
      </Card>

      {/* 3 · Agir — links, not forms. Nothing here writes a protocol row. */}
      <Card>
        <CardHeader>
          <CardTitle>Le protocole</CardTitle>
          <CardDescription>
            Les recommandations, les compléments et les essentiels se modifient
            dans leurs sections. Ce que vous avez écrit ici est conservé.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          {protocolLinks.map((link) => (
            <NextLink
              key={link.href}
              href={link.href}
              className="border-border text-muted-foreground hover:bg-accent hover:text-foreground rounded-full border px-3 py-1 text-sm transition-colors"
            >
              {link.label}
            </NextLink>
          ))}
        </CardContent>
      </Card>

      {/* 4 · Suivre — what to prepare for next time. */}
      <Card>
        <CardHeader>
          <CardTitle>La prochaine fois</CardTitle>
          <CardDescription>
            {nextConsultationPrep
              ? `Ce que vous aviez préparé pour aujourd'hui : « ${nextConsultationPrep} »`
              : "Rien n'avait été préparé pour aujourd'hui."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Field
            id="consultation-prep"
            label="À préparer pour la prochaine consultation"
            optional
          >
            <Textarea
              id="consultation-prep"
              name="nextConsultationPrep"
              rows={3}
              maxLength={10000}
              value={draft.nextConsultationPrep}
              onChange={(event) =>
                update({ nextConsultationPrep: event.target.value })
              }
            />
          </Field>
        </CardContent>
      </Card>

      <div className="flex flex-wrap items-center gap-3">
        <Button type="submit" disabled={pending}>
          {pending ? "Enregistrement…" : "Enregistrer la consultation"}
        </Button>
        {/* Not "Annuler": it leaves the screen, it does not throw the draft
            away — that is what "Repartir de zéro" is for. */}
        <Button type="button" variant="ghost" asChild>
          <NextLink href={`/patients/${patientId}`}>Retour au patient</NextLink>
        </Button>
        {state.error ? (
          <Typography size="sm" className="text-error-text" role="alert">
            {state.error}
          </Typography>
        ) : null}
      </div>
    </form>
  );
};
