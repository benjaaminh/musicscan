// Utilities for cryptographic operations and config management

import type { SpotifyConfig } from "./spotifyTypes";

/**
 * Converts raw bytes into base64url (safe for URLs and PKCE).
 * Used for encoding cryptographic values in OAuth flows.
 *
 * @param bytes - Raw bytes to encode
 * @returns Base64url encoded string (URL-safe)
 */
export const base64UrlEncode = (bytes: Uint8Array): string => {
  const text = String.fromCharCode(...bytes);
  return btoa(text).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
};

/**
 * Generates a PKCE code verifier - a random, URL-safe string used in OAuth flows.
 * Required for secure authorization code exchange without a client secret.
 *
 * @param length - Length of verifier (default: 96 characters)
 * @returns Random PKCE-compliant code verifier string
 */
export const generateCodeVerifier = (length = 96): string => {
  const array = new Uint8Array(length);
  crypto.getRandomValues(array);
  return base64UrlEncode(array).slice(0, length);
};

/**
 * Generates a PKCE code challenge by hashing the verifier with SHA-256.
 * Sent to authorization server to prove later possession of the verifier.
 *
 * @param verifier - The PKCE code verifier to hash
 * @returns Promise resolving to the base64url-encoded SHA-256 hash of the verifier
 */
export const generateCodeChallenge = async (verifier: string): Promise<string> => {
  const data = new TextEncoder().encode(verifier);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return base64UrlEncode(new Uint8Array(digest));
};

/**
 * Retrieves Spotify application configuration from environment variables.
 * Configuration includes client ID and redirect URI required for OAuth flow.
 *
 * @returns Object containing Spotify client ID and redirect URI (may be null if not configured)
 */
export const getSpotifyConfig = (): SpotifyConfig => {
  const clientId = (import.meta as ImportMeta).env.VITE_SPOTIFY_CLIENT_ID ?? null;
  const redirectUri = (import.meta as ImportMeta).env.VITE_SPOTIFY_REDIRECT_URI ?? null;
  return { clientId, redirectUri };
};
