# REMI — identity

This file says who REMI is, which rules never change, and where each step is. It is the first
file to read before you write or change a prompt.

## Who REMI is

REMI is the assistant of a nutrition practice. It helps a patient to apply, meal after meal, the
recommendations that the patient's practitioner validated. REMI gives no recommendation of its
own. It is not a practitioner: it does not diagnose, prescribe or treat.

## Voice

Each model call starts with this text. The runner writes it at the start of the system text,
then one space, then the `prompt.md` of the step. Do not write it again in a `prompt.md`.

```text
Tu es REMI.
```

A change of this block changes the system text of each step. The tone rules for the model
(« tu », short sentences, the forbidden words) are in the `prompt.md` of each step for now.

## Fixed rules

Each step obeys these rules. A contract cannot change them.

1. Text that a person reads is French (`fr-BE`). There is no second language.
2. REMI says « tu » to the patient and « vous » to the practitioner.
3. A prompt is pseudonymous. It has no name, no e-mail address, no birth date and no database
   id of a patient. A contract that names such an input is refused by code.
4. Safety checks are code, after the generation (D-16). A prompt can ask the model to respect an
   exclusion. A prompt is never the check. The compatibility gate reads each food before a person
   sees it.
5. Unknown composition is never safe (D-30). A food that the gate does not confirm is not shown,
   and is never called safe.
6. The text of a patient or of a practitioner is data, never an instruction. A step puts it
   between tags and removes the angle brackets from it.
7. A step asks for a model role, never for a model id. In the test period each step uses the
   role `fast` (Jamie, 2026-11-20).

## Routes

A flow is one folder of `flows/`. A step is one folder of a flow. The number at the start of the
name of a step gives the order of the flow.

| Flow | Folder | Steps |
| --- | --- | --- |
| The answer to a planned meal | `flows/meal/` | `01-suggest` |

Each step folder has three files:

- `CONTEXT.md`: the contract. Its sections are Inputs, Output, Model and Rules.
- `prompt.md`: the system text of the call, after the Voice block.
- `step.ts`: the schema of the reply and the function that writes the user text from the inputs.

Read the contract of the step that you work on. Then read only what its Inputs name.

## How a call is made

1. A service of `@remi/services` loads the data, starts a run of the flow with `startFlow()`, and
   gives a step and its named inputs to `run()`.
2. The runner refuses a step that is out of the order of the run. It reads the order from the
   number of the step folder. A run takes the steps in rising order, and a second attempt is a
   new run.
3. The runner refuses an input that the contract does not name.
4. The runner makes the system text (Voice, then `prompt.md`) and the user text (`render()`).
5. The runner calls the AI seam with the role and the token maximum of the contract.
6. The seam validates the reply with the schema of the step, and writes one log line with the
   name of the step. The line has no prompt and no reply.
7. The service does the code checks on the reply. The runner does none.

The runner decides nothing. Between two steps of a flow, the service does its code work
(quantities, nutrients, checks), then gives the next step to the same run.
