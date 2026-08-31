import { useEffect, useState ,useRef} from 'react';
import { useWatchlist } from '../../../../context/watchlistcontext';
import { getwatchlist, removefromwatchlist } from '../../../../api/watchlistapi';
import type { Movie } from '../../../../type/movie.type';
import MovieCard from './MovieCard';
import { Link } from 'react-router-dom';


export default function WatchlistDropdown() {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const { watchlistIds } = useWatchlist();
  const dropdownRef = useRef<HTMLDivElement>(null);

  const fetchWatchlist = async () => {
    if (watchlistIds.size === 0) {
      setMovies([]);
      return;
    }
    setLoading(true);
    try {
      const res = await getwatchlist();
      setMovies(res.data || []);
    } catch (err) {
      console.error('Failed to fetch watchlist:', err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch when dropdown opens and watchlistIds changes
  useEffect(() => {
    if (isOpen) {
      fetchWatchlist();
    }
  }, [isOpen, watchlistIds]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div
      ref={dropdownRef}
      className="relative"
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}
    >
      {/* Navbar link */}
      <div className="flex items-center gap-1 cursor-pointer text-ink hover:text-primary transition">
        <span>Watchlist</span>
        <span className="text-xs bg-primary/20 px-1.5 rounded-full">
          {watchlistIds.size}
        </span>
      </div>

      {/* Dropdown panel */}
      {isOpen && (
        <div
          className="absolute left-1/2 -translate-x-1/2 mt-2 w-[400px] max-h-[500px] overflow-y-auto
                     bg-surface border border-edge rounded-xl shadow-2xl p-4 z-50"
        >
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-semibold text-ink">My Watchlist</h3>
            <Link
              to="/watchlist"
              className="text-sm text-primary hover:underline"
              onClick={() => setIsOpen(false)}
            >
           
            </Link>
          </div>

          {loading ? (
            <div className="text-center py-4 text-muted">Loading...</div>
          ) : movies.length === 0 ? (
            <div className="text-center py-4 text-muted">Your watchlist is empty.</div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {movies.slice(0, 6).map((movie) => (
                <MovieCard key={movie.tmdbId} movie={movie} />
              ))}
              {movies.length > 6 && (
                <div className="col-span-full text-center text-sm text-muted mt-2">
                  + {movies.length - 6} more
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}