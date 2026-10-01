export type MediaErrorCode = "AUTH" | "RATE_LIMIT" | "NOT_FOUND" | "NETWORK" | "BAD_REQUEST" | "UNKNOWN";

export class MediaError extends Error {
  readonly code: MediaErrorCode;
  readonly status?: number;
  constructor(code: MediaErrorCode, message: string, status?: number) {
    super(message);
    this.name = "MediaError";
    this.code = code;
    this.status = status;
  }
}

export function errorFromStatus(status: number): MediaError {
  if (status === 401 || status === 403) return new MediaError("AUTH", "Invalid or missing API key", status);
  if (status === 404) return new MediaError("NOT_FOUND", "Resource not found", status);
  if (status === 429) return new MediaError("RATE_LIMIT", "Rate limit exceeded", status);
  if (status >= 400 && status < 500) return new MediaError("BAD_REQUEST", `Request failed (${status})`, status);
  return new MediaError("UNKNOWN", `Server error (${status})`, status);
}
