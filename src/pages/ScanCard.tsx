import { useState, useEffect } from "react";
import QRScanner from "../components/qr/QRScanner";
import { parseSpotifyTrackFromScan } from "../spotify/spotifyClient";
import { Link } from "react-router-dom";

const ScanCard = () => {
  const [trackId, setTrackId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [countdown, setCountdown] = useState<number | null>(null);

  // Countdown timer: after 3 seconds, open Spotify.
  useEffect(() => {
    if (countdown === null) return;
    if (countdown === 0) {
      window.location.href = `spotify:track:${trackId}`;
      return;
    }
    const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    return () => clearTimeout(timer);
  }, [countdown, trackId]);

  // Parse QR and start countdown.
  const handleScan = (value: string) => {
    const parsedTrackId = parseSpotifyTrackFromScan(value);

    if (!parsedTrackId) {
      setError("This QR code is not a Spotify track.");
      setTrackId(null);
      return;
    }

    setError(null);
    setTrackId(parsedTrackId);
    setStatus("Flip your screen!");
    setCountdown(3);
  };

  return (
    <main style={{ maxWidth: 480, margin: "0 auto", padding: 24 }}>
      <p>
        <Link to="/">Go back</Link>
      </p>
      <h2>Scan Card</h2>
      <p>Scan a QR code pointing to a Spotify track to play it inline.</p>

      <QRScanner onScan={handleScan} />

      {error && <p style={{ color: "#d32f2f", marginTop: 12 }}>{error}</p>}
      {status && (
        <div style={{ marginTop: 24, textAlign: "center" }}>
          <p style={{ fontSize: 18, fontWeight: "bold" }}>{status}</p>
          {countdown !== null && (
            <p style={{ fontSize: 48, fontWeight: "bold", marginTop: 12 }}>
              {countdown}
            </p>
          )}
        </div>
      )}

    </main>
  );
};

export default ScanCard;