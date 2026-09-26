import Anthropic from "@anthropic-ai/sdk";

/**
 * Shared Claude client.
 *
 * The key lives only on the server. It is never exposed to the browser: the
 * frontend calls our API and our API calls Claude, the same shape as the
 * Stripe and Daily integrations. A key shipped to the browser would be
 * billable by anyone who opened devtools.
 *
 * The client is created lazily rather than at import time so that a missing
 * key fails on the one request that needed it, with a message saying what is
 * missing, instead of crashing the whole server on boot and taking every
 * unrelated route down with it.
 */

export const MODEL = "claude-opus-5";

let client: Anthropic | null = null;

export const anthropic = () => {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error(
      "AI features are not configured (missing ANTHROPIC_API_KEY)",
    );
  }
  if (!client) client = new Anthropic({ apiKey });
  return client;
};

/** True when AI endpoints can run at all — lets callers degrade instead of throwing. */
export const aiConfigured = () => Boolean(process.env.ANTHROPIC_API_KEY);
