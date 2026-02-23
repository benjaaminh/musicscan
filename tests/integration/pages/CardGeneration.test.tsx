import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import CardGeneration from '../../../src/pages/CardGeneration';

const loginMock = vi.fn();
const logoutMock = vi.fn();

vi.mock('../../../src/hooks/useSpotifyAuth', () => ({
  useSpotifyAuth: () => ({
    isAuthenticated: false,
    login: loginMock,
    logout: logoutMock,
    accessToken: 'test-token',
  }),
}));

vi.mock('../../../src/components/spotify/SpotifyAuthenticationButton', () => ({
  SpotifyAuthenticationButton: ({ onConnect, onLogout }: { onConnect: () => void; onLogout: () => void }) => (
    <div>
      <button onClick={onConnect}>Connect Spotify</button>
      <button onClick={onLogout}>Disconnect Spotify</button>
    </div>
  ),
}));

vi.mock('../../../src/components/spotify/MusicLibrarySelector', () => ({
  default: ({ onCardsGenerated }: { onCardsGenerated: (cards: Array<{ spotifyUri: string; title: string }>) => void }) => (
    <button
      onClick={() =>
        onCardsGenerated([
          { spotifyUri: 'spotify:track:1', title: 'Track 1' },
          { spotifyUri: 'spotify:track:2', title: 'Track 2' },
        ])
      }
    >
      Add Initial Cards
    </button>
  ),
}));

vi.mock('../../../src/components/GeneratedCardsView', () => ({
  GeneratedCardsView: ({ cards }: { cards: Array<{ spotifyUri: string }> }) => (
    <div data-testid="generated-cards-count">{cards.length}</div>
  ),
}));

describe('CardGeneration page', () => {
  beforeEach(() => {
    loginMock.mockClear();
    logoutMock.mockClear();
  });

  it('calls login with required Spotify scopes', async () => {
    render(
      <MemoryRouter>
        <CardGeneration />
      </MemoryRouter>
    );

    fireEvent.click(screen.getByRole('button', { name: 'Connect Spotify' }));

    expect(loginMock).toHaveBeenCalledWith([
      'playlist-read-private',
      'playlist-read-collaborative',
      'user-library-read',
    ]);
  });

  it('deduplicates cards by spotify URI across multiple generations', () => {
    render(
      <MemoryRouter>
        <CardGeneration />
      </MemoryRouter>
    );

    const addButton = screen.getByRole('button', { name: 'Add Initial Cards' });

    fireEvent.click(addButton);
    expect(screen.getByTestId('generated-cards-count')).toHaveTextContent('2');

    fireEvent.click(addButton);
    expect(screen.getByTestId('generated-cards-count')).toHaveTextContent('2');
  });

  it('calls logout when disconnect button is clicked', () => {
    render(
      <MemoryRouter>
        <CardGeneration />
      </MemoryRouter>
    );

    fireEvent.click(screen.getByRole('button', { name: 'Disconnect Spotify' }));

    expect(logoutMock).toHaveBeenCalledTimes(1);
  });
});
