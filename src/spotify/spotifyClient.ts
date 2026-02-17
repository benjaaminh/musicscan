// Re-export everything from specialized modules for backward compatibility

// Types
export type { SpotifyTrackInfo, SpotifyPlaylist, SpotifyTrack, SpotifyAlbum } from "./spotifyTypes";

// Auth functions
export { 
  startSpotifyAuth,
  exchangeSpotifyCodeForToken,
  getValidSpotifyAccessToken,
  getSpotifyCallbackCode,
  clearSpotifyCallbackParams,
  clearStoredSpotifyAuth,
} from "./spotifyAuth";

// API functions
export {
  fetchSpotifyTrackInfo,
  getSpotifyPlaylist,
  getPlaylistTracks,
  searchSpotifyTracks,
  searchSpotifyAlbums,
  getAlbumTracks,
  getCurrentUserPlaylists,
  getCurrentUserSavedTracks,
} from "./spotifyApi";

// Parsing functions
export {
  parseSpotifyTrackFromScan,
  buildSpotifyEmbedUrl,
} from "./spotifyParser";
