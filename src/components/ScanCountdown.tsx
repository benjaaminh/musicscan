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
    <div style={{ marginTop: 24, textAlign: "center" }}>
      <p style={{ fontSize: 18, fontWeight: "bold" }}>{status}</p>
      {countdown !== null && (
        <p style={{ fontSize: 48, fontWeight: "bold", marginTop: 12 }}>
          {countdown}
        </p>
      )}
    </div>
  );
};
