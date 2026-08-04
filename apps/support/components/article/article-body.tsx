import {
  AlertTriangle,
  ArrowUpRight,
  Ban,
  Check,
  CircleCheck,
  Info,
  Minus,
} from "lucide-react";
import type { ComponentType } from "react";
import type { Locale } from "@remi/services/shared";
import {
  Alert,
  AlertDescription,
  AlertTitle,
  Card,
  Link,
  Typography,
} from "@remi/ui/server";
import { cn } from "@remi/ui/utils";
import { externalHref } from "@/lib/links";
import type {
  ArticleBlock,
  ArticleColumn,
  NoteIntent,
} from "@/lib/content/types";

type Props = {
  blocks: ArticleBlock[];
  locale: Locale;
};

/** Which alert an intent draws, and the icon that opens it. */
const noteStyle: Record<
  NoteIntent,
  {
    variant: "info" | "warning" | "neutral" | "success";
    icon: ComponentType<{ className?: string }>;
  }
> = {
  info: { variant: "info", icon: Info },
  warning: { variant: "warning", icon: AlertTriangle },
  neutral: { variant: "neutral", icon: Info },
  success: { variant: "success", icon: CircleCheck },
};

/** A column's marker says which side of the comparison it is without reading it. */
const columnMarker: Record<
  ArticleColumn["intent"],
  ComponentType<{ className?: string }>
> = {
  success: Check,
  error: Ban,
  info: Check,
  neutral: Minus,
};

const columnTone: Record<ArticleColumn["intent"], string> = {
  success: "text-success-text",
  error: "text-error-text",
  info: "text-info-text",
  neutral: "text-muted-foreground",
};

const Bullets = ({ items }: { items: string[] }) => (
  <ul className="flex flex-col gap-2.5">
    {items.map((item) => (
      <li key={item} className="flex items-start gap-3">
        <span
          aria-hidden="true"
          className="bg-primary/40 mt-2.5 size-1.5 shrink-0 rounded-full"
        />
        <Typography as="span">{item}</Typography>
      </li>
    ))}
  </ul>
);

/**
 * Renders an article from its blocks. There is no markdown parser here on
 * purpose: the block union is closed, so the only things that can appear on a
 * page are the ones this file knows how to draw, and an article cannot ship a
 * shape nobody designed.
 *
 * A server component throughout — an article is markup, and markup should not
 * cost the reader bytes of JavaScript.
 */
export const ArticleBody = ({ blocks, locale }: Props) => (
  <div className="flex flex-col gap-6">
    {blocks.map((block, index) => {
      switch (block.kind) {
        case "heading": {
          return (
            <Typography
              key={block.id}
              as="h2"
              id={block.id}
              variant="display"
              size="3xl"
              balance
              /* Clears the sticky header when the contents list jumps here. */
              className="scroll-mt-24 pt-4"
            >
              {block.text}
            </Typography>
          );
        }

        case "paragraph": {
          return (
            <Typography key={index} className="leading-relaxed">
              {block.text}
            </Typography>
          );
        }

        case "list": {
          return <Bullets key={index} items={block.items} />;
        }

        case "steps": {
          return (
            <ol key={index} className="flex flex-col gap-5">
              {block.items.map((item, step) => (
                <li key={item.title} className="flex items-start gap-4">
                  <span
                    aria-hidden="true"
                    className="border-primary-border bg-primary-subtle text-primary flex size-7 shrink-0 items-center justify-center rounded-full border text-sm font-medium tabular-nums"
                  >
                    {step + 1}
                  </span>
                  <div className="flex flex-col gap-1">
                    <Typography as="h3" weight="semibold">
                      {item.title}
                    </Typography>
                    <Typography tone="muted" className="leading-relaxed">
                      {item.body}
                    </Typography>
                  </div>
                </li>
              ))}
            </ol>
          );
        }

        case "columns": {
          return (
            <div key={index} className="grid gap-4 sm:grid-cols-2">
              {block.columns.map((column) => {
                const Marker = columnMarker[column.intent];

                return (
                  <Card
                    key={column.title}
                    elevation="flat"
                    variant={column.intent}
                    className="h-full gap-4"
                  >
                    <div className="px-6">
                      <Typography as="h3" size="sm" weight="semibold">
                        {column.title}
                      </Typography>
                    </div>

                    <ul className="flex flex-col gap-3 px-6">
                      {column.items.map((item) => (
                        <li key={item} className="flex items-start gap-2.5">
                          <Marker
                            aria-hidden="true"
                            className={cn(
                              "mt-0.5 size-4 shrink-0",
                              columnTone[column.intent],
                            )}
                          />
                          <Typography as="span" size="sm">
                            {item}
                          </Typography>
                        </li>
                      ))}
                    </ul>
                  </Card>
                );
              })}
            </div>
          );
        }

        case "note": {
          const { variant, icon: Icon } = noteStyle[block.intent];

          return (
            <Alert key={index} variant={variant}>
              <Icon aria-hidden="true" />
              <AlertTitle>{block.title}</AlertTitle>
              <AlertDescription>
                <Typography size="sm" className="leading-relaxed">
                  {block.body}
                </Typography>
              </AlertDescription>
            </Alert>
          );
        }

        case "action": {
          return (
            <div key={index} className="flex flex-col items-start gap-2">
              <Typography className="leading-relaxed">{block.body}</Typography>
              <Link
                href={externalHref(locale, block.link)}
                variant="standalone"
              >
                {block.link.label}
                <ArrowUpRight aria-hidden="true" />
              </Link>
            </div>
          );
        }
      }
    })}
  </div>
);
