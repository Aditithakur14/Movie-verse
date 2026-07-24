import React, { useRef } from 'react';
import { ChevronLeft, ChevronRight, TrendingUp } from 'lucide-react';
import { Movie } from '../types/tmdb';
import { MovieCard } from './MovieCard';

interface TrendingMoviesProps {
  movies: Movie[];
  onSelectMovie: (movieId: number) => void;
  genreMap?: Record<number, string>;
  title?: string;
  subtitle?: string;
}

export const TrendingMovies: React.FC<TrendingMoviesProps> = ({
  movies,
  onSelectMovie,
  genreMap = {},
  title = 'Trending This Week',
  subtitle = 'Top movies everyone is watching right now on TMDB',
}) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (!scrollContainerRef.current) return;
    const scrollAmount = direction === 'left' ? -600 : 600;
    scrollContainerRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
  };

  return (
    <section id="trending-section" className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
      {/* Header with Scroll Controls */}
      <div className="flex items-end justify-between mb-6">
        <div>
          <div className="inline-flex items-center gap-2 text-xs font-bold text-amber-400 uppercase tracking-widest mb-1.5">
            <TrendingUp className="h-4 w-4" />
            <span>Popular Right Now</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            {title}
          </h2>
          <p className="text-xs sm:text-sm text-gray-400 mt-1">{subtitle}</p>
        </div>

        {/* Scroll Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => scroll('left')}
            title="Scroll Left"
            className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#12151e] hover:bg-white/10 border border-white/10 text-white transition-all duration-200 active:scale-95"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            onClick={() => scroll('right')}
            title="Scroll Right"
            className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#12151e] hover:bg-white/10 border border-white/10 text-white transition-all duration-200 active:scale-95"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Horizontal Scrollable Slider */}
      <div
        ref={scrollContainerRef}
        className="flex gap-4 sm:gap-6 overflow-x-auto no-scrollbar py-4 -mx-2 px-2 scroll-smooth"
      >
        {movies.map((movie) => (
          <MovieCard
            key={movie.id}
            movie={movie}
            onSelectMovie={onSelectMovie}
            genreMap={genreMap}
          />
        ))}
      </div>
    </section>
  );
};
