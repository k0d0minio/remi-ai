"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  patientSegments,
  segmentLabels,
  type PatientSegment,
} from "@/components/patients/vocabulary";

/** One entry in the section registry — every rendered section on the page. */
export type PatientSectionEntry = {
  /** Anchor id on the section wrapper; must exist in the DOM. */
  id: string;
  /** French label, shown in the index and used for the scroll target. */
  label: string;
  /** Which phone segment the section lives under. */
  segment: PatientSegment;
  /** How many items the section holds, shown on the desktop index. */
  count?: number;
};

type Props = {
  sections: readonly PatientSectionEntry[];
};

const isPatientSegment = (value: string | null): value is PatientSegment =>
  (patientSegments as readonly string[]).includes(value ?? "");

const ROOT_ID = "patient-page";
const rootSegment = () =>
  document.getElementById(ROOT_ID)?.getAttribute("data-segment") ?? "suivi";
const scrollTo = (id: string) => {
  document.getElementById(id)?.scrollIntoView({
    behavior: "smooth",
    block: "start",
  });
};

/**
 * The patient page's two navigation modes, one component.
 *
 * On desktop a sticky section index sits in the right rail — every section,
 * working view first, with its count, the current one marked as she scrolls. On
 * phone it becomes the segmented control (Suivi · Journal · Dossier · Profil):
 * switching a segment writes it to the URL (`?segment=…`, so a link lands on it
 * and back-navigation restores it) and flips a `data-segment` attribute on the
 * page root that CSS turns into show/hide per span. One DOM order, three views
 * — this is the client that drives two of them.
 */
export const PatientNavigation = ({ sections }: Props) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const segmentParam = searchParams.get("segment");
  const segment = isPatientSegment(segmentParam) ? segmentParam : "suivi";

  const [activeId, setActiveId] = useState(sections[0]?.id ?? "");

  // The phone layout's show/hide is pure CSS on the root's data-segment, so
  // reflect the URL there before any interaction on Morgane's side.
  useEffect(() => {
    document.getElementById(ROOT_ID)?.setAttribute("data-segment", segment);
  }, [segment]);

  // The current section, marked on the desktop index: the section whose top
  // crosses the reading line wins, and hidden sections never intersect.
  useEffect(() => {
    if (typeof IntersectionObserver === "undefined") {
      return;
    }
    const seen = new Map<Element, string>();
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            seen.set(entry.target, entry.target.id);
          } else {
            seen.delete(entry.target);
          }
        }
        const last = [...seen.values()].pop();
        if (last) {
          setActiveId(last);
        }
      },
      { rootMargin: "-112px 0px -70% 0px" },
    );
    for (const section of sections) {
      const el = document.getElementById(section.id);
      if (el) {
        observer.observe(el);
      }
    }
    return () => observer.disconnect();
  }, [sections]);

  const setSegment = (next: PatientSegment) => {
    document.getElementById(ROOT_ID)?.setAttribute("data-segment", next);
    router.replace(`${pathname}?segment=${next}`);
  };

  return (
    <>
      {/* The segmented control — phone only. */}
      <nav
        aria-label="Sections du dossier"
        className="bg-muted text-muted-foreground flex rounded-lg p-1 md:hidden"
        role="tablist"
      >
        {patientSegments.map((value) => {
          const selected = value === segment;
          return (
            <button
              key={value}
              type="button"
              role="tab"
              aria-selected={selected}
              onClick={() => setSegment(value)}
              className={`flex-1 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                selected
                  ? "bg-card text-foreground shadow-sm"
                  : "hover:text-foreground"
              }`}
            >
              {segmentLabels[value]}
            </button>
          );
        })}
      </nav>

      {/* The section index — desktop only. */}
      <aside className="hidden w-56 shrink-0 lg:order-2 lg:block">
        <nav
          aria-label="Sections de la page"
          className="bg-card border-border sticky top-14 flex flex-col gap-1 rounded-lg border p-3"
        >
          <p className="text-muted-foreground px-2 pb-1 text-xs font-medium uppercase tracking-wide">
            Sections
          </p>
          {sections.map((section) => {
            const active = section.id === activeId;
            return (
              <button
                key={section.id}
                type="button"
                onClick={() => {
                  setActiveId(section.id);
                  scrollTo(section.id);
                }}
                aria-current={active ? "true" : undefined}
                className={`flex w-full items-center justify-between gap-2 rounded-md px-2 py-1.5 text-left text-sm transition-colors ${
                  active
                    ? "bg-accent text-accent-foreground font-medium"
                    : "text-muted-foreground hover:bg-accent/50 hover:text-foreground"
                }`}
              >
                <span className="truncate">{section.label}</span>
                {section.count !== undefined ? (
                  <span className="text-xs tabular-nums opacity-70">
                    {section.count}
                  </span>
                ) : null}
              </button>
            );
          })}
        </nav>
      </aside>
    </>
  );
};

/** The page wraps the navigation in Suspense — `useSearchParams` needs it. */
export { rootSegment, scrollTo };
