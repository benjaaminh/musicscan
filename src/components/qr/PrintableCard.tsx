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
    if (!printRef.current) {
      return;
    }

    const printWindow = window.open("", "_blank", "width=1200,height=900");

    if (!printWindow) {
      window.alert("Unable to open print preview. Please allow pop-ups and try again.");
      return;
    }

    const printDocument = printWindow.document;
    printDocument.open();
    printDocument.write("<!DOCTYPE html><html lang=\"en\"><head><meta charset=\"utf-8\" /><meta name=\"viewport\" content=\"width=device-width, initial-scale=1\" /><title>Print Cards</title></head><body></body></html>");
    printDocument.close();

    const styleNodes = Array.from(document.querySelectorAll('style, link[rel="stylesheet"]'));
    styleNodes.forEach((styleNode) => {
      printDocument.head.appendChild(styleNode.cloneNode(true));
    });

    const printContainer = printRef.current.cloneNode(true) as HTMLDivElement;
    printContainer.classList.add("print-only");
    printDocument.body.appendChild(printContainer);

    window.setTimeout(() => {
      printWindow.focus();
      printWindow.print();
      printWindow.close();
    }, 250);
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
