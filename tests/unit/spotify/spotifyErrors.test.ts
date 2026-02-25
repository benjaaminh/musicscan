import { describe, expect, it } from 'vitest';
import { buildSpotifyErrorMessage, extractSpotifyErrorReason } from '../../../src/spotify/spotifyErrors';

describe('spotifyErrors', () => {
  describe('extractSpotifyErrorReason', () => {
    it('extracts nested Spotify error message', () => {
      expect(extractSpotifyErrorReason({ error: { message: 'Invalid access token' } })).toBe('Invalid access token');
    });

    it('extracts top-level message', () => {
      expect(extractSpotifyErrorReason({ message: 'Service unavailable' })).toBe('Service unavailable');
    });

    it('returns null for unknown payload shape', () => {
      expect(extractSpotifyErrorReason({ foo: 'bar' })).toBeNull();
      expect(extractSpotifyErrorReason(null)).toBeNull();
    });
  });

  describe('buildSpotifyErrorMessage', () => {
    it('prefers Spotify-provided reason in message', () => {
      const message = buildSpotifyErrorMessage({
        action: 'retrieve playlists',
        status: 403,
        statusText: 'Forbidden',
        endpoint: '/v1/me/playlists',
        reason: 'Insufficient client scope',
        retryAfterSeconds: null,
      });

      expect(message).toBe(
        'Failed to retrieve playlists (403 Forbidden) on /v1/me/playlists: Insufficient client scope'
      );
    });

    it('falls back to status-specific hint when reason is missing', () => {
      const message = buildSpotifyErrorMessage({
        action: 'search tracks',
        status: 401,
        statusText: 'Unauthorized',
        endpoint: '/v1/search',
        reason: null,
        retryAfterSeconds: null,
      });

      expect(message).toContain('Failed to search tracks (401 Unauthorized) on /v1/search');
      expect(message).toContain('Spotify access token expired or is invalid');
    });

    it('includes retry window for rate limits', () => {
      const message = buildSpotifyErrorMessage({
        action: 'retrieve saved tracks',
        status: 429,
        statusText: 'Too Many Requests',
        endpoint: '/v1/me/tracks',
        reason: null,
        retryAfterSeconds: 7,
      });

      expect(message).toBe(
        'Failed to retrieve saved tracks (429 Too Many Requests) on /v1/me/tracks: Rate limited by Spotify. Retry in about 7s.'
      );
    });
  });
});
