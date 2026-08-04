/**
 * Class-based theming. `tokens.css` already ships a full `.dark` block behind
 * `@custom-variant dark (&:is(.dark *))`, so switching theme is one class on
 * `<html>` and nothing else — no second stylesheet, no token duplicated.
 *
 * Two pieces of code decide that class, and this module is what keeps them
 * agreeing: `themeScript` runs before first paint, `ThemeToggle` runs after
 * hydration. They cannot share a function — one is a string in the HTML, the
 * other is React — so they share these constants instead.
 *
 * Server-safe on purpose: it reaches for no browser API at module scope, which
 * is what lets `@remi/ui/server` export the script for a root layout to render.
 */

/** The three states the toggle offers. `system` is the absence of a choice. */
export const themes = ["system", "light", "dark"] as const;

export type Theme = (typeof themes)[number];

/**
 * Only ever holds `"light"` or `"dark"`. Choosing `system` REMOVES the key
 * rather than writing `"system"` into it, so "I have not chosen" and "I chose
 * to follow the OS" are the same state — one fewer thing that can disagree.
 */
export const THEME_STORAGE_KEY = "remi-theme";

/** The class `tokens.css` hangs its dark block off. */
export const THEME_CLASS = "dark";

/**
 * The anti-flash script, rendered as the first thing inside `<body>` so it runs
 * before the browser paints anything below it. Without it a dark-mode visitor
 * gets a white flash on every navigation that is not client-side: the server
 * has no way to know their preference, so the HTML always arrives light.
 *
 * `try` around the whole body because `localStorage` throws outright in a
 * partitioned or cookie-blocked context, and a theme preference is not worth
 * taking the page down for — the catch leaves the light default in place.
 *
 * `colorScheme` on the element as well as the class: it is what tells the
 * browser to render form controls, scrollbars and the canvas underneath in the
 * matching palette, which no amount of Tailwind reaches.
 */
export const themeScript = `(() => {
  try {
    const root = document.documentElement;
    const stored = localStorage.getItem(${JSON.stringify(THEME_STORAGE_KEY)});
    const dark = stored === "dark" || (stored !== "light" && window.matchMedia("(prefers-color-scheme: dark)").matches);
    root.classList.toggle(${JSON.stringify(THEME_CLASS)}, dark);
    root.style.colorScheme = dark ? "dark" : "light";
  } catch {
    /* No storage access — the light default already in the markup stands. */
  }
})();`;
