/**
 * @remi/services/ai — model access.
 *
 * Server-only. Model ids and generation defaults live here, in one place, so a
 * model upgrade is one edit rather than a grep across five apps. The provider
 * client itself is a seam, same as /db and /email — no SDK is committed yet.
 */

export type ModelRole = "fast" | "balanced" | "deep";

/**
 * The three tiers callers choose between. They ask for a role, never a model id,
 * so upgrading a tier does not touch a single call site.
 */
export const MODELS: Record<ModelRole, string> = {
  fast: "claude-haiku-4-5-20251001",
  balanced: "claude-sonnet-5",
  deep: "claude-opus-5",
};

export type GenerateOptions = {
  role?: ModelRole;
  system?: string;
  maxTokens?: number;
  temperature?: number;
};

export const DEFAULTS: Required<
  Pick<GenerateOptions, "role" | "maxTokens" | "temperature">
> = {
  role: "balanced",
  maxTokens: 4096,
  temperature: 0.7,
};

export type TextProvider = {
  readonly name: string;
  generateText: (prompt: string, options?: GenerateOptions) => Promise<string>;
};

let provider: TextProvider | null = null;

export const registerTextProvider = (adapter: TextProvider) => {
  provider = adapter;
};

export const getTextProvider = (): TextProvider => {
  if (!provider) {
    throw new Error(
      "no AI provider registered — call registerTextProvider() at process start (see packages/services/AGENTS.md)",
    );
  }
  return provider;
};

export const resolveModel = (role: ModelRole = DEFAULTS.role) => MODELS[role];

/**
 * The patient context block — the plain-French text every prompt here opens
 * with, and the one part of `ai-assist` that needs no vendor. `copy-context`
 * is its first consumer; the adapter will be its second.
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
