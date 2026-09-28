import { useState, useEffect } from 'react';
import { fetchmovies } from '../../../api/movieapi';
import type { Movie, Pagination, Genre } from '../../../type/movie.type';
import { Link, useSearchParams } from 'react-router-dom';
import { fetchGenres } from '../../../api/genreapi';

export default function BrowseMovies() {
  const [searchParams, setSearchParams] = useSearchParams();
  const genreId = searchParams.get('genreId') || '';
  const ratingMin = searchParams.get('ratingMin') || '';
  const view = searchParams.get('view') || 'trending';
  const sortBy = view === 'trending' ? 'rating' : 'latest';
  const page = Number(searchParams.get('page')) || 1;

  const [movies, setMovies] = useState<Movie[]>([]);
  const [genres, setGenres] = useState<Genre[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [draftGenreId, setDraftGenreId] = useState(genreId);
  const [draftRatingMin, setDraftRatingMin] = useState(ratingMin);

  useEffect(() => {
    fetchGenres()
      .then((data) => {
        const genresArray = Array.isArray(data) ? data : [];
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
    fetchmovies({ page, genreId: genreId || undefined, sortBy, ratingMin: ratingMin || undefined })
      .then((data) => {
        setMovies(data.movies);
        setPagination(data.pagination);
      })
      .catch((error) => console.error('Failed to fetch movies:', error))
      .finally(() => setIsLoading(false));
  }, [page, genreId, sortBy, ratingMin]);

  useEffect(() => {
    setDraftGenreId(genreId);
    setDraftRatingMin(ratingMin);
  }, [genreId, ratingMin]);

  const goToPage = (newPage: number) => {
    const next = new URLSearchParams(searchParams);
    next.set('page', String(newPage));
    setSearchParams(next);
  };

  const changeView = (nextView: string) => {
    const next = new URLSearchParams(searchParams);
    next.set('view', nextView);
    next.set('page', '1');
    setSearchParams(next);
  };

  const applyFilters = () => {
    const next = new URLSearchParams(searchParams);
    if (draftGenreId) next.set('genreId', draftGenreId);
    else next.delete('genreId');
    if (draftRatingMin) next.set('ratingMin', draftRatingMin);
    else next.delete('ratingMin');
    next.set('page', '1');
    setSearchParams(next);
  };

  const viewLabels: Record<string, string> = {
    trending: 'Trending',
    latest: 'New releases',
    tv: 'TV shows',
    anime: 'Anime',
  };

  return (
    <div className="hotflix-shell min-h-screen pb-16 pt-10 text-white">
      <div className="page-width">
      <p className="mb-2 text-xs font-bold uppercase tracking-[.25em] text-primary">The catalog</p>
      <h1 className="mb-12 font-display text-4xl font-medium">Catalog</h1>

      <div className="mb-8 flex gap-7 border-b border-white/10 text-xs font-bold uppercase tracking-[.12em] text-muted">
        {Object.entries(viewLabels).map(([key, label]) => (
          <button
            key={key}
            onClick={() => changeView(key)}
            className={`relative pb-4 transition hover:text-white ${
              view === key
                ? 'text-primary after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-full after:bg-primary'
                : ''
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="mb-8 flex flex-wrap items-center gap-3 border-b border-white/10 pb-7">
        <select
          value={draftGenreId}
          onChange={(e) => setDraftGenreId(e.target.value)}
          className="hotflix-input !w-auto !rounded !bg-surface text-sm"
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
          value={draftRatingMin}
          onChange={(e) => setDraftRatingMin(e.target.value)}
          className="hotflix-input !w-auto !rounded !bg-surface text-sm"
          aria-label="Minimum rating"
        >
          <option value="">Any rating</option>
          <option value="8">8+ rating</option>
          <option value="7">7+ rating</option>
          <option value="6">6+ rating</option>
        </select>

        <button
          type="button"
          onClick={applyFilters}
          className="ml-auto rounded border border-primary px-8 py-3 text-xs font-bold uppercase tracking-wider text-primary transition hover:bg-primary hover:text-black"
        >
          Apply
        </button>

      </div>

      {isLoading ? (
        <p className="text-muted">Loading the catalog...</p>
      ) : movies.length === 0 ? (
        <p className="text-muted">No movies found.</p>
      ) : (
        <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-7">
          {movies.map((movie) => (
            <Link
              to={`/movies/${movie.tmdbId}`}
              key={movie.tmdbId}
              className="group transition-transform"
            >
              {movie.posterUrl ? (
                <img
                  src={movie.posterUrl}
                  alt={movie.title}
                  className="aspect-[2/3] w-full rounded-md object-cover transition group-hover:-translate-y-1"
                />
              ) : (
                <div className="flex aspect-[2/3] w-full items-center justify-center rounded-md bg-surface text-sm text-muted">
                  No image
                </div>
              )}
              <p className="mt-3 truncate text-sm font-semibold">{movie.title}</p>
              <p className="pt-1 text-xs text-muted"><span className="text-primary">★</span> {movie.averageRating.toFixed(1)}</p>
            </Link>
          ))}
        </div>
      )}

      {pagination && pagination.totalPages > 1 && (
        <div className="mt-12 flex justify-center gap-3">
          <button
            disabled={page <= 1}
            onClick={() => goToPage(page - 1)}
            className="rounded border border-edge px-4 py-2 text-sm transition hover:border-primary disabled:opacity-40"
          >
            Prev
          </button>
          <span className="px-2 py-2 text-sm text-muted">
            Page {pagination.page} of {pagination.totalPages}
          </span>
          <button
            disabled={page >= pagination.totalPages}
            onClick={() => goToPage(page + 1)}
            className="rounded border border-edge px-4 py-2 text-sm transition hover:border-primary disabled:opacity-40"
          >
            Next
          </button>
        </div>
      )}
      </div>
    </div>
  );
}