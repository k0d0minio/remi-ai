import { NoObjectGeneratedError, Output, createGateway, generateText } from "ai";
import type { FinishReason, LanguageModelUsage } from "ai";

import { env } from "../../server/env";
import type { ProviderReply, ProviderRequest, TextProvider } from "../index";

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
        const result = await generateText(call);
        return replyOf(result.text, result.totalUsage, result.finishReason);
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
        throw error;
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
