"use client";

import { X } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@remi/ui";
import { STICKY } from "@/lib/content/landing";

/**
 * The compact fixed button, phones only. It appears after the hero, hides
 * while the sign-up is on screen, and can be dismissed for the visit.
 */
export const StickyCta = () => {
  const [shown, setShown] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const hero = document.getElementById("top");
    const form = document.getElementById("inscription-flow");
    if (!hero || !form || !("IntersectionObserver" in window)) {
      return;
    }
    let heroVisible = true;
    let formVisible = false;
    const observer = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (entry.target === hero) {
          heroVisible = entry.isIntersecting;
        }
        if (entry.target === form) {
          formVisible = entry.isIntersecting;
        }
      }
      setShown(!heroVisible && !formVisible);
    });
    observer.observe(hero);
    observer.observe(form);
    return () => observer.disconnect();
  }, []);

  if (dismissed) {
    return null;
  }
  return (
    <div
      aria-hidden={!shown}
      className={`bg-background/95 fixed right-3 bottom-3 z-40 flex items-center gap-1.5 rounded-full p-1 shadow-lg transition-transform duration-300 lg:hidden ${shown ? "translate-y-0" : "translate-y-[160%]"}`}
    >
      <Button asChild size="sm">
        <a href="#inscription" tabIndex={shown ? 0 : -1}>
          {STICKY.label}
        </a>
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="rounded-full"
        aria-label={STICKY.dismiss}
        tabIndex={shown ? 0 : -1}
        onClick={() => setDismissed(true)}
      >
        <X aria-hidden="true" />
      </Button>
    </div>
  );
};
