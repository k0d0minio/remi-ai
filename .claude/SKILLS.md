# Skills — the catalog and the rule for adding one

## The model this serves

The pipeline (`pipeline/`) is a context workspace: **folder structure is the orchestration.** One
`/pipeline` router skill routes between gated stages, and the stages call flat, **one-job capability
skills** in `.claude/skills/`.

A skill earns its place only if **both** hold:

1. it matches the real stack and product, and
2. a pipeline stage or a common dev task would actually invoke it.

Generic skills, near-duplicates, broken stubs and stack mismatches dilute the model — an agent
scanning a list of forty descriptions to find the two that apply is worse off than one with no list
at all. Keep this small.

## Repo-local skills

| Skill      | What it does                                                         |
| ---------- | -------------------------------------------------------------------- |
| `pipeline` | The delivery pipeline router. Non-negotiable — it _is_ the workflow. |

That's the whole list today, and that is the correct size for a repo at this stage. Everything else
comes from the globally installed skills (Next.js, Vercel, security, accessibility, testing, and so
on), which need no copy here.

## Adding one

Before writing a skill, check three things:

1. **Is it one job?** "Add a shared component" is a skill. "Frontend work" is not.
2. **Who calls it?** Name the stage or the task. A skill nothing invokes is documentation with extra
   steps — write it in `CONVENTIONS.md` or an `AGENTS.md` instead.
3. **Does a global skill already cover it?** If so, the answer is to use that one, not to fork it
   with a repo-specific tweak — the fork will drift.

Candidates worth building once the repo has the surface to justify them:

- **`shared-component`** — add a primitive to `packages/ui`: shadcn add, rewrite to house style,
  export from the barrel, wire a consumer. Called by Build and Design.
- **`service-adapter`** — implement and register a seam adapter in `packages/services` (storage,
  email, AI) with its env vars, `docs/ENV.md` row and `turbo.json` entry. Called by Build.
- **`changelog-entry`** — the changelog page's frontmatter and user-voice copy rules. Called by Ship.
- **`docs-sync`** — update the affected `apps/docs` pages in the feature PR. Called by Ship.

Each is currently inlined in the stage contract that would call it. Extract one into a skill when
the inline version starts repeating itself across stages — not before.

## A note on permissions

`.claude/settings.json` allowlists the **read-only** pipeline scripts (`resolve-run.sh`,
`validate-spec.sh`, `project-labels.sh`). `new-run.sh` and `send-ship-note.sh` are deliberately
**not** allowlisted: they open pull requests and send email. Those get an explicit prompt every
time, because an outward action that happens silently is one nobody notices went wrong.
