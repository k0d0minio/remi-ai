"use client";

import { Ban, Plus, Sparkles, Star } from "lucide-react";
import { useState } from "react";
import { Button, Switch } from "@remi/ui";
import {
  Badge,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Typography,
} from "@remi/ui/server";
import { emphasised, excluded, principles } from "@/lib/mock/frame";

/**
 * The frame as a set of switches rather than a text box.
 *
 * A prose "about my practice" field would be a prompt, and a prompt is not a
 * boundary. Each principle is on or off, and the excluded list is absolute —
 * which is what makes "REMI travaille dans votre cadre" a claim the practitioner
 * can actually check.
 */
export const FrameEditor = () => {
  const [active, setActive] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(
      principles.map((principle) => [principle.id, principle.active]),
    ),
  );

  const activeCount = Object.values(active).filter(Boolean).length;

  return (
    <div className="flex flex-col gap-6">
      <section className="flex flex-col gap-3">
        <div className="flex items-center justify-between gap-4">
          <Typography as="h2" size="lg" weight="semibold">
            Préceptes
          </Typography>
          <Badge variant="info" tone="subtle" size="sm">
            {activeCount} actifs
          </Badge>
        </div>

        <ul className="flex flex-col gap-2">
          {principles.map((principle) => (
            <li
              key={principle.id}
              className="border-border flex items-start justify-between gap-4 rounded-lg border p-4"
            >
              <div className="flex flex-col gap-1">
                <Typography as="span" size="sm" weight="medium">
                  {principle.title}
                </Typography>
                <Typography size="sm" tone="muted">
                  {principle.detail}
                </Typography>
              </div>
              <Switch
                checked={active[principle.id]}
                onCheckedChange={() =>
                  setActive((current) => ({
                    ...current,
                    [principle.id]: !current[principle.id],
                  }))
                }
                aria-label={principle.title}
              />
            </li>
          ))}
        </ul>
      </section>

      <div className="grid gap-4 md:grid-cols-2">
        <Card variant="error" elevation="flat">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Ban aria-hidden="true" className="size-4" />
              Jamais proposé
            </CardTitle>
            <CardDescription>
              Une règle absolue, pour toutes les personnes que vous accompagnez.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            {excluded.map((item) => (
              <Badge key={item} variant="error" tone="subtle" size="sm">
                {item}
              </Badge>
            ))}
            <Button variant="ghost" size="sm">
              <Plus aria-hidden="true" />
              Ajouter
            </Button>
          </CardContent>
        </Card>

        <Card variant="success" elevation="flat">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Star aria-hidden="true" className="size-4" />
              Privilégié
            </CardTitle>
            <CardDescription>
              Une préférence : REMI y va en premier quand le choix existe.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            {emphasised.map((item) => (
              <Badge key={item} variant="success" tone="subtle" size="sm">
                {item}
              </Badge>
            ))}
            <Button variant="ghost" size="sm">
              <Plus aria-hidden="true" />
              Ajouter
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-end">
        <Button>
          <Sparkles aria-hidden="true" />
          Enregistrer le cadre
        </Button>
      </div>
    </div>
  );
};
