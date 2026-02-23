import React, { useState } from "react";
import { Alert } from "../common/Alert";
import type { SpotifyTrack } from "../../spotify/spotifyClient";

interface TrackSearchSectionProps {
  loading: boolean;
  trackResults: SpotifyTrack[];
  selectedTrackIds: string[];
  onSearch: (query: string) => Promise<void> | void;
  onToggleTrack: (trackId: string) => void;
}

export const TrackSearchSection: React.FC<TrackSearchSectionProps> = ({
  loading,
  trackResults,
  selectedTrackIds,
  onSearch,
  onToggleTrack,
}) => {
  const [trackQuery, setTrackQuery] = useState("");

  const handleSearchTracks = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSearch(trackQuery);
  };

  return (
    <>
      <div className="card p-4 mt-4">
        <h3 className="text-lg font-semibold mb-3">Search Tracks</h3>
        <form onSubmit={handleSearchTracks} className="flex flex-col sm:flex-row gap-2">
          <input
            type="text"
            placeholder="Search for tracks or artists..."
            value={trackQuery}
            onChange={(e) => setTrackQuery(e.target.value)}
            className="input-base flex-1"
          />
          <button
            type="submit"
            disabled={loading || !trackQuery.trim()}
            className="btn btn-primary w-full sm:w-auto"
          >
            Search
          </button>
        </form>
      </div>

      {trackResults.length > 0 && (
        <div className="mt-6">
          <h3 className="text-lg font-semibold mb-3">Track Results</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {trackResults.map((track) => {
              const isSelected = selectedTrackIds.includes(track.id);
              return (
                <div
                  key={track.id}
                  className={`card p-4 cursor-pointer ${
                    isSelected ? "border-slate-300 bg-slate-300/10" : "hover:shadow-md"
                  }`}
                  onClick={() => onToggleTrack(track.id)}
                >
                  <h4 className="font-semibold text-sm mb-1 truncate">{track.name}</h4>
                  <p className="text-xs text-muted mb-2">
                    {track.artists.map((artist) => artist.name).join(", ")}
                  </p>
                  <p className="text-xs text-muted">{track.album?.name ?? "Unknown album"}</p>
                  {isSelected && (
                    <p className="text-xs text-sky-200 mt-2 font-semibold">Selected</p>
                  )}
                </div>
              );
            })}
          </div>

          {selectedTrackIds.length > 0 && (
            <div className="mt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <Alert message={`Selected ${selectedTrackIds.length} tracks`} variant="success" />
            </div>
          )}
        </div>
      )}
    </>
  );
};
