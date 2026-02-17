import React from "react";

/**
 * Display component for showing scan countdown timer and status message.
 * Shows a status message and numerical countdown during scanning operations.
 *
 * @prop countdown - Current countdown value in seconds, or null if not counting down
 * @prop status - Status message to display to the user, or null to hide component
 */
interface ScanCountdownProps {
  countdown: number | null;
  status: string | null;
}

export const ScanCountdown: React.FC<ScanCountdownProps> = ({ countdown, status }) => {
  if (!status) return null;

  return (
    <div className="mt-6 text-center">
      <p className="text-lg font-bold">{status}</p>
      {countdown !== null && (
        <p className="text-5xl font-bold mt-3">
          {countdown}
        </p>
      )}
    </div>
  );
};
