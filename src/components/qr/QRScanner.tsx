import { Html5Qrcode } from "html5-qrcode";
import { useCallback, useEffect, useRef, useState, type ChangeEvent } from "react";

type Props = {
  onScan: (text: string) => void;
};

 const Scanner = ({ onScan }: Props) => {
  // Mutable references that persist across renders
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const hasScannedRef = useRef(false);
  const isStartedRef = useRef(false);
  
  const [isStarted, setIsStarted] = useState(false);
  const [isInitializing, setIsInitializing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Lazy init to avoid requesting camera permission before the user clicks.
  const ensureScanner = useCallback(() => {
    if (!scannerRef.current) {
      scannerRef.current = new Html5Qrcode("qr-reader");
    }
    return scannerRef.current;
  }, []);

  // Stop camera stream and release resources.
  const stopScanner = useCallback(async () => {
    const scanner = scannerRef.current;
    if (!scanner || !isStartedRef.current) return;
    try {
      await scanner.stop();
      scanner.clear();
    } catch {
      // Ignore stop failures to avoid blocking UI.
    } finally {
      setIsStarted(false);
      isStartedRef.current = false;
    }
  }, []);

  // Start camera scanning and stop after the first valid read.
  const startScanner = useCallback(async () => {
    if (isStarted || isInitializing) return;
    setError(null);
    hasScannedRef.current = false;
    setIsInitializing(true);

    try {
      const scanner = ensureScanner();
      const cameras = await Html5Qrcode.getCameras();
      // Prefer the last reported camera (often the rear camera on phones).
      const cameraId = cameras?.length ? cameras[cameras.length - 1].id : undefined;
      // Build camera constraints: use a specific camera when available, else request rear camera.
      const constraints = cameraId
        ? { deviceId: { exact: cameraId } }
        : { facingMode: "environment" };

      await scanner.start(
        constraints,
        { fps: 12, qrbox: { width: 260, height: 260 } },
        // Success callback runs every time a QR is detected.
        (text) => {
          if (hasScannedRef.current) return;
          hasScannedRef.current = true;
          onScan(text);
          void stopScanner();
        },
        // Error callback is very noisy; filter "not found" spam and show real issues only.
        (scanError) => {
          const message = String(scanError ?? "");
          if (message.includes("NotFoundException")) return;
          if (message.includes("No QR code found")) return;
          setError(message);
        }
      );

      setIsStarted(true);
      isStartedRef.current = true;
    } catch (startError) {
      setError(startError instanceof Error ? startError.message : "Unable to start camera.");
    } finally {
      setIsInitializing(false);
    }
  }, [ensureScanner, isInitializing, isStarted, onScan, stopScanner]);

  // File-based scan for cases where camera access fails.
  const handleFileSelect = useCallback(
    async (event: ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) return;
      setError(null);
      try {
        const scanner = ensureScanner();
        const text = await scanner.scanFile(file, true);
        onScan(text);
      } catch (scanError) {
        const message = scanError instanceof Error ? scanError.message : "Unable to read QR from image.";
        setError(message);
      } finally {
        event.target.value = "";
      }
    },
    [ensureScanner, onScan]
  );

  useEffect(() => {
    return () => {
      const scanner = scannerRef.current;
      if (!scanner) return;
      if (!isStartedRef.current) {
        scanner.clear();
        scannerRef.current = null;
        return;
      }
      scanner.stop().catch(() => {}).finally(() => {
        scanner.clear();
        scannerRef.current = null;
        isStartedRef.current = false;
      });
    };
  }, []);

  return (
    <div>
      <div style={{ display: "flex", gap: 12, marginBottom: 12, flexWrap: "wrap" }}>
        <button onClick={startScanner} disabled={isStarted || isInitializing}>
          Start Scanner
        </button>
        <button onClick={stopScanner} disabled={!isStarted}>
          Stop Scanner
        </button>
        <button onClick={() => fileInputRef.current?.click()}>
          Scan from Image
        </button>
      </div>
      {error && <p style={{ color: "#d32f2f", marginBottom: 12 }}>{error}</p>}
      {isInitializing && <p style={{ marginBottom: 12 }}>Starting camera...</p>}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        style={{ display: "none" }}
      />
      <div id="qr-reader" />
    </div>
  );
}

export default Scanner;
