/**
 * @remi/services/ai — model access.
 *
 * Server-only. Model ids and generation defaults live here, in one place, so a
 * model upgrade is one edit rather than a grep across five apps. The provider
 * client is a seam, same as /db and /email: one adapter (`adapters/gateway.ts`)
 * and nothing above this file names its vendor.
 *
 * Callers use `generateText()` and `generateJson()`. Both return a `Result`:
 * a failure is a value that the caller must handle, never an empty answer.
 * Each call writes one structured line in the server log. The line never
 * holds the prompt or the reply, because they can hold patient health data.
 */

import type { ZodType } from "zod";

import { err, ok } from "../shared/result";
import type { Result } from "../shared/result";

export type ModelRole = "fast" | "balanced" | "deep";

/**
 * The three tiers callers choose between. They ask for a role, never a model id,
 * so upgrading a tier does not touch a single call site.
 *
 * The ids are AI Gateway ids, `creator/model` (D-16). `fast` is the cheapest
 * model of the catalogue that has structured output and whose providers do not
 * train on the data (Jamie, 2026-11-20: the cheapest for the time being).
 * Free models are excluded for that reason: the prompt has health data.
 * `balanced` accepts images.
 */
export const MODELS: Record<ModelRole, string> = {
  fast: "mistral/mistral-nemo",
  balanced: "anthropic/claude-sonnet-5.5",
  deep: "anthropic/claude-opus-5.5",
};

export type GenerateOptions = {
  role?: ModelRole;
  system?: string;
  maxTokens?: number;
  /** Sent only when the caller sets it. Not every model accepts it. */
  temperature?: number;
};

/** `fast` is the default of a product call: cheapest capable model first (D-16). */
export const DEFAULTS: Required<Pick<GenerateOptions, "role" | "maxTokens">> = {
  role: "fast",
  maxTokens: 4096,
};

/**
 * What the seam gives an adapter for one call. `prompt` and `system` are plain
 * text: this type has no field for a name, an e-mail address or an account id,
 * and it must not get one. A prompt stays pseudonymous.
 */
export type ProviderRequest = {
  prompt: string;
  /** The model id that the role resolves to. */
  model: string;
  system?: string;
  maxTokens: number;
  temperature?: number;
  /**
   * Set for `generateJson()`. The adapter asks the model for JSON of this
   * shape. The seam does the validation: the adapter returns the raw text.
   */
  schema?: ZodType;
};

export type ProviderReply = {
  /** The raw text of the reply. For a JSON call, the raw JSON text. */
  text: string;
  inputTokens?: number;
  outputTokens?: number;
  /** True when the model or a content filter refused to answer. */
  refused?: boolean;
};

export type TextProvider = {
  readonly name: string;
  generateText: (request: ProviderRequest) => Promise<ProviderReply>;
};

/**
 * - `schema_fail`: the reply is not JSON, or does not satisfy the schema.
 * - `refused`: the model or a content filter refused.
 * - `error`: no provider is registered, or the call failed.
 */
export type GenerationError = "schema_fail" | "refused" | "error";

export type GenerationResult<T> = Result<T, GenerationError>;

let provider: TextProvider | null = null;

export const registerTextProvider = (adapter: TextProvider) => {
  provider = adapter;
};

export const isTextProviderRegistered = () => provider !== null;

export const getTextProvider = (): TextProvider => {
  if (!provider) {
    throw new Error(
      "no AI provider registered — call registerTextProvider() from the app's lib/ai.ts (see packages/services/AGENTS.md)",
    );
  }
  return provider;
};

export const resolveModel = (role: ModelRole = DEFAULTS.role) => MODELS[role];

type GenerationKind = "text" | "json";

type GenerationOutcome = "ok" | GenerationError;

/**
 * The one line that each call writes in the server log. It replaces a row of a
 * table `ai_generations` until that table exists. Add no field that holds the
 * prompt, the reply or an error message: an error message can quote them.
 */
type GenerationLog = {
  event: "ai.generation";
  kind: GenerationKind;
  role: ModelRole;
  model: string;
  provider: string | null;
  durationMs: number;
  inputTokens: number | null;
  outputTokens: number | null;
  outcome: GenerationOutcome;
  /** The class name of a thrown error, for example `APICallError`. */
  errorName?: string;
};

const logGeneration = (line: GenerationLog) => {
  const text = JSON.stringify(line);
  if (line.outcome === "ok") {
    console.info(text);
  } else {
    console.error(text);
  }
};

const MESSAGES: Record<GenerationError, string> = {
  schema_fail: "the model reply does not satisfy the schema",
  refused: "the model refused to answer",
  error: "the model call failed",
};

/** A model can put its JSON in a markdown code fence. Remove the fence. */
const withoutFence = (text: string) => {
  const match = /^```(?:json)?\s*\n([\s\S]*?)\n?```$/i.exec(text.trim());
  return match?.[1] ?? text.trim();
};

type Parsed<T> =
  { ok: true; value: T } | { ok: false; error: GenerationError };

const run = async <T>(
  kind: GenerationKind,
  prompt: string,
  options: GenerateOptions,
  schema: ZodType | undefined,
  parse: (text: string) => Parsed<T>,
): Promise<GenerationResult<T>> => {
  const role = options.role ?? DEFAULTS.role;
  const model = resolveModel(role);
  const started = Date.now();
  const finish = (
    outcome: GenerationOutcome,
    reply: ProviderReply | null,
    errorName?: string,
  ) => {
    logGeneration({
      event: "ai.generation",
      kind,
      role,
      model,
      provider: provider?.name ?? null,
      durationMs: Date.now() - started,
      inputTokens: reply?.inputTokens ?? null,
      outputTokens: reply?.outputTokens ?? null,
      outcome,
      ...(errorName ? { errorName } : {}),
    });
  };
  const failure = (
    error: GenerationError,
    reply: ProviderReply | null,
    errorName?: string,
  ) => {
    finish(error, reply, errorName);
    return err(error, MESSAGES[error]);
  };

  if (!provider) {
    return failure("error", null, "NoProviderRegistered");
  }

  let reply: ProviderReply;
  try {
    reply = await provider.generateText({
      prompt,
      model,
      maxTokens: options.maxTokens ?? DEFAULTS.maxTokens,
      ...(options.system === undefined ? {} : { system: options.system }),
      ...(options.temperature === undefined
        ? {}
        : { temperature: options.temperature }),
      ...(schema ? { schema } : {}),
    });
  } catch (error) {
    return failure(
      "error",
      null,
      error instanceof Error ? error.name : "UnknownError",
    );
  }

  if (reply.refused) {
    return failure("refused", reply);
  }
  const parsed = parse(reply.text);
  if (!parsed.ok) {
    return failure(parsed.error, reply);
  }
  finish("ok", reply);
  return ok(parsed.value);
};

/**
 * Generate text. A reply with no text is the failure `error`, never an empty
 * answer.
 */
export const generateText = (
  prompt: string,
  options: GenerateOptions = {},
): Promise<GenerationResult<string>> =>
  run("text", prompt, options, undefined, (text) =>
    text.trim() === ""
      ? { ok: false, error: "error" }
      : { ok: true, value: text },
  );

/**
 * Generate a value that satisfies `schema`. The seam parses the reply and
 * validates it with the schema, whatever the adapter did. A reply that does not
 * satisfy the schema is the failure `schema_fail`, and the log has one line for
 * it. The reply is never returned in that case.
 */
export const generateJson = <T>(
  prompt: string,
  schema: ZodType<T>,
  options: GenerateOptions = {},
): Promise<GenerationResult<T>> =>
  run("json", prompt, options, schema, (text) => {
    let json: unknown;
    try {
      json = JSON.parse(withoutFence(text));
    } catch {
      return { ok: false, error: "schema_fail" };
    }
    const checked = schema.safeParse(json);
    return checked.success
      ? { ok: true, value: checked.data }
      : { ok: false, error: "schema_fail" };
  });

/**
 * The AI Gateway adapter. This file is the only one that re-exports it. An app
 * registers it from its own `lib/ai.ts`, and only when the key is set.
 */
export { gatewayTextProviderFromEnv } from "./adapters/gateway";

/**
 * The patient context block — the plain-French text every prompt here opens
 * with, and the one part of `ai-assist` that needs no vendor. `copy-context`
 * is its first consumer.
 */
export {
  DEFAULT_CONTEXT_PREAMBLE,
  contextBlocks,
  defaultContextBlocks,
  patientContextText,
} from "./context";
export type {
  ContextBlock,
  ContextEssential,
  ContextGoal,
  ContextProfile,
  ContextRecommendationGroup,
  ContextSupplement,
  PatientContextInput,
  PatientContextOptions,
} from "./context";
