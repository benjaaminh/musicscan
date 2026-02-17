import { Html5Qrcode } from "html5-qrcode";
import { useCallback, useEffect, useRef, useState, type ChangeEvent } from "react";

/**
 * Custom hook for managing QR code scanning via camera or file upload.
 * Handles camera initialization, permissions, scanning, and cleanup.
 *
 * @param onScan - Callback function triggered when a QR code is successfully scanned
 * @returns Object containing scanner state and methods:
 *   - fileInputRef: Ref for file input element
 *   - isStarted: Whether camera is currently active
 *   - isInitializing: Whether camera permission is being requested
 *   - error: Any error message from camera or file operations
 *   - startScanner: Initialize and start camera scanning
 *   - stopScanner: Stop camera and release resources
 *   - handleFileSelect: Handle QR code image file selection
 */
export const useQRScanner = (onScan: (text: string) => void) => {
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const hasScannedRef = useRef(false);
  const isStartedRef = useRef(false);

  const [isStarted, setIsStarted] = useState(false);
  const [isInitializing, setIsInitializing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const ensureScanner = useCallback(() => {
    if (!scannerRef.current) {
      scannerRef.current = new Html5Qrcode("qr-reader");
    }
    return scannerRef.current;
  }, []);

  const stopScanner = useCallback(async () => {
    const scanner = scannerRef.current;
    if (!scanner || !isStartedRef.current) return;
    try {
      await scanner.stop();
      scanner.clear();
    } catch {
      // Ignore stop failures
    } finally {
      setIsStarted(false);
      isStartedRef.current = false;
    }
  }, []);

  const startScanner = useCallback(async () => {
    if (isStarted || isInitializing) return;
    setError(null);
    hasScannedRef.current = false;
    setIsInitializing(true);

    try {
      const scanner = ensureScanner();
      const cameras = await Html5Qrcode.getCameras();
      // Back camera
      const cameraId = cameras?.length ? cameras[cameras.length - 1].id : undefined;
      const constraints = cameraId
        ? { deviceId: { exact: cameraId } }
        : { facingMode: "environment" };

      await scanner.start(
        constraints,
        { fps: 12, qrbox: { width: 260, height: 260 } },
        (text) => {
          if (hasScannedRef.current) return;
          hasScannedRef.current = true;
          onScan(text);
          void stopScanner();
        },
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
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      }
    },
    [ensureScanner, onScan]
  );

  useEffect(() => {
    return () => {
      void stopScanner();
    };
  }, [stopScanner]);

  return {
    fileInputRef,
    isStarted,
    isInitializing,
    error,
    startScanner,
    stopScanner,
    handleFileSelect,
  };
};
