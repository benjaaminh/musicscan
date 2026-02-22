import React from "react";

/**
 * Button component for loading user's playlists.
 *
 * @prop onClick - Function when button is clicked
 * @prop loading - Whether playlists are currently loading
 * @prop isActive - Whether user playlists view is currently active
 */
interface LibraryPlaylistsButtonProps {
  onClick: () => void;
  loading: boolean;
  isActive: boolean;
}

export const LibraryPlaylistsButton: React.FC<LibraryPlaylistsButtonProps> = ({
  onClick,
  loading,
  isActive,
}) => {
  return (
    <div className="card p-4">
      <button
        onClick={onClick}
        disabled={loading}
        className={`w-full btn ${isActive ? "btn-info" : "btn-secondary"}`}
      >
        {isActive ? "Hide Playlists" : "Show Your Playlists"}
      </button>
    </div>
  );
};
