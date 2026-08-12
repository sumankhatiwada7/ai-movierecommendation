import { Link } from "react-router-dom";
import type { Movie } from "../../../../type/movie.type";

interface MovieRowProps {
  title: string;
  movies: Movie[];
}

export default function MovieRow({ title, movies }: MovieRowProps) {
  if (movies.length === 0) return null;

  return (
    <div className="mb-8">
      <h2 className="text-xl font-semibold mb-3 px-6">{title}</h2>
      <div className="flex gap-4 overflow-x-auto px-6 pb-2">
        {movies.map((movie) => (
          <Link
            to={`/movies/${movie.id}`}
            key={movie.id}
            className="flex-shrink-0 w-40 hover:scale-105 transition-transform"
          >
            {movie.posterUrl ? (
              <img src={movie.posterUrl} alt={movie.title} className="rounded w-40 h-60 object-cover" />
            ) : (
              <div className="w-40 h-60 bg-gray-800 rounded flex items-center justify-center text-sm text-gray-400">
                No image
              </div>
            )}
            <p className="mt-2 text-sm font-medium truncate">{movie.title}</p>
            <p className="text-xs text-gray-400">⭐ {movie.averageRating.toFixed(1)}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}