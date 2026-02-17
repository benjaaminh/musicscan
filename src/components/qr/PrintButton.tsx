import React from "react";

interface PrintButtonProps {
  onPrint: () => void;
}

export const PrintButton: React.FC<PrintButtonProps> = ({ onPrint }) => {
  return (
    <button
      onClick={onPrint}
      className="btn btn-info mb-4"
    >
      Print Cards
    </button>
  );
};
