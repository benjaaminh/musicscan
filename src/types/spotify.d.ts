declare namespace Spotify {
  interface Player {
    addListener(
      event: string,
      callback: (state: PlaybackState | { device_id: string }) => void
    ): boolean;
    removeListener(event: string): boolean;
    connect(): Promise<boolean>;
    disconnect(): void;
    getCurrentState(): Promise<PlaybackState | null>;
    setName(name: string): Promise<void>;
    getVolume(): Promise<number>;
    setVolume(volume: number): Promise<void>;
    pause(): Promise<void>;
    resume(): Promise<void>;
    togglePlay(): Promise<void>;
    seek(positionMs: number): Promise<void>;
    previousTrack(): Promise<void>;
    nextTrack(): Promise<void>;
  }

  interface PlaybackState {
    context: {
      type: string;
      external_urls: { spotify: string };
      href: string;
      uri: string;
    };
    current_timestamp: number;
    device: {
      id: string;
      is_active: boolean;
      is_private_session: boolean;
      is_restricted: boolean;
      name: string;
      supports_volume: boolean;
      type: string;
      volume_percent: number;
    };
    disallows: { [key: string]: boolean };
    duration_ms: number;
    item: {
      album: any;
      artists: Array<{ external_urls: any; href: string; id: string; name: string; type: string; uri: string }>;
      available_markets: string[];
      disc_number: number;
      duration_ms: number;
      explicit: boolean;
      external_ids: any;
      external_urls: { spotify: string };
      href: string;
      id: string;
      is_local: boolean;
      name: string;
      popularity: number;
      preview_url: string | null;
      track_number: number;
      type: string;
      uri: string;
    };
    offset: number;
    paused: boolean;
    position_ms: number;
    repeat_state: "off" | "context" | "track";
    shuffle: boolean;
    timestamp: number;
  }

  interface PlayerInit {
    name: string;
    getOAuthToken: () => string;
    volume?: number;
  }

  class Player {
    constructor(options: PlayerInit);
    addListener(
      event: string,
      callback: (state: PlaybackState | { device_id: string }) => void
    ): boolean;
    removeListener(event: string): boolean;
    connect(): Promise<boolean>;
    disconnect(): void;
    getCurrentState(): Promise<PlaybackState | null>;
    setName(name: string): Promise<void>;
    getVolume(): Promise<number>;
    setVolume(volume: number): Promise<void>;
    pause(): Promise<void>;
    resume(): Promise<void>;
    togglePlay(): Promise<void>;
    seek(positionMs: number): Promise<void>;
    previousTrack(): Promise<void>;
    nextTrack(): Promise<void>;
  }
}

interface Window {
  Spotify: typeof Spotify;
  onSpotifyWebPlaybackSDKReady: (() => void) | undefined;
}
