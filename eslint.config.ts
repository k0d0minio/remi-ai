import eslint from "@eslint/js";
import { defineConfig } from "eslint/config";
import tseslint from "typescript-eslint";
import preferArrow from "eslint-plugin-prefer-arrow";
import reactHooks from "eslint-plugin-react-hooks";
import react from "eslint-plugin-react";
import globals from "globals";

// One flat config for the whole monorepo. Three layers, in this order:
//   1. base       — what is true of every file
//   2. environment — which globals each workspace gets (browser / node / both)
//   3. boundaries  — the architectural rules that keep the packages a real boundary
// Rules that are "will be error soon" are warnings; CI enforces a warning ceiling
// (see .github/workflows/quality.yaml) so the count can only go down.

/** Every app that consumes the shared packages rather than owning primitives. */
const CONSUMER_APPS = ["apps/web", "apps/admin", "apps/marketing", "apps/demo"];
const glob = (dirs: string[], ext = "{ts,tsx}") =>
  dirs.map((d) => `${d}/**/*.${ext}`);

export default defineConfig(
  {
    ignores: [
      "**/public/**",
      "**/dist/**",
      "**/.next/**",
      "**/out/**",
      "**/build/**",
      "**/node_modules/**",
      "**/*.json",
    ],
  },

  // --- 1. base -------------------------------------------------------------------

  {
    files: ["**/*.{js,jsx,mjs,cjs}"],
    ...eslint.configs.recommended,
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      parserOptions: { ecmaFeatures: { jsx: true } },
    },
  },
  {
    files: ["**/*.{ts,tsx}"],
    extends: [eslint.configs.recommended, tseslint.configs.recommended],
    rules: {
      "no-unused-vars": "off", // replaced by the @typescript-eslint version
      "@typescript-eslint/no-unused-vars": [
        "warn",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          caughtErrorsIgnorePattern: "^_",
        },
      ],
      "@typescript-eslint/no-explicit-any": "warn",
      // CONVENTIONS.md: types, never interfaces.
      "@typescript-eslint/consistent-type-definitions": ["warn", "type"],
    },
  },
  {
    files: ["**/*.{js,jsx,mjs,cjs,ts,tsx}"],
    languageOptions: { parserOptions: { ecmaFeatures: { jsx: true } } },
    plugins: { "prefer-arrow": preferArrow, react },
    extends: [reactHooks.configs.flat.recommended],
    settings: { react: { version: "detect" } },
    rules: {
      "react/jsx-uses-react": "off", // not needed in React 17+
      "react/react-in-jsx-scope": "off",
      "react/jsx-uses-vars": "warn",

      "no-undef": "error",
      "no-unsafe-optional-chaining": "error",
      "no-useless-escape": "warn",
      "no-empty": "warn",
      "no-case-declarations": "warn",

      // CONVENTIONS.md: braces on every control statement.
      curly: ["warn", "all"],

      // CONVENTIONS.md: arrow functions, implicit return where there is no logic.
      "prefer-arrow/prefer-arrow-functions": [
        "warn",
        {
          disallowPrototype: true,
          singleReturnOnly: false,
          classPropertiesAllowed: false,
        },
      ],
      "arrow-body-style": ["warn", "as-needed"],
      "prefer-arrow-callback": ["warn", { allowNamedFunctions: false }],

      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": "warn",
    },
  },

  // --- 2. environment ------------------------------------------------------------

  {
    // Next.js apps run in both environments; RSC files are Node, client files are browser.
    files: glob([...CONSUMER_APPS, "apps/docs"], "{js,jsx,mjs,cjs,ts,tsx}"),
    languageOptions: { globals: { ...globals.browser, ...globals.node } },
  },
  {
    // @remi/ui is browser-only by construction — its barrel carries "use client".
    files: ["packages/ui/**/*.{js,jsx,mjs,cjs,ts,tsx}"],
    languageOptions: { globals: { ...globals.browser } },
  },
  {
    // @remi/services is Node by default…
    files: ["packages/services/**/*.{js,jsx,mjs,cjs,ts,tsx}"],
    languageOptions: { globals: { ...globals.node } },
  },
  {
    // …except the deliberately isomorphic surface.
    files: ["packages/services/src/shared/**/*.{ts,tsx}"],
    languageOptions: { globals: { ...globals.browser, ...globals.node } },
  },
  {
    files: ["**/*.config.{js,ts,mjs}", "**/eslint.config.ts"],
    languageOptions: { globals: { ...globals.node } },
  },

  // --- 3. boundaries -------------------------------------------------------------

  {
    // Every consumer app imports primitives from the shared package, never from a
    // primitive library directly, and never from a local ui barrel. This is the rule
    // that stops a second design system growing inside an app.
    files: glob(CONSUMER_APPS),
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["@radix-ui/*", "@headlessui/*"],
              message:
                "Import primitives from @remi/ui. Add the component to packages/ui first if it does not exist yet.",
            },
            {
              group: ["@/components/ui", "@/components/ui/*"],
              message:
                "There is no local ui barrel. Import from @remi/ui — see CONVENTIONS.md.",
            },
          ],
        },
      ],
    },
  },
  {
    // Server-capable apps must name the services entrypoint they mean. The root
    // barrel is types-only; /server carries the Node-only surface.
    files: glob(["apps/web", "apps/admin", "apps/marketing"]),
    rules: {
      "no-restricted-imports": [
        "error",
        {
          paths: [
            {
              name: "@remi/services",
              message:
                "Use an explicit entrypoint: @remi/services/shared (isomorphic), /server (Node-only), /ai or /email.",
            },
          ],
          patterns: [
            {
              group: ["@radix-ui/*", "@headlessui/*"],
              message: "Import primitives from @remi/ui.",
            },
            {
              group: ["@/components/ui", "@/components/ui/*"],
              message: "There is no local ui barrel. Import from @remi/ui.",
            },
          ],
        },
      ],
    },
  },
  {
    // apps/demo is the Design stage's sandbox: mock data only, no services, no auth.
    // The lint rule is what keeps it a sandbox instead of a second product.
    files: ["apps/demo/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["@remi/services", "@remi/services/*"],
              message:
                "apps/demo is mock-data only — it never reaches a backend. See CONVENTIONS.md → apps/demo.",
            },
            {
              group: ["@radix-ui/*", "@headlessui/*"],
              message: "Import primitives from @remi/ui.",
            },
            {
              group: ["@/components/ui", "@/components/ui/*"],
              message: "There is no local ui barrel. Import from @remi/ui.",
            },
          ],
        },
      ],
    },
  },
  {
    // The shared packages never depend on an app.
    files: ["packages/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["@remi/web", "@remi/admin", "@remi/marketing", "@remi/demo", "@remi/docs"],
              message:
                "A package must not import an app — the dependency only ever points app → package.",
            },
          ],
        },
      ],
    },
  },
);
