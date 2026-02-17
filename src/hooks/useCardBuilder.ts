import { useCallback } from "react";
import type { SpotifyTrack } from "../spotify/spotifyClient";
import type { Card } from "../types/Card";

/**
 * Hook for building cards from Spotify tracks.
 */
export const useCardBuilder = () => {
    const buildCardsFromTracks = useCallback((tracks: SpotifyTrack[]): Card[] => {
        return tracks.map((track, index) => {
            const releaseYear = track.album?.release_date
                ? track.album.release_date.split("-")[0]
                : "Unknown";
            return {
                id: `${track.id}-${index}`,
                title: track.name,
                artist: track.artists.map((artist) => artist.name).join(", "),
                year: parseInt(releaseYear, 10) || 0,
                spotifyUri: `spotify:track:${track.id}`,
            };
        });
    }, []);

    return { buildCardsFromTracks };
};
