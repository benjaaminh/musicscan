import { extractSpotifyErrorReason, SpotifyHttpError } from "./spotifyErrors";

type SpotifyRequestJsonOptions = {
  accessToken: string;
  url: string;
  action: string;
  init?: RequestInit;
};

const parseEndpoint = (url: string): string => {
  try {
    const parsed = new URL(url);
    return `${parsed.pathname}${parsed.search}`;
  } catch {
    return url;
  }
};

const parseRetryAfterSeconds = (headers: Headers): number | null => {
  const retryAfter = headers.get("Retry-After");
  if (!retryAfter) {
    return null;
  }

  const parsed = Number.parseInt(retryAfter, 10);
  return Number.isNaN(parsed) ? null : parsed;
};

const readResponsePayload = async (response: Response): Promise<unknown> => {
  const raw = await response.text();
  if (!raw.trim()) {
    return null;
  }

  try {
    return JSON.parse(raw) as unknown;
  } catch {
    return raw;
  }
};

const createNetworkErrorMessage = (action: string): string => {
  return `Unable to reach Spotify while trying to ${action}. Check internet connectivity and try again.`;
};

export const spotifyRequestJson = async <T>({ accessToken, url, action, init }: SpotifyRequestJsonOptions): Promise<T> => {
  let response: Response;

  try {
    response = await fetch(url, {
      ...init,
      headers: {
        Authorization: `Bearer ${accessToken}`,
        ...(init?.headers ?? {}),
      },
    });
  } catch {
    throw new Error(createNetworkErrorMessage(action));
  }

  if (!response.ok) {
    const payload = await readResponsePayload(response);
    throw new SpotifyHttpError({
      action,
      status: response.status,
      statusText: response.statusText,
      endpoint: parseEndpoint(url),
      reason: extractSpotifyErrorReason(payload),
      retryAfterSeconds: parseRetryAfterSeconds(response.headers),
    });
  }

  return (await response.json()) as T;
};
