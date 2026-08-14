import { useNavigate } from "react-router-dom";
import type { Movie } from "../../../../type/movie.type";

export default function HeroBanner({ movie }: { movie: Movie }) {
  const navigate = useNavigate();

  return (
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

      <div className="relative z-10 h-full flex items-end pb-8 px-8 max-w-xl">
        <div className="bg-surface/85 backdrop-blur-md rounded-2xl p-8 border border-edge shadow-lg">
          <h1 className="font-display text-4xl font-bold mb-3 text-ink">{movie.title}</h1>
          <p className="text-sm text-muted mb-4 line-clamp-3">{movie.description}</p>
          <div className="flex gap-3">
            <button
              onClick={() => navigate(`/movies/${movie.tmdbId}`)}
              className="bg-primary hover:bg-primary-dark text-white px-6 py-2.5 rounded-full font-semibold transition"
            >
              ▶ Play
            </button>
            <button
              onClick={() => navigate(`/movies/${movie.tmdbId}`)}
              className="bg-bg border border-edge hover:border-primary text-ink px-6 py-2.5 rounded-full font-semibold transition"
            >
              More Info
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}