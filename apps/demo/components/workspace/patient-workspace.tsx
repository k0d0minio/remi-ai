"use client";

import { ChevronDown, Plus } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  Button,
  CopyButton,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@remi/ui";
import { Badge, Container, Typography } from "@remi/ui/server";
import { cn } from "@remi/ui/utils";
import type {
  ClientStatus,
  GlanceItem,
  WorkspaceSegment,
} from "@/lib/mock/types";
import type { RenderedSection } from "@/components/workspace/workspace-sections";
import { addActions, segmentLabels, segmentOrder } from "@/lib/mock/workspace";

type Props = {
  patient: {
    pseudonym: string;
    fullName: string;
    status: ClientStatus;
    statusLabel: string;
    identity: string;
    linkUrl: string;
  };
  glance: GlanceItem[];
  /** Read from `?vue=` on the server, so a shared link lands on its segment. */
  initialSegment: WorkspaceSegment;
  sections: RenderedSection[];
};

const statusIntents: Record<ClientStatus, "success" | "info" | "neutral"> = {
  active: "success",
  invited: "info",
  paused: "neutral",
};

const isSegment = (value: string | null): value is WorkspaceSegment =>
  value !== null && segmentOrder.includes(value as WorkspaceSegment);

/**
 * The patient page's three views over one tree.
 *
 * The sections are rendered once, on the server, in one DOM order, and handed
 * to this island as nodes. Nothing here re-renders a section for a second
 * screen size: `lg` places the same list in a work column beside a sticky rail,
 * `md` stacks it under a scrolling anchor row, and a phone shows one segment of
 * it at a time. What changes between the three is placement and visibility —
 * never content (decision #2).
 *
 * The one piece of state that cannot be CSS is the phone segment, and it lives
 * in the URL: a link lands on its segment, the back button restores the
 * previous one, and `history.pushState` keeps the switch free of a round trip.
 */
export const PatientWorkspace = ({
  patient,
  glance,
  initialSegment,
  sections,
}: Props) => {
  const [segment, setSegment] = useState<WorkspaceSegment>(initialSegment);
  const [briefOpen, setBriefOpen] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  const [current, setCurrent] = useState<string | null>(null);
  const workColumn = useRef<HTMLDivElement>(null);

  // Back and forward have to move the segment, or the URL is decoration.
  useEffect(() => {
    const onPopState = () => {
      const next = new URLSearchParams(window.location.search).get("vue");
      setSegment(isSegment(next) ? next : "suivi");
    };

    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

  // The index marks where the reader is (R10). Observing the sections is what
  // makes it a location rather than a list of links.
  useEffect(() => {
    const nodes = workColumn.current?.querySelectorAll("[data-section]");
    if (!nodes || nodes.length === 0) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((entry) => entry.isIntersecting);
        if (visible.length > 0) {
          setCurrent(visible[0].target.getAttribute("data-section"));
        }
      },
      { rootMargin: "-25% 0px -65% 0px" },
    );

    nodes.forEach((node) => observer.observe(node));
    return () => observer.disconnect();
  }, [segment]);

  const goToSegment = useCallback((next: WorkspaceSegment) => {
    setSegment(next);
    const url = new URL(window.location.href);
    url.searchParams.set("vue", next);
    window.history.pushState(null, "", url);
    window.scrollTo({ top: 0 });
  }, []);

  return (
    <div className="flex flex-col">
      {/* The identification strip, kept above every view (R29). One row from
          `md` up; two lines on a phone, where a third would be a third of the
          screen (R25). */}
      <header className="border-border bg-background/95 h-18 sticky top-14 z-20 -mx-4 flex flex-col justify-center gap-1 border-b px-4 backdrop-blur-md md:top-0 md:-mx-8 md:h-16 md:flex-row md:items-center md:gap-4 md:px-8">
        <div className="flex min-w-0 flex-wrap items-center gap-x-3 gap-y-1">
          <Typography as="h1" size="lg" weight="semibold" className="truncate">
            {patient.pseudonym}
          </Typography>
          <Badge
            variant={statusIntents[patient.status]}
            tone="subtle"
            size="sm"
          >
            {patient.statusLabel}
          </Badge>
          <Typography
            as="span"
            size="sm"
            tone="muted"
            className="truncate max-md:w-full"
          >
            {patient.fullName} · {patient.identity}
          </Typography>
        </div>

        <div className="flex shrink-0 items-center gap-2 md:ml-auto">
          <CopyButton
            value={`https://${patient.linkUrl}`}
            label="Copier le lien"
            copiedLabel="Copié"
            className="max-md:hidden"
          />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="sm" className="max-md:hidden">
                <Plus aria-hidden="true" />
                Ajouter
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Ajouter au dossier</DropdownMenuLabel>
              {addActions.map((action) => (
                <DropdownMenuItem key={action.id}>
                  {action.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      {/* The phone's navigation: five segments at most (R11), each in the URL. */}
      <nav
        aria-label="Vue du dossier"
        className="border-border bg-background sticky top-32 z-10 -mx-4 flex gap-1 overflow-x-auto border-b px-4 py-2 md:hidden"
      >
        {segmentOrder.map((option) => (
          <button
            key={option}
            type="button"
            onClick={() => goToSegment(option)}
            aria-current={option === segment ? "page" : undefined}
            className={cn(
              "focus-visible:ring-ring/40 min-h-11 shrink-0 rounded-md px-3 text-sm font-medium transition-colors duration-[--duration-fast] focus-visible:outline-none focus-visible:ring-[3px]",
              option === segment
                ? "bg-primary-subtle text-primary"
                : "text-muted-foreground hover:bg-accent",
            )}
          >
            {segmentLabels[option]}
          </button>
        ))}
      </nav>

      <Container
        size="wide"
        gutter={false}
        className="grid gap-6 py-6 lg:grid-cols-[minmax(0,1fr)_20rem] lg:gap-8"
      >
        {/* One element, three jobs: the sticky rail at `lg`, the anchor row
            plus an "En bref" fold at `md`, and the "En bref" segment on a
            phone. Placed by CSS rather than rendered three times. */}
        <aside
          className={cn(
            "flex flex-col gap-4 lg:sticky lg:top-20 lg:col-start-2 lg:row-start-1 lg:self-start",
            segment !== "brief" && "max-md:hidden",
          )}
        >
          <nav
            aria-label="Sections du dossier"
            className="max-md:hidden md:-mx-1 md:overflow-x-auto md:px-1 md:pb-1 lg:mx-0 lg:overflow-visible lg:px-0 lg:pb-0"
          >
            <ul className="flex gap-1 lg:flex-col">
              {sections.map((section) => (
                <li key={section.id}>
                  <a
                    href={`#${section.id}`}
                    aria-current={current === section.id ? "true" : undefined}
                    className={cn(
                      "focus-visible:ring-ring/40 flex shrink-0 items-center gap-2 whitespace-nowrap rounded-md px-2 py-1.5 text-sm transition-colors duration-[--duration-fast] focus-visible:outline-none focus-visible:ring-[3px] lg:whitespace-normal",
                      current === section.id
                        ? "bg-primary-subtle text-primary font-medium"
                        : "text-muted-foreground hover:bg-accent hover:text-foreground",
                    )}
                  >
                    <span className="min-w-0 lg:truncate">{section.label}</span>
                    {section.count !== null ? (
                      <span className="text-muted-foreground text-xs lg:ml-auto">
                        {section.count}
                      </span>
                    ) : null}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          {/* Only ever a control at `md`: at `lg` the rail is the page's second
              column and has nothing to fold, and on a phone "En bref" is a
              segment of its own. */}
          <button
            type="button"
            onClick={() => setBriefOpen((open) => !open)}
            aria-expanded={briefOpen}
            aria-controls="workspace-brief"
            className="border-border focus-visible:ring-ring/40 hidden min-h-11 items-center justify-between rounded-lg border px-3 text-sm font-medium focus-visible:outline-none focus-visible:ring-[3px] md:max-lg:flex"
          >
            En bref
            <ChevronDown
              aria-hidden="true"
              className={cn(
                "ease-standard size-4 transition-transform duration-[--duration-base]",
                briefOpen && "rotate-180",
              )}
            />
          </button>

          <div
            id="workspace-brief"
            className={cn(
              "border-border flex flex-col gap-3 rounded-lg border p-3",
              !briefOpen && "md:max-lg:hidden",
            )}
          >
            <Typography as="h2" size="xs" weight="medium" tone="muted">
              En bref
            </Typography>
            <dl className="flex flex-col gap-3">
              {glance.map((item) => (
                <div key={item.id} className="flex flex-col gap-0.5">
                  <Typography as="dt" size="xs" tone="muted">
                    {item.label}
                  </Typography>
                  <dd className="flex flex-wrap items-center gap-2">
                    <Typography as="span" size="sm" weight="medium">
                      {item.value}
                    </Typography>
                    {item.intent ? (
                      <Badge variant={item.intent} tone="subtle" size="sm">
                        {item.intent === "warning" || item.intent === "error"
                          ? "à voir"
                          : "ok"}
                      </Badge>
                    ) : null}
                  </dd>
                  {item.hint ? (
                    <Typography size="xs" tone="muted">
                      {item.hint}
                    </Typography>
                  ) : null}
                </div>
              ))}
            </dl>
          </div>
        </aside>

        <div
          ref={workColumn}
          className="flex min-w-0 flex-col gap-6 pb-24 md:gap-8 md:pb-8 lg:col-start-1 lg:row-start-1"
        >
          {sections.map((section) => (
            <section
              key={section.id}
              id={section.id}
              data-section={section.id}
              aria-labelledby={`${section.id}-title`}
              className={cn(
                // The sticky banner and anchor row must never sit on top of
                // the heading a reader just jumped to (R10, R28).
                "scroll-mt-48 md:scroll-mt-20 lg:scroll-mt-24",
                section.segment !== segment && "max-md:hidden",
              )}
            >
              {section.node}
            </section>
          ))}
        </div>
      </Container>

      {/* One pinned action, at the bottom, where a thumb is (R15, R23). It
          opens a sheet whose first step is what to add — the multi-field adds
          behind it earn a surface, a single-field one would not (R14). */}
      <div className="border-border bg-background/95 fixed inset-x-0 bottom-0 z-30 border-t p-3 backdrop-blur-md md:hidden">
        <Button
          type="button"
          className="min-h-11 w-full"
          onClick={() => setAddOpen(true)}
        >
          <Plus aria-hidden="true" />
          Ajouter
        </Button>
      </div>

      <Sheet open={addOpen} onOpenChange={setAddOpen}>
        <SheetContent side="bottom" className="max-h-[80dvh] overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Ajouter au dossier</SheetTitle>
            <SheetDescription>
              Ce que vous ajoutez le plus souvent en premier.
            </SheetDescription>
          </SheetHeader>
          <ul className="flex flex-col gap-1 p-4 pt-0">
            {addActions.map((action) => (
              <li key={action.id}>
                <button
                  type="button"
                  onClick={() => setAddOpen(false)}
                  className="hover:bg-accent focus-visible:ring-ring/40 flex min-h-11 w-full flex-col justify-center rounded-md px-3 py-2 text-left transition-colors duration-[--duration-fast] focus-visible:outline-none focus-visible:ring-[3px]"
                >
                  <Typography as="span" size="sm" weight="medium">
                    {action.label}
                  </Typography>
                  <Typography as="span" size="xs" tone="muted">
                    {action.hint}
                  </Typography>
                </button>
              </li>
            ))}
          </ul>
        </SheetContent>
      </Sheet>
    </div>
  );
};
