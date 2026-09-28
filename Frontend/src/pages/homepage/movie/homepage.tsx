import { useEffect, useState } from "react";
import { fetchmovies } from "../../../api/movieapi";
import { getrecommendations } from "../../../api/recommendationapi";
import { getWatchHistory, getWatchProgressBatch } from "../../../api/watchapi";
import type { Movie } from "../../../type/movie.type";
import MovieCard from "./components/MovieCard";
import MovieRow from "./components/MovieRow";

export default function Homepage() {
  const [activeTab, setActiveTab] = useState("new");
  const [catalogMovies, setCatalogMovies] = useState<Movie[]>([]);
  const [recommended, setRecommended] = useState<Movie[]>([]);
  const [watchHistory, setWatchHistory] = useState<Movie[]>([]);
  const [watchProgressMap, setWatchProgressMap] = useState<Record<number, number>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function loadHomepage() {
      try {
        setError(null);
        setIsLoading(true);
        const sortBy = activeTab === "movies" ? "rating" : "latest";
        const response = await fetchmovies({ page: 1, sortBy });

        if (!isMounted) return;
        let movies = response.movies || [];
        if (activeTab === "anime") {
          movies = movies.filter((movie) => movie.genres?.some((genre) => /anime/i.test(genre.name)));
        }
        if (activeTab === "tv") movies = [];
        setCatalogMovies(movies);
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
  }, [activeTab]);

  useEffect(() => {
    let isMounted = true;
    Promise.all([
      getrecommendations().catch(() => ({ movies: [] as Movie[] })),
      getWatchHistory().catch(() => ({ movies: [] as Movie[] })),
    ]).then(([recommendationResponse, watchHistoryResponse]) => {
      if (!isMounted) return;
      setRecommended(recommendationResponse.movies || []);
      setWatchHistory(watchHistoryResponse.movies || []);
    });

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (watchHistory.length === 0) return;
    let isMounted = true;
    getWatchProgressBatch(watchHistory.map((movie) => movie.tmdbId))
      .then((response) => {
        if (!isMounted) return;
        const progressMap: Record<number, number> = {};
        response.movies.forEach(({ tmdbId, time }) => {
          progressMap[tmdbId] = time;
        });
        setWatchProgressMap(progressMap);
      })
      .catch(() => undefined);

    return () => {
      isMounted = false;
    };
  }, [watchHistory]);

  // Loading state
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

  return (
    <div className="hotflix-shell min-h-screen pb-16 text-ink">
      {recommended.length > 0 && (
        <div className="pt-8 md:pt-10">
          <MovieRow title="Recommendations" movies={recommended} />
        </div>
      )}
      {watchHistory.length > 0 && (
        <MovieRow title="Continue watching" movies={watchHistory} progressMap={watchProgressMap} />
      )}
      <main className="group/updated relative mb-10 pt-2">
        <div className="page-width section-heading">
          <h2>Recently updated</h2>
          <span className="text-xs text-muted">{catalogMovies.length} titles</span>
        </div>
        <div className="page-width">
          <div className="mb-8 flex max-w-full gap-6 overflow-x-auto border-b border-white/10 text-xs font-bold uppercase tracking-[.08em] text-muted sm:gap-8">
            {[
              ["new", "New items"],
              ["movies", "Movies"],
              ["tv", "TV shows"],
              ["anime", "Anime"],
            ].map(([key, label]) => (
              <button
                key={key}
                onClick={() => setActiveTab(key)}
                className={`relative shrink-0 whitespace-nowrap pb-4 transition hover:text-white ${activeTab === key ? "text-primary after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-full after:bg-primary" : ""}`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
        {error ? (
          <p className="py-16 text-center text-muted">{error}</p>
        ) : catalogMovies.length === 0 ? (
          <p className="border border-dashed border-white/10 py-16 text-center text-muted">
            {activeTab === "tv" ? "TV shows are not available in the current movie catalog." : "No titles found in this category."}
          </p>
        ) : (
          <section className="page-width">
            <div className="section-heading">
              <h2>New items</h2>
            </div>
            <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
              {catalogMovies.map((movie) => (
                <MovieCard key={movie.tmdbId} movie={movie} />
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}