import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { fetchmovies } from '../../../api/movieapi';
import type { Movie } from "../../../type/movie.type";
import MovieRow from "./components/MovieRow";
import HeroBanner from "./components/HeroBanner";

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
    <div className="bg-black min-h-screen text-white pt-6 pb-12">
      <h1 className="text-xl font-semibold px-6 mb-4">
        {isLoading ? "Searching..." : `Results for "${query}"`}
      </h1>
      {!isLoading && movies.length === 0 && (
        <p className="px-6 text-gray-400">No movies found.</p>
      )}
      {movies.length > 0 && <MovieRow title="Search Results" movies={movies} />}
     
    </div>
  );
}