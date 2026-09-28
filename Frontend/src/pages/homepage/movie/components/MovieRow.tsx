import type { Movie } from "../../../../type/movie.type";
import { useState, useRef, useEffect } from "react";
import MovieCard from "../components/MovieCard"; // 👈 import the card

interface MovieRowProps {
  title: string;
  movies: Movie[];
  progressMap?: Record<number, number>; // tmdbId -> seconds watched
}

export default function MovieRow({ title, movies, progressMap = {} }: MovieRowProps) {
  const [, setScrollPosition] = useState(0);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);

  if (movies.length === 0) return null;

  const scroll = (direction: "left" | "right") => {
    if (!containerRef.current) return;
    const { scrollLeft, clientWidth } = containerRef.current;
    const scrollAmount = clientWidth * 0.8;
    const newPosition =
      direction === "left"
        ? scrollLeft - scrollAmount
        : scrollLeft + scrollAmount;

    containerRef.current.scrollTo({
      left: newPosition,
      behavior: "smooth",
    });
  };

  const handleScroll = () => {
    if (!containerRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = containerRef.current;
    setScrollPosition(scrollLeft);
    setShowLeftArrow(scrollLeft > 20);
    setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 20);
  };

  useEffect(() => {
    if (containerRef.current) {
      const { scrollWidth, clientWidth } = containerRef.current;
      setShowRightArrow(scrollWidth > clientWidth);
    }
  }, [movies]);

  return (
    <section className="group/row relative mb-10">
      <div className="page-width section-heading"><h2>{title}</h2><span className="text-xs text-muted">{movies.length} titles</span></div>

      {/* Navigation Arrows */}
      {showLeftArrow && (
        <button
          onClick={() => scroll("left")}
          className="absolute left-2 top-[45%] z-10 -translate-y-1/2 rounded-full border border-white/10 bg-black/70 p-2 text-white transition-all duration-200 
                     opacity-0 group-hover/row:opacity-100 hover:scale-110
                     backdrop-blur-sm border border-white/10"
          aria-label="Scroll left"
        >
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
      )}

      {showRightArrow && (
        <button
          onClick={() => scroll("right")}
          className="absolute right-2 top-[45%] z-10 -translate-y-1/2 rounded-full border border-white/10 bg-black/70 p-2 text-white transition-all duration-200 
                     opacity-0 group-hover/row:opacity-100 hover:scale-110
                     backdrop-blur-sm border border-white/10"
          aria-label="Scroll right"
        >
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      )}

      {/* Movie Grid – using MovieCard */}
      <div
        ref={containerRef}
        onScroll={handleScroll}
        className="page-width flex gap-4 overflow-x-auto pb-4 scrollbar-hide
                   scroll-smooth snap-x snap-mandatory"
        style={{
          scrollbarWidth: "none",
          msOverflowStyle: "none",
        }}
      >
        {movies.map((movie) => (
          <div
            key={movie.tmdbId}
            className="w-[145px] flex-shrink-0 snap-start sm:w-[175px] md:w-[190px]"
          >
            <MovieCard
              movie={movie}
              showProgress={!!progressMap[movie.tmdbId]}
              progress={progressMap[movie.tmdbId] || 0}
            />
          </div>
        ))}
      </div>

      {/* Gradient Fade Effects */}
    </section>
  );
}