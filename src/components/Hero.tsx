import React, { useState, useEffect } from 'react';
import { Play, Star, Bookmark, Check, ChevronLeft, ChevronRight, Info, Sparkles } from 'lucide-react';
import { Movie } from '../types/tmdb';
import { getImageUrl } from '../services/tmdbApi';
import { useWatchlist } from '../context/WatchlistContext';

interface HeroProps {
  movies: Movie[];
  onSelectMovie: (movieId: number) => void;
  isLoading?: boolean;
}

export const Hero: React.FC<HeroProps> = ({ movies, onSelectMovie, isLoading = false }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const { isInWatchlist, toggleWatchlist } = useWatchlist();

  useEffect(() => {
    if (movies.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % Math.min(movies.length, 6));
    }, 7000);
    return () => clearInterval(timer);
  }, [movies.length]);

  if (isLoading || movies.length === 0) {
    return (
      <div className="relative min-h-[75vh] w-full skeleton flex items-center justify-center">
        <div className="text-center text-gray-500">
          <Sparkles className="h-8 w-8 animate-spin mx-auto mb-2 text-red-500" />
          <p className="text-sm font-medium">Loading Trending Blockbusters...</p>
        </div>
      </div>
    );
  }

  const currentMovie = movies[currentIndex] || movies[0];
  const inWatchlist = isInWatchlist(currentMovie.id);
  const releaseYear = currentMovie.release_date ? currentMovie.release_date.split('-')[0] : 'N/A';
  const rating = currentMovie.vote_average ? currentMovie.vote_average.toFixed(1) : 'NR';

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % Math.min(movies.length, 6));
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + Math.min(movies.length, 6)) % Math.min(movies.length, 6));
  };

  return (
    <section id="hero-banner" className="relative min-h-[80vh] lg:min-h-[88vh] w-full overflow-hidden pt-20">
      {/* Dynamic Background Backdrop */}
      <div className="absolute inset-0 z-0">
        <img
          src={getImageUrl(currentMovie.backdrop_path || currentMovie.poster_path, 'w1280')}
          alt={currentMovie.title}
          className="h-full w-full object-cover object-center transition-all duration-1000 scale-105"
        />
        {/* Layered Cinematic Vignette Gradients */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#090a0f] via-[#090a0f]/60 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#090a0f] via-[#090a0f]/80 to-transparent w-full md:w-3/4" />
        <div className="absolute inset-0 bg-black/30" />
      </div>

      {/* Main Hero Content */}
      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-12 md:pt-24 pb-16 flex flex-col justify-end min-h-[70vh]">
        <div className="max-w-2xl space-y-4 md:space-y-6">
          {/* Tag / Badge */}
          <div className="inline-flex items-center gap-2 rounded-full bg-red-600/20 border border-red-500/30 px-3.5 py-1.5 text-xs font-extrabold text-red-400 backdrop-blur-md">
            <span className="flex h-2 w-2 rounded-full bg-red-500 animate-pulse" />
            <span>#1 TRENDING ON MOVIEVERSE</span>
          </div>

          {/* Title */}
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-none drop-shadow-lg">
            {currentMovie.title}
          </h1>

          {/* Movie Meta Information */}
          <div className="flex flex-wrap items-center gap-4 text-xs sm:text-sm font-semibold text-gray-300">
            {/* Rating */}
            <div className="flex items-center gap-1.5 rounded-md bg-amber-500/10 px-2.5 py-1 text-amber-400 border border-amber-500/20">
              <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
              <span>{rating} / 10</span>
            </div>

            {/* Release Year */}
            <span className="rounded-md bg-white/10 px-2.5 py-1 text-gray-200">
              {releaseYear}
            </span>

            {/* Vote Count */}
            {currentMovie.vote_count > 0 && (
              <span className="text-gray-400">
                {currentMovie.vote_count.toLocaleString()} TMDB votes
              </span>
            )}
          </div>

          {/* Short Overview */}
          <p className="line-clamp-3 text-sm sm:text-base text-gray-300 font-normal leading-relaxed max-w-xl drop-shadow">
            {currentMovie.overview || 'Discover detailed storyline, cast, trailer videos, and stream availability.'}
          </p>

          {/* Call-to-Action Buttons */}
          <div className="pt-2 flex flex-wrap items-center gap-3.5 sm:gap-4">
            <button
              onClick={() => onSelectMovie(currentMovie.id)}
              id="hero-explore-btn"
              className="flex items-center gap-2.5 rounded-xl bg-red-600 hover:bg-red-700 px-6 py-3.5 text-sm font-bold text-white shadow-xl glow-red transition-all duration-200 hover:scale-105 active:scale-95"
            >
              <Info className="h-4.5 w-4.5" />
              <span>Explore Movie</span>
            </button>

            <button
              onClick={() => toggleWatchlist(currentMovie)}
              id="hero-watchlist-btn"
              className={`flex items-center gap-2.5 rounded-xl px-5 py-3.5 text-sm font-bold border backdrop-blur-md transition-all duration-200 hover:scale-105 active:scale-95 ${
                inWatchlist
                  ? 'bg-red-600/20 border-red-500/50 text-red-400'
                  : 'bg-white/10 hover:bg-white/20 border-white/15 text-white'
              }`}
            >
              {inWatchlist ? (
                <>
                  <Check className="h-4.5 w-4.5 text-red-400" />
                  <span>In Watchlist</span>
                </>
              ) : (
                <>
                  <Bookmark className="h-4.5 w-4.5" />
                  <span>Add to Watchlist</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Hero Slider Indicators & Controls */}
        <div className="mt-8 flex items-center justify-between border-t border-white/10 pt-6">
          <div className="flex items-center gap-2">
            {movies.slice(0, 6).map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentIndex(idx)}
                title={`Go to slide ${idx + 1}`}
                className={`h-2 rounded-full transition-all duration-300 ${
                  currentIndex === idx ? 'w-8 bg-red-600' : 'w-2 bg-white/30 hover:bg-white/60'
                }`}
              />
            ))}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrev}
              title="Previous Movie"
              className="flex h-9 w-9 items-center justify-center rounded-full bg-black/50 hover:bg-white/20 border border-white/10 text-white backdrop-blur-md transition-colors"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              onClick={handleNext}
              title="Next Movie"
              className="flex h-9 w-9 items-center justify-center rounded-full bg-black/50 hover:bg-white/20 border border-white/10 text-white backdrop-blur-md transition-colors"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};
