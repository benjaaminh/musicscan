import React from "react";
import { useMusicLibrary } from "../../hooks/useMusicLibrary";
import { useCardBuilder } from "../../hooks/useCardBuilder";
import type { SpotifyPlaylist } from "../../spotify/spotifyClient";
import { LibraryPlaylistsButton } from "../spotify/LibraryPlaylistsButton";
import { PlaylistPickerGrid } from "../spotify/PlaylistPickerGrid";
import { TrackSearchSection } from "../spotify/TrackSearchSection";
import { AlbumSearchSection } from "../spotify/AlbumSearchSection";
import { SelectionSummaryBar } from "../spotify/SelectionSummaryBar";
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

  /**
   * Function for selecting a playlist
   * @param playlist the playlist to select
   */
  const handleSelectPlaylist = (playlist: SpotifyPlaylist) => {
    // check if the playlist is selected
    const isSelected = selectedPlaylists.some((item) => item.id === playlist.id);
    // if it is, filter it out
    if (isSelected) {
      setSelectedPlaylists(selectedPlaylists.filter((item) => item.id !== playlist.id));
    } else {
      // else, add it to selected playlists
      setSelectedPlaylists([...selectedPlaylists, playlist]);
    }
  };

  const handleGenerateFromSavedTracks = async () => {
    const cards = await loadSavedTracks();
    if (cards.length > 0) {
      onCardsGenerated(cards); //set the saved tracks into generated tracks
    }
  };

  const handleToggleTrack = (trackId: string) => {
    // check if track is selected
    const isSelected = selectedTracks.some((track) => track.id === trackId);
    // if it is, filter it out from selected
    if (isSelected) { 
      setSelectedTracks(selectedTracks.filter((track) => track.id !== trackId));
      return;
    }
    
    //select a track
    const track = trackResults.find((result) => result.id === trackId);
    if (track) {
      //add it to list of selected tracks
      setSelectedTracks([...selectedTracks, track]);
    }
  };

  // select album
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


  /**
   * Function to handle card generation from multiple sources
   */
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

  const totalSelectionsCount = getTotalSelectionsCount();
  const selectionsDescription = getSelectionsDescription();

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
            onClick={handleGenerateFromSavedTracks} //use liked songs
            disabled={loading}
            className="w-full btn btn-secondary"
          >
            Use Liked Songs
          </button>
        </div>
      </div>

      <TrackSearchSection // tracks
        loading={loading}
        trackResults={trackResults}
        selectedTrackIds={selectedTracks.map((track) => track.id)}
        onSearch={searchTracks}
        onToggleTrack={handleToggleTrack}
      />

      <AlbumSearchSection //albums
        loading={loading}
        albumResults={albumResults}
        selectedAlbumIds={selectedAlbums.map((album) => album.id)}
        onSearch={searchAlbums}
        onToggleAlbum={handleToggleAlbum}
      />

      {error && <ErrorAlert message={error} />}

      {showUserPlaylists && ( //user playlists
        <PlaylistPickerGrid
          playlists={playlists}
          selectedPlaylistIds={selectedPlaylists.map((playlist) => playlist.id)}
          onToggle={handleSelectPlaylist}
          loading={loading}
          showUserPlaylists={showUserPlaylists}
        />
      )}

      {!loading && showUserPlaylists && playlists.length === 0 && (
        <div className="text-center py-8">
          <p className="text-muted">No playlists found. Follow a playlist in Spotify and try again.</p>
        </div>
      )}

      {totalSelectionsCount > 0 && (
        <SelectionSummaryBar // what is selected
          selectionDescription={selectionsDescription}
          loading={loading}
          onGenerate={handleGenerateFromAll}
        />
      )}
    </div>
  );
};

export default MusicLibrarySelector;
