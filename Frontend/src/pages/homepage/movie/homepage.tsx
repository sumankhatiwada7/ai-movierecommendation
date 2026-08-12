import { useEffect, useState } from "react";
import {fetchmovies} from "../../../api/movieapi";
import {fetchGenres} from "../../../api/genreapi";
import {getrecommendations} from "../../../api/recommendationapi";
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

  useEffect(() => {
    let isMounted = true;

    async function loadHomepage() {
      try {
        const [recRes, newReleasesRes, trendingRes, genresRes] = await Promise.all([
          getrecommendations({
              userId: "",
              movieid: 0
          }).catch(() => ({ movies: [] as Movie[] })),
          fetchmovies({ page: 1, limit: 30, sortBy: "latest" }),
          fetchmovies({ page: 1, limit: 30, sortBy: "rating" }),
          fetchGenres(),
        ]);

        if (!isMounted) return;

        setNewReleases(newReleasesRes.movies);
        setTrending(trendingRes.movies);
        setRecommended(recRes.movies);

        const heroCandidate = trendingRes.movies.find((m) => m.backdropUrl) || newReleasesRes.movies[0];
        setHeroMovie(heroCandidate || null);

        const rows = await Promise.all(
          genresRes.slice(0, 5).map(async (genre) => {
            const res = await fetchmovies({ genreId: genre.id, limit: 15 });
            return { genre, movies: res.movies };
          })
        );
        setGenreRows(rows.filter((r) => r.movies.length > 0));
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    loadHomepage();
    return () => {
      isMounted = false;
    };
  }, []);

  if (isLoading) return <div className="p-8 text-center">Loading...</div>;

  return (
    <div className="bg-black min-h-screen text-white pb-12">
      {heroMovie && <HeroBanner movie={heroMovie} />}

      <div className="mt-6">
        <MovieRow title="Recommended for you" movies={recommended} />
        <MovieRow title="Trending Now" movies={trending} />
        <MovieRow title="New Releases" movies={newReleases} />
        {genreRows.map(({ genre, movies }) => (
          <MovieRow key={genre.id} title={genre.name} movies={movies} />
        ))}
      </div>
    </div>
  );
}