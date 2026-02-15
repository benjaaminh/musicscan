// Utilities for QR scanning and OAuth (for card generation).
// Deep-links to Spotify app for track playback (complies with Developer Policy—no in-app playback).

// Persist auth and PKCE state across redirects and browser quirks.
const SPOTIFY_AUTH_STORAGE_KEY = "spotify_auth";
const SPOTIFY_PKCE_VERIFIER_KEY = "spotify_pkce_verifier";
const SPOTIFY_PKCE_VERIFIER_FALLBACK_KEY = "spotify_pkce_verifier_fallback";

type StoredSpotifyAuth = {
  accessToken: string;
  refreshToken?: string;
  expiresAt: number;
};

export type SpotifyTrackInfo = {
  id: string;
  name: string;
  artists: string[];
  album: string;
  releaseYear: string;
  durationMs: number;
};

type SpotifyConfig = {
  clientId: string | null;
  redirectUri: string | null;
};

// Pulls client configuration from Vite env variables.
const getSpotifyConfig = (): SpotifyConfig => {
  const clientId = (import.meta as ImportMeta).env.VITE_SPOTIFY_CLIENT_ID ?? null;
  const redirectUri = (import.meta as ImportMeta).env.VITE_SPOTIFY_REDIRECT_URI ?? null;
  return { clientId, redirectUri };
};

// Converts raw bytes into base64url (safe for URLs and PKCE).
const base64UrlEncode = (bytes: Uint8Array): string => {
  const text = String.fromCharCode(...bytes);
  return btoa(text).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
};

// PKCE verifier used to exchange the auth code for an access token.
const generateCodeVerifier = (length = 96): string => {
  const array = new Uint8Array(length);
  crypto.getRandomValues(array);
  return base64UrlEncode(array).slice(0, length);
};

// PKCE challenge = base64url(SHA-256(verifier)).
const generateCodeChallenge = async (verifier: string): Promise<string> => {
  const data = new TextEncoder().encode(verifier);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return base64UrlEncode(new Uint8Array(digest));
};

// Read cached tokens from localStorage if present.
const readStoredAuth = (): StoredSpotifyAuth | null => {
  const raw = localStorage.getItem(SPOTIFY_AUTH_STORAGE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as StoredSpotifyAuth;
  } catch {
    return null;
  }
};

// Persist tokens so the user doesn't have to log in every time.
const writeStoredAuth = (auth: StoredSpotifyAuth): void => {
  localStorage.setItem(SPOTIFY_AUTH_STORAGE_KEY, JSON.stringify(auth));
};

export const clearStoredSpotifyAuth = (): void => {
  localStorage.removeItem(SPOTIFY_AUTH_STORAGE_KEY);
  sessionStorage.removeItem(SPOTIFY_PKCE_VERIFIER_KEY);
  localStorage.removeItem(SPOTIFY_PKCE_VERIFIER_FALLBACK_KEY);
};

// OAuth callback returns a short-lived "code" in the query string.
export const getSpotifyCallbackCode = (): string | null => {
  const params = new URLSearchParams(window.location.search);
  return params.get("code");
};

// Remove auth query params so refresh doesn't re-trigger the exchange.
export const clearSpotifyCallbackParams = (): void => {
  const url = new URL(window.location.href);
  url.searchParams.delete("code");
  url.searchParams.delete("state");
  window.history.replaceState({}, document.title, url.toString());
};

// Starts a PKCE authorization flow and returns the Spotify auth URL.
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

// Exchanges the OAuth code for a short-lived access token and refresh token.
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

// Returns a cached access token or refreshes it when expired.
export const getValidSpotifyAccessToken = async (): Promise<string | null> => {
  const stored = readStoredAuth();
  if (!stored) return null;

  if (Date.now() < stored.expiresAt - 30000) {
    return stored.accessToken;
  }

  if (!stored.refreshToken) {
    return null;
  }

  const { clientId } = getSpotifyConfig();
  if (!clientId) return null;

  const body = new URLSearchParams({
    grant_type: "refresh_token",
    refresh_token: stored.refreshToken,
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
  const nextRefreshToken = data.refresh_token ?? stored.refreshToken;

  writeStoredAuth({
    accessToken: data.access_token,
    refreshToken: nextRefreshToken,
    expiresAt,
  });

  return data.access_token as string;
};

// Fetches track metadata for the reveal step.
export const fetchSpotifyTrackInfo = async (accessToken: string, trackId: string): Promise<SpotifyTrackInfo> => {
  const response = await fetch(`https://api.spotify.com/v1/tracks/${trackId}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!response.ok) {
    throw new Error("Unable to load track info.");
  }

  const data = await response.json();
  const releaseDate = typeof data.album?.release_date === "string" ? data.album.release_date : "";
  const releaseYear = releaseDate ? releaseDate.split("-")[0] : "Unknown";

  return {
    id: data.id,
    name: data.name,
    // Normalize artist names to a simple string array for display.
    artists: Array.isArray(data.artists) ? data.artists.map((artist: { name: string }) => artist.name) : [],
    album: data.album?.name ?? "",
    releaseYear,
    durationMs: data.duration_ms ?? 0,
  };
};

// Extracts a Spotify track ID from either a spotify:track URI or an open.spotify.com URL.
export const parseSpotifyTrackFromScan = (value: string): string | null => {
  const text = value.trim();

  const uriMatch = text.match(/^spotify:track:([A-Za-z0-9]+)$/i);
  if (uriMatch?.[1]) return uriMatch[1];

  const urlMatch = text.match(/open\.spotify\.com\/track\/([A-Za-z0-9]+)(?:\?|$|\/)/i);
  if (urlMatch?.[1]) return urlMatch[1];

  return null;
};

// Builds the embeddable player URL for a track.
export const buildSpotifyEmbedUrl = (trackId: string): string =>
  `https://open.spotify.com/embed/track/${trackId}?utm_source=qr_player`;
