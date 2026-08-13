// frontend/src/components/RecommendedMovies.tsx
import { useEffect, useState } from "react";
import {getrecommendations} from '../../../../api/recommendationapi'
import type { Movie } from '../../../../type/movie.type';

import { Link } from "react-router-dom";

export default function RecommendedMovies() {
  const [movies, setMovies] = useState<Movie[]>([]);

  useEffect(() => {
    getrecommendations()
      .then((data) => setMovies(data.movies ?? []))
      .catch(() => setMovies([]));
  }, []);

  if (movies.length === 0) return null;

  return (
    <div className="p-6">
      <h2 className="text-xl font-semibold mb-4">Recommended for you</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {movies.map((movie) => (
          <Link to={`/movies/${movie.tmdbId}`} key={movie.tmdbId}>
            {movie.posterUrl && <img src={movie.posterUrl} alt={movie.title} className="rounded" />}
            <p className="mt-2 font-medium">{movie.title}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}