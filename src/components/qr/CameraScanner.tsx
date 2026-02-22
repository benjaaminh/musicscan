import React from "react";

/**
 * Camera-based QR code scanner UI component.
 * Displays the camera feed and start button for scanning QR codes.
 *
 * @prop onStart - Function when user clicks the start camera button
 * @prop isStarted - Whether the camera is currently active
 * @prop isInitializing - Whether camera permissions are being requested
 */
interface CameraScannerProps {
  onStart: () => void;
  isStarted: boolean;
  isInitializing: boolean;
}

export const CameraScanner: React.FC<CameraScannerProps> = ({
  onStart,
  isStarted,
  isInitializing,
}) => {
  return (
    <div>
      <div id="qr-reader" style={{ width: "100%" }} />

      {!isStarted && (
        <button
          onClick={onStart}
          disabled={isInitializing}
          className="w-full mt-4 btn btn-info"
        >
          {isInitializing ? "Initializing camera..." : "Start Camera"}
        </button>
      )}
    </div>
  );
};
