import { useEffect, useState } from "react";

/**
 * Custom hook for managing a countdown timer.
 * Automatically counts down from initial value to 0 and triggers callback.
 *
 * @param initialSeconds - Starting value for countdown (null to start paused)
 * @param onComplete - Optional callback function to execute when countdown reaches 0
 * @returns Object with countdown state and control methods:
 *   - countdown: Current countdown value or null if not running
 *   - start: Begin counting down
 *   - stop: Pause the countdown
 *   - reset: Reset to initial value
 */
export const useCountdown = (initialSeconds: number | null, onComplete?: () => void) => {
  const [countdown, setCountdown] = useState<number | null>(initialSeconds);

  useEffect(() => {
    if (countdown === null) return;
    if (countdown === 0) {
      onComplete?.();
      return;
    }

    const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    return () => clearTimeout(timer);
  }, [countdown, onComplete]);

  const start = () => setCountdown(initialSeconds);
  const stop = () => setCountdown(null);
  const reset = () => setCountdown(initialSeconds);

  return { countdown, start, stop, reset };
};
