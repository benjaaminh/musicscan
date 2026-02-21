import React from "react";
import QRCode from "react-qr-code";
import type { Card } from "../../types/Card";

/**
 * Individual game card component displaying a QR code with track metadata.
 * Shows the QR code on one side and track info (year, title, artist) on the other.
 * Designed for printing.
 *
 * @prop card - The game card object containing QR data and metadata
 */
interface CardProps {
  card: Card;
}

export const QRCard: React.FC<CardProps> = ({ card }) => {
  return (
    <div className="card-page">
      {/* QR Code Side */}
      <div className="card-side qr-side">
        <div className="qr-content">
          <QRCode value={card.spotifyUri} size={200} level="H" />
        </div>
      </div>

      {/* Metadata Side */}
      <div className="card-side metadata-side">
        <div className="metadata-content">
          <h2 className="text-7xl font-bold">{card.year}</h2>
          <p className="title">{card.title}</p>
          <p className="artist">{card.artist}</p>
        </div>
      </div>
    </div>
  );
};
