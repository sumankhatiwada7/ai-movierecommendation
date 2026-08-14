import { useEffect, useState } from "react";
import { fetchmovies } from "../../../api/movieapi";
import { fetchGenres } from "../../../api/genreapi";
import { getrecommendations } from "../../../api/recommendationapi";
import type { Movie, Genre } from "../../../type/movie.type";
import HeroBanner from "./components/HeroBanner";
import MovieRow from "./components/MovieRow";

export default function Homepage() {
  const [heroMovie, setHeroMovie] = useState<Movie | null>(null);
  const [recommended, setRecommended] = useState<Movie[]>([]);
  const [trending, setTrending] = useState<Movie[]>([]);
  const [newReleases, setNewReleases] = useState<Movie[]>([]);
  const [genreRows, setGenreRows] = useState<{ genre: Genre; movies: Movie[] }[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function loadHomepage() {
      try {
        setError(null);

        const [recRes, newReleasesRes, trendingRes, genresRes] = await Promise.all([
          getrecommendations().catch((err) => {
            console.warn("Recommendations failed:", err);
            return { movies: [] as Movie[] };
          }),
          fetchmovies({ page: 1, sortBy: "latest" }).catch((err) => {
            console.warn("New releases fetch failed:", err);
            return { movies: [] as Movie[] };
          }),
          fetchmovies({ page: 1, sortBy: "rating" }).catch((err) => {
            console.warn("Trending fetch failed:", err);
            return { movies: [] as Movie[] };
          }),
          fetchGenres().catch((err) => {
            console.warn("Genres fetch failed:", err);
            return [] as Genre[];
          }),
        ]);

        if (!isMounted) return;

        const trendingMovies = trendingRes.movies || [];
        const newReleasesMovies = newReleasesRes.movies || [];
        const recommendedMovies = recRes.movies || [];

        setNewReleases(newReleasesMovies);
        setTrending(trendingMovies);
        setRecommended(recommendedMovies);

        const heroCandidate =
          trendingMovies.find((m) => m.backdropUrl) ||
          newReleasesMovies[0] ||
          trendingMovies[0];

        setHeroMovie(heroCandidate || null);

        const genres = genresRes || [];
        if (genres.length > 0) {
          try {
            const rows = await Promise.all(
              genres.slice(0, 5).map(async (genre) => {
                try {
                  const res = await fetchmovies({
                    genreId: String(genre.id),
                    page: 1,
                  });
                  return { genre, movies: res.movies || [] };
                } catch (err) {
                  console.warn(`Failed to fetch movies for genre ${genre.name}:`, err);
                  return { genre, movies: [] };
                }
              })
            );
            setGenreRows(rows.filter((r) => r.movies.length > 0));
          } catch (err) {
            console.warn("Failed to fetch genre rows:", err);
            setGenreRows([]);
          }
        } else {
          setGenreRows([]);
        }

        if (trendingMovies.length === 0 && newReleasesMovies.length === 0 && recommendedMovies.length === 0) {
          setError("Unable to load movies. Please try again later.");
        }

      } catch (err) {
        console.error("Homepage load failed:", err);
        if (isMounted) {
          setError("Failed to load homepage. Please refresh the page.");
        }
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    loadHomepage();
    return () => {
      isMounted = false;
    };
  }, []);

  // Loading state with spinner
  if (isLoading) {
    return (
      <div className="bg-bg min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted">Loading your homepage...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="bg-bg min-h-screen flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <svg className="w-16 h-16 text-primary mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h2 className="font-display text-xl font-semibold text-ink mb-2">Oops! Something went wrong</h2>
          <p className="text-muted mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-2 bg-primary hover:bg-primary-dark text-white rounded-full transition-colors"
          >
            Refresh Page
          </button>
        </div>
      </div>
    );
  }

  const hasContent = heroMovie || recommended.length > 0 || trending.length > 0 || newReleases.length > 0 || genreRows.length > 0;

  if (!hasContent) {
    return (
      <div className="bg-bg min-h-screen flex items-center justify-center px-4">
        <div className="text-center">
          <svg className="w-16 h-16 text-muted mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z" />
          </svg>
          <h2 className="font-display text-xl font-semibold text-ink mb-2">No movies available</h2>
          <p className="text-muted">Check back later for new content</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-bg min-h-screen text-ink pb-12">
      {heroMovie && <HeroBanner movie={heroMovie} />}

      <div className="mt-6 space-y-6">
        {recommended.length > 0 && (
          <MovieRow title="Recommended for you" movies={recommended} />
        )}

        {trending.length > 0 && (
          <MovieRow title="Trending Now" movies={trending} />
        )}

        {newReleases.length > 0 && (
          <MovieRow title="New Releases" movies={newReleases} />
        )}

        {genreRows.map(({ genre, movies }) => (
          <MovieRow key={genre.id} title={genre.name} movies={movies} />
        ))}

        {recommended.length === 0 && trending.length === 0 && newReleases.length === 0 && genreRows.length > 0 && (
          <p className="text-muted text-center px-6">Browse by genre below</p>
        )}
      </div>
    </div>
  );
}
