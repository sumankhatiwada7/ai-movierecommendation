import { Link } from "react-router-dom";
import type { Movie } from "../../../../type/movie.type";
import { useState, useRef, useEffect } from "react";

interface MovieRowProps {
  title: string;
  movies: Movie[];
}

export default function MovieRow({ title, movies }: MovieRowProps) {
  const [scrollPosition, setScrollPosition] = useState(0);
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
    <div className="relative group/row mb-8">
      {/* Title with hover effect */}
      <h2 className="text-2xl font-bold mb-3 px-6 text-white hover:text-red-600 transition-colors duration-200">
        {title}
      </h2>

      {/* Navigation Arrows */}
      {showLeftArrow && (
        <button
          onClick={() => scroll("left")}
          className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-black/50 hover:bg-black/70 
                     text-white p-3 rounded-r-md transition-all duration-200 
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
          className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-black/50 hover:bg-black/70 
                     text-white p-3 rounded-l-md transition-all duration-200 
                     opacity-0 group-hover/row:opacity-100 hover:scale-110
                     backdrop-blur-sm border border-white/10"
          aria-label="Scroll right"
        >
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      )}

      {/* Movie Grid */}
      <div
        ref={containerRef}
        onScroll={handleScroll}
        className="flex gap-3 overflow-x-auto px-6 pb-4 scrollbar-hide
                   scroll-smooth snap-x snap-mandatory"
        style={{
          scrollbarWidth: "none",
          msOverflowStyle: "none",
        }}
      >
        {movies.map((movie, index) => (
          <Link
            to={`/movies/${movie.tmdbId}`}
            key={movie.tmdbId}
            className="flex-shrink-0 w-48 transition-all duration-300 
                       hover:scale-110 hover:z-20 snap-start group/movie"
            style={{
              transitionDelay: `${index * 30}ms`,
            }}
          >
            <div className="relative">
              {/* Movie Poster */}
              {movie.posterUrl ? (
                <img
                  src={movie.posterUrl}
                  alt={movie.title}
                  className="rounded-lg w-48 h-72 object-cover shadow-lg
                             transition-shadow duration-300
                             group-hover/movie:shadow-2xl group-hover/movie:shadow-red-600/20"
                  loading="lazy"
                />
              ) : (
                <div className="w-48 h-72 bg-gradient-to-br from-gray-800 to-gray-900 
                              rounded-lg flex items-center justify-center text-sm text-gray-400
                              border border-gray-700">
                  No image
                </div>
              )}

              {/* Hover Overlay - Shows on hover */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent
                            opacity-0 group-hover/movie:opacity-100 transition-opacity duration-300
                            rounded-lg flex flex-col justify-end p-4">
                <p className="text-sm font-semibold text-white line-clamp-2">
                  {movie.title}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs text-yellow-400">⭐ {movie.averageRating.toFixed(1)}</span>
                  <span className="text-xs text-white/60">• {new Date().getFullYear()}</span>
                </div>
              </div>
            </div>

            {/* Title below poster (visible when not hovering) */}
            <p className="mt-2 text-sm font-medium text-white/90 truncate px-1">
              {movie.title}
            </p>
            <p className="text-xs text-yellow-400 px-1">
              ⭐ {movie.averageRating.toFixed(1)}
            </p>
          </Link>
        ))}
      </div>

      {/* Gradient Fade Effects */}
      <div className="absolute left-0 top-0 bottom-0 w-12 bg-gradient-to-r from-black to-transparent pointer-events-none" />
      <div className="absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-black to-transparent pointer-events-none" />
    </div>
  );
}