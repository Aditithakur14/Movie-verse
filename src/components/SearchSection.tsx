import React, { useState, useEffect, useRef } from 'react';
import { Search, X, Loader2, Film, Sparkles, Filter } from 'lucide-react';
import { Movie } from '../types/tmdb';
import { tmdbService } from '../services/tmdbApi';
import { MovieCard } from './MovieCard';

interface SearchSectionProps {
  onSelectMovie: (movieId: number) => void;
  genreMap?: Record<number, string>;
  initialQuery?: string;
}

export const SearchSection: React.FC<SearchSectionProps> = ({
  onSelectMovie,
  genreMap = {},
  initialQuery = '',
}) => {
  const [query, setQuery] = useState(initialQuery);
  const [results, setResults] = useState<Movie[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [filterRating, setFilterRating] = useState<number>(0);
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setHasSearched(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsLoading(true);
      try {
        const data = await tmdbService.searchMovies(query);
        setResults(data);
        setHasSearched(true);
      } catch (err) {
        console.error('Search error:', err);
      } finally {
        setIsLoading(false);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [query]);

  const handleClear = () => {
    setQuery('');
    setResults([]);
    setHasSearched(false);
    if (searchInputRef.current) searchInputRef.current.focus();
  };

  const filteredResults = results.filter((m) => (m.vote_average || 0) >= filterRating);

  return (
    <section id="search-section" className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
      <div className="relative glass-panel rounded-2xl p-6 md:p-8 border border-white/10 shadow-2xl">
        <div className="text-center max-w-2xl mx-auto mb-6">
          <div className="inline-flex items-center gap-2 text-xs font-bold text-red-500 uppercase tracking-widest mb-2">
            <Search className="h-4 w-4" />
            <span>Instant TMDB Search</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Search Any Movie, Director, or Title
          </h2>
          <p className="text-xs sm:text-sm text-gray-400 mt-1">
            Access millions of titles directly powered by TMDB.
          </p>
        </div>

        {/* Large Modern Search Bar */}
        <div className="relative max-w-3xl mx-auto">
          <div className="relative flex items-center">
            <Search className="absolute left-4.5 h-5 w-5 text-gray-400 pointer-events-none" />
            <input
              ref={searchInputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Type movie name (e.g. Inception, Oppenheimer, Avatar, Dark Knight)..."
              id="movie-search-input"
              className="w-full rounded-2xl bg-black/60 border border-white/15 py-4 pl-12 pr-12 text-sm sm:text-base text-white placeholder-gray-500 focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/20 transition-all shadow-inner"
            />
            {isLoading ? (
              <Loader2 className="absolute right-4.5 h-5 w-5 animate-spin text-red-500" />
            ) : query ? (
              <button
                onClick={handleClear}
                className="absolute right-4.5 flex h-6 w-6 items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-gray-300 transition-colors"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            ) : null}
          </div>

          {/* Quick Filter Controls when results exist */}
          {results.length > 0 && (
            <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-xs text-gray-400 px-2">
              <span className="font-medium text-gray-300">
                Found {filteredResults.length} movies for &quot;{query}&quot;
              </span>
              <div className="flex items-center gap-2">
                <Filter className="h-3.5 w-3.5 text-gray-400" />
                <span>Min Rating:</span>
                {[0, 6, 7, 8].map((rating) => (
                  <button
                    key={rating}
                    onClick={() => setFilterRating(rating)}
                    className={`px-2.5 py-1 rounded-md transition-colors ${
                      filterRating === rating
                        ? 'bg-red-600 text-white font-bold'
                        : 'bg-white/5 hover:bg-white/10 text-gray-300'
                    }`}
                  >
                    {rating === 0 ? 'All' : `${rating}+ ⭐`}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Results Grid */}
        {hasSearched && !isLoading && (
          <div className="mt-8 border-t border-white/10 pt-8">
            {filteredResults.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6">
                {filteredResults.map((movie) => (
                  <MovieCard
                    key={movie.id}
                    movie={movie}
                    onSelectMovie={onSelectMovie}
                    genreMap={genreMap}
                    className="w-full"
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-gray-400 space-y-2">
                <Film className="h-10 w-10 mx-auto text-gray-600 mb-2" />
                <p className="text-base font-semibold text-gray-300">No movies found</p>
                <p className="text-xs">Try searching another title or clearing your rating filter.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
};
