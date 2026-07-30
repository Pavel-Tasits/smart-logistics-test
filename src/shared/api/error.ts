import type { ProblemDetail, ValidationProblem } from './types';

/**
 * Error thrown by the HTTP client for any non-2xx response.
 * Bodies follow the API's `application/problem+json` contract
 * ({@link ProblemDetail} / {@link ValidationProblem}).
 */
export class ApiError extends Error {
  readonly status: number;
  readonly body: unknown;

  constructor(status: number, body: unknown, message?: string) {
    super(message ?? `Request failed with status ${status}`);
    this.name = 'ApiError';
    this.status = status;
    this.body = body;
  }

  get isValidationError(): boolean {
    return this.status === 422 && isValidationProblem(this.body);
  }

  get validation(): ValidationProblem | null {
    return this.isValidationError ? (this.body as ValidationProblem) : null;
  }

  /** Human-readable message extracted from the problem body when available. */
  get displayMessage(): string {
    if (isProblemDetail(this.body)) return this.body.message;
    return this.message;
  }
}

export function isProblemDetail(value: unknown): value is ProblemDetail {
  return (
    typeof value === 'object' &&
    value !== null &&
    'code' in value &&
    'message' in value &&
    typeof (value as ProblemDetail).message === 'string'
  );
}

export function isValidationProblem(value: unknown): value is ValidationProblem {
  return (
    isProblemDetail(value) &&
    (value as ValidationProblem).code === 'validation_failed' &&
    Array.isArray((value as ValidationProblem).errors)
  );
}
