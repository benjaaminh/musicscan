import { useState, useCallback } from "react";
import {
  searchSpotifyTracks,
  searchSpotifyAlbums,
  getCurrentUserPlaylists,
  getPlaylistTracks,
  getCurrentUserSavedTracks,
  getAlbumTracks,
  type SpotifyPlaylist,
  type SpotifyTrack,
  type SpotifyAlbum,
} from "../spotify/spotifyClient";
import type { Card } from "../types/Card";
import { useCardBuilder } from "./useCardBuilder";

/**
 * Hook for Spotify library data and search.
 * Loads user playlists, searches tracks/albums, and converts tracks to cards.
 */
export const useMusicLibrary = (accessToken: string | null) => {
  const [playlists, setPlaylists] = useState<SpotifyPlaylist[]>([]);
  const [selectedPlaylists, setSelectedPlaylists] = useState<SpotifyPlaylist[]>([]);
  const [trackResults, setTrackResults] = useState<SpotifyTrack[]>([]);
  const [selectedTracks, setSelectedTracks] = useState<SpotifyTrack[]>([]);
  const [albumResults, setAlbumResults] = useState<SpotifyAlbum[]>([]);
  const [selectedAlbums, setSelectedAlbums] = useState<SpotifyAlbum[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showUserPlaylists, setShowUserPlaylists] = useState(false);

  const { buildCardsFromTracks } = useCardBuilder();

  const searchTracks = useCallback(
    async (query: string) => {
      if (!accessToken || !query.trim()) return;

      try {
        setLoading(true);
        setError(null);
        const results = await searchSpotifyTracks(accessToken, query);
        setTrackResults(results);
      } catch (err) {
        const message = err instanceof Error ? err.message : "Failed to search tracks";
        setError(message);
      } finally {
        setLoading(false);
      }
    },
    [accessToken]
  );

  const searchAlbums = useCallback(
    async (query: string) => {
      if (!accessToken || !query.trim()) return;

      try {
        setLoading(true);
        setError(null);
        const results = await searchSpotifyAlbums(accessToken, query);
        setAlbumResults(results);
      } catch (err) {
        const message = err instanceof Error ? err.message : "Failed to search albums";
        setError(message);
      } finally {
        setLoading(false);
      }
    },
    [accessToken]
  );

  const loadUserPlaylists = useCallback(async () => {
    if (!accessToken) return;

    try {
      setLoading(true);
      setError(null);
      const userPlaylists = await getCurrentUserPlaylists(accessToken);
      const validPlaylists = userPlaylists.filter((playlist): playlist is SpotifyPlaylist => playlist !== null);
      setPlaylists(validPlaylists);
      setShowUserPlaylists(true);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to load playlists";
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [accessToken]);

  const toggleUserPlaylists = useCallback(async () => {
    if (showUserPlaylists) {
      setShowUserPlaylists(false);
    } else {
      await loadUserPlaylists();
    }
  }, [showUserPlaylists, loadUserPlaylists]);

  const loadSavedTracks = useCallback(async (): Promise<Card[]> => {
    if (!accessToken) return [];

    try {
      setLoading(true);
      setError(null);
      setSelectedPlaylists([]);

      const tracks = await getCurrentUserSavedTracks(accessToken);
      return buildCardsFromTracks(tracks);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to load saved tracks";
      setError(message);
      return [];
    } finally {
      setLoading(false);
    }
  }, [accessToken]);

  const selectPlaylists = useCallback(
    async (playlistsToLoad: SpotifyPlaylist[]): Promise<Card[]> => {
      if (!accessToken) return [];

      try {
        setLoading(true);
        setError(null);
        setSelectedPlaylists(playlistsToLoad);

        const trackLists = await Promise.all(
          playlistsToLoad.map((playlist) => getPlaylistTracks(accessToken, playlist.id, 50))
        );

        const seen = new Set<string>();
        const mergedTracks: SpotifyTrack[] = [];

        trackLists.forEach((playlistTracks) => {
          playlistTracks.forEach((track) => {
            if (!seen.has(track.id)) {
              seen.add(track.id);
              mergedTracks.push(track);
            }
          });
        });

        return buildCardsFromTracks(mergedTracks);
      } catch (err) {
        const message = err instanceof Error ? err.message : "Failed to load playlist tracks";
        setError(message);
        return [];
      } finally {
        setLoading(false);
      }
    },
    [accessToken]
  );

  const selectAlbums = useCallback(
    async (albumsToLoad: SpotifyAlbum[]): Promise<Card[]> => {
      if (!accessToken) return [];

      try {
        setLoading(true);
        setError(null);
        setSelectedAlbums(albumsToLoad);

        const trackLists = await Promise.all(
          albumsToLoad.map((album) => getAlbumTracks(accessToken, album.id))
        );

        const seen = new Set<string>();
        const mergedTracks: SpotifyTrack[] = [];

        trackLists.forEach((albumTracks) => {
          albumTracks.forEach((track) => {
            if (!seen.has(track.id)) {
              seen.add(track.id);
              mergedTracks.push(track);
            }
          });
        });

        return buildCardsFromTracks(mergedTracks);
      } catch (err) {
        const message = err instanceof Error ? err.message : "Failed to load album tracks";
        setError(message);
        return [];
      } finally {
        setLoading(false);
      }
    },
    [accessToken]
  );

  const reset = useCallback(() => {
    setPlaylists([]);
    setSelectedPlaylists([]);
    setTrackResults([]);
    setSelectedTracks([]);
    setAlbumResults([]);
    setSelectedAlbums([]);
    setError(null);
    setShowUserPlaylists(false);
  }, []);

  return {
    playlists,
    selectedPlaylists,
    setSelectedPlaylists,
    trackResults,
    selectedTracks,
    setSelectedTracks,
    albumResults,
    selectedAlbums,
    setSelectedAlbums,
    loading,
    error,
    showUserPlaylists,
    searchTracks,
    searchAlbums,
    loadUserPlaylists,
    toggleUserPlaylists,
    loadSavedTracks,
    selectPlaylists,
    selectAlbums,
    reset,
  };
};
