import { Link } from "react-router-dom";

/**
 * Home page component serving as the main landing page.
 * Displays the app title and navigation links to generate cards or scan cards.
 */
const Home = () => {
  return (
    <main className="container-main flex items-center justify-center min-h-screen">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">Music QR Game</h1>
        <p className="text-lg text-muted mb-8">Create and scan Spotify track QR codes</p>
        <nav className="space-y-3">
          <div>
            <Link
              to="/generate"
              className="inline-block btn btn-info px-6 py-3 text-lg"
            >
              Generate Cards
            </Link>
          </div>
          <div>
            <Link
              to="/scan"
              className="inline-block btn btn-secondary px-6 py-3 text-lg"
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