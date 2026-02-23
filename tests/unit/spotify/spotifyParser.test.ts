import { describe, expect, it } from 'vitest';
import { parseSpotifyTrackFromScan } from '../../../src/spotify/spotifyParser';

describe('parseSpotifyTrackFromScan', () => {
  it('parses spotify URI track format', () => {
    expect(parseSpotifyTrackFromScan('spotify:track:1A2B3C4D')).toBe('1A2B3C4D');
  });

  it('parses open.spotify URL with query params', () => {
    expect(
      parseSpotifyTrackFromScan('https://open.spotify.com/track/7ouMYWpwJ422jRcDASZB7P?si=abc123')
    ).toBe('7ouMYWpwJ422jRcDASZB7P');
  });

  it('parses URL with trailing slash and ignores whitespace', () => {
    expect(parseSpotifyTrackFromScan('  https://open.spotify.com/track/6rqhFgbbKwnb9MLmUQDhG6/  ')).toBe(
      '6rqhFgbbKwnb9MLmUQDhG6'
    );
  });

  it('returns null for unsupported formats', () => {
    expect(parseSpotifyTrackFromScan('spotify:album:1234')).toBeNull();
    expect(parseSpotifyTrackFromScan('https://example.com/not-spotify')).toBeNull();
    expect(parseSpotifyTrackFromScan('')).toBeNull();
  });
});
