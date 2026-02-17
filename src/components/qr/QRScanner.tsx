import { useQRScanner } from "../../hooks/useQRScanner";
import { CameraScanner } from "./CameraScanner";
import { FileScanner } from "./FileScanner";
import { ErrorAlert } from "../common/Alert";

/**
 * Main QR code scanner component.
 * Provides two ways to scan: camera-based scanning or file upload.
 *
 * @prop onScan - Callback function triggered when a QR code is successfully scanned
 */
type Props = {
  onScan: (text: string) => void;
};

const Scanner = ({ onScan }: Props) => {
  const { fileInputRef, isStarted, isInitializing, error, startScanner, handleFileSelect } =
    useQRScanner(onScan);

  return (
    <div className="space-y-4">
      <CameraScanner onStart={startScanner} isStarted={isStarted} isInitializing={isInitializing} />

      <FileScanner fileInputRef={fileInputRef} onFileSelect={handleFileSelect} />

      {error && <ErrorAlert message={error} />}
    </div>
  );
};

export default Scanner;
