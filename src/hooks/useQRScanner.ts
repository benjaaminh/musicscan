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
  const scanCooldownTimeoutRef = useRef<number | null>(null);
  const isStartedRef = useRef(false);

  const [isStarted, setIsStarted] = useState(false);
  const [isInitializing, setIsInitializing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // tries to find the back camera on all devices
  const pickPreferredBackCameraId = useCallback(
    (cameras: Array<{ id: string; label: string }>): string | undefined => {
      if (!cameras.length) return undefined;

      const rearKeywords = ["back", "rear", "environment", "world"];
      const frontKeywords = ["front", "user", "selfie", "facetime"];

      const labeled = cameras.map((camera) => ({
        ...camera,
        labelLower: camera.label.toLowerCase(),
      }));

      const rearCamera = labeled.find((camera) =>
        rearKeywords.some((keyword) => camera.labelLower.includes(keyword))
      );

      if (rearCamera) {
        return rearCamera.id;
      }

      const nonFrontCamera = labeled.find(
        (camera) => !frontKeywords.some((keyword) => camera.labelLower.includes(keyword))
      );

      return nonFrontCamera?.id ?? cameras[0]?.id;
    },
    []
  );

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
      if (scanCooldownTimeoutRef.current !== null) {
        window.clearTimeout(scanCooldownTimeoutRef.current);
        scanCooldownTimeoutRef.current = null;
      }
      setIsStarted(false);
      isStartedRef.current = false;
      hasScannedRef.current = false;
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
      const cameraId = pickPreferredBackCameraId(cameras ?? []);
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

          if (scanCooldownTimeoutRef.current !== null) {
            window.clearTimeout(scanCooldownTimeoutRef.current);
          }

          // Keep camera running for seamless rescans, but throttle duplicate detections
          // while the same QR code remains in view.
          scanCooldownTimeoutRef.current = window.setTimeout(() => {
            hasScannedRef.current = false;
            scanCooldownTimeoutRef.current = null;
          }, 3500);
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
  }, [ensureScanner, isInitializing, isStarted, onScan, pickPreferredBackCameraId]);

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
      if (scanCooldownTimeoutRef.current !== null) {
        window.clearTimeout(scanCooldownTimeoutRef.current);
      }
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
