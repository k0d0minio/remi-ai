import { Monitor, Moon, Sun } from "lucide-react";
import { useSyncExternalStore } from "react";
import {
  THEME_CLASS,
  THEME_STORAGE_KEY,
  themes,
  type Theme,
} from "../lib/theme";
import { cn } from "../lib/utils";

const icons: Record<Theme, typeof Monitor> = {
  system: Monitor,
  light: Sun,
  dark: Moon,
};

const darkQuery = "(prefers-color-scheme: dark)";

/**
 * The stored choice IS the state, so the component reads it through
 * `useSyncExternalStore` rather than mirroring it into `useState`. That is what
 * makes the server render and the first client render agree without an effect
 * correcting them afterwards — `getServerTheme` supplies the value React
 * hydrates against, and the real one is read straight from storage after.
 */
const listeners = new Set<() => void>();

/** Memoised: `matchMedia` hands back a new object per call, and removing a
 *  listener needs the object it was added to. */
let media: MediaQueryList | null = null;
const darkMedia = () => (media ??= window.matchMedia(darkQuery));

const readStoredTheme = (): Theme => {
  try {
    const stored = localStorage.getItem(THEME_STORAGE_KEY);
    return stored === "light" || stored === "dark" ? stored : "system";
  } catch {
    return "system";
  }
};

/** What the server renders, and what the client hydrates against. */
const getServerTheme = (): Theme => "system";

/**
 * The same decision `themeScript` makes before paint, made again after a click.
 * Kept separate from the script rather than shared with it: the script is a
 * string with no module system, so the two agree by reading the same constants,
 * not because one calls the other.
 */
const applyTheme = (theme: Theme) => {
  const dark = theme === "dark" || (theme === "system" && darkMedia().matches);
  document.documentElement.classList.toggle(THEME_CLASS, dark);
  document.documentElement.style.colorScheme = dark ? "dark" : "light";
};

const notify = () => {
  for (const listener of listeners) {
    listener();
  }
};

/** The OS switched while `system` was selected — repaint, nothing to store. */
const onSystemChange = () => {
  applyTheme(readStoredTheme());
  notify();
};

/** Another tab changed the choice. Follow it, so two open tabs never disagree. */
const onStorage = (event: StorageEvent) => {
  if (event.key !== null && event.key !== THEME_STORAGE_KEY) {
    return;
  }
  applyTheme(readStoredTheme());
  notify();
};

const subscribe = (listener: () => void) => {
  if (listeners.size === 0) {
    window.addEventListener("storage", onStorage);
    darkMedia().addEventListener("change", onSystemChange);
  }
  listeners.add(listener);

  return () => {
    listeners.delete(listener);
    if (listeners.size === 0) {
      window.removeEventListener("storage", onStorage);
      darkMedia().removeEventListener("change", onSystemChange);
    }
  };
};

const selectTheme = (next: Theme) => {
  try {
    // `system` REMOVES the key rather than writing "system" into it, so "never
    // chose" and "chose to follow the OS" stay the same state.
    if (next === "system") {
      localStorage.removeItem(THEME_STORAGE_KEY);
    } else {
      localStorage.setItem(THEME_STORAGE_KEY, next);
    }
  } catch {
    /* The choice still applies to this page; it just will not outlive it. */
  }
  applyTheme(next);
  notify();
};

type Props = {
  /** Names the group for assistive tech — the app supplies it in its language. */
  label: string;
  /** One label per option, in the app's language. Also the button tooltips. */
  optionLabels: Record<Theme, string>;
  className?: string;
};

/**
 * Three states rather than a light/dark flip, and the third one is the point:
 * `system` is a live subscription to the OS setting, so a visitor whose laptop
 * turns dark at sunset gets the same courtesy here without touching this
 * control again. A two-state toggle cannot express that — the moment it is
 * touched the OS is overridden forever.
 *
 * Rendered as pressable buttons rather than a `radiogroup`: a radio group owes
 * the user arrow-key navigation and a single tab stop, and three buttons that
 * each say whether they are pressed is the honest markup for what this is.
 */
export const ThemeToggle = ({ label, optionLabels, className }: Props) => {
  const theme = useSyncExternalStore(
    subscribe,
    readStoredTheme,
    getServerTheme,
  );

  return (
    <div
      data-slot="theme-toggle"
      role="group"
      aria-label={label}
      className={cn(
        "bg-muted inline-flex w-fit items-center gap-0.5 rounded-md p-0.5",
        className,
      )}
    >
      {themes.map((option) => {
        const Icon = icons[option];
        const selected = option === theme;

        return (
          <button
            key={option}
            type="button"
            aria-pressed={selected}
            aria-label={optionLabels[option]}
            title={optionLabels[option]}
            onClick={() => selectTheme(option)}
            className={cn(
              "focus-visible:ring-ring/40 ease-standard inline-flex size-7 items-center justify-center rounded-sm outline-none transition-colors duration-[--duration-fast] focus-visible:ring-[3px]",
              selected
                ? "bg-background text-foreground shadow-xs"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            <Icon aria-hidden="true" className="size-4" />
          </button>
        );
      })}
    </div>
  );
};
