import {useState, useEffect} from "react";

import {similarMovies} from '../../../../api/recommendationapi';

import type { Movie } from '../../../../type/movie.type';
import { Link } from "react-router-dom";


export default function SimilarMovies({ movieId }: { movieId: number }) {
  const [movies, setMovies] = useState<Movie[]>([]);

  useEffect(() => {
   similarMovies(movieId)
      .then((data) => setMovies(data.movies))
      .catch(() => {});
  }, [movieId]);

  if (movies.length === 0) return null;

  return (
    <div className="mt-8">
      <h2 className="text-xl font-semibold mb-4">More like this</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {movies.map((movie) => (
          <Link to={`/movies/${movie.id}`} key={movie.id}>
            {movie.posterUrl && <img src={movie.posterUrl} alt={movie.title} className="rounded" />}
            <p className="mt-2 font-medium">{movie.title}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
