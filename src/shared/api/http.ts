import { API_BASE_URL } from '@/shared/config';
import { ApiError } from './error';

type Json = Record<string, unknown> | unknown[];

interface RequestOptions {
  method?: 'GET' | 'POST';
  body?: Json;
  signal?: AbortSignal;
}

/**
 * Thin typed fetch wrapper around the (mocked) API.
 * - Prefixes {@link API_BASE_URL}.
 * - Serialises JSON bodies.
 * - Throws {@link ApiError} on non-2xx, preserving the parsed body.
 */
export async function apiRequest<TResponse>(
  path: string,
  { method = 'GET', body, signal }: RequestOptions = {},
): Promise<TResponse> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method,
    signal,
    headers: body ? { 'Content-Type': 'application/json' } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });

  const parsed = await parseBody(response);

  if (!response.ok) {
    throw new ApiError(response.status, parsed);
  }

  return parsed as TResponse;
}

async function parseBody(response: Response): Promise<unknown> {
  const text = await response.text();
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}
