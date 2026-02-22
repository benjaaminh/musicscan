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
    // verify that the print ref exists (the div containing cards)
    if (!printRef.current) {
      return;
    }

    // open a new browser window for printing
    const printWindow = window.open("", "_blank", "width=1200,height=900"); 

    if (!printWindow) {
      window.alert("Unable to open print preview. Please allow pop-ups and try again.");
      return;
    }
    
    // the print window document
    const printDocument = printWindow.document;
    printDocument.open();
    
    // the print window is a html-document
    printDocument.write("<!DOCTYPE html><html lang=\"en\"><head><meta charset=\"utf-8\" /><meta name=\"viewport\" content=\"width=device-width, initial-scale=1\" /><title>Print Cards</title></head><body></body></html>");
    printDocument.close();

    // copy all stylesheets and style tags from the main document to the print window
    const styleNodes = Array.from(document.querySelectorAll('style, link[rel="stylesheet"]'));
    styleNodes.forEach((styleNode) => {
      printDocument.head.appendChild(styleNode.cloneNode(true));
    });

    // add only the cards to the print window. this excludes other elements from the printed cards.
    const printContainer = printRef.current.cloneNode(true) as HTMLDivElement;
    printDocument.body.appendChild(printContainer);

    // wait for styles to load, then focus the window, trigger print dialog, and close
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
        <p className="print-instructions">Fold each card in half so the QR code is on one side and the song info is on the other.</p>
        {cards.map((card) => (
          <QRCard key={card.id} card={card} />
        ))}
      </div>
    </div>
  );
};

export default PrintableCard;
