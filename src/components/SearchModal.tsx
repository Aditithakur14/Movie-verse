import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Search,
  X,
  Loader2,
  Film,
  User,
  Star,
  Sparkles,
  Calendar,
  AlertCircle,
  CornerDownLeft,
  ArrowUp,
  ArrowDown,
  TrendingUp,
} from 'lucide-react';
import { SearchResultItem } from '../types/tmdb';
import { tmdbService, getPosterUrl, getProfileUrl } from '../services/tmdbApi';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectMovie: (movieId: number) => void;
  onSelectActor: (actorId: number) => void;
}

const POPULAR_SUGGESTIONS = [
  'Oppenheimer',
  'Dune: Part Two',
  'Interstellar',
  'Inception',
  'Brad Pitt',
  'Zendaya',
  'The Dark Knight',
  'Christopher Nolan',
];

export const SearchModal: React.FC<SearchModalProps> = ({
  isOpen,
  onClose,
  onSelectMovie,
  onSelectActor,
}) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResultItem[]>([]);
  const [filterType, setFilterType] = useState<'all' | 'movie' | 'actor'>('all');
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeIndex, setActiveIndex] = useState<number>(0);

  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // Filter results based on selected tab
  const filteredResults = results.filter((item) => {
    if (filterType === 'movie') return item.mediaType === 'movie';
    if (filterType === 'actor') return item.mediaType === 'actor';
    return true;
  });

  // Autofocus when modal opens & reset index
  useEffect(() => {
    if (isOpen) {
      setError(null);
      setActiveIndex(0);
      const timer = setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
      return () => clearTimeout(timer);
    } else {
      setQuery('');
      setResults([]);
      setHasSearched(false);
    }
  }, [isOpen]);

  // Debounced TMDB API search (300ms)
  useEffect(() => {
    const trimmed = query.trim();
    if (!trimmed) {
      setResults([]);
      setHasSearched(false);
      setIsLoading(false);
      setError(null);
      return;
    }

    setIsLoading(true);
    setError(null);

    const handler = setTimeout(async () => {
      try {
        const data = await tmdbService.searchMulti(trimmed);
        setResults(data);
        setHasSearched(true);
        setActiveIndex(0);
      } catch (err) {
        console.error('TMDB Search Error:', err);
        setError('Unable to fetch TMDB results. Please check your connection or key.');
      } finally {
        setIsLoading(false);
      }
    }, 300);

    return () => clearTimeout(handler);
  }, [query]);

  // Handle item selection
  const handleSelectItem = useCallback(
    (item: SearchResultItem) => {
      onClose();
      if (item.mediaType === 'movie') {
        onSelectMovie(item.id);
      } else {
        onSelectActor(item.id);
      }
    },
    [onClose, onSelectMovie, onSelectActor]
  );

  // Keyboard navigation & Shortcuts (Escape, ArrowUp, ArrowDown, Enter)
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
        return;
      }

      if (filteredResults.length === 0) return;

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setActiveIndex((prev) => (prev + 1) % filteredResults.length);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setActiveIndex((prev) => (prev - 1 + filteredResults.length) % filteredResults.length);
      } else if (e.key === 'Enter') {
        e.preventDefault();
        const selected = filteredResults[activeIndex];
        if (selected) {
          handleSelectItem(selected);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, filteredResults, activeIndex, handleSelectItem, onClose]);

  // Scroll active item into view
  useEffect(() => {
    if (listRef.current && filteredResults.length > 0) {
      const activeEl = listRef.current.children[activeIndex] as HTMLElement;
      if (activeEl) {
        activeEl.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
      }
    }
  }, [activeIndex, filteredResults.length]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-12 sm:pt-20 px-3 sm:px-6 pb-6 bg-black/85 backdrop-blur-xl animate-in fade-in duration-200">
      {/* Click outside backdrop */}
      <div className="fixed inset-0" onClick={onClose} aria-hidden="true" />

      {/* Modal Card */}
      <div className="relative z-10 w-full max-w-2xl bg-[#0c0e16]/95 border border-white/15 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh] transition-all">
        {/* Search Header */}
        <div className="relative p-4 sm:p-5 border-b border-white/10 bg-white/5">
          <div className="relative flex items-center">
            <Search className="absolute left-4 h-5 w-5 text-red-500 pointer-events-none" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search movies, actors..."
              className="w-full rounded-2xl bg-black/70 border border-white/15 py-3.5 pl-12 pr-20 text-sm sm:text-base text-white placeholder-gray-400 focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/30 transition-all font-medium shadow-inner"
            />

            <div className="absolute right-3 flex items-center gap-2">
              {isLoading && <Loader2 className="h-5 w-5 animate-spin text-red-500" />}

              {query && !isLoading && (
                <button
                  onClick={() => {
                    setQuery('');
                    inputRef.current?.focus();
                  }}
                  className="flex h-7 w-7 items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-gray-300 transition-colors"
                  title="Clear search"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}

              <button
                onClick={onClose}
                className="hidden sm:flex items-center gap-1 px-2 py-1 rounded-lg bg-white/10 text-[11px] font-bold text-gray-300 border border-white/10 hover:bg-white/20 transition-colors"
                title="Close modal"
              >
                ESC
              </button>
            </div>
          </div>

          {/* Result Filter Tabs when items exist */}
          {results.length > 0 && !isLoading && (
            <div className="flex items-center justify-between mt-3 px-1 text-xs text-gray-400">
              <div className="flex items-center gap-1.5 bg-black/40 p-1 rounded-xl border border-white/10">
                <button
                  onClick={() => {
                    setFilterType('all');
                    setActiveIndex(0);
                  }}
                  className={`px-3 py-1 rounded-lg font-semibold transition-all ${
                    filterType === 'all'
                      ? 'bg-red-600 text-white shadow-md'
                      : 'text-gray-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  All ({results.length})
                </button>
                <button
                  onClick={() => {
                    setFilterType('movie');
                    setActiveIndex(0);
                  }}
                  className={`px-3 py-1 rounded-lg font-semibold transition-all ${
                    filterType === 'movie'
                      ? 'bg-red-600 text-white shadow-md'
                      : 'text-gray-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  Movies ({results.filter((i) => i.mediaType === 'movie').length})
                </button>
                <button
                  onClick={() => {
                    setFilterType('actor');
                    setActiveIndex(0);
                  }}
                  className={`px-3 py-1 rounded-lg font-semibold transition-all ${
                    filterType === 'actor'
                      ? 'bg-red-600 text-white shadow-md'
                      : 'text-gray-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  Actors ({results.filter((i) => i.mediaType === 'actor').length})
                </button>
              </div>

              <span className="hidden sm:block text-[11px] text-gray-400">
                Use <ArrowUp className="inline h-3 w-3" /> <ArrowDown className="inline h-3 w-3" /> to navigate, <CornerDownLeft className="inline h-3 w-3" /> to select
              </span>
            </div>
          )}
        </div>

        {/* Results Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {/* Error Banner */}
          {error && (
            <div className="flex items-center gap-3 rounded-2xl bg-red-500/10 border border-red-500/20 p-4 text-xs text-red-300">
              <AlertCircle className="h-5 w-5 text-red-400 shrink-0" />
              <p className="flex-1 font-medium">{error}</p>
            </div>
          )}

          {/* Empty Query State / Suggestions */}
          {!query.trim() && (
            <div className="py-6 px-2 space-y-6">
              <div className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-wider">
                <TrendingUp className="h-4 w-4 text-red-500" />
                <span>Popular Searches</span>
              </div>

              <div className="flex flex-wrap gap-2">
                {POPULAR_SUGGESTIONS.map((suggestion) => (
                  <button
                    key={suggestion}
                    onClick={() => {
                      setQuery(suggestion);
                      inputRef.current?.focus();
                    }}
                    className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/5 hover:bg-red-600/20 hover:border-red-500/40 border border-white/10 text-xs font-semibold text-gray-300 hover:text-white transition-all hover:scale-105"
                  >
                    <Search className="h-3 w-3 text-red-500" />
                    <span>{suggestion}</span>
                  </button>
                ))}
              </div>

              <div className="rounded-2xl bg-white/5 border border-white/10 p-4 text-xs text-gray-400 flex items-start gap-3">
                <Sparkles className="h-5 w-5 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-gray-200">Instant TMDB Search Engine</p>
                  <p className="text-gray-400 mt-0.5 leading-relaxed">
                    Search millions of blockbuster movies, indie gems, Hollywood actors, and legendary directors in real-time.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Loading Skeleton */}
          {isLoading && (
            <div className="space-y-3 py-2">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex items-center gap-4 p-3 rounded-2xl skeleton border border-white/5">
                  <div className="h-16 w-12 rounded-xl bg-white/10 shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 w-1/3 bg-white/10 rounded" />
                    <div className="h-3 w-1/4 bg-white/5 rounded" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Search Results List */}
          {hasSearched && !isLoading && filteredResults.length > 0 && (
            <div ref={listRef} className="space-y-2">
              {filteredResults.map((item, index) => {
                const isActive = index === activeIndex;
                const isMovie = item.mediaType === 'movie';
                const imageSrc = isMovie
                  ? getPosterUrl(item.imagePath, 'w92')
                  : getProfileUrl(item.imagePath);

                return (
                  <div
                    key={`${item.mediaType}-${item.id}`}
                    onClick={() => handleSelectItem(item)}
                    onMouseEnter={() => setActiveIndex(index)}
                    className={`group flex items-center justify-between p-3 rounded-2xl cursor-pointer transition-all border ${
                      isActive
                        ? 'bg-red-950/40 border-red-500/60 shadow-lg shadow-red-950/50 scale-[1.01]'
                        : 'bg-white/5 hover:bg-white/10 border-white/5 hover:border-white/15'
                    }`}
                  >
                    <div className="flex items-center gap-3.5 min-w-0">
                      {/* Image Thumbnail */}
                      <div className="relative h-16 w-12 rounded-xl overflow-hidden bg-black/60 shrink-0 border border-white/10">
                        {item.imagePath ? (
                          <img
                            src={imageSrc}
                            alt={item.name}
                            className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-300"
                            onError={(e) => {
                              // Fallback if image load fails
                              e.currentTarget.style.display = 'none';
                              e.currentTarget.nextElementSibling?.classList.remove('hidden');
                            }}
                          />
                        ) : null}

                        <div
                          className={`h-full w-full flex items-center justify-center bg-gradient-to-br from-gray-800 to-gray-900 text-gray-500 ${
                            item.imagePath ? 'hidden' : ''
                          }`}
                        >
                          {isMovie ? <Film className="h-5 w-5" /> : <User className="h-5 w-5" />}
                        </div>
                      </div>

                      {/* Content Info */}
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-bold text-white truncate group-hover:text-red-400 transition-colors">
                            {item.name}
                          </h4>

                          {/* Type Badge */}
                          {isMovie ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-red-500/20 border border-red-500/30 text-[10px] font-extrabold text-red-400 uppercase tracking-wider shrink-0">
                              <Film className="h-3 w-3" />
                              Movie
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-purple-500/20 border border-purple-500/30 text-[10px] font-extrabold text-purple-300 uppercase tracking-wider shrink-0">
                              <User className="h-3 w-3" />
                              Actor
                            </span>
                          )}
                        </div>

                        {/* Metadata Row */}
                        <div className="flex items-center gap-3 text-xs text-gray-400 mt-1">
                          {isMovie ? (
                            <>
                              {item.releaseYear && (
                                <span className="flex items-center gap-1 font-medium text-gray-300">
                                  <Calendar className="h-3 w-3 text-gray-400" />
                                  {item.releaseYear}
                                </span>
                              )}

                              {typeof item.rating === 'number' && item.rating > 0 && (
                                <span className="flex items-center gap-1 font-bold text-amber-400">
                                  <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                                  {item.rating}
                                </span>
                              )}
                            </>
                          ) : (
                            item.knownFor && (
                              <span className="text-gray-400 font-medium truncate">
                                Known for: <span className="text-gray-300">{item.knownFor}</span>
                              </span>
                            )
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Enter Action Indicator */}
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity pl-2">
                      <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-red-600 text-white shadow-md">
                        <CornerDownLeft className="h-4 w-4" />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* No Results Found State */}
          {hasSearched && !isLoading && filteredResults.length === 0 && (
            <div className="text-center py-12 px-4 space-y-3">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white/5 border border-white/10 mx-auto text-gray-500">
                <Film className="h-7 w-7 text-gray-400" />
              </div>
              <h3 className="text-base font-bold text-white">No results found for &quot;{query}&quot;</h3>
              <p className="text-xs text-gray-400 max-w-sm mx-auto">
                Check for typos or try searching another title, actor, or genre keyword.
              </p>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-3 border-t border-white/10 bg-black/60 flex items-center justify-between text-[11px] text-gray-400 px-5">
          <div className="flex items-center gap-1.5 text-gray-400">
            <Sparkles className="h-3.5 w-3.5 text-red-500" />
            <span>Powered by TMDB API</span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="hover:text-white transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
