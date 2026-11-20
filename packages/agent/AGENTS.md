# @remi/agent — package rules (Layer 3 delta)

The global rules in [`/CONVENTIONS.md`](../../CONVENTIONS.md) still apply. This file holds only
what is specific to this package. [`REMI.md`](REMI.md) is the identity of REMI and its fixed
rules: read it before you write or change a prompt.

## The folder tree is the orchestration

```text
REMI.md                 the identity: who REMI is, the Voice block, the fixed rules, the routes
flows/
  <flow>/               one flow, for example `meal`
    NN-<step>/          one step. NN gives the order of the flow: 01, 02, 03
      CONTEXT.md        the contract: Inputs, Output, Model, Rules
      prompt.md         the system text, after the Voice block
      step.ts           the schema of the reply, and `render()`: the user text from the inputs
      step.test.ts      the tests of `render()` and of the schema
src/
  contract.ts           reads a CONTEXT.md as data
  step.ts               `defineStep()` and `prepareCall()`: the pure half of the runner
  flow.ts               the order of a run, read from the numbers of the step folders
  identity.ts           reads the Voice block of REMI.md
  index.ts              the barrel: one line for each step
  tree.test.ts          reads the folders, and fails when one breaks a rule below
```

## Rules

- **No orchestrator.** The runner has no business rule. It holds the order of the folders and
  the inputs of the contract, and no other thing. Do not add a condition, a retry, a loop or a
  check on the reply to `src/` or to `packages/services/src/server/agent/`. A rule on a reply is
  code of the service that calls.
- **The order of a flow is the order of its folders.** A run takes the steps in rising order of
  their numbers. Code has no list of steps.
- **This package imports no other package of the repo.** `@remi/services` reads it. The
  dependency is app → `@remi/services` → `@remi/agent`. An import of `@remi/services` here is a
  lint error, and it would be a cycle.
- **Pure and isomorphic.** No I/O, no clock, no `process.env`. The only dependency is `zod`.
- **A call gets the inputs that its contract names, and no other.** `prepareCall()` throws on
  another input. To give a step a new input, add it to `## Inputs` of the contract first.
- **A contract is read by code.** Keep the four headings (`## Inputs`, `## Output`, `## Model`,
  `## Rules`) and the form of a bullet: a dash, the name in backticks, a colon. `## Output` names
  each field of the schema, and `tree.test.ts` compares the two lists.
- **A `prompt.md` is exact text.** Prettier does not format it (`/.prettierignore`). Do not
  start it with the Voice block.
- **A prompt is pseudonymous.** The inputs of a step have no field for a name, an e-mail
  address, a birth date or a database id.
- **Each step uses the role `fast`** in the test period (Jamie, 2026-11-20). `tree.test.ts`
  holds this. The model of the role stays a console setting.

## To add a step

1. Make the folder `flows/<flow>/NN-<step>/` with the next number of the flow.
2. Write `CONTEXT.md`, `prompt.md`, `step.ts` and `step.test.ts`. Copy the form of
   `flows/meal/01-suggest/`. The `id` in `step.ts` is the path of the folder: `<flow>/NN-<step>`.
3. Add one line for the step to `src/index.ts`.
4. For a new flow, add one row to the table Routes of `REMI.md`.

The runner does not change. The service that needs the step starts a run with
`startFlow("<flow>")` of `packages/services/src/server/agent/runner.ts`, and calls
`run(step, inputs, { model })` for each step, in the order of the folders.

## The build

tsup inlines each `.md` file as a string, so no route reads a file at run time. vitest does the
same with the plugin of `vitest.config.ts`. `@remi/services` tests read the source of this
package through an alias of its `vitest.config.ts`, so its tests need no build of this package.
