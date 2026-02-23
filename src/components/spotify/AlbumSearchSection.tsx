import React, { useState } from "react";
import { Alert } from "../common/Alert";
import type { SpotifyAlbum } from "../../spotify/spotifyClient";

interface AlbumSearchSectionProps {
  loading: boolean;
  albumResults: SpotifyAlbum[];
  selectedAlbumIds: string[];
  onSearch: (query: string) => Promise<void> | void;
  onToggleAlbum: (albumId: string) => void;
}

export const AlbumSearchSection: React.FC<AlbumSearchSectionProps> = ({
  loading,
  albumResults,
  selectedAlbumIds,
  onSearch,
  onToggleAlbum,
}) => {
  const [albumQuery, setAlbumQuery] = useState("");

  const handleSearchAlbums = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSearch(albumQuery);
  };

  return (
    <>
      <div className="card p-4 mt-4">
        <h3 className="text-lg font-semibold mb-3">Search Albums</h3>
        <form onSubmit={handleSearchAlbums} className="flex flex-col sm:flex-row gap-2">
          <input
            type="text"
            placeholder="Search for albums or compilations..."
            value={albumQuery}
            onChange={(e) => setAlbumQuery(e.target.value)}
            className="input-base flex-1"
          />
          <button
            type="submit"
            disabled={loading || !albumQuery.trim()}
            className="btn btn-primary w-full sm:w-auto"
          >
            Search
          </button>
        </form>
      </div>

      {albumResults.length > 0 && (
        <div className="mt-6">
          <h3 className="text-lg font-semibold mb-3">Album Results</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {albumResults.map((album) => {
              const isSelected = selectedAlbumIds.includes(album.id);
              return (
                <div
                  key={album.id}
                  className={`card p-4 cursor-pointer ${
                    isSelected ? "border-slate-300 bg-slate-300/10" : "hover:shadow-md"
                  }`}
                  onClick={() => onToggleAlbum(album.id)}
                >
                  {album.images?.[0]?.url && (
                    <img
                      src={album.images[0].url}
                      alt={album.name}
                      className="w-full h-32 object-cover rounded-md mb-3"
                    />
                  )}
                  <h4 className="font-semibold text-sm mb-1 truncate">{album.name}</h4>
                  <p className="text-xs text-muted mb-2">
                    {album.artists.map((artist) => artist.name).join(", ")}
                  </p>
                  <p className="text-xs text-muted">{album.total_tracks || 0} tracks</p>
                  {isSelected && (
                    <p className="text-xs text-sky-200 mt-2 font-semibold">Selected</p>
                  )}
                </div>
              );
            })}
          </div>

          {selectedAlbumIds.length > 0 && (
            <div className="mt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <Alert message={`Selected ${selectedAlbumIds.length} albums`} variant="success" />
            </div>
          )}
        </div>
      )}
    </>
  );
};
