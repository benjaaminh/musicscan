import { act, renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { useCountdown } from '../../../src/hooks/useCountdown';

describe('useCountdown', () => {
  it('counts down each second and calls onComplete at zero', () => {
    vi.useFakeTimers();
    const onComplete = vi.fn();

    const { result } = renderHook(() => useCountdown(3, onComplete));

    expect(result.current.countdown).toBe(3);

    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(result.current.countdown).toBe(2);

    act(() => {
      vi.advanceTimersByTime(2000);
    });
    expect(result.current.countdown).toBe(1);

    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(result.current.countdown).toBe(0);

    act(() => {
      vi.runOnlyPendingTimers();
    });
    expect(onComplete).toHaveBeenCalledTimes(1);

    vi.useRealTimers();
  });

  it('can stop and restart the countdown', () => {
    vi.useFakeTimers();

    const { result } = renderHook(() => useCountdown(2));

    act(() => {
      result.current.stop();
    });
    expect(result.current.countdown).toBeNull();

    act(() => {
      result.current.start();
    });
    expect(result.current.countdown).toBe(2);

    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(result.current.countdown).toBe(1);

    vi.useRealTimers();
  });
});
