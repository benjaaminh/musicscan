import React from "react";

/**
 * Button group for selecting how to generate cards (example vs Spotify).
 * Shows authentication state and allows users to connect/disconnect Spotify account.
 *
 * @prop mode - Current card generation mode ('example' or 'spotify')
 * @prop spotifyAuthenticated - Whether user is logged into Spotify
 * @prop onModeChange - Callback when user switches between modes
 * @prop onConnect - Callback when user clicks "Connect Spotify" button
 * @prop onLogout - Callback when user clicks logout button
 */
interface CardModeSelectorProps {
  mode: "example" | "spotify";
  spotifyAuthenticated: boolean;
  onModeChange: (mode: "example" | "spotify") => void;
  onConnect: () => void;
  onLogout: () => void;
}

export const CardModeSelector: React.FC<CardModeSelectorProps> = ({
  mode,
  spotifyAuthenticated,
  onModeChange,
  onConnect,
  onLogout,
}) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
      <button
        onClick={() => onModeChange("example")}
        className={`w-full btn ${
          mode === "example"
            ? "btn-info"
            : "btn-secondary"
        }`}
      >
        Example Cards
      </button>
      <button
        onClick={spotifyAuthenticated ? () => onModeChange("spotify") : onConnect}
        className={`w-full btn ${
          spotifyAuthenticated
            ? mode === "spotify"
              ? "btn-info"
              : "btn-secondary"
            : "btn-primary"
        }`}
      >
        {spotifyAuthenticated ? "Spotify Playlists" : "Connect Spotify"}
      </button>
      {spotifyAuthenticated && (
        <button
          onClick={onLogout}
          className="w-full btn btn-danger"
        >
          Logout Spotify
        </button>
      )}
    </div>
  );
};
