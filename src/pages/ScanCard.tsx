import { useState } from "react";
import QRScanner from "../components/qr/QRScanner";
import SpotifyPlayer from "../components/spotify/SpotifyPlayer";
import { parseSpotifyTrackFromScan, getAccessToken, redirectToSpotifyAuth } from "../spotify/spotifyClient";

const ScanCard = () => {
  const [trackId, setTrackId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleScan = (value: string) => {
    const parsedTrackId = parseSpotifyTrackFromScan(value);

    if (!parsedTrackId) {
      setError("This QR code is not a Spotify track.");
      setTrackId(null);
      return;
    }

    setError(null);
    setTrackId(parsedTrackId);
  };

  if (!getAccessToken()) {
    return (
      <main style={{ maxWidth: 480, margin: "0 auto", padding: 24 }}>
        <h2>Scan Card</h2>
        <p>Authenticate with Spotify to play tracks.</p>
        <button
          onClick={redirectToSpotifyAuth}
          style={{ padding: "12px 24px", fontSize: 16, cursor: "pointer" }}
        >
          Login with Spotify
        </button>
      </main>
    );
  }

  return (
    <main style={{ maxWidth: 480, margin: "0 auto", padding: 24 }}>
      <h2>Scan Card</h2>
      <p>Scan a QR code to play a mystery track.</p>

      <QRScanner onScan={handleScan} />

      {error && <p style={{ color: "#d32f2f", marginTop: 12 }}>{error}</p>}

      <SpotifyPlayer 
        trackId={trackId} 
        onError={setError} 
        onClearError={() => setError(null)} 
      />
    </main>
  );
};

export default ScanCard;