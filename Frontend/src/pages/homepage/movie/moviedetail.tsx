import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { fetchMovieById } from '../../../api/movieapi';
import { logwatch } from '../../../api/watchapi';
import { getWatchSource } from '../../../api/watchapi';
import type { Movie } from '../../../type/movie.type';
import type { WatchSource } from '../../../type/movie.type';
import SimilarMovies from './components/similarMovies';
import VideoPlayer from './components/videoplayer';

export default function MovieDetail() {
  const { id } = useParams<{ id: string }>();
  const [movie, setMovie] = useState<Movie | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [watchSource, setWatchSource] = useState<WatchSource | null>(null);
  const [checkingSource, setCheckingSource] = useState(false);
  const [showPlayer, setShowPlayer] = useState(false);

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
    setShowPlayer(false);
    setWatchSource(null);

    fetchMovieById(tmdbId)
      .then((data) => {
        setMovie(data.movie);
        logwatch(tmdbId).catch(console.warn);
      })
      .catch((err) => {
        console.error('Failed to fetch movie:', err);
        setError('Unable to load movie details. Please try again later.');
      })
      .finally(() => setLoading(false));

    setCheckingSource(true);
    getWatchSource(tmdbId)
      .then((data) => setWatchSource(data.source))
      .catch((err) => {
        console.warn('Watch source lookup failed:', err);
        setWatchSource(null);
      })
      .finally(() => setCheckingSource(false));
  }, [id]);

  // Loading state
  if (loading) {
    return (
      <div className="bg-bg min-h-screen text-ink p-6 animate-pulse">
        <div className="max-w-6xl mx-auto">
          <div className="h-96 bg-edge rounded-xl mb-6" />
          <div className="h-10 bg-edge w-3/4 rounded mb-4" />
          <div className="h-6 bg-edge w-1/2 rounded mb-4" />
          <div className="flex gap-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-6 w-16 bg-edge rounded-full" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !movie) {
    return (
      <div className="bg-bg min-h-screen text-ink p-6 flex items-center justify-center">
        <div className="text-center">
          <p className="text-primary-dark text-xl mb-4">{error || 'Movie not found'}</p>
          <button
            onClick={() => window.history.back()}
            className="px-4 py-2 bg-surface border border-edge rounded-full hover:border-primary hover:text-primary transition"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  // Main render
  return (
    <div className="bg-bg text-ink min-h-screen">
      {/* Hero Section with Backdrop */}
      <div className="relative w-full h-[60vh] overflow-hidden bg-bg">
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-primary/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-32 right-0 w-80 h-80 bg-primary-dark/15 rounded-full blur-3xl" />

        {movie.backdropUrl && (
          <img
            src={movie.backdropUrl}
            alt=""
            className="absolute right-0 top-0 h-full w-2/3 object-cover opacity-90"
            style={{ maskImage: "linear-gradient(to left, black 40%, transparent 100%)" }}
          />
        )}

        <div className="absolute inset-0 flex items-end pb-12 px-6 md:px-12">
          <div className="max-w-6xl mx-auto w-full flex flex-col md:flex-row gap-6 items-start">
            <div className="flex-shrink-0 w-48 md:w-64 rounded-xl overflow-hidden shadow-lg border border-edge bg-surface">
              {movie.posterUrl ? (
                <img
                  src={movie.posterUrl}
                  alt={movie.title}
                  className="w-full h-auto object-cover"
                />
              ) : (
                <div className="w-full aspect-[2/3] bg-edge flex items-center justify-center text-sm text-muted">
                  No poster
                </div>
              )}
            </div>

            <div className="flex-1 space-y-3 bg-surface/85 backdrop-blur-md rounded-2xl p-6 border border-edge shadow-md">
              <h1 className="font-display text-3xl md:text-5xl font-bold leading-tight text-ink">
                {movie.title}
              </h1>
              <p className="text-sm text-muted">
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
                    className="text-xs font-medium px-3 py-1 bg-primary/10 text-primary-dark rounded-full border border-primary/20"
                  >
                    {g.name}
                  </span>
                ))}
              </div>
              <p className="text-muted max-w-2xl line-clamp-4">
                {movie.description || 'No description available.'}
              </p>

              {!checkingSource && watchSource && !showPlayer && (
                <button
                  onClick={() => setShowPlayer(true)}
                  className="mt-2 bg-primary hover:bg-primary-dark text-white px-6 py-3 rounded-full font-semibold transition"
                >
                  ▶ Watch Full Movie
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Player / Trailer Section */}
      {showPlayer && watchSource ? (
        <div className="max-w-4xl mx-auto px-4 -mt-12 relative z-10">
          <VideoPlayer videoUrl={watchSource.videoUrl} title={watchSource.title} />
        </div>
      ) : (
        movie.trailerKey && (
          <div className="max-w-4xl mx-auto px-4 -mt-12 relative z-10">
            <div className="bg-surface backdrop-blur-sm rounded-xl overflow-hidden shadow-lg border border-edge">
              <iframe
                className="w-full aspect-video"
                src={`https://www.youtube.com/embed/${movie.trailerKey}`}
                title={`${movie.title} trailer`}
                allowFullScreen
              />
            </div>
          </div>
        )
      )}

      {!checkingSource && !watchSource && (
        <p className="max-w-4xl mx-auto px-4 -mt-8 relative z-10 text-sm text-muted">
          Full movie not available for this title — showing trailer only.
        </p>
      )}

      {/* Similar Movies */}
      <div className="max-w-6xl mx-auto px-4 py-12">
        <SimilarMovies title={movie.title} />
      </div>
    </div>
  );
}