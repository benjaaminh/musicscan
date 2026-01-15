import { useRef } from "react";
import QRCode from "react-qr-code";
import type { Card } from "../../types/Card";
import "./PrintableCard.css";

type Props = {
  cards: Card[];
};

const PrintableCard = ({ cards }: Props) => {
  const printRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div>
      <button onClick={handlePrint} style={{ marginBottom: 16 }}>
        Print Cards
      </button>

      <div ref={printRef} className="print-container">
        {cards.map((card) => (
          <div key={card.id} className="card-page">
            {/* QR Code Side */}
            <div className="card-side qr-side">
              <div className="qr-content">
                <QRCode value={card.spotifyUri} size={200} level="H" />
              </div>
            </div>

            {/* Metadata Side */}
            <div className="card-side metadata-side">
              <div className="metadata-content">
                <h2>{card.year}</h2>
                <p className="artist">{card.title}</p>
                <p className="year">{card.artist}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PrintableCard;
