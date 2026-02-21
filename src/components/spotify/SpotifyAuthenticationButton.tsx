import React from "react";

/**
 * Button group for Spotify authentication and account state.
 * Shows authentication state and allows users to connect/disconnect Spotify account.
 *
 * @prop spotifyAuthenticated - Whether user is logged into Spotify
 * @prop onConnect - Callback when user clicks "Connect Spotify" button
 * @prop onLogout - Callback when user clicks logout button
 */
interface SpotifyAuthenticationProps {
  spotifyAuthenticated: boolean;
  onConnect: () => void;
  onLogout: () => void;
}

export const SpotifyAuthenticationButton: React.FC<SpotifyAuthenticationProps> = ({
  spotifyAuthenticated,
  onConnect,
  onLogout,
}) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
      <button
        onClick={() => {
          if (!spotifyAuthenticated) {
            onConnect();
          }
        }}
        className={`w-full btn ${
          spotifyAuthenticated
              ? "btn-info"
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
