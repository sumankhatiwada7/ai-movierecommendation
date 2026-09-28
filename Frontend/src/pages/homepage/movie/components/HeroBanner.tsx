import { useNavigate } from "react-router-dom";
import type { Movie } from "../../../../type/movie.type";

export default function HeroBanner({ movie }: { movie: Movie }) {
  const navigate = useNavigate();

  return (
    <section className="relative min-h-[31rem] overflow-hidden border-b border-white/5 bg-[#111114] md:min-h-[38rem]">

      {movie.backdropUrl && (
        <img
          src={movie.backdropUrl}
          alt=""
          className="absolute right-0 top-0 h-full w-full object-cover opacity-75 md:w-[72%]"
          style={{ maskImage: "linear-gradient(to right, transparent 0%, black 42%, black 100%)" }}
        />
      )}

      <div className="page-width relative z-10 flex min-h-[31rem] items-end pb-12 md:min-h-[38rem] md:pb-20">
        <div className="max-w-xl">
          <p className="mb-4 text-xs font-bold uppercase tracking-[.3em] text-primary">Featured tonight</p>
          <h1 className="mb-4 font-display text-4xl font-extrabold leading-[1.05] text-white md:text-6xl">{movie.title}</h1>
          <p className="mb-6 max-w-lg text-sm leading-6 text-white/65 line-clamp-3">{movie.description || 'A story worth staying up for.'}</p>
          <div className="mb-7 flex items-center gap-4 text-xs text-white/65"><span className="text-primary">★ {movie.averageRating?.toFixed(1) ?? 'N/A'}</span><span>{movie.releaseYear}</span><span>{movie.durationMinutes} min</span></div>
          <div className="flex gap-3">
            <button
              onClick={() => navigate(`/movies/${movie.tmdbId}`)}
              className="rounded bg-primary px-6 py-3 text-sm font-bold text-black transition hover:bg-white"
            >
              ▶ Play
            </button>
            <button
              onClick={() => navigate(`/movies/${movie.tmdbId}`)}
              className="rounded border border-white/20 bg-white/10 px-6 py-3 text-sm font-bold text-white transition hover:border-primary hover:text-primary"
            >
              More Info
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}