// Spotify API calls for tracks, playlists, and search

import type { AlbumTrackItem, SpotifyAlbum, SpotifyArtist, SpotifyPlaylist, SpotifyTrack, SpotifyTrackSearchCandidate } from "../types/spotifyTypes";
import { spotifyRequestJson } from "./spotifyRequest";

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

    const data = await spotifyRequestJson<{
      items?: Array<{ track?: SpotifyTrack | null; item?: SpotifyTrack | null }>;
      next?: string | null;
    }>({
      accessToken,
      url: `https://api.spotify.com/v1/playlists/${playlistId}/items?${params.toString()}`,
      action: "fetch playlist tracks",
    });
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

  const data = await spotifyRequestJson<{ tracks?: { items?: Array<SpotifyTrack | null> } }>({
    accessToken,
    url: `https://api.spotify.com/v1/search?${params.toString()}`,
    action: "search tracks",
  });
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

  const data = await spotifyRequestJson<{ albums?: { items?: Array<SpotifyAlbum | null> } }>({
    accessToken,
    url: `https://api.spotify.com/v1/search?${params.toString()}`,
    action: "search albums",
  });
  return (data.albums?.items ?? []).filter((item: SpotifyAlbum | null): item is SpotifyAlbum => item !== null);
};

/**
 * Fetches tracks for an album, including full album info for card generation.
 * For each track, searches for the original version to get accurate release dates.
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
  // Step 1: Load album metadata once so we can decide whether to use
  // the fast path (regular albums) or the expensive resolution path
  // (compilations with potentially incorrect release years).
  const albumData = await spotifyRequestJson<{
    album_type?: string;
    name?: string;
    release_date?: string;
  }>({
    accessToken,
    url: `https://api.spotify.com/v1/albums/${albumId}`,
    action: "fetch album info",
  });
  const isCompilationAlbum = albumData.album_type === "compilation";
  // Base album info used directly for non-compilation albums.
  const baseAlbumInfo = {
    name: albumData.name ?? "",
    release_date: albumData.release_date ?? "",
  };

  const trackIds: string[] = [];
  let offset = 0;
  const limit = 50;
  let hasMore = true;

  // Fast-path output container for non-compilation albums.
  const directTracks: SpotifyTrack[] = [];

  // For compilation albums, we store minimal track data for follow-up search:
  // - trackIds keeps processing order
  // - trackInfoMap keeps searchable text (song + artists)
  const trackInfoMap = new Map<string, { name: string; artists: SpotifyArtist[] }>();
  
  // Step 2: Read all tracks from the selected album (paginated).
  while (hasMore) {
    const params = new URLSearchParams({
      offset: offset.toString(),
      limit: limit.toString(),
    });

    const data = await spotifyRequestJson<{ items?: AlbumTrackItem[]; next?: string | null }>({
      accessToken,
      url: `https://api.spotify.com/v1/albums/${albumId}/tracks?${params.toString()}`,
      action: "fetch album tracks",
    });
    const items = data.items ?? [];
    
    // Branch behavior by album type:
    // - compilation: defer year resolution via search
    // - non-compilation: use the selected album's release year directly
    items.forEach((item: AlbumTrackItem) => {
      if (isCompilationAlbum) {
        trackIds.push(item.id);
        trackInfoMap.set(item.id, {
          name: item.name,
          artists: (item.artists ?? []).map((artist) => ({ name: artist.name ?? "" })),
        });
      } else {
        directTracks.push({
          id: item.id,
          name: item.name,
          artists: (item.artists ?? []).map((artist) => ({ name: artist.name ?? "" })),
          album: baseAlbumInfo,
        });
      }
    });

    hasMore = data.next !== null && data.next !== undefined;
    offset += limit;
  }

  // Step 3 (fast path): for regular albums, return immediately.
  if (!isCompilationAlbum) {
    return directTracks;
  }

  // Step 3 (compilation path): resolve each track's likely original release by
  // searching Spotify and preferring candidates from album-type "album".
  const resolveTrack = async (trackId: string): Promise<SpotifyTrack | null> => {
    try {
      const trackInfo = trackInfoMap.get(trackId);
      if (!trackInfo) {
        return null;
      }

      const artistNames = trackInfo.artists.map((artist: SpotifyArtist) => artist.name ?? "").join(" ");
      const query = `${trackInfo.name} ${artistNames}`;
      const searchParams = new URLSearchParams({
        q: query,
        type: "track",
        // Pull multiple candidates so we can pick a non-compilation album result.
        limit: "10",
      });

      const searchData = await spotifyRequestJson<{ tracks?: { items?: Array<SpotifyTrackSearchCandidate | null> } }>({
        accessToken,
        url: `https://api.spotify.com/v1/search?${searchParams.toString()}`,
        action: `search a matching track for "${trackInfo.name}"`,
      });
      const candidates = ((searchData.tracks?.items ?? []) as Array<SpotifyTrackSearchCandidate | null>).filter(
        (candidate): candidate is SpotifyTrackSearchCandidate => candidate !== null
      );
      // Prefer a canonical album release; fallback to first candidate when needed.
      const foundTrack =
        candidates.find((candidate) => candidate.album?.album_type === "album") ?? candidates[0];

      if (!foundTrack) {
        return null;
      }

      return {
        id: foundTrack.id,
        name: foundTrack.name,
        artists: foundTrack.artists ?? [],
        album: {
          name: foundTrack.album?.name ?? "",
          release_date: foundTrack.album?.release_date ?? "",
        },
      };
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error";
      console.warn(`Error processing track ${trackId}: ${message}`);
      return null;
    }
  };

  // Step 4: bounded parallelism to speed up compilation resolution while
  // avoiding a burst of one-request-per-track at the same instant.
  const maxConcurrent = 5;
  const resolvedTracks: Array<SpotifyTrack | null> = new Array(trackIds.length).fill(null);
  let nextIndex = 0;

  // Worker pulls next index, resolves that track, stores result in-place.
  // In-place assignment preserves original track order.
  const worker = async () => {
    while (true) {
      const index = nextIndex;
      nextIndex += 1;

      if (index >= trackIds.length) {
        return;
      }

      resolvedTracks[index] = await resolveTrack(trackIds[index]);
    }
  };

  // Spin up a small worker pool and wait for all workers to finish.
  const workers = Array.from(
    { length: Math.min(maxConcurrent, trackIds.length) },
    () => worker()
  );

  await Promise.all(workers);

  // Return only successfully resolved tracks.
  return resolvedTracks.filter((track): track is SpotifyTrack => track !== null);
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

    const data = await spotifyRequestJson<{
      items?: Array<SpotifyPlaylist | null>;
      next?: string | null;
    }>({
      accessToken,
      url: `https://api.spotify.com/v1/me/playlists?${params.toString()}`,
      action: "retrieve playlists",
    });
    // Filter out null items from Spotify API
    const validItems = ((data.items ?? []) as Array<SpotifyPlaylist | null>).filter(
      (item): item is SpotifyPlaylist => item !== null
    );
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

    const data = await spotifyRequestJson<{
      items?: Array<{ track?: SpotifyTrack | null }>;
      next?: string | null;
    }>({
      accessToken,
      url: `https://api.spotify.com/v1/me/tracks?${params.toString()}`,
      action: "retrieve saved tracks",
    });
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
