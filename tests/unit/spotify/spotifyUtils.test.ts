import { describe, expect, it } from 'vitest';
import {
  base64UrlEncode,
  generateCodeChallenge,
  generateCodeVerifier,
  getSpotifyConfig,
} from '../../../src/spotify/spotifyUtils';

describe('spotifyUtils', () => {
  const env = (import.meta as ImportMeta & { env: Record<string, string | undefined> }).env;

  it('base64UrlEncode converts bytes to url-safe base64', () => {
    const bytes = Uint8Array.from([116, 101, 115, 116]);
    expect(base64UrlEncode(bytes)).toBe('dGVzdA');
  });

  it('generateCodeVerifier returns expected length and allowed charset', () => {
    const verifier = generateCodeVerifier(64);
    expect(verifier).toHaveLength(64);
    expect(verifier).toMatch(/^[A-Za-z0-9_-]+$/);
  });

  it('generateCodeChallenge produces RFC7636-compatible challenge', async () => {
    const verifier = 'dBjftJeZ4CVP-mB92K27uhbUJU1p1r_wW1gFWFOEjXk';
    await expect(generateCodeChallenge(verifier)).resolves.toBe('E9Melhoa2OwvFrEMTJguCHaoeK1t8URWbuGJSstw-cM');
  });

  it('getSpotifyConfig maps values from import.meta.env with null fallback', () => {
    const config = getSpotifyConfig();
    expect(config).toEqual({
      clientId: env.VITE_SPOTIFY_CLIENT_ID ?? null,
      redirectUri: env.VITE_SPOTIFY_REDIRECT_URI ?? null,
    });
  });
});
