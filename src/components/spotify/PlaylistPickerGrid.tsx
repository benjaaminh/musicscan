import React from "react";
import type { SpotifyPlaylist } from "../../spotify/spotifyClient";

/**
 * Grid component for displaying and selecting playlists.
 * Shows playlists in a responsive grid with sorting and selection capabilities.
 *
 * @prop playlists - Array of playlists to display
 * @prop selectedPlaylistIds - IDs of currently selected playlists
 * @prop onToggle - Callback when user toggles a playlist
 * @prop loading - Whether playlists are currently loading
 * @prop showUserPlaylists - Whether showing user's playlists
 * @prop sortBy - Current sort order (popularity or name)
 * @prop onSortChange - Callback when user changes sort order
 */
interface PlaylistPickerGridProps {
  playlists: SpotifyPlaylist[];
  selectedPlaylistIds: string[];
  onToggle: (playlist: SpotifyPlaylist) => void;
  loading: boolean;
  showUserPlaylists: boolean;
  sortBy: "popularity" | "name";
  onSortChange: (value: "popularity" | "name") => void;
}

const sortPlaylists = (
  playlists: SpotifyPlaylist[],
  sortBy: "popularity" | "name"
): SpotifyPlaylist[] => {
  const sorted = [...playlists];
  switch (sortBy) {
    case "popularity":
      sorted.sort((a, b) => (b.popularity?.total || 0) - (a.popularity?.total || 0));
      return sorted;
    case "name":
    default:
      sorted.sort((a, b) => a.name.localeCompare(b.name));
      return sorted;
  }
};

export const PlaylistPickerGrid: React.FC<PlaylistPickerGridProps> = ({
  playlists,
  selectedPlaylistIds,
  onToggle,
  loading,
  showUserPlaylists,
  sortBy,
  onSortChange,
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

  const sorted = sortPlaylists(playlists, sortBy);

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 mb-4">
        <h3 className="text-lg font-semibold">
          {showUserPlaylists ? "Your Playlists" : "Playlists"}
        </h3>
        <select
          value={sortBy}
          onChange={(e) => onSortChange(e.target.value as "popularity" | "name")}
          className="input-base text-sm w-full sm:w-auto"
        >
          <option value="popularity">Sort: Most Popular</option>
          <option value="name">Sort: Name</option>
        </select>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {sorted.map((playlist) => (
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
              <p className="text-xs text-muted">{playlist.tracks?.total || 0} tracks</p>
              <p className="text-xs font-medium text-sky-300">
                {((playlist.popularity?.total) || 0).toLocaleString()} followers
              </p>
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
