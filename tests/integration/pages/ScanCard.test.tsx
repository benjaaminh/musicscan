import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import ScanCard from '../../../src/pages/ScanCard';

const startMock = vi.fn();
const stopMock = vi.fn();
const parseSpotifyTrackFromScanMock = vi.fn<(value: string) => string | null>();

vi.mock('../../../src/spotify/spotifyClient', () => ({
  parseSpotifyTrackFromScan: (value: string) => parseSpotifyTrackFromScanMock(value),
}));

vi.mock('../../../src/hooks/useCountdown', () => ({
  useCountdown: () => ({
    countdown: 3,
    start: startMock,
    stop: stopMock,
  }),
}));

vi.mock('../../../src/components/qr/QRScanner', () => ({
  default: ({ onScan }: { onScan: (value: string) => void }) => (
    <div>
      <button onClick={() => onScan('invalid-value')}>Mock Invalid Scan</button>
      <button onClick={() => onScan('valid-value')}>Mock Valid Scan</button>
    </div>
  ),
}));

describe('ScanCard page', () => {
  beforeEach(() => {
    startMock.mockClear();
    stopMock.mockClear();
    parseSpotifyTrackFromScanMock.mockReset();
  });

  it('shows an error on invalid scan values', () => {
    parseSpotifyTrackFromScanMock.mockReturnValue(null);

    render(
      <MemoryRouter>
        <ScanCard />
      </MemoryRouter>
    );

    fireEvent.click(screen.getByRole('button', { name: 'Mock Invalid Scan' }));

    expect(screen.getByText('This QR code is not a Spotify track.')).toBeInTheDocument();
    expect(startMock).not.toHaveBeenCalled();
  });

  it('starts countdown and sets status for valid Spotify tracks', () => {
    parseSpotifyTrackFromScanMock.mockReturnValue('7ouMYWpwJ422jRcDASZB7P');

    render(
      <MemoryRouter>
        <ScanCard />
      </MemoryRouter>
    );

    fireEvent.click(screen.getByRole('button', { name: 'Mock Valid Scan' }));

    expect(startMock).toHaveBeenCalledTimes(1);
    expect(screen.getByText('Flip your screen!')).toBeInTheDocument();
  });

  it('stops countdown when toggle is turned off', () => {
    parseSpotifyTrackFromScanMock.mockReturnValue('7ouMYWpwJ422jRcDASZB7P');

    render(
      <MemoryRouter>
        <ScanCard />
      </MemoryRouter>
    );

    const checkbox = screen.getByRole('checkbox', { name: /Show countdown on scan/i });
    expect(checkbox).toBeChecked();

    fireEvent.click(checkbox);
    expect(stopMock).toHaveBeenCalledTimes(1);
    expect(checkbox).not.toBeChecked();
  });
});
