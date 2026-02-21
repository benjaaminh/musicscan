import React, { useState } from "react";
import { useMusicLibrary } from "../../hooks/useMusicLibrary";
import { useCardBuilder } from "../../hooks/useCardBuilder";
import { LibraryPlaylistsButton } from "./LibraryPlaylistsButton";
import { PlaylistPickerGrid } from "./PlaylistPickerGrid";
import { Alert, ErrorAlert } from "../common/Alert";
import type { Card } from "../../types/Card";

/**
 * Main component for selecting Spotify sources and generating cards.
 * Allows users to load playlists, use liked songs, and search tracks/albums.
 */
interface MusicLibrarySelectorProps {
  onCardsGenerated: (cards: Card[]) => void;
  accessToken: string | null;
}

const MusicLibrarySelector: React.FC<MusicLibrarySelectorProps> = ({ onCardsGenerated, accessToken }) => {
  const {
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
    toggleUserPlaylists,
    loadSavedTracks,
    selectPlaylists,
    selectAlbums,
  } = useMusicLibrary(accessToken);
  const { buildCardsFromTracks } = useCardBuilder();

  const [trackQuery, setTrackQuery] = useState("");
  const [albumQuery, setAlbumQuery] = useState("");

  const handleTogglePlaylist = (playlist: any) => {
    const isSelected = selectedPlaylists.some((item) => item.id === playlist.id);
    if (isSelected) {
      setSelectedPlaylists(selectedPlaylists.filter((item) => item.id !== playlist.id));
    } else {
      setSelectedPlaylists([...selectedPlaylists, playlist]);
    }
  };

  const handleGenerateFromSavedTracks = async () => {
    const cards = await loadSavedTracks();
    if (cards.length > 0) {
      onCardsGenerated(cards);
    }
  };

  const handleSearchTracks = async (e: React.FormEvent) => {
    e.preventDefault();
    await searchTracks(trackQuery);
  };

  const handleToggleTrack = (trackId: string) => {
    const isSelected = selectedTracks.some((track) => track.id === trackId);
    if (isSelected) {
      setSelectedTracks(selectedTracks.filter((track) => track.id !== trackId));
      return;
    }

    const track = trackResults.find((result) => result.id === trackId);
    if (track) {
      setSelectedTracks([...selectedTracks, track]);
    }
  };


  const handleSearchAlbums = async (e: React.FormEvent) => {
    e.preventDefault();
    await searchAlbums(albumQuery);
  };

  const handleToggleAlbum = (albumId: string) => {
    const isSelected = selectedAlbums.some((album) => album.id === albumId);
    if (isSelected) {
      setSelectedAlbums(selectedAlbums.filter((album) => album.id !== albumId));
      return;
    }

    const album = albumResults.find((result) => result.id === albumId);
    if (album) {
      setSelectedAlbums([...selectedAlbums, album]);
    }
  };

  const handleGenerateFromAll = async () => {
    const allCards: Card[] = [];

    // Generate from selected playlists
    if (selectedPlaylists.length > 0) {
      const playlistCards = await selectPlaylists(selectedPlaylists);
      allCards.push(...playlistCards);
    }

    // Generate from selected tracks
    if (selectedTracks.length > 0) {
      const trackCards = buildCardsFromTracks(selectedTracks);
      allCards.push(...trackCards);
    }

    // Generate from selected albums
    if (selectedAlbums.length > 0) {
      const albumCards = await selectAlbums(selectedAlbums);
      allCards.push(...albumCards);
    }

    // Generate all cards at once
    if (allCards.length > 0) {
      onCardsGenerated(allCards);
    }
  };

  const getTotalSelectionsCount = () => {
    return selectedPlaylists.length + selectedTracks.length + selectedAlbums.length;
  };

  const getSelectionsDescription = () => {
    const descriptions = [];
    if (selectedPlaylists.length > 0) {
      descriptions.push(`${selectedPlaylists.length} playlist${selectedPlaylists.length > 1 ? 's' : ''}`);
    }
    if (selectedTracks.length > 0) {
      descriptions.push(`${selectedTracks.length} track${selectedTracks.length > 1 ? 's' : ''}`);
    }
    if (selectedAlbums.length > 0) {
      descriptions.push(`${selectedAlbums.length} album${selectedAlbums.length > 1 ? 's' : ''}`);
    }
    return descriptions.join(', ');
  };

  if (!accessToken) {
    return (
      <Alert
        message={
          <>
            <p className="mb-2">You need to connect your Spotify account to generate cards.</p>
            <p className="text-xs">Use the "Connect Spotify" feature in the app to authenticate.</p>
          </>
        }
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <LibraryPlaylistsButton
          onClick={toggleUserPlaylists}
          loading={loading}
          isActive={showUserPlaylists}
        />
        <div className="card p-4">
          <button
            onClick={handleGenerateFromSavedTracks}
            disabled={loading}
            className="w-full btn btn-secondary"
          >
            Use Liked Songs
          </button>
        </div>
      </div>

      <div className="card p-4 mt-4">
        <h3 className="text-lg font-semibold mb-3">Search Tracks</h3>
        <form onSubmit={handleSearchTracks} className="flex flex-col sm:flex-row gap-2">
          <input
            type="text"
            placeholder="Search for tracks or artists..."
            value={trackQuery}
            onChange={(e) => setTrackQuery(e.target.value)}
            className="input-base flex-1"
          />
          <button
            type="submit"
            disabled={loading || !trackQuery.trim()}
            className="btn btn-primary w-full sm:w-auto"
          >
            Search
          </button>
        </form>
      </div>

      <div className="card p-4 mt-4">
        <h3 className="text-lg font-semibold mb-3">Search Albums</h3>
        <form onSubmit={handleSearchAlbums} className="flex flex-col sm:flex-row gap-2">
          <input
            type="text"
            placeholder="Search for albums or compilations..."
            value={albumQuery}
            onChange={(e) => setAlbumQuery(e.target.value)}
            className="input-base flex-1"
          />
          <button
            type="submit"
            disabled={loading || !albumQuery.trim()}
            className="btn btn-primary w-full sm:w-auto"
          >
            Search
          </button>
        </form>
      </div>

      {error && <ErrorAlert message={error} />}

      {showUserPlaylists && (
        <PlaylistPickerGrid
          playlists={playlists}
          selectedPlaylistIds={selectedPlaylists.map((playlist) => playlist.id)}
          onToggle={handleTogglePlaylist}
          loading={loading}
          showUserPlaylists={showUserPlaylists}
        />
      )}

      {trackResults.length > 0 && (
        <div className="mt-6">
          <h3 className="text-lg font-semibold mb-3">Track Results</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {trackResults.map((track) => (
              <div
                key={track.id}
                className={`card p-4 cursor-pointer ${
                  selectedTracks.some((selected) => selected.id === track.id)
                    ? "border-slate-300 bg-slate-300/10"
                    : "hover:shadow-md"
                }`}
                onClick={() => handleToggleTrack(track.id)}
              >
                <h4 className="font-semibold text-sm mb-1 truncate">{track.name}</h4>
                <p className="text-xs text-muted mb-2">
                  {track.artists.map((artist) => artist.name).join(", ")}
                </p>
                <p className="text-xs text-muted">
                  {track.album?.name ?? "Unknown album"}
                </p>
                {selectedTracks.some((selected) => selected.id === track.id) && (
                  <p className="text-xs text-sky-200 mt-2 font-semibold">Selected</p>
                )}
              </div>
            ))}
          </div>

          {selectedTracks.length > 0 && (
            <div className="mt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <Alert message={`Selected ${selectedTracks.length} tracks`} variant="success" />
            </div>
          )}
        </div>
      )}

      {albumResults.length > 0 && (
        <div className="mt-6">
          <h3 className="text-lg font-semibold mb-3">Album Results</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {albumResults.map((album) => (
              <div
                key={album.id}
                className={`card p-4 cursor-pointer ${
                  selectedAlbums.some((selected) => selected.id === album.id)
                    ? "border-slate-300 bg-slate-300/10"
                    : "hover:shadow-md"
                }`}
                onClick={() => handleToggleAlbum(album.id)}
              >
                {album.images?.[0]?.url && (
                  <img
                    src={album.images[0].url}
                    alt={album.name}
                    className="w-full h-32 object-cover rounded-md mb-3"
                  />
                )}
                <h4 className="font-semibold text-sm mb-1 truncate">{album.name}</h4>
                <p className="text-xs text-muted mb-2">
                  {album.artists.map((artist) => artist.name).join(", ")}
                </p>
                <p className="text-xs text-muted">{album.total_tracks || 0} tracks</p>
                {selectedAlbums.some((selected) => selected.id === album.id) && (
                  <p className="text-xs text-sky-200 mt-2 font-semibold">Selected</p>
                )}
              </div>
            ))}
          </div>

          {selectedAlbums.length > 0 && (
            <div className="mt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <Alert message={`Selected ${selectedAlbums.length} albums`} variant="success" />
            </div>
          )}
        </div>
      )}

      {!loading && showUserPlaylists && playlists.length === 0 && (
        <div className="text-center py-8">
          <p className="text-muted">No playlists found. Follow a playlist in Spotify and try again.</p>
        </div>
      )}

      {getTotalSelectionsCount() > 0 && (
        <div className="mt-6 card p-4 bg-slate-800/50 border border-slate-700">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <p className="text-sm text-slate-300 mb-1">Selected for card generation:</p>
              <p className="text-lg font-semibold text-sky-300">{getSelectionsDescription()}</p>
            </div>
            <button
              type="button"
              className="btn btn-primary w-full sm:w-auto"
              disabled={loading}
              onClick={handleGenerateFromAll}
            >
              Generate Cards
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MusicLibrarySelector;
