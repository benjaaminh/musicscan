import React from "react";
import PrintableCard from "./qr/PrintableCard";
import type { Card } from "../types/Card";

/**
 * View component for displaying example game cards.
 * Shows pre-generated example cards with an info message about switching to Spotify mode.
 *
 * @prop cards - Array of example cards to display
 */
interface ExampleCardsViewProps {
  cards: Card[];
}

export const ExampleCardsView: React.FC<ExampleCardsViewProps> = ({ cards }) => {
  return (
    <div className="mb-8">
      <div className="alert alert-info mb-6">
        <p className="text-sm">
          Showing {cards.length} example cards. Switch to "Spotify Playlists" to create cards from your music library.
        </p>
      </div>
      <PrintableCard cards={cards} />
    </div>
  );
};
