import { useState, useEffect } from 'react';
import { fetchmovies } from '../../../api/movieapi';
import type { Movie, Pagination, Genre } from '../../../type/movie.type';
import { Link, useSearchParams } from 'react-router-dom';
import { fetchGenres } from '../../../api/genreapi';

export default function BrowseMovies() {
  const [searchParams, setSearchParams] = useSearchParams();
  const genreId = searchParams.get('genreId') || '';
  const sortBy = (searchParams.get('sortBy') as 'latest' | 'rating') || 'latest';
  const page = Number(searchParams.get('page')) || 1;

  const [movies, setMovies] = useState<Movie[]>([]);
  const [genres, setGenres] = useState<Genre[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchGenres()
      .then((data) => {
        const genresArray = Array.isArray(data) ? data : data?.genres || [];
        setGenres(genresArray);
      })
      .catch((error) => {
        console.error('Failed to fetch genres:', error);
        setGenres([]); // fallback to empty array
      });
  }, []);

  // Fetch movies whenever filters change
  useEffect(() => {
    setIsLoading(true);
    fetchmovies({ page, genreId: genreId || undefined, sortBy })
      .then((data) => {
        setMovies(data.movies);
        setPagination(data.pagination);
      })
      .catch((error) => console.error('Failed to fetch movies:', error))
      .finally(() => setIsLoading(false));
  }, [page, genreId, sortBy]);

  const updateParam = (key: string, value: string) => {
    const next = new URLSearchParams(searchParams);
    if (value) next.set(key, value);
    else next.delete(key);
    next.set('page', '1'); // reset to page 1 whenever a filter changes
    setSearchParams(next);
  };

  const goToPage = (newPage: number) => {
    const next = new URLSearchParams(searchParams);
    next.set('page', String(newPage));
    setSearchParams(next);
  };

  return (
    <div className="bg-black min-h-screen text-white p-6">
      <h1 className="text-2xl font-semibold mb-6">Browse Movies</h1>

      <div className="flex flex-wrap gap-4 mb-6">
        <select
          value={genreId}
          onChange={(e) => updateParam('genreId', e.target.value)}
          className="bg-gray-800 rounded px-3 py-2 text-sm"
        >
          <option value="">All Genres</option>
          {/* Safe guard: ensure genres is an array before mapping */}
          {Array.isArray(genres) &&
            genres.map((g) => (
              <option key={g.id} value={g.id}>
                {g.name}
              </option>
            ))}
        </select>

        <select
          value={sortBy}
          onChange={(e) => updateParam('sortBy', e.target.value)}
          className="bg-gray-800 rounded px-3 py-2 text-sm"
        >
          <option value="latest">Latest</option>
          <option value="rating">Top Rated</option>
        </select>
      </div>

      {isLoading ? (
        <p className="text-gray-400">Loading...</p>
      ) : movies.length === 0 ? (
        <p className="text-gray-400">No movies found.</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
          {movies.map((movie) => (
            <Link
              to={`/movies/${movie.tmdbId}`}
              key={movie.tmdbId}
              className="hover:scale-105 transition-transform"
            >
              {movie.posterUrl ? (
                <img
                  src={movie.posterUrl}
                  alt={movie.title}
                  className="rounded w-full h-60 object-cover"
                />
              ) : (
                <div className="w-full h-60 bg-gray-800 rounded flex items-center justify-center text-sm text-gray-400">
                  No image
                </div>
              )}
              <p className="mt-2 text-sm font-medium truncate">{movie.title}</p>
              <p className="text-xs text-gray-400">⭐ {movie.averageRating.toFixed(1)}</p>
            </Link>
          ))}
        </div>
      )}

      {pagination && pagination.totalPages > 1 && (
        <div className="flex gap-2 justify-center mt-8">
          <button
            disabled={page <= 1}
            onClick={() => goToPage(page - 1)}
            className="px-3 py-1 border border-gray-600 rounded disabled:opacity-40"
          >
            Prev
          </button>
          <span className="px-2 py-1 text-sm text-gray-300">
            Page {pagination.page} of {pagination.totalPages}
          </span>
          <button
            disabled={page >= pagination.totalPages}
            onClick={() => goToPage(page + 1)}
            className="px-3 py-1 border border-gray-600 rounded disabled:opacity-40"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}