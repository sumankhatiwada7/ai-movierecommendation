import {useState, useEffect} from "react";

import {similarMovies} from '../../../../api/recommendationapi';

import type { Movie } from '../../../../type/movie.type';
import { Link } from "react-router-dom";


export default function SimilarMovies({ title }: { title: string }) {
  const [movies, setMovies] = useState<Movie[]>([]);

  useEffect(() => {
    similarMovies(title)
      .then((data) => setMovies(data.movies ?? []))
      .catch(() => setMovies([]));
  }, [title]);

  if (movies.length === 0) return null;

  return (
    <div className="mt-8">
      <h2 className="text-xl font-semibold mb-4">More like this</h2>
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
