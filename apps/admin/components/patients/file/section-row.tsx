"use client";

import { ChevronDown } from "lucide-react";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { flushSync } from "react-dom";
import { Typography } from "@remi/ui/server";
import { cn } from "@remi/ui/utils";

/**
 * A script asks a folded row to open with this event. The detail is the id of
 * the row, or of an element inside the row.
 */
export const OPEN_SECTION_EVENT = "patient-section:open";

type Props = {
  /** The anchor of the section. The index and the quick actions scroll to it. */
  id: string;
  title: string;
  /** One line: a count or a short state. */
  summary: string;
  /** The section holds nothing: the row is one quiet line. */
  quiet: boolean;
  description: string;
  children: ReactNode;
};

/**
 * One folded section of the patient file: its name and one line, and it opens
 * in place. The body stays mounted while the row is closed, so a form that is
 * open inside keeps its text. A link to an anchor inside a closed row opens
 * the row first, then scrolls: a hidden element has no position to scroll to.
 */
export const SectionRow = ({
  id,
  title,
  summary,
  quiet,
  description,
  children,
}: Props) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const reveal = (target: string, scroll: boolean) => {
      if (target === "") {
        return;
      }
      const element = document.getElementById(target);
      if (!element || !ref.current || !ref.current.contains(element)) {
        return;
      }
      flushSync(() => setOpen(true));
      if (scroll) {
        element.scrollIntoView({ block: "start" });
      }
    };
    const fromHash = () =>
      reveal(decodeURIComponent(window.location.hash.slice(1)), true);
    const onClick = (event: MouseEvent) => {
      const link =
        event.target instanceof Element
          ? event.target.closest('a[href^="#"]')
          : null;
      const href = link?.getAttribute("href");
      if (href) {
        reveal(decodeURIComponent(href.slice(1)), false);
      }
    };
    const onOpen = (event: Event) => {
      if (event instanceof CustomEvent && typeof event.detail === "string") {
        reveal(event.detail, false);
      }
    };
    // A link from another page lands with the hash already set.
    const frame = window.requestAnimationFrame(fromHash);
    window.addEventListener("hashchange", fromHash);
    window.addEventListener(OPEN_SECTION_EVENT, onOpen);
    // Capture: the row opens before the browser follows the link, so the
    // browser finds the anchor in the layout.
    document.addEventListener("click", onClick, true);
    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener("hashchange", fromHash);
      window.removeEventListener(OPEN_SECTION_EVENT, onOpen);
      document.removeEventListener("click", onClick, true);
    };
  }, []);

  return (
    <section ref={ref} id={id} className="scroll-mt-60">
      <button
        type="button"
        aria-expanded={open}
        aria-controls={`${id}-panel`}
        onClick={() => setOpen((value) => !value)}
        className="hover:bg-accent/50 focus-visible:ring-ring flex min-h-11 w-full items-center gap-3 px-4 py-2 text-left transition-colors focus-visible:outline-none focus-visible:ring-[3px]"
      >
        <span className="flex min-w-0 flex-1 flex-col sm:flex-row sm:items-baseline sm:gap-3">
          <Typography
            as="span"
            size="sm"
            weight={quiet ? "normal" : "medium"}
            tone={quiet ? "muted" : "default"}
            className="sm:shrink-0"
          >
            {title}
          </Typography>
          <Typography
            as="span"
            size="sm"
            tone="muted"
            className="min-w-0 truncate"
          >
            {summary}
          </Typography>
        </span>
        <ChevronDown
          aria-hidden="true"
          className={cn(
            "text-muted-foreground size-4 shrink-0 transition-transform",
            open ? "rotate-180" : "",
          )}
        />
      </button>
      <div
        id={`${id}-panel`}
        className={open ? "flex flex-col gap-6 px-4 pb-4 pt-1" : "hidden"}
      >
        <Typography size="sm" tone="muted">
          {description}
        </Typography>
        {children}
      </div>
    </section>
  );
};
