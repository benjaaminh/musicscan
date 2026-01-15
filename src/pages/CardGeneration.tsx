import { useState } from "react";
import PrintableCard from "../components/qr/PrintableCard";
import type { Card } from "../types/Card";
import { Link } from "react-router-dom";

const CardGeneration = () => {
  // Example cards
  const [cards] = useState<Card[]>([
    {
      id: "1",
      title: "Never Gonna Give You Up",
      artist: "Rick Astley",
      year: 1987,
      spotifyUri: "spotify:track:4uLU6hMCjMI75M1A2tKUQC",
    },
    {
      id: "2",
      title: "Blinding Lights",
      artist: "The Weeknd",
      year: 2019,
      spotifyUri: "spotify:track:0VjIjW4GlUZAMYd2vXMwbk",
    },
    {
      id: "3",
      title: "Bohemian Rhapsody",
      artist: "Queen",
      year: 1975,
      spotifyUri: "spotify:track:3z8h0TU7ReDPLIbEnYhWZb",
    },
    {
      id: "4",
      title: "Shape of You",
      artist: "Ed Sheeran",
      year: 2017,
      spotifyUri: "spotify:track:7qiZfU4dY1lWllzX7mPBI",
    },
    {
      id: "5",
      title: "Someone Like You",
      artist: "Adele",
      year: 2011,
      spotifyUri: "spotify:track:1zwMYTA5nlNjZxYrvBB2pV",
    },
    {
      id: "6",
      title: "Smells Like Teen Spirit",
      artist: "Nirvana",
      year: 1991,
      spotifyUri: "spotify:track:4CeeEOM32jQcH3eN9Q2dGj",
    },
    {
      id: "7",
      title: "Billie Jean",
      artist: "Michael Jackson",
      year: 1982,
      spotifyUri: "spotify:track:5ChkMS8OtdzJeqyybCc9R5",
    },
    {
      id: "8",
      title: "Sweet Child O' Mine",
      artist: "Guns N' Roses",
      year: 1987,
      spotifyUri: "spotify:track:7o2CTH4ctstm8TNelqjb51",
    },
    {
      id: "9",
      title: "Rolling in the Deep",
      artist: "Adele",
      year: 2010,
      spotifyUri: "spotify:track:4OSBTYyNNolMkhMlcy7gyN",
    },
    {
      id: "10",
      title: "Uptown Funk",
      artist: "Mark Ronson ft. Bruno Mars",
      year: 2014,
      spotifyUri: "spotify:track:32OlwWuMpZ6b0aN2RZOeMS",
    },
    {
      id: "11",
      title: "Hotel California",
      artist: "Eagles",
      year: 1976,
      spotifyUri: "spotify:track:40riOy7x9W7GXjyGp4pjAv",
    },
    {
      id: "12",
      title: "Wonderwall",
      artist: "Oasis",
      year: 1995,
      spotifyUri: "spotify:track:5qqabIl2vWzo9ApSC317sa",
    },
    {
      id: "13",
      title: "Stairway to Heaven",
      artist: "Led Zeppelin",
      year: 1971,
      spotifyUri: "spotify:track:5CQ30WqJwcep0pYcV4AMNc",
    },
    {
      id: "14",
      title: "Thriller",
      artist: "Michael Jackson",
      year: 1982,
      spotifyUri: "spotify:track:2LlQb7Uoj1kKyGhlkBf9aC",
    },
    {
      id: "15",
      title: "Hey Jude",
      artist: "The Beatles",
      year: 1968,
      spotifyUri: "spotify:track:0aym2LBJBk9DAYuHHutrIl",
    },
    {
      id: "16",
      title: "Don't Stop Believin'",
      artist: "Journey",
      year: 1981,
      spotifyUri: "spotify:track:4bHsxqR3GMrXTxEPLuK5ue",
    },
  ]);

  return (
    <main>
      <p>
        <Link to="/">Go back</Link>
      </p>
      <h2>Generate Cards</h2>
      <PrintableCard cards={cards} />
    </main>
  );
};

export default CardGeneration;