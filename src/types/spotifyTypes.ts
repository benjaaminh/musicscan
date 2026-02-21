// Shared types and constants for Spotify integration

// Storage and configuration keys
export const SPOTIFY_AUTH_STORAGE_KEY = "spotify_auth";
export const SPOTIFY_PKCE_VERIFIER_KEY = "spotify_pkce_verifier";
export const SPOTIFY_PKCE_VERIFIER_FALLBACK_KEY = "spotify_pkce_verifier_fallback";

export type StoredSpotifyAuth = {
  accessToken: string;
  refreshToken?: string;
  expiresAt: number;
};

export type SpotifyConfig = {
  clientId: string | null;
  redirectUri: string | null;
};

export type SpotifyTrackInfo = {
  id: string;
  name: string;
  artists: string[];
  album: string;
  releaseYear: string;
};

export type SpotifyPlaylist = {
  id: string;
  name: string;
  images: Array<{ url: string }>;
  owner: { display_name: string };
  items: { total: number };
  external_urls: { spotify: string };
};

export type SpotifyAlbum = {
  id: string;
  name: string;
  release_date: string;
  images: Array<{ url: string }>;
  artists: Array<{ name: string }>;
  total_tracks: number;
};

export type SpotifyTrack = {
  id: string;
  name: string;
  artists: Array<{ name: string }>;
  album: { name: string; release_date: string };
};
