// Spotify authentication and Web Playback SDK integration.

const CLIENT_ID = import.meta.env.VITE_SPOTIFY_CLIENT_ID || "";
const REDIRECT_URI = import.meta.env.VITE_SPOTIFY_REDIRECT_URI || window.location.origin;

// Extracts a Spotify track ID from either a spotify:track URI or an open.spotify.com URL.
export const parseSpotifyTrackFromScan = (value: string): string | null => {
  const text = value.trim();

  const uriMatch = text.match(/^spotify:track:([A-Za-z0-9]+)$/i);
  if (uriMatch?.[1]) return uriMatch[1];

  const urlMatch = text.match(/open\.spotify\.com\/track\/([A-Za-z0-9]+)(?:\?|$|\/)/);
  if (urlMatch?.[1]) return urlMatch[1];

  return null;
};

// Get access token from localStorage or redirect to auth.
export const getAccessToken = (): string | null => {
  const params = new URLSearchParams(window.location.search);
  const code = params.get("code");

  if (code && !localStorage.getItem("spotify_access_token")) {
    // For now uses implicit grant (less secure but works for dev). need a backend for prod.
    localStorage.setItem("spotify_auth_code", code);
    window.history.replaceState({}, document.title, window.location.pathname);
  }

  return localStorage.getItem("spotify_access_token");
};

// Redirect to Spotify login.
export const redirectToSpotifyAuth = () => {
  const scopes = "streaming user-read-private user-read-email";
  const params = new URLSearchParams({
    client_id: CLIENT_ID,
    response_type: "code",
    redirect_uri: REDIRECT_URI,
    scope: scopes,
  });
  window.location.href = `https://accounts.spotify.com/authorize?${params.toString()}`;
};

// Initialize Web Playback SDK and return player instance.
export const initSpotifyPlayer = (token: string, onReady?: (deviceId: string) => void): Promise<Spotify.Player> => {
  return new Promise((resolve) => {
    window.onSpotifyWebPlaybackSDKReady = () => {
      const player = new Spotify.Player({
        name: "Music Game Player",
        getOAuthToken: () => token,
        volume: 0.5,
      });

      player.addListener("player_state_changed", (state) => {
        if (state) console.log("Player state:", state);
      });

      player.addListener("ready", (readyEvent: any) => {
        const device_id = readyEvent.device_id;
        console.log("Ready with Device ID:", device_id);
        onReady?.(device_id);
      });

      player.connect();
      resolve(player);
    };

    // Load Spotify Web Playback SDK script if not already loaded.
    if (!window.Spotify) {
      const script = document.createElement("script");
      script.src = "https://sdk.scdn.co/spotify-player.js";
      document.head.appendChild(script);
    } else {
      window.onSpotifyWebPlaybackSDKReady?.();
    }
  });
};
