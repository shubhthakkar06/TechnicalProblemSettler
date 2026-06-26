import { GoogleGenAI } from '@google/genai';

export const MODELS = ['gemini-2.5-flash', 'gemini-2.5-flash-lite'];
export const DEFAULT_MODEL = MODELS[0];
const MAX_ATTEMPTS = 3;

function getGeminiErrorMessage(error) {
  let errorMsg = error.message || 'Failed to generate content';

  try {
    if (errorMsg.includes('{')) {
      const jsonPart = errorMsg.substring(errorMsg.indexOf('{'));
      const parsed = JSON.parse(jsonPart);
      if (parsed.error?.message) {
        errorMsg = parsed.error.message;
      }
    }
  } catch (e) {}

  return errorMsg;
}

function isQuotaUnavailable(error) {
  const errorMsg = getGeminiErrorMessage(error);
  return errorMsg.includes('Quota exceeded') || errorMsg.includes('limit: 0');
}

function isRetryableError(error) {
  if (isQuotaUnavailable(error)) return false;

  const status = error.status ?? error.code;
  if (status === 503 || status === 429) return true;
  const msg = getGeminiErrorMessage(error);
  return (
    msg.includes('high demand') ||
    msg.includes('UNAVAILABLE') ||
    msg.includes('overloaded') ||
    msg.includes('RESOURCE_EXHAUSTED')
  );
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function generateWithRetry(ai, prompt, json = true) {
  let lastError;

  for (const model of MODELS) {
    for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
      try {
        return await ai.models.generateContent({
          model,
          contents: prompt,
          config: json ? { responseMimeType: 'application/json' } : undefined,
        });
      } catch (error) {
        lastError = error;
        if (!isRetryableError(error)) throw error;
        if (attempt < MAX_ATTEMPTS - 1) {
          await sleep(1000 * Math.pow(2, attempt));
        }
      }
    }
  }

  throw lastError;
}

function normalizeJsonText(text) {
  const trimmed = text.trim();
  const withoutFence = trimmed.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '');
  const firstBrace = withoutFence.indexOf('{');
  const lastBrace = withoutFence.lastIndexOf('}');

  if (firstBrace !== -1 && lastBrace > firstBrace) {
    return withoutFence.slice(firstBrace, lastBrace + 1);
  }

  return withoutFence;
}

export function parseGeminiJson(text) {
  try {
    return JSON.parse(normalizeJsonText(text));
  } catch (error) {
    throw new Error(`Gemini returned malformed JSON: ${error.message}`);
  }
}

export async function generateJsonWithRetry(ai, prompt, responseJsonSchema) {
  let lastError;
  let currentPrompt = prompt;

  for (const model of MODELS) {
    for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
      try {
        const response = await ai.models.generateContent({
          model,
          contents: currentPrompt,
          config: {
            responseMimeType: 'application/json',
            responseJsonSchema,
          },
        });

        return parseGeminiJson(response.text);
      } catch (error) {
        lastError = error;

        if (error.message?.startsWith('Gemini returned malformed JSON')) {
          currentPrompt = `${prompt}

Your previous response was not valid JSON. Return only one JSON object matching the requested schema. Escape every newline, quote, and backslash inside string values. Do not include Markdown fences or extra text.`;
          continue;
        }

        if (!isRetryableError(error)) throw error;
        if (attempt < MAX_ATTEMPTS - 1) {
          await sleep(1000 * Math.pow(2, attempt));
        }
      }
    }
  }

  throw lastError;
}

export function createAI(apiKey) {
  return new GoogleGenAI({ apiKey: apiKey?.trim() });
}

export function parseGeminiError(error) {
  const errorMsg = getGeminiErrorMessage(error);
  const status = error.status ?? error.code;

  if (errorMsg.includes('Gemini returned malformed JSON')) {
    return 'Gemini returned malformed JSON even after retries. Please try again; the app now asks Gemini for stricter structured JSON.';
  }

  if (
    errorMsg.includes('API key not valid') ||
    errorMsg.includes('API_KEY_INVALID') ||
    errorMsg.includes('PERMISSION_DENIED')
  ) {
    return 'Gemini rejected this API key. Create a fresh key in Google AI Studio, paste it into the sidebar, and make sure it belongs to the project you expect.';
  }

  if (errorMsg.includes('Quota exceeded') || errorMsg.includes('limit: 0')) {
    return 'Gemini API quota is unavailable for this key/project/model (limit is 0). In AI Studio, check that the key is active, restricted to the Gemini API, attached to the intended project, and that the project has quota or billing enabled.';
  }

  if (errorMsg.includes('model') && (errorMsg.includes('not found') || errorMsg.includes('deprecated') || errorMsg.includes('shut down'))) {
    return 'The configured Gemini model is not available anymore. Update the app to use an active Gemini model such as gemini-2.5-flash.';
  }

  if (
    status === 429 ||
    errorMsg.includes('RESOURCE_EXHAUSTED') ||
    errorMsg.includes('rate limit') ||
    errorMsg.includes('Rate limit')
  ) {
    return 'Gemini rate limit or quota was reached for this project. Check the project rate limits in Google AI Studio, wait for the quota window to reset, or enable billing for a higher tier.';
  }

  if (
    errorMsg.includes('high demand') ||
    errorMsg.includes('UNAVAILABLE') ||
    errorMsg.includes('overloaded') ||
    status === 503
  ) {
    return 'Gemini is temporarily overloaded. The app retried and tried a lighter fallback model, but Google still returned a capacity error. Please wait a moment and try again.';
  }

  return errorMsg;
}
