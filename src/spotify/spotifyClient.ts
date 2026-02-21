// Re-export everything from specialized modules for backward compatibility

// Types
export type { SpotifyTrackInfo, SpotifyPlaylist, SpotifyTrack, SpotifyAlbum } from "../types/spotifyTypes";

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
} from "./spotifyParser";
