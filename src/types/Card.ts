/**
 * Represents a card with track information and QR code data.
 * Used throughout the app to store and display music track information.
 * The spotifyUri is encoded in the QR code on printed cards.
 */
export interface Card {
  id: string;
  title: string;
  artist: string;
  year: number;
  /** Spotify URI format: spotify:track:TRACK_ID */
  spotifyUri: string;
}
