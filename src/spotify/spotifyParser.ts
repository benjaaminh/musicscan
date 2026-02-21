// Parsing and parsing utilities for Spotify data

/**
 * Extracts a Spotify track ID from either a spotify:track URI or an open.spotify.com URL.
 * Handles two formats:
 * - Spotify URI: spotify:track:ID
 * - Spotify Web URL: https://open.spotify.com/track/ID
 *
 * @param value - The Spotify URI or URL string to parse
 * @returns The extracted track ID, or null if format is unrecognized
 */
export const parseSpotifyTrackFromScan = (value: string): string | null => {
  const text = value.trim();

  // Try spotify:track:ID format
  const uriMatch = text.match(/^spotify:track:([A-Za-z0-9]+)$/i);
  if (uriMatch?.[1]) return uriMatch[1];

  // Try open.spotify.com/track/ID format
  const urlMatch = text.match(/open\.spotify\.com\/track\/([A-Za-z0-9]+)(?:\?|$|\/)/i);
  if (urlMatch?.[1]) return urlMatch[1];

  return null;
};