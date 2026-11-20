import {
  gatewayTextProviderFromEnv,
  isTextProviderRegistered,
  registerTextProvider,
} from "@remi/services/server";

/**
 * This app's registration point for the AI seam. It has the same shape as
 * `lib/mailer.ts`: lazily, from the code that generates, never from
 * `instrumentation.ts`.
 *
 * Call `aiReady()` before `generateText()` or `generateJson()`, and import
 * them from `@remi/services/server` too: a registry belongs to the entrypoint
 * that it was reached through.
 *
 * The adapter registers only when `AI_GATEWAY_API_KEY` is set. With no key,
 * this function returns false and a generation returns the failure `error`.
 * Thus a patient screen can show that the function is not available.
 */
export const aiReady = () => {
  if (isTextProviderRegistered()) {
    return true;
  }
  const adapter = gatewayTextProviderFromEnv();
  if (!adapter) {
    console.error(
      "[ai] no AI provider registered — unset on this deployment: AI_GATEWAY_API_KEY. Each generation fails. See .icm/docs/ENV.md.",
    );
    return false;
  }
  registerTextProvider(adapter);
  return true;
};
