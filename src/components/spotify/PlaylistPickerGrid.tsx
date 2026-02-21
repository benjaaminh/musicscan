import React from "react";
import type { SpotifyPlaylist } from "../../spotify/spotifyClient";

/**
 * Grid component for displaying and selecting playlists.
 * Shows playlists in a responsive grid with selection capabilities.
 *
 * @prop playlists - Array of playlists to display
 * @prop selectedPlaylistIds - IDs of currently selected playlists
 * @prop onToggle - Callback when user toggles a playlist
 * @prop loading - Whether playlists are currently loading
 * @prop showUserPlaylists - Whether showing user's playlists
 */
interface PlaylistPickerGridProps {
  playlists: SpotifyPlaylist[];
  selectedPlaylistIds: string[];
  onToggle: (playlist: SpotifyPlaylist) => void;
  loading: boolean;
  showUserPlaylists: boolean;
}

export const PlaylistPickerGrid: React.FC<PlaylistPickerGridProps> = ({
  playlists,
  selectedPlaylistIds,
  onToggle,
  loading,
  showUserPlaylists,
}) => {
  if (loading) {
    return (
      <div className="text-center py-8">
        <p className="text-white/70">Loading...</p>
      </div>
    );
  }

  if (playlists.length === 0) {
    return null;
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 mb-4">
        <h3 className="text-lg font-semibold">
          {showUserPlaylists ? "Your Playlists" : "Playlists"}
        </h3>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {playlists.map((playlist) => (
          <div
            key={playlist.id}
            className={`card p-4 cursor-pointer ${
              selectedPlaylistIds.includes(playlist.id)
                ? "border-slate-300 bg-slate-300/10"
                : "hover:shadow-md"
            }`}
            onClick={() => onToggle(playlist)}
          >
            {playlist.images?.[0]?.url && (
              <img
                src={playlist.images[0].url}
                alt={playlist.name}
                className="w-full h-32 object-cover rounded-md mb-3"
              />
            )}
            <h4 className="font-semibold text-sm mb-1 truncate">{playlist.name}</h4>
            <p className="text-xs text-muted mb-2">
              by {playlist.owner?.display_name || "Unknown"}
            </p>
            <div className="flex justify-between items-center mb-2">
              <p className="text-xs text-muted">{playlist.items?.total || 0} tracks</p>
            </div>
            {selectedPlaylistIds.includes(playlist.id) && (
              <p className="text-xs text-sky-200 mt-2 font-semibold">Selected</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
