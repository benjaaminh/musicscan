import { useMemo, useState } from "react";
import QRScanner from "../components/qr/QRScanner";
import { buildSpotifyEmbedUrl, parseSpotifyTrackFromScan } from "../spotify/spotifyClient";
import { Link } from "react-router-dom";

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

  const embedUrl = useMemo(() => {
    if (!trackId) return null;
    return buildSpotifyEmbedUrl(trackId);
  }, [trackId]);

  return (
    <main style={{ maxWidth: 480, margin: "0 auto", padding: 24 }}>
      <p>
        <Link to="/">Go back</Link>
      </p>
      <h2>Scan Card</h2>
      <p>Scan a QR code pointing to a Spotify track to play it inline.</p>

      <QRScanner onScan={handleScan} />

      {error && (
        <p style={{ color: "#d32f2f", marginTop: 12 }}>{error}</p>
      )}

      {embedUrl && (
        <section style={{ marginTop: 24 }}>
          <h3 style={{ marginBottom: 8 }}>Now playing</h3>
          <iframe
            title="Spotify player"
            src={embedUrl}
            width="100%"
            height="160"
            style={{ borderRadius: 12, border: "none" }}
            allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
          />
        </section>
      )}
    </main>
  );
};

export default ScanCard;