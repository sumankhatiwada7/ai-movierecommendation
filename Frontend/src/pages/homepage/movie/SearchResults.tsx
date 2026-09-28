import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { fetchmovies } from '../../../api/movieapi';
import type { Movie } from "../../../type/movie.type";
import MovieRow from "./components/MovieRow";

export default function SearchResults() {
  const [searchParams] = useSearchParams();
  const query = searchParams.get("query") || "";
  const [movies, setMovies] = useState<Movie[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
  if (!query) {
    setMovies([]);
    setIsLoading(false);
    return;
  }

  setIsLoading(true);

  fetchmovies({ search: query })
    .then((data) => setMovies(data.movies))
    .finally(() => setIsLoading(false));
}, [query]);

  return (
    <div className="hotflix-shell min-h-screen pb-16 pt-12 text-white">
      <div className="page-width">
      <p className="mb-2 text-xs font-bold uppercase tracking-[.25em] text-primary">Search</p>
      <h1 className="mb-10 font-display text-3xl font-extrabold">
        {isLoading ? "Searching..." : `Results for "${query}"`}
      </h1>
      {!isLoading && movies.length === 0 && (
        <p className="text-muted">No movies found for this search.</p>
      )}
      {movies.length > 0 && <MovieRow title="Search results" movies={movies} />}
     
      </div>
    </div>
  );
}