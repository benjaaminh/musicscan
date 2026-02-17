import React from "react";

interface PrintButtonProps {
  onPrint: () => void;
}

export const PrintButton: React.FC<PrintButtonProps> = ({ onPrint }) => {
  return (
    <button
      onClick={onPrint}
      className="btn btn-info w-full sm:w-auto mb-4"
    >
      Print Cards
    </button>
  );
};
