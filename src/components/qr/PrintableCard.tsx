import React, { useRef } from "react";
import { QRCard } from "./QRCard";
import { PrintButton } from "./PrintButton";
import type { Card } from "../../types/Card";
import "./PrintableCard.css";

/**
 * Container component for displaying and printing game cards.
 * Shows all cards in a print-friendly layout and provides print functionality.
 *
 * @prop cards - Array of game cards to display
 */
type Props = {
  cards: Card[];
};

const PrintableCard: React.FC<Props> = ({ cards }) => {
  const printRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div>
      <PrintButton onPrint={handlePrint} />

      <div ref={printRef} className="print-container">
        {cards.map((card) => (
          <QRCard key={card.id} card={card} />
        ))}
      </div>
    </div>
  );
};

export default PrintableCard;
