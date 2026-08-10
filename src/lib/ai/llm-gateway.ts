// ============================================
// LLM Gateway — Routes all AI calls through OpenRouter (free models)
// Fallback chain: if primary model rate-limited, cascade to next
// ============================================

import type { LLMMessage, LLMResponse } from '@/types';

const OPENROUTER_BASE_URL = 'https://openrouter.ai/api/v1';
const GROQ_BASE_URL = 'https://api.groq.com/openai/v1';

// Groq models (when GROQ_API_KEY is available)
const GROQ_MODELS = [
  'llama-3.3-70b-versatile',
  'llama-3.1-8b-instant',
  'qwen-2.5-coder-32b',
  'deepseek-r1-distill-llama-70b',
];

// Ordered fallback chain for OpenRouter Gemini and free-tier models
const FREE_MODEL_FALLBACKS = [
  'google/gemini-2.5-flash',
  'google/gemini-2.5-flash-lite',
  'google/gemini-2.5-pro',
  'meta-llama/llama-3.3-70b-instruct:free',
  'deepseek/deepseek-r1:free',
  'google/gemma-3-27b-it:free',
  'qwen/qwen-2.5-72b-instruct:free',
];

export interface LLMConfig {
  model?: string;
  temperature?: number;
  maxTokens?: number;
  topP?: number;
}

function getOpenRouterHeaders(): Record<string, string> {
  const key = process.env.OPENROUTER_API_KEY;
  if (!key) throw new Error('OPENROUTER_API_KEY is not set');
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${key}`,
    ...(process.env.NEXT_PUBLIC_APP_URL
      ? { 'HTTP-Referer': process.env.NEXT_PUBLIC_APP_URL }
      : {}),
    'X-Title': 'AI Career OS',
  };
}

function getGroqHeaders(): Record<string, string> | null {
  const key = process.env.GROQ_API_KEY;
  if (!key) return null;
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${key}`,
  };
}

function buildFallbackChain(primary?: string): string[] {
  if (!primary) return FREE_MODEL_FALLBACKS;
  const rest = FREE_MODEL_FALLBACKS.filter((m) => m !== primary);
  return [primary, ...rest];
}

function isRetriable(status: number): boolean {
  return status === 429 || status === 402 || status === 503 || status === 404 || status === 400 || status >= 500;
}

export class LLMGateway {
  /**
   * Non-streaming chat completion with automatic fallback across Groq and OpenRouter
   */
  static async chat(
    messages: LLMMessage[],
    config: LLMConfig = {}
  ): Promise<LLMResponse> {
    const startTime = Date.now();

    // 1. Try Groq first if GROQ_API_KEY is available
    const groqHeaders = getGroqHeaders();
    if (groqHeaders) {
      for (const model of GROQ_MODELS) {
        try {
          const response = await fetch(`${GROQ_BASE_URL}/chat/completions`, {
            method: 'POST',
            headers: groqHeaders,
            signal: AbortSignal.timeout(30_000),
            body: JSON.stringify({
              model,
              messages,
              temperature: config.temperature ?? 0.7,
              max_tokens: config.maxTokens ?? 2048,
              ...(config.topP !== undefined ? { top_p: config.topP } : {}),
            }),
          });

          if (response.ok) {
            const data = await response.json();
            return {
              content: data.choices?.[0]?.message?.content ?? '',
              model: `groq/${model}`,
              usage: {
                promptTokens: data.usage?.prompt_tokens || 0,
                completionTokens: data.usage?.completion_tokens || 0,
                totalTokens: data.usage?.total_tokens || 0,
              },
              latency: Date.now() - startTime,
            };
          }
          console.warn(`[LLMGateway] Groq model "${model}" returned ${response.status}; trying next`);
        } catch (err) {
          console.warn(`[LLMGateway] Groq model "${model}" failed:`, (err as Error).message);
        }
      }
    }

    // 2. Fallback to OpenRouter chain
    const chain = buildFallbackChain(config.model);
    let lastError: Error | null = null;

    for (let i = 0; i < chain.length; i++) {
      const model = chain[i];

      try {
        const response = await fetch(`${OPENROUTER_BASE_URL}/chat/completions`, {
          method: 'POST',
          headers: getOpenRouterHeaders(),
          signal: AbortSignal.timeout(60_000),
          body: JSON.stringify({
            model,
            messages,
            temperature: config.temperature ?? 0.7,
            max_tokens: config.maxTokens ?? 2048,
            ...(config.topP !== undefined ? { top_p: config.topP } : {}),
          }),
        });

        if (response.ok) {
          const data = await response.json();
          if (i > 0) {
            console.warn(`[LLMGateway] Fell back to "${model}" after earlier models were unavailable`);
          }
          return {
            content: data.choices?.[0]?.message?.content ?? '',
            model,
            usage: {
              promptTokens: data.usage?.prompt_tokens || 0,
              completionTokens: data.usage?.completion_tokens || 0,
              totalTokens: data.usage?.total_tokens || 0,
            },
            latency: Date.now() - startTime,
          };
        }

        const errText = await response.text().catch(() => response.statusText);
        lastError = new Error(`LLM API error (${response.status}) on "${model}": ${errText}`);

        if (!isRetriable(response.status)) throw lastError;
        console.warn(`[LLMGateway] "${model}" returned ${response.status}; trying next fallback`);
      } catch (err) {
        if (err instanceof Error && err.message.includes('LLM API error')) throw err;
        lastError = err as Error;
        console.warn(`[LLMGateway] "${model}" failed:`, (err as Error).message);
      }
    }

    throw lastError ?? new Error('LLM request failed: no models responded');
  }

  /**
   * Streaming chat completion (returns ReadableStream for SSE)
   */
  static async stream(
    messages: LLMMessage[],
    config: LLMConfig = {}
  ): Promise<ReadableStream<Uint8Array>> {
    // 1. Try Groq first if key available
    const groqHeaders = getGroqHeaders();
    if (groqHeaders) {
      for (const model of GROQ_MODELS) {
        try {
          const response = await fetch(`${GROQ_BASE_URL}/chat/completions`, {
            method: 'POST',
            headers: groqHeaders,
            signal: AbortSignal.timeout(30_000),
            body: JSON.stringify({
              model,
              messages,
              temperature: config.temperature ?? 0.7,
              max_tokens: config.maxTokens ?? 2048,
              stream: true,
            }),
          });

          if (response.ok && response.body) {
            return response.body;
          }
        } catch (err) {
          console.warn(`[LLMGateway] Groq stream "${model}" failed:`, (err as Error).message);
        }
      }
    }

    // 2. Fallback to OpenRouter chain
    const chain = buildFallbackChain(config.model);
    let lastError: Error | null = null;

    for (let i = 0; i < chain.length; i++) {
      const model = chain[i];

      try {
        const response = await fetch(`${OPENROUTER_BASE_URL}/chat/completions`, {
          method: 'POST',
          headers: getOpenRouterHeaders(),
          signal: AbortSignal.timeout(60_000),
          body: JSON.stringify({
            model,
            messages,
            temperature: config.temperature ?? 0.7,
            max_tokens: config.maxTokens ?? 2048,
            stream: true,
          }),
        });

        if (response.ok && response.body) {
          if (i > 0) {
            console.warn(`[LLMGateway] Stream fell back to "${model}"`);
          }
          return response.body;
        }

        const errText = await response.text().catch(() => response.statusText);
        lastError = new Error(`Stream error (${response.status}) on "${model}": ${errText}`);
        if (!isRetriable(response.status)) throw lastError;
        console.warn(`[LLMGateway] Stream "${model}" returned ${response.status}; trying next fallback`);
      } catch (err) {
        if (err instanceof Error && err.message.includes('Stream error')) throw err;
        lastError = err as Error;
        console.warn(`[LLMGateway] Stream "${model}" failed:`, (err as Error).message);
      }
    }

    throw lastError ?? new Error('Stream failed: no models responded');
  }

  /**
   * Generate embeddings using Gemini (free tier)
   */
  static async embed(text: string): Promise<number[]> {
    const key = process.env.GOOGLE_AI_API_KEY;
    if (!key) throw new Error('GOOGLE_AI_API_KEY is not set');

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-embedding-001:embedContent?key=${key}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'models/gemini-embedding-001',
          content: { parts: [{ text }] },
          outputDimensionality: 768,
        }),
      }
    );

    if (!response.ok) {
      const errText = await response.text().catch(() => response.statusText);
      throw new Error(`Embedding error (${response.status}): ${errText}`);
    }

    const data = await response.json();
    const values = data?.embedding?.values;
    if (!Array.isArray(values)) throw new Error('Embedding response missing values');
    return values as number[];
  }
}
