type BuildSpotifyErrorMessageInput = {
  action: string;
  status: number;
  statusText: string;
  endpoint: string;
  reason: string | null;
  retryAfterSeconds: number | null;
};

type SpotifyHttpErrorInput = BuildSpotifyErrorMessageInput;

const isRecord = (value: unknown): value is Record<string, unknown> => {
  return typeof value === "object" && value !== null;
};

const getStatusHint = (status: number, retryAfterSeconds: number | null): string | null => {
  if (status === 401) {
    return "Spotify access token expired or is invalid. Reconnect Spotify and try again.";
  }

  if (status === 403) {
    return "Spotify denied this request. Your account may be missing required permissions/scopes.";
  }

  if (status === 429) {
    return retryAfterSeconds !== null
      ? `Rate limited by Spotify. Retry in about ${retryAfterSeconds}s.`
      : "Rate limited by Spotify. Retry in a few seconds.";
  }

  if (status >= 500) {
    return "Spotify service is currently unavailable. Try again shortly.";
  }

  return null;
};

const getStringProperty = (obj: Record<string, unknown>, key: string): string | null => {
  const value = obj[key];
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : null;
};

export const extractSpotifyErrorReason = (payload: unknown): string | null => {
  if (typeof payload === "string") {
    const trimmed = payload.trim();
    return trimmed.length > 0 ? trimmed : null;
  }

  if (!isRecord(payload)) {
    return null;
  }

  const topLevelMessage = getStringProperty(payload, "message");
  if (topLevelMessage) {
    return topLevelMessage;
  }

  const nestedError = payload.error;
  if (!isRecord(nestedError)) {
    return null;
  }

  return getStringProperty(nestedError, "message");
};

export const buildSpotifyErrorMessage = ({
  action,
  status,
  statusText,
  endpoint,
  reason,
  retryAfterSeconds,
}: BuildSpotifyErrorMessageInput): string => {
  const statusLabel = statusText.trim().length > 0 ? statusText : "Unknown Status";
  const reasonOrHint = reason ?? getStatusHint(status, retryAfterSeconds);

  return reasonOrHint
    ? `Failed to ${action} (${status} ${statusLabel}) on ${endpoint}: ${reasonOrHint}`
    : `Failed to ${action} (${status} ${statusLabel}) on ${endpoint}.`;
};

export class SpotifyHttpError extends Error {
  readonly status: number;
  readonly endpoint: string;
  readonly action: string;
  readonly reason: string | null;
  readonly retryAfterSeconds: number | null;

  constructor({ action, status, statusText, endpoint, reason, retryAfterSeconds }: SpotifyHttpErrorInput) {
    super(
      buildSpotifyErrorMessage({
        action,
        status,
        statusText,
        endpoint,
        reason,
        retryAfterSeconds,
      })
    );
    this.name = "SpotifyHttpError";
    this.status = status;
    this.endpoint = endpoint;
    this.action = action;
    this.reason = reason;
    this.retryAfterSeconds = retryAfterSeconds;
  }
}
