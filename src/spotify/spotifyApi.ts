// Spotify API calls for tracks, playlists, and search

import type { SpotifyAlbum, SpotifyPlaylist, SpotifyTrack } from "../types/spotifyTypes";

/**
 * Fetches all tracks from a playlist
 *
 * @param accessToken - Spotify API access token
 * @param playlistId - The Spotify playlist ID to fetch tracks from
 * @returns Promise resolving to array of all playlist tracks
 * @throws Error if track fetch fails
 */
export const getPlaylistTracks = async (
  accessToken: string,
  playlistId: string,
  limit: number
): Promise<SpotifyTrack[]> => {
  const tracks: SpotifyTrack[] = [];
  let offset = 0;
  let hasMore = true;

  while (hasMore) {
    const params = new URLSearchParams({
      offset: offset.toString(),
      limit: limit.toString(),
    });

    const response = await fetch(
      `https://api.spotify.com/v1/playlists/${playlistId}/items?${params.toString()}`,
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      }
    );

    if (!response.ok) {
      throw new Error("Failed to fetch playlist tracks");
    }

    const data = await response.json();
    const items = data.items ?? []; // items in the playlist

    const validTracks = items
      .map((item: { track?: SpotifyTrack | null; item?: SpotifyTrack | null }) =>
        item.track ?? item.item ?? null
      )
      .filter((track: SpotifyTrack | null): track is SpotifyTrack => track !== null);

    tracks.push(...validTracks);

    hasMore = data.next !== null && data.next !== undefined;
    offset += limit;
  }

  return tracks;
};

/**
 * Searches for tracks on Spotify by query string.
 * Returns minimal track fields needed for card generation.
 *
 * @param accessToken - Spotify API access token
 * @param query - Search query string (e.g., 'radiohead', 'blinding lights')
 * @returns Promise resolving to array of matching tracks
 * @throws Error if search fails
 */
export const searchSpotifyTracks = async (
  accessToken: string,
  query: string,
): Promise<SpotifyTrack[]> => {
  const params = new URLSearchParams({
    q: query,
    type: "track"
  });

  const response = await fetch(`https://api.spotify.com/v1/search?${params.toString()}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(
      `Failed to search tracks: ${errorData.error?.message || response.statusText}`
    );
  }

  const data = await response.json();
  return (data.tracks?.items ?? []).filter((item: SpotifyTrack | null): item is SpotifyTrack => item !== null);
};

/**
 * Searches for albums on Spotify by query string.
 *
 * @param accessToken - Spotify API access token
 * @param query - Search query string (e.g., 'greatest hits', 'best of')
 * @returns Promise resolving to array of matching albums
 * @throws Error if search fails
 */
export const searchSpotifyAlbums = async (
  accessToken: string,
  query: string,
): Promise<SpotifyAlbum[]> => {
  const params = new URLSearchParams({
    q: query,
    type: "album"
  });

  const response = await fetch(`https://api.spotify.com/v1/search?${params.toString()}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(
      `Failed to search albums: ${errorData.error?.message || response.statusText}`
    );
  }

  const data = await response.json();
  return (data.albums?.items ?? []).filter((item: SpotifyAlbum | null): item is SpotifyAlbum => item !== null);
};

/**
 * Fetches tracks for an album, including basic album info for card generation.
 *
 * @param accessToken - Spotify API access token
 * @param albumId - The Spotify album ID to fetch tracks from
 * @returns Promise resolving to array of album tracks
 * @throws Error if album or track fetch fails
 */
export const getAlbumTracks = async (
  accessToken: string,
  albumId: string
): Promise<SpotifyTrack[]> => {
  const albumResponse = await fetch(
    `https://api.spotify.com/v1/albums/${albumId}?fields=id,name,release_date,artists(name)`,
    {
      headers: { Authorization: `Bearer ${accessToken}` },
    }
  );

  if (!albumResponse.ok) {
    throw new Error("Failed to fetch album info");
  }

  const albumData = await albumResponse.json();
  const albumInfo = {
    name: albumData.name ?? "",
    release_date: typeof albumData.release_date === "string" ? albumData.release_date : "",
  };

  const tracks: SpotifyTrack[] = [];
  let offset = 0;
  const limit = 50;
  let hasMore = true;

  while (hasMore) {
    const params = new URLSearchParams({
      offset: offset.toString(),
      limit: limit.toString(),
    });

    const response = await fetch(
      `https://api.spotify.com/v1/albums/${albumId}/tracks?${params.toString()}`,
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      }
    );

    if (!response.ok) {
      throw new Error("Failed to fetch album tracks");
    }

    const data = await response.json();
    const items = data.items ?? [];

    const validTracks = items.map((item: SpotifyTrack) => ({
      id: item.id,
      name: item.name,
      artists: item.artists ?? [],
      album: albumInfo,
    }));

    tracks.push(...validTracks);

    hasMore = data.next !== null && data.next !== undefined;
    offset += limit;
  }

  return tracks;
};

/**
 * Fetches the current logged-in user's playlists, handling pagination automatically.
 * Returns all playlists the user owns or has added, with full metadata.
 *
 * @param accessToken - Spotify API access token
 * @param limit - Number of results per request (default: 50)
 * @returns Promise resolving to array of user's playlists
 * @throws Error if playlist fetch fails
 */
export const getCurrentUserPlaylists = async (
  accessToken: string,
  limit = 50
): Promise<SpotifyPlaylist[]> => {
  const playlists: SpotifyPlaylist[] = [];
  let offset = 0;
  let hasMore = true;

  while (hasMore) {
    const params = new URLSearchParams({
      offset: offset.toString(),
      limit: limit.toString(),
    });

    const response = await fetch(
      `https://api.spotify.com/v1/me/playlists?${params.toString()}`,
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      }
    );

    if (!response.ok) {
      throw new Error("Failed to fetch user playlists");
    }

    const data = await response.json();
    // Filter out null items from Spotify API
    const validItems = (data.items ?? []).filter((item: any): item is SpotifyPlaylist => item !== null);
    playlists.push(...validItems);

    hasMore = data.next !== null && data.next !== undefined;
    offset += limit;
  }

  return playlists;
};

/**
 * Fetches the current user's saved tracks ("Liked Songs"), handling pagination automatically.
 *
 * @param accessToken - Spotify API access token
 * @param limit - Number of results per request (default: 50)
 * @returns Promise resolving to array of user's saved tracks
 * @throws Error if track fetch fails
 */
export const getCurrentUserSavedTracks = async (
  accessToken: string,
  limit = 50
): Promise<SpotifyTrack[]> => {
  const tracks: SpotifyTrack[] = [];
  let offset = 0;
  let hasMore = true;

  while (hasMore) {
    const params = new URLSearchParams({
      offset: offset.toString(),
      limit: limit.toString(),
    });

    const response = await fetch(
      `https://api.spotify.com/v1/me/tracks?${params.toString()}`,
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      }
    );

    if (!response.ok) {
      throw new Error("Failed to fetch saved tracks");
    }

    const data = await response.json();
    const items = data.items ?? [];

    const validTracks = items
      .map((item: { track?: SpotifyTrack | null }) => item.track ?? null)
      .filter((track: SpotifyTrack | null): track is SpotifyTrack => track !== null);

    tracks.push(...validTracks);

    hasMore = data.next !== null && data.next !== undefined;
    offset += limit;
  }

  return tracks;
};
