import { useState, useCallback } from "react";
import { Link } from "react-router-dom";
import QRScanner from "../components/qr/QRScanner";
import { ScanCountdown } from "../components/ScanCountdown";
import { parseSpotifyTrackFromScan } from "../spotify/spotifyClient";
import { useCountdown } from "../hooks/useCountdown";
import { ErrorAlert } from "../components/common/Alert";

/**
 * Card scanning page where users can scan QR codes pointing to Spotify tracks.
 * When a valid QR code is detected, displays a countdown and opens the track in Spotify.
 * Supports both camera-based and file-based QR code scanning.
 */
const ScanCard = () => {
  const [trackId, setTrackId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);

  const handleCountdownComplete = useCallback(() => {
    if (trackId) {
      window.location.href = `spotify:track:${trackId}`;
    }
  }, [trackId]);

  const { countdown, start } = useCountdown(3, handleCountdownComplete);

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
    start();
  };

  return (
    <main className="container-main max-w-md">
      <p className="mb-4">
        <Link to="/">Go back</Link>
      </p>
      <h2 className="text-2xl font-bold mb-2">Scan Card</h2>
      <p className="text-muted mb-6">Scan a QR code pointing to a Spotify track to play it.</p>

      <QRScanner onScan={handleScan} />

      {error && <ErrorAlert message={error} />}

      <ScanCountdown countdown={countdown} status={status} />
    </main>
  );
};

export default ScanCard;