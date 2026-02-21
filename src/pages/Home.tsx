import { Link } from "react-router-dom";

/**
 * Home page component serving as the main landing page.
 * Displays the app title and navigation links to generate cards or scan cards.
 */
const Home = () => {
  return (
    <main className="container-main min-h-[100dvh] flex items-center justify-center">
      <div className="w-full max-w-md text-center">
        <p className="page-kicker mb-3">Local Edition</p>
        <h1 className="poster-title text-4xl sm:text-5xl font-bold mb-3">Music QR Game</h1>
        <p className="text-base sm:text-lg text-muted mb-8">Create and scan Spotify track QR cards</p>
        <nav className="space-y-3">
          <div>
            <Link
              to="/generate"
              className="w-full btn btn-info text-base"
            >
              Generate Cards
            </Link>
          </div>
          <div>
            <Link
              to="/scan"
              className="w-full btn btn-secondary text-base"
            >
              Scan Card
            </Link>
          </div>
        </nav>
      </div>
    </main>
  );
}

export default Home;