import { useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import { useWatchlist } from '../../../../context/watchlistcontext';
import type { Movie } from '../../../../type/movie.type';

interface MovieCardProps {
  movie: Movie;
  showProgress?: boolean;
  progress?: number;
}

export default function MovieCard({ movie, showProgress = false, progress = 0 }: MovieCardProps) {
  const { watchlistIds, addMovie, removeMovie } = useWatchlist();
  const [toggling, setToggling] = useState(false);
  const inWatchlist = watchlistIds.has(movie.tmdbId);
  const isFull = watchlistIds.size >= 5 && !inWatchlist;

  const handleToggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (isFull) {
      toast.warning('Watchlist is full (max 5 movies). Remove some to add more.', {
        duration: 3000,
        position: 'bottom-center',
      });
      return;
    }
    setToggling(true);
    try {
      if (inWatchlist) {
        await removeMovie(movie.tmdbId);
        toast.success('Removed from watchlist', { duration: 2000 });
      } else {
        await addMovie(movie.tmdbId, movie.title);
        toast.success('Added to watchlist', { duration: 2000 });
      }
    } catch (err: any) {
      if (err.response?.status === 403 && err.response?.data?.message?.includes('limit')) {
        toast.error('Watchlist limit reached (max 5 movies).');
      } else {
        toast.error('Something went wrong. Try again.');
        console.error('Toggle failed:', err);
      }
    } finally {
      setToggling(false);
    }
  };

  const durationSeconds = movie.durationMinutes ? movie.durationMinutes * 60 : 0;
  const progressPercent = durationSeconds > 0 ? Math.min((progress / durationSeconds) * 100, 100) : 0;
  const showProgressBar = showProgress && progress > 0 && durationSeconds > 0;

  return (
    <Link to={`/movies/${movie.tmdbId}`} className="block group relative">
      <div className="relative rounded-lg overflow-hidden shadow-lg transition-transform duration-300 hover:scale-105 hover:z-10">
        {/* Poster */}
        {movie.posterUrl ? (
          <img
            src={movie.posterUrl}
            alt={movie.title}
            className="w-full h-auto aspect-[2/3] object-cover"
            loading="lazy"
          />
        ) : (
          <div className="w-full aspect-[2/3] bg-gray-800 flex items-center justify-center text-gray-400 text-sm">
            No Image
          </div>
        )}

        {showProgressBar && (
          <div className="absolute bottom-0 left-0 w-full h-1.5 bg-gray-700/70">
            <div
              className="h-full bg-gradient-to-r from-red-600 to-red-400 transition-all duration-500 ease-out"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        )}

        {/* Hover Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
          <h3 className="text-white font-semibold text-sm line-clamp-2">{movie.title}</h3>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-yellow-400 text-xs">⭐ {movie.averageRating?.toFixed(1) ?? 'N/A'}</span>
            <span className="text-white/60 text-xs">• {movie.releaseYear ?? ''}</span>
          </div>
          {showProgressBar && (
            <div className="mt-1 text-xs text-white/70">{Math.round(progressPercent)}% watched</div>
          )}
        </div>

        {/* Star Icon */}
        <button
          onClick={handleToggle}
          disabled={toggling}
          className={`absolute top-2 right-2 p-1.5 rounded-full bg-black/50 backdrop-blur-sm transition-all duration-200 hover:scale-110 ${
            inWatchlist ? 'text-yellow-400' : 'text-white/60 hover:text-yellow-400'
          } ${isFull && !inWatchlist ? 'opacity-50 cursor-not-allowed' : ''}`}
          aria-label={inWatchlist ? 'Remove from watchlist' : 'Add to watchlist'}
          title={isFull && !inWatchlist ? 'Watchlist is full (max 5)' : ''}
        >
          {toggling ? (
            <span className="animate-spin inline-block w-4 h-4 border-2 border-yellow-400 border-t-transparent rounded-full" />
          ) : (
            <svg
              className="w-5 h-5"
              fill={inWatchlist ? 'currentColor' : 'none'}
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
              />
            </svg>
          )}
        </button>

        {/* Lock icon when full */}
        {isFull && !inWatchlist && (
          <div className="absolute top-2 right-2 mt-2 mr-2 pointer-events-none text-white/30">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                clipRule="evenodd"
              />
            </svg>
          </div>
        )}
      </div>

      <p className="mt-2 text-sm font-medium text-ink truncate px-1">{movie.title}</p>
      <p className="text-xs text-yellow-400 px-1">⭐ {movie.averageRating?.toFixed(1) ?? 'N/A'}</p>
    </Link>
  );
}