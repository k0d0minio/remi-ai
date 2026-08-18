# Remi AI — conventions (canonical Layer 3 reference)

The single source of truth for code style, design-system rules, and git conventions across the
monorepo. `CLAUDE.md` (Layer 0) points here; the pipeline's Build stage loads this file by path;
the subtree `AGENTS.md` files link it. **Change a rule here and nowhere else.**

## Code style

### Functions

- **Always arrow functions.** Never `function foo() {}` — ESLint flags it as a warning, and CI runs
  lint with a zero-warning ceiling, so the warning is a red check.
- **Always `async`/`await`.** Never `.then()` chains.
- Implicit return when there is no logic between the signature and the returned value:

  ```tsx
  // Good — no logic, implicit return
  export const Greeting = ({ name }: Props) => <div>Hello, {name}!</div>;

  // Good — has logic, explicit return
  export const Greeting = ({ name }: Props) => {
    const formatted = name.toUpperCase();
    return <div>Hello, {formatted}!</div>;
  };
  ```

- **Exception:** `page.tsx`, `layout.tsx` and route handlers may use `export default function` when
  that matches the framework's own convention.

### Control flow

Braces on every `if` / `else` / loop body. No `if (x) return y;` without `{ }` — `curly: "all"`.

### Components

- Named `const`, arrow function, one responsibility:

  ```tsx
  export const MyComponent = ({ name }: Props) => <div>{name}</div>;
  ```

- **Server components by default.** `"use client"` earns its place with an event handler, a hook,
  or a browser API — nothing else. Push the boundary down: a client island inside a server page,
  never a client page wrapping server content.

### Types

- **Always `type`, never `interface`.** ESLint warns on the latter.
- Props are a `type` directly above the component:

  ```tsx
  type Props = {
    name: string;
    muted?: boolean;
  };

  export const MyComponent = ({ name, muted }: Props) => <div>{name}</div>;
  ```

- No JSDoc `@param` / `@returns` — TypeScript already says it. A JSDoc description is for logic
  that is non-obvious, and explains _why_, not _what_.

### Naming

| Thing                   | Convention   |
| ----------------------- | ------------ |
| Variables and functions | `camelCase`  |
| Components and types    | `PascalCase` |
| File names              | `kebab-case` |
| CSS classes             | `kebab-case` |

### Imports

- **Named imports.** Default imports only where a framework requires one.
- `@/*` for app-local paths.
- **Name the services entrypoint that matches where the code runs** — `@remi/services/shared` is
  isomorphic; `/server`, `/db`, `/ai` and `/email` are Node-only. The bare root barrel is
  lint-blocked so the choice is always visible at the call site. What each entrypoint carries is
  catalogued once, in [`packages/services/AGENTS.md`](packages/services/AGENTS.md).
- `cn()` comes from `@remi/ui/utils`, never from the main barrel — the barrel is `"use client"` and
  its exports cannot be called from a server component.

### Links that leave the app

Six apps are six deployments on six origins, so a link between them is a plain `<a>` — `next/link`
resolves against the origin it rendered on and 404s. **Never write an origin.** Build it with
`appHref()` / `appOrigin()` from `@remi/services/shared`, which is the single catalogue of where
each app answers (`packages/services/src/shared/links.ts`) and the only file that knows the domain.
It also knows which apps carry a locale prefix, so pass your locale and let it decide. A site's own
`metadataBase` comes from the same place: the URL a site publishes itself under and the URL another
app links it by are one fact.

### Copy and text

**Sentence case everywhere** — headings, labels, buttons, badges, placeholders. Never title case.

- ✓ `Save changes` · `Billing overview` · `Awaiting approval`
- ✗ `Save Changes` · `Billing Overview` · `Awaiting Approval`

## Working languages

The repo works in two languages, and the split is a rule, not a habit:

- **English is the language of the codebase.** Identifiers, comments, commit messages, PRs, and
  every technical document — this file included.
- **French is the language of review.** Any document prepared for Morgane and Arnaud to analyse,
  review or sign off — the console's Company pages, business questions, roadmaps, offers — is
  written in French. They read English fine; the point is that a review should never double as a
  translation exercise. Belgian register (« jours prestés », « HTVA ») and French typography: a
  space before `%` and `€`, a space as the thousands separator, a comma for the decimal,
  guillemets for quotes.
- **French is the language of the conversation with them** — Slack, email, meeting notes —
  whoever starts the thread.
- **Product copy is out of scope here.** UI strings follow each app's locale system (`marketing`
  ships English and French); this section governs working documents, not the product.

## The design system

### `packages/ui` — the only home for primitives

- Add components from the package: `pnpm --filter @remi/ui exec shadcn@latest add <component>`.
- Rewrite to house style, export from `src/index.ts`.
- Intent-bearing props use one vocabulary — `success | warning | error | info | neutral` — across
  `Badge`, `Card`, and anything added later. A component never takes a caller-supplied colour class.
- Nothing lands in `packages/ui` without a consuming app in the same PR.

### Every app that renders product UI

- Import primitives from `@remi/ui`. **Never** from `@radix-ui/*` directly, **never** from a local
  `components/ui/` barrel — ESLint blocks both, so a second design system cannot grow inside an app.
- Import tokens once, in the app's `globals.css`: `@import "@remi/ui/tokens.css"` after
  `@import "tailwindcss"`. Never redefine a token.
- Use tokens, not raw palette colours: `bg-card`, `text-muted-foreground`, `bg-success` — not
  `bg-white`, `bg-emerald-50`.

### Text

Use the `Typography` component. Semantics come from `as`, scale from the variants:

```tsx
// Good
<Typography as="h2" size="sm" weight="medium" muted>Section title</Typography>

// Bad — a raw tag plus utility classes forks the type scale
<h2 className="text-sm font-medium text-muted-foreground">Section title</h2>
```

## Keeping the codebase lean

Each of these is a review blocker, not a preference. They exist because the alternative is
discovering twenty thousand lines of drift in an audit two years from now.

- **Superseding deletes the superseded.** The PR that lands a replacement deletes the old
  implementation in the same change. Never leave files on disk "for reference" — unreachable code
  documents nothing, it rots and hides real bugs.
- **Shared components are built in `packages/ui`, not in apps.** A component needed by more than
  one app, or one that renders purely from props, belongs there from its first commit. Copying a
  component between apps is forbidden: lift it into `packages/ui` and wrap it thinly per app.
- **Grep before writing a helper.** `cn`, `initials`, date and currency formatting each live in
  exactly one home. Before writing any small helper, search for it; if it exists elsewhere, import
  it or move it to the shared home first. Never a second copy, never a forked variant.
- **Every dependency needs an import.** No speculative `package.json` entries; when the last import
  of a dependency goes, the dependency goes. Shared runtime versions come from the pnpm `catalog:`
  — apps do not pin their own.
- **A barrel export is a public-API commitment.** Export only what a consumer imports today. A
  "might be useful" export is a rename-blocker that outlives whoever added it. When a symbol's last
  consumer goes, the symbol and its barrel line go too.
- **No dead configuration.** A flag, env var or config key with no reader is deleted, not left
  "in case". `.icm/docs/ENV.md` is the check: a variable not in that table does not exist.

## Testing

- **Test-driven wherever possible.** For logic with a definable contract — the services layer above
  all — the test lands in the same PR as the implementation, written with it or before it. UI
  composition is exempt; behaviour is not.
- **Coverage floors on the database layer.** `packages/services/src/db/` carries a hard floor of
  75% line coverage and aims for 90%. A PR that drops it below the floor is red.
- The harness (runner + coverage gate in `.github/workflows/quality.yaml`) arrives with the first
  db adapter PR; until then this section is the standing instruction. Tests run in the factory,
  not locally — the same rule as every other check.

## Environment variables

Every server-side `process.env` read goes through `env()` / `requireEnv()` in
`packages/services/src/server/env.ts`. Adding a variable means three edits in the same PR: the zod
schema, a row in [`.icm/docs/ENV.md`](.icm/docs/ENV.md), and a `globalEnv` entry in `turbo.json`. Values are
never committed — they live in Vercel and in GitHub Actions secrets.

## The factory owns the checks — you do not

Format, lint, typecheck and build are deterministic work. They belong to Husky, CI and the Vercel
preview, not to a session's context window:

| Check           | Runs where                                                    |
| --------------- | ------------------------------------------------------------- |
| Format          | Husky pre-commit (lint-staged) + CI                           |
| Lint, typecheck | CI — `.github/workflows/quality.yaml`, on **every** PR        |
| Build           | The Vercel preview deploy                                     |
| Pipeline gates  | CI — `.github/workflows/gates.yaml` reads the PR's checkboxes |

`.claude/hooks/block-local-checks.sh` enforces this for agent sessions. Push, then read the result
back from the PR's check runs. The one exception: if you already know an edit introduced a type
error, fix it before pushing rather than spending a CI round-trip — but do not go sweeping for them.

## Git

- Small, conventional commits: `feat: <slug> — <what>`. The type vocabulary is `feat`, `fix`,
  `chore`, `docs`, `refactor`, `style`, `build`. A scope is optional and is the workspace it lands
  in — `fix(web):`, `refactor(services):`.
- One PR per pipeline run, from Define through Ship. Never a second PR for the same run.
- Squash-merge, and only on a ticked **Ready to merge** box with green checks. The tick half is
  enforced rather than trusted — the `Pipeline gates` check stays red until the box is ticked. The
  required-checks and squash-only half is branch protection on `main` — a GitHub setting, so it is
  invisible from here; what it carries is recorded in
  [`.icm/intake/_done/REMI-005-branch-protection-ci-gaps.md`](.icm/intake/_done/REMI-005-branch-protection-ci-gaps.md).
- Never commit a secret. If you find one in the tree, stop and flag it.
