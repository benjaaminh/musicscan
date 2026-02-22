import { useState } from "react";
import { Link } from "react-router-dom";
import MusicLibrarySelector from "../components/spotify/MusicLibrarySelector";
import { useSpotifyAuth } from "../hooks/useSpotifyAuth";
import { SpotifyAuthenticationButton } from "../components/spotify/SpotifyAuthenticationButton";
import { GeneratedCardsView } from "../components/GeneratedCardsView";
import type { Card } from "../types/Card";

/**
 * Card generation page where users can create cards from Spotify playlists.
 * Allows users to select Spotify sources and generate cards.
 * Users can download/print the generated cards.
 */
const CardGeneration = () => {
  const [cards, setCards] = useState<Card[]>();
  const { isAuthenticated, login, logout, accessToken } = useSpotifyAuth();

  const handleConnect = async () => {
    const scopes = [ // scopes required by spotify auth
      "playlist-read-private",
      "playlist-read-collaborative",
      "user-library-read",
    ];
    await login(scopes);
  };

  const handleLogout = () => {
    logout();
  };

  /**
   * handle generation of cards. Supports cards from multiple sources, such as playlists, albums, individual tracks, etc.
   * @param newCards the newly selected cards
   * @returns the generated cards in combination with the existing cards
   */
  const handleCardsGenerated = (newCards: Card[]) => {
    if (newCards.length === 0) {
      return;
    }

    setCards((currentCards) => {
      const currentCardsArray = currentCards || [];
      
      // create a Set of Spotify URIs already in the collection for O(1) lookup
      const existingUris = new Set(currentCardsArray.map((card) => card.spotifyUri));
      
      // filter new cards to only include those not already in the collection
      const uniqueNewCards = newCards.filter((card) => !existingUris.has(card.spotifyUri));
      
      // combine existing cards with filtered new cards
      return [...currentCardsArray, ...uniqueNewCards];
    });
  };

  return (
    <main className="container-main">
      <div className="mb-6 sm:mb-8">
        <p className="mb-4">
          <Link to="/" className="text-white/90 hover:text-sky-200 transition-colors">
            ← Go back
          </Link>
        </p>
        <p className="page-kicker mb-3">Deck Builder</p>
        <h2 className="poster-title text-3xl sm:text-4xl font-bold mb-2">Generate Cards</h2>
        <p className="text-sm sm:text-base text-muted mb-6">
          Create cards from Spotify
        </p>
      </div>

      <SpotifyAuthenticationButton
        spotifyAuthenticated={isAuthenticated}
        onConnect={handleConnect}
        onLogout={handleLogout}
      />

        <div className="section space-y-4">
          <MusicLibrarySelector onCardsGenerated={handleCardsGenerated} accessToken={accessToken} />
          <GeneratedCardsView cards={cards || []} />
        </div>
    </main>
  );
};

export default CardGeneration;