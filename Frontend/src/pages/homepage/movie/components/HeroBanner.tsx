import { useNavigate } from "react-router-dom";
import type { Movie } from "../../../../type/movie.type";

export default function HeroBanner({ movie }: { movie: Movie }) {
  const navigate = useNavigate();

  return (
    <div
      className="relative w-full h-[60vh] flex items-end text-white"
      style={{
        backgroundImage: movie.backdropUrl ? `url(${movie.backdropUrl})` : undefined,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
      <div className="relative z-10 p-8 max-w-xl">
        <h1 className="text-4xl font-bold mb-3">{movie.title}</h1>
        <p className="text-sm text-gray-200 mb-4 line-clamp-3">{movie.description}</p>
        <div className="flex gap-3">
          <button
            onClick={() => navigate(`/movies/${movie.tmdbId}`)}
            className="bg-white text-black px-6 py-2 rounded font-semibold"
          >
            ▶ Play
          </button>
          <button
            onClick={() => navigate(`/movies/${movie.tmdbId}`)}
            className="bg-gray-700/70 px-6 py-2 rounded font-semibold"
          >
            More Info
          </button>
        </div>
      </div>
    </div>
  );
}