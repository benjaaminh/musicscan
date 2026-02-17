import { useState, useEffect } from "react";
import {
  getValidSpotifyAccessToken,
  startSpotifyAuth,
  getSpotifyCallbackCode,
  clearSpotifyCallbackParams,
  exchangeSpotifyCodeForToken,
  clearStoredSpotifyAuth,
} from "../spotify/spotifyClient";

/**
 * Custom hook for managing Spotify OAuth authentication.
 * Handles token initialization, refresh, login, and logout flows.
 *
 * @returns Object containing authentication state and methods:
 *   - accessToken: Current valid access token or null
 *   - isAuthenticated: Whether user is logged in
 *   - isLoading: Whether auth check is in progress
 *   - error: Any auth-related error message
 *   - login: Function to initiate Spotify OAuth flow
 *   - logout: Function to clear auth and sign out
 */
export const useSpotifyAuth = () => {
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Check for cached token or handle OAuth callback
  useEffect(() => {
    const initializeAuth = async () => {
      setIsLoading(true);
      try {
        const code = getSpotifyCallbackCode();
        if (code) {
          await exchangeSpotifyCodeForToken(code);
          clearSpotifyCallbackParams();
        }

        const token = await getValidSpotifyAccessToken();
        if (token) {
          setAccessToken(token);
          setIsAuthenticated(true);
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : "Auth initialization failed";
        console.error("Auth error:", err);
        setError(message);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  /**
   * Initiates Spotify OAuth login flow with PKCE protection.
   * Redirects user to Spotify authorization page.
   *
   * @param scopes - Array of Spotify API scopes to request
   */
  const login = async (scopes: string[] = ["playlist-read-private", "playlist-read-collaborative"]) => {
    try {
      setError(null);
      clearStoredSpotifyAuth();
      const authUrl = await startSpotifyAuth(scopes);
      window.location.href = authUrl;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Login failed";
      setError(message);
    }
  };

  /**
   * Signs out the user by clearing all stored authentication data.
   */
  const logout = () => {
    clearStoredSpotifyAuth();
    setAccessToken(null);
    setIsAuthenticated(false);
  };

  return {
    accessToken,
    isAuthenticated,
    isLoading,
    error,
    login,
    logout,
  };
};
