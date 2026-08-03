"use client";

import { Ban, Plus, Sparkles, Star } from "lucide-react";
import { useState } from "react";
import type { FramePrinciple } from "@remi/services/shared";
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
import type { Content } from "@/lib/content/types";

type Props = {
  principles: readonly FramePrinciple[];
  excluded: readonly string[];
  emphasised: readonly string[];
  content: Content["frame"];
};

/**
 * The frame as a set of switches rather than a text box.
 *
 * A prose "about my practice" field would be a prompt, and a prompt is not a
 * boundary. Each précepte is on or off, and the excluded list is absolute —
 * which is what makes "REMI works inside your frame" a claim the practitioner
 * can actually check.
 *
 * A client island because of the switches, and nothing else: the page around it
 * stays on the server, and the frame itself is read there.
 */
export const FrameEditor = ({
  principles,
  excluded,
  emphasised,
  content,
}: Props) => {
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
            {content.principles.title}
          </Typography>
          <Badge variant="info" tone="subtle" size="sm">
            {activeCount} {content.principles.active}
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
              {content.excluded.title}
            </CardTitle>
            <CardDescription>{content.excluded.body}</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            {excluded.map((item) => (
              <Badge key={item} variant="error" tone="subtle" size="sm">
                {item}
              </Badge>
            ))}
            <Button variant="ghost" size="sm">
              <Plus aria-hidden="true" />
              {content.add}
            </Button>
          </CardContent>
        </Card>

        <Card variant="success" elevation="flat">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Star aria-hidden="true" className="size-4" />
              {content.emphasised.title}
            </CardTitle>
            <CardDescription>{content.emphasised.body}</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            {emphasised.map((item) => (
              <Badge key={item} variant="success" tone="subtle" size="sm">
                {item}
              </Badge>
            ))}
            <Button variant="ghost" size="sm">
              <Plus aria-hidden="true" />
              {content.add}
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-end">
        <Button>
          <Sparkles aria-hidden="true" />
          {content.save}
        </Button>
      </div>
    </div>
  );
};
