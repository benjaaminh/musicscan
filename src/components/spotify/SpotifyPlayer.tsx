import { useEffect, useState } from "react";
import { getAccessToken, initSpotifyPlayer } from "../../spotify/spotifyClient";

type Props = {
  trackId: string | null;
  onError: (error: string) => void;
  onClearError: () => void;
};

const SpotifyPlayer = ({ trackId, onError, onClearError }: Props) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [player, setPlayer] = useState<Spotify.Player | null>(null);
  const [deviceId, setDeviceId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Initialize player on mount
  useEffect(() => {
    const token = getAccessToken();
    if (!token) {
      setLoading(false);
      return;
    }

    initSpotifyPlayer(token, (id) => setDeviceId(id))
      .then((p) => {
        setPlayer(p);
        p.addListener("player_state_changed", (state) => {
          if (state && "paused" in state) setIsPlaying(!state.paused);
        });
      })
      .catch((err) => {
        onError("Failed to initialize player: " + String(err));
      })
      .finally(() => setLoading(false));
  }, [onError]);

  // Play track when trackId changes
  useEffect(() => {
    if (!trackId) return;
    playTrack(trackId);
  }, [trackId]);

  const playTrack = async (id: string) => {
    if (!player || !deviceId) {
      onError("Player not ready. Please authenticate with Spotify.");
      return;
    }

    try {
      const token = getAccessToken();
      if (!token) return;

      const trackUri = `spotify:track:${id}`;
      const response = await fetch(
        `https://api.spotify.com/v1/me/player/play?device_id=${deviceId}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ uris: [trackUri] }),
        }
      );

      if (!response.ok) {
        onError("Failed to play track. Make sure you have Spotify Premium.");
        return;
      }

      setIsPlaying(true);
      onClearError();
    } catch (err) {
      onError("Error playing track. Please try again.");
    }
  };

  const togglePlayPause = () => {
    if (!player) return;
    if (isPlaying) {
      player.pause();
      setIsPlaying(false);
    } else {
      player.resume();
      setIsPlaying(true);
    }
  };

  if (loading) {
    return <p>Initializing player...</p>;
  }

  if (!trackId) {
    return null;
  }

  return (
    <section
      style={{
        marginTop: 24,
        padding: 24,
        backgroundColor: "#1a1a1a",
        borderRadius: 12,
        textAlign: "center",
      }}
    >
      <p style={{ fontSize: 12, color: "#aaa", marginBottom: 16 }}>♫ Mystery Track ♫</p>

      <button
        onClick={togglePlayPause}
        style={{
          width: 80,
          height: 80,
          borderRadius: "50%",
          fontSize: 32,
          backgroundColor: "#1DB954",
          color: "white",
          border: "none",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          margin: "0 auto",
          transition: "background-color 0.2s",
        }}
        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#1ed760")}
        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#1DB954")}
      >
        {isPlaying ? "⏸" : "▶"}
      </button>
    </section>
  );
};

export default SpotifyPlayer;
