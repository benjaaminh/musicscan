// Spotify OAuth authentication flow with PKCE

import {
  SPOTIFY_AUTH_STORAGE_KEY,
  SPOTIFY_PKCE_VERIFIER_KEY,
  SPOTIFY_PKCE_VERIFIER_FALLBACK_KEY,
  type StoredSpotifyAuth,
} from "../types/spotifyTypes";
import {
  generateCodeVerifier,
  generateCodeChallenge,
  getSpotifyConfig,
} from "./spotifyUtils";

/**
 * Read cached tokens from localStorage if present.
 * Retrieves stored access token, refresh token, and expiration time.
 *
 * @returns Stored auth object or null if no cached tokens exist
 */
const readStoredAuth = (): StoredSpotifyAuth | null => {
  const raw = localStorage.getItem(SPOTIFY_AUTH_STORAGE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as StoredSpotifyAuth;
  } catch {
    return null;
  }
};

/**
 * Persist tokens to localStorage so the user doesn't have to log in every time.
 * Stores access token, refresh token, and expiration timestamp.
 *
 * @param auth - Authentication object containing tokens and expiration time
 */
const writeStoredAuth = (auth: StoredSpotifyAuth): void => {
  localStorage.setItem(SPOTIFY_AUTH_STORAGE_KEY, JSON.stringify(auth));
};

/**
 * Clears all stored Spotify authentication data from storage.
 * Removes access tokens, refresh tokens, and PKCE verifiers from both localStorage and sessionStorage.
 * Called when user logs out or authentication fails.
 *
 * @returns void
 */
export const clearStoredSpotifyAuth = (): void => {
  localStorage.removeItem(SPOTIFY_AUTH_STORAGE_KEY);
  sessionStorage.removeItem(SPOTIFY_PKCE_VERIFIER_KEY);
  localStorage.removeItem(SPOTIFY_PKCE_VERIFIER_FALLBACK_KEY);
};

/**
 * Extracts the OAuth authorization code from the URL query parameters.
 * Called after user logs in at Spotify and is redirected back to the app.
 *
 * @returns The authorization code if present, null otherwise
 */
export const getSpotifyCallbackCode = (): string | null => {
  const params = new URLSearchParams(window.location.search);
  return params.get("code");
};

/**
 * Removes authorization code and state from URL after successful token exchange.
 * Prevents automatic re-triggering of token exchange on page refresh.
 *
 * @returns void
 */
export const clearSpotifyCallbackParams = (): void => {
  const url = new URL(window.location.href);
  url.searchParams.delete("code");
  url.searchParams.delete("state");
  window.history.replaceState({}, document.title, url.toString());
};

/**
 * Initiates Spotify OAuth PKCE flow by redirecting to Spotify authorization endpoint.
 * Generates and stores PKCE verifier/challenge pair for secure code exchange.
 *
 * @param scopes - Array of Spotify permission scopes (e.g., 'playlist-read-private')
 * @returns Promise resolving to the Spotify authorization URL to redirect to
 * @throws Error if client configuration is missing
 */
export const startSpotifyAuth = async (scopes: string[]): Promise<string> => {
  const { clientId, redirectUri } = getSpotifyConfig();
  if (!clientId || !redirectUri) {
    throw new Error("Missing Spotify client configuration.");
  }

  const verifier = generateCodeVerifier();
  const challenge = await generateCodeChallenge(verifier);

  sessionStorage.setItem(SPOTIFY_PKCE_VERIFIER_KEY, verifier);
  localStorage.setItem(SPOTIFY_PKCE_VERIFIER_FALLBACK_KEY, verifier);

  const params = new URLSearchParams({
    response_type: "code",
    client_id: clientId,
    redirect_uri: redirectUri,
    code_challenge_method: "S256",
    code_challenge: challenge,
    scope: scopes.join(" "),
  });

  return `https://accounts.spotify.com/authorize?${params.toString()}`;
};

/**
 * Exchanges OAuth authorization code for access and refresh tokens.
 * Completes the PKCE authorization flow by trading the code + verifier for tokens.
 *
 * @param code - The OAuth authorization code from Spotify callback
 * @returns Promise resolving to the new access token
 * @throws Error if code exchange fails or configuration is missing
 */
export const exchangeSpotifyCodeForToken = async (code: string): Promise<string> => {
  const { clientId, redirectUri } = getSpotifyConfig();
  if (!clientId || !redirectUri) {
    throw new Error("Missing Spotify client configuration.");
  }

  const verifier =
    sessionStorage.getItem(SPOTIFY_PKCE_VERIFIER_KEY) ??
    localStorage.getItem(SPOTIFY_PKCE_VERIFIER_FALLBACK_KEY);
  if (!verifier) {
    throw new Error("Missing PKCE verifier in session storage.");
  }

  const body = new URLSearchParams({
    grant_type: "authorization_code",
    code,
    redirect_uri: redirectUri,
    client_id: clientId,
    code_verifier: verifier,
  });

  const response = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });

  if (!response.ok) {
    throw new Error("Spotify token exchange failed.");
  }

  const data = await response.json();
  const expiresAt = Date.now() + Number(data.expires_in ?? 0) * 1000;

  writeStoredAuth({
    accessToken: data.access_token,
    refreshToken: data.refresh_token,
    expiresAt,
  });

  return data.access_token as string;
};

/**
 * Refreshes an expired access token using the refresh token.
 * Called automatically when current token is close to expiration.
 *
 * @param refreshToken - The stored refresh token from previous authentication
 * @returns Promise resolving to new access token, or null if refresh fails
 */
const refreshAccessToken = async (refreshToken: string): Promise<string | null> => {
  const { clientId } = getSpotifyConfig();
  if (!clientId) return null;

  const body = new URLSearchParams({
    grant_type: "refresh_token",
    refresh_token: refreshToken,
    client_id: clientId,
  });

  const response = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });

  if (!response.ok) {
    return null;
  }

  const data = await response.json();
  const expiresAt = Date.now() + Number(data.expires_in ?? 0) * 1000;
  const nextRefreshToken = data.refresh_token ?? refreshToken;

  writeStoredAuth({
    accessToken: data.access_token,
    refreshToken: nextRefreshToken,
    expiresAt,
  });

  return data.access_token as string;
};

/**
 * Returns a valid cached access token or automatically refreshes if expired.
 * Checks if current token is still valid (with 30s buffer), otherwise refreshes.
 * This is the main function used throughout the app to get authenticated access to Spotify API.
 *
 * @returns Promise resolving to valid access token, or null if no auth data exists
 */
export const getValidSpotifyAccessToken = async (): Promise<string | null> => {
  const stored = readStoredAuth();
  if (!stored) return null;

  // Token valid for another 30+ seconds
  if (Date.now() < stored.expiresAt - 30000) {
    return stored.accessToken;
  }

  // Try to refresh
  if (!stored.refreshToken) {
    return null;
  }

  return refreshAccessToken(stored.refreshToken);
};
