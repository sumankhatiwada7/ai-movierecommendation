import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { fetchMovieById } from '../../../api/movieapi';
import { logwatch } from '../../../api/watchapi';
import type { Movie } from '../../../type/movie.type';
import SimilarMovies from './components/similarMovies';

export default function MovieDetail() {
  const { id } = useParams<{ id: string }>();
  const [movie, setMovie] = useState<Movie | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      setError('Movie ID is missing');
      setLoading(false);
      return;
    }

    const tmdbId = Number(id);
    if (isNaN(tmdbId)) {
      setError('Invalid movie ID');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    fetchMovieById(tmdbId)
      .then((data) => {
        setMovie(data.movie);
        logwatch( tmdbId ).catch(console.warn);
      })
      .catch((err) => {
        console.error('Failed to fetch movie:', err);
        setError('Unable to load movie details. Please try again later.');
      })
      .finally(() => setLoading(false));
  }, [id]);

  // Loading state
  if (loading) {
    return (
      <div className="bg-black min-h-screen text-white p-6 animate-pulse">
        <div className="max-w-6xl mx-auto">
          <div className="h-96 bg-gray-800 rounded-xl mb-6" />
          <div className="h-10 bg-gray-800 w-3/4 rounded mb-4" />
          <div className="h-6 bg-gray-800 w-1/2 rounded mb-4" />
          <div className="flex gap-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-6 w-16 bg-gray-800 rounded-full" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !movie) {
    return (
      <div className="bg-black min-h-screen text-white p-6 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-400 text-xl mb-4">{error || 'Movie not found'}</p>
          <button
            onClick={() => window.history.back()}
            className="px-4 py-2 bg-gray-800 rounded hover:bg-gray-700 transition"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  // Main render
  return (
    <div className="bg-black text-white min-h-screen">
      {/* Hero Section with Backdrop */}
      <div
        className="relative w-full h-[60vh] bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: movie.backdropUrl
            ? `url(${movie.backdropUrl})`
            : 'linear-gradient(to right, #1a1a2e, #16213e)',
        }}
      >
        {/* Dark overlay */}
        <div className="absolute inset-0 bg-black/60" />

        {/* Content overlay */}
        <div className="absolute inset-0 flex items-end pb-12 px-6 md:px-12">
          <div className="max-w-6xl mx-auto w-full flex flex-col md:flex-row gap-6 items-start">
            {/* Poster */}
            <div className="flex-shrink-0 w-48 md:w-64 rounded-xl overflow-hidden shadow-2xl border border-gray-700">
              {movie.posterUrl ? (
                <img
                  src={movie.posterUrl}
                  alt={movie.title}
                  className="w-full h-auto object-cover"
                />
              ) : (
                <div className="w-full aspect-[2/3] bg-gray-800 flex items-center justify-center text-sm text-gray-400">
                  No poster
                </div>
              )}
            </div>

            {/* Details */}
            <div className="flex-1 space-y-3">
              <h1 className="text-3xl md:text-5xl font-bold leading-tight">
                {movie.title}
              </h1>
              <p className="text-sm text-gray-300">
                {movie.releaseYear} · {movie.durationMinutes} min ·{' '}
                <span className="inline-flex items-center">
                  ⭐ {movie.averageRating?.toFixed(1) ?? 'N/A'} (
                  {movie.ratingCount ?? 0} ratings)
                </span>
              </p>
              <div className="flex flex-wrap gap-2">
                {(movie.genres ?? []).map((g) => (
                  <span
                    key={g.id}
                    className="text-xs font-medium px-3 py-1 bg-white/10 backdrop-blur-sm rounded-full border border-white/10"
                  >
                    {g.name}
                  </span>
                ))}
              </div>
              <p className="text-gray-300 max-w-2xl line-clamp-4">
                {movie.description || 'No description available.'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Trailer Section */}
      {movie.trailerKey && (
        <div className="max-w-4xl mx-auto px-4 -mt-12 relative z-10">
          <div className="bg-black/80 backdrop-blur-sm rounded-xl overflow-hidden shadow-2xl border border-gray-800">
            <iframe
              className="w-full aspect-video"
              src={`https://www.youtube.com/embed/${movie.trailerKey}`}
              title={`${movie.title} trailer`}
              allowFullScreen
            />
          </div>
        </div>
      )}

      {/* Similar Movies */}
      <div className="max-w-6xl mx-auto px-4 py-12">
        <SimilarMovies title={movie.title} />
      </div>
    </div>
  );
}