export type AIEngineErrorCode =
  | "MISSING_API_KEY"
  | "INVALID_INPUT"
  | "REQUEST_TOO_LARGE"
  | "AUTHENTICATION_ERROR"
  | "INSUFFICIENT_QUOTA"
  | "RATE_LIMIT"
  | "PROVIDER_UNAVAILABLE"
  | "EMPTY_RESPONSE"
  | "INVALID_PROVIDER_RESPONSE"
  | "INVALID_STRUCTURED_OUTPUT"
  | "UNKNOWN_ERROR";

interface AIEngineErrorOptions {
  code: AIEngineErrorCode;
  message: string;
  status: number;
  cause?: unknown;
}

export class AIEngineError extends Error {
  readonly code: AIEngineErrorCode;
  readonly status: number;
  readonly cause?: unknown;

  constructor({
    code,
    message,
    status,
    cause,
  }: AIEngineErrorOptions) {
    super(message);

    this.name = "AIEngineError";
    this.code = code;
    this.status = status;
    this.cause = cause;
  }
}

export const isAIEngineError = (
  error: unknown,
): error is AIEngineError => {
  return error instanceof AIEngineError;
};