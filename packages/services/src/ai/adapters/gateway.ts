import { NoObjectGeneratedError, Output, createGateway, generateText } from "ai";
import type { FinishReason, LanguageModelUsage } from "ai";
import { z } from "zod";

import { env } from "../../server/env";
import type {
  CatalogueModel,
  ProviderReply,
  ProviderRequest,
  TextProvider,
} from "../index";
import { ProviderCallError } from "../provider-error";

/**
 * The Vercel AI Gateway adapter for the `TextProvider` seam (D-16).
 *
 * It uses the AI SDK (`ai`, version 7), whose gateway provider takes a model id
 * of the form `creator/model`. The key comes from `env()`, as each server-side
 * read does, and goes to `createGateway()` explicitly. The SDK can also read
 * `AI_GATEWAY_API_KEY` or a Vercel OIDC token by itself: this adapter does not
 * use that path, so that an unset key means no adapter.
 *
 * Not here: image input, streaming, tool use. They come with the tickets that
 * need them.
 */

/** One call stops after this time. The SDK does 2 retries inside it. */
const TIMEOUT_MS = 60_000;

/**
 * The catalogue of the gateway. The REST reference says that this endpoint
 * needs no authentication, so the request has no key.
 * https://vercel.com/docs/ai-gateway/sdks-and-apis/rest-api
 */
const MODELS_URL = "https://ai-gateway.vercel.sh/v1/models";

const MODELS_TIMEOUT_MS = 8_000;

/**
 * The fields that this adapter reads. The REST reference documents `id`,
 * `name`, `type` and `tags`. On 2026-11-20 the endpoint also sent `no_training`
 * and `zdr` (`all`, `some` or `none`) and the tag `structured-output`, and the
 * reference did not document them. Thus each of them is optional here, and a
 * missing one is `null` or an empty list: the rules of `model-checks.ts` then
 * refuse the model.
 */
const gatewayModelsSchema = z.object({
  data: z.array(
    z.object({
      id: z.string().min(1),
      name: z.string().nullish(),
      type: z.string().nullish(),
      tags: z.array(z.string()).nullish(),
      no_training: z.string().nullish(),
      zdr: z.string().nullish(),
    }),
  ),
});

/** The catalogue from the body of the endpoint. It throws on another shape. */
export const parseGatewayModels = (body: unknown): CatalogueModel[] =>
  gatewayModelsSchema.parse(body).data.map((model) => ({
    id: model.id,
    name: model.name ?? model.id,
    type: model.type ?? null,
    tags: model.tags ?? [],
    noTraining: model.no_training ?? null,
    zdr: model.zdr ?? null,
  }));

const listGatewayModels = async (): Promise<CatalogueModel[]> => {
  const response = await fetch(MODELS_URL, {
    cache: "no-store",
    signal: AbortSignal.timeout(MODELS_TIMEOUT_MS),
  });
  if (!response.ok) {
    throw new Error(`the gateway answered ${response.status} for its models`);
  }
  return parseGatewayModels(await response.json());
};

const NO_ACCESS_TYPES: readonly string[] = ["forbidden", "access_policy_denied"];

/** The known refusal of the free plan, and the general wording of a 403. */
const NO_ACCESS_MESSAGE = /free tier|do not have access|does not have access/i;

type ErrorLike = {
  type?: unknown;
  statusCode?: unknown;
  message?: unknown;
  lastError?: unknown;
  cause?: unknown;
};

/**
 * Why the gateway refused, from an error of the SDK. The SDK can wrap the
 * gateway's error (`lastError` of a retry error, `cause`), so this reads the
 * chain. It reads `type`, `statusCode` and `message` only to decide: nothing
 * of the error goes to a log or to the caller.
 */
export const gatewayRefusal = (error: unknown): ProviderCallError | null => {
  const seen = new Set<unknown>();
  const queue: unknown[] = [error];
  while (queue.length > 0) {
    const next = queue.shift();
    if (typeof next !== "object" || next === null || seen.has(next)) {
      continue;
    }
    seen.add(next);
    const { type, statusCode, message, lastError, cause } = next as ErrorLike;
    if (
      (typeof type === "string" && NO_ACCESS_TYPES.includes(type)) ||
      statusCode === 403 ||
      (typeof message === "string" && NO_ACCESS_MESSAGE.test(message))
    ) {
      return new ProviderCallError("no_access");
    }
    if (type === "model_not_found" || statusCode === 404) {
      return new ProviderCallError("unknown_model");
    }
    queue.push(lastError, cause);
  }
  return null;
};

const replyOf = (
  text: string,
  usage: LanguageModelUsage | undefined,
  finishReason: FinishReason | undefined,
): ProviderReply => ({
  text,
  ...(usage?.inputTokens === undefined
    ? {}
    : { inputTokens: usage.inputTokens }),
  ...(usage?.outputTokens === undefined
    ? {}
    : { outputTokens: usage.outputTokens }),
  ...(finishReason === "content-filter" ? { refused: true } : {}),
});

export const createGatewayTextProvider = (apiKey: string): TextProvider => {
  const gateway = createGateway({ apiKey });

  return {
    name: "vercel-ai-gateway",
    listModels: listGatewayModels,
    generateText: async (request: ProviderRequest) => {
      const call = {
        model: gateway(request.model),
        prompt: request.prompt,
        maxOutputTokens: request.maxTokens,
        abortSignal: AbortSignal.timeout(TIMEOUT_MS),
        ...(request.system === undefined
          ? {}
          : { instructions: request.system }),
        ...(request.temperature === undefined
          ? {}
          : { temperature: request.temperature }),
      };

      if (!request.schema) {
        try {
          const result = await generateText(call);
          return replyOf(result.text, result.totalUsage, result.finishReason);
        } catch (error) {
          throw gatewayRefusal(error) ?? error;
        }
      }

      // The schema goes to the model as a structured-output constraint. The
      // adapter returns the raw text: the seam parses and validates it.
      try {
        const result = await generateText({
          ...call,
          output: Output.object({ schema: request.schema }),
        });
        return replyOf(result.text, result.totalUsage, result.finishReason);
      } catch (error) {
        // The SDK found that the reply is not an object of the schema. Give
        // the seam the raw text, so that it records the failure `schema_fail`.
        if (NoObjectGeneratedError.isInstance(error)) {
          return replyOf(error.text ?? "", error.usage, error.finishReason);
        }
        throw gatewayRefusal(error) ?? error;
      }
    },
  };
};

/**
 * The adapter, or `null` when `AI_GATEWAY_API_KEY` is not set. An app registers
 * the result only when it is not `null`. With no key the seam stays
 * unregistered, and each caller of `generateText()` or `generateJson()` gets
 * the failure `error`.
 */
export const gatewayTextProviderFromEnv = (): TextProvider | null => {
  const key = env().AI_GATEWAY_API_KEY;
  return key ? createGatewayTextProvider(key) : null;
};
