import React from "react";
import PrintableCard from "./qr/PrintableCard";
import type { Card } from "../types/Card";

/**
 * View component for displaying user-generated cards from Spotify.
 * Shows cards generated from a selected Spotify playlist.
 * Only renders if cards have been generated.
 *
 * @prop cards - Array of user-generated cards to display
 */
interface GeneratedCardsViewProps {
  cards: Card[];
}

export const GeneratedCardsView: React.FC<GeneratedCardsViewProps> = ({ cards }) => {
  if (cards.length === 0) {
    return null;
  }

  return (
    <div>
      <h3 className="text-2xl font-bold mb-4">Generated Cards ({cards.length})</h3>
      <PrintableCard cards={cards} />
    </div>
  );
};
