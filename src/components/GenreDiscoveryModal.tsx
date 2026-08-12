import React, { useEffect, useState, useRef } from 'react';
import {
  X,
  ArrowLeft,
  Sparkles,
  Star,
  Film,
  TrendingUp,
  Loader2,
  AlertCircle,
  Calendar,
  Share2,
  Check,
  RefreshCw,
  SlidersHorizontal,
  Globe,
  Layers,
  History,
} from 'lucide-react';
import { Movie } from '../types/tmdb';
import { tmdbService } from '../services/tmdbApi';
import {
  getGenreBySlug,
  GENRE_CONFIGS,
  GenreConfig,
  GENRE_LANGUAGES,
} from '../data/genres';
import { MovieCard } from './MovieCard';

interface GenreDiscoveryModalProps {
  genreSlug: string | null;
  onClose: () => void;
  onSelectMovie: (movieId: number) => void;
  genreMap?: Record<number, string>;
}

export const GenreDiscoveryModal: React.FC<GenreDiscoveryModalProps> = ({
  genreSlug,
  onClose,
  onSelectMovie,
  genreMap = {},
}) => {
  const [genre, setGenre] = useState<GenreConfig | null>(null);
  const [movies, setMovies] = useState<Movie[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalResults, setTotalResults] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);

  // Filter States
  const [sortBy, setSortBy] = useState<'popular' | 'top_rated' | 'newest' | 'oldest' | 'upcoming'>('popular');
  const [selectedYear, setSelectedYear] = useState<number | null>(null);
  const [selectedLanguage, setSelectedLanguage] = useState<string>('');

  const containerRef = useRef<HTMLDivElement>(null);

  // Update selected genre whenever genreSlug prop changes
  useEffect(() => {
    if (!genreSlug) {
      setGenre(null);
      setMovies([]);
      setError(null);
      return;
    }

    const found = getGenreBySlug(genreSlug);
    if (!found) {
      // Fallback: check if genreSlug is numeric ID or matching name
      const numericId = parseInt(genreSlug, 10);
      const fallback = !isNaN(numericId)
        ? GENRE_CONFIGS.find((g) => g.id === numericId)
        : GENRE_CONFIGS.find(
            (g) => g.name.toLowerCase() === genreSlug.toLowerCase().replace(/-/g, ' ')
          );

      if (fallback) {
        setGenre(fallback);
        setError(null);
      } else {
        setGenre(null);
        setError(`Genre "${genreSlug}" not found`);
      }
    } else {
      setGenre(found);
      setError(null);
    }

    // Reset filters on genre change
    setSortBy('popular');
    setSelectedYear(null);
    setSelectedLanguage('');
    setPage(1);
  }, [genreSlug]);

  // Fetch movies from TMDB when genre, sortBy, selectedYear, or selectedLanguage changes
  useEffect(() => {
    if (!genre) return;

    const fetchGenreMovies = async () => {
      setIsLoading(true);
      setError(null);
      setPage(1);

      if (containerRef.current) {
        containerRef.current.scrollTop = 0;
      }

      try {
        const response = await tmdbService.getMoviesByGenreAdvanced(
          genre.id,
          sortBy,
          selectedYear,
          selectedLanguage,
          1
        );

        setMovies(response.results);
        setTotalPages(response.totalPages);
        setTotalResults(response.totalResults);
      } catch (err) {
        console.error('Error fetching genre movies:', err);
        setError('Failed to load movies for this genre from TMDB.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchGenreMovies();
  }, [genre, sortBy, selectedYear, selectedLanguage]);

  // Load More Handler (Pagination)
  const handleLoadMore = async () => {
    if (!genre || isLoadingMore || page >= totalPages) return;

    const nextPage = page + 1;
    setIsLoadingMore(true);

    try {
      const response = await tmdbService.getMoviesByGenreAdvanced(
        genre.id,
        sortBy,
        selectedYear,
        selectedLanguage,
        nextPage
      );

      // Append new movies, deduplicating by movie.id
      setMovies((prev) => {
        const existingIds = new Set(prev.map((m) => m.id));
        const uniqueNew = response.results.filter((m) => !existingIds.has(m.id));
        return [...prev, ...uniqueNew];
      });

      setPage(nextPage);
      setTotalPages(response.totalPages);
      setTotalResults(response.totalResults);
    } catch (err) {
      console.error('Error loading more genre movies:', err);
    } finally {
      setIsLoadingMore(false);
    }
  };

  // Keyboard navigation (Escape key)
  useEffect(() => {
    if (!genreSlug) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleBack();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [genreSlug]);

  const handleBack = () => {
    if (window.history.length > 1) {
      window.history.back();
    } else {
      onClose();
    }
  };

  const handleClearFilters = () => {
    setSortBy('popular');
    setSelectedYear(null);
    setSelectedLanguage('');
  };

  const handleCopyLink = () => {
    if (!genreSlug) return;
    const url = `${window.location.origin}/genre/${genreSlug}`;
    navigator.clipboard.writeText(url).then(() => {
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    });
  };

  if (!genreSlug) return null;

  // Release year filter options
  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from({ length: 45 }, (_, i) => currentYear - i);

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-[#0a0b10] animate-in fade-in duration-300">
      {/* Top Header Bar */}
      <header className="sticky top-0 z-40 flex items-center justify-between border-b border-white/10 bg-[#0a0b10]/90 px-4 sm:px-8 py-3.5 backdrop-blur-xl">
        <button
          onClick={handleBack}
          className="flex items-center gap-2 rounded-xl bg-white/5 border border-white/10 px-3.5 py-2 text-xs sm:text-sm font-bold text-gray-200 hover:bg-white/10 hover:text-white transition-all hover:scale-105 active:scale-95"
        >
          <ArrowLeft className="h-4 w-4 text-purple-400" />
          <span>Back</span>
        </button>

        <div className="flex items-center gap-2 max-w-xs sm:max-w-md truncate">
          <Layers className="h-4 w-4 text-purple-400 shrink-0" />
          <span className="text-xs sm:text-sm font-extrabold text-white truncate">
            {genre ? `${genre.emoji} ${genre.name} Movies` : 'Genre Discovery'}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {genre && (
            <button
              onClick={handleCopyLink}
              title="Share Genre Page"
              className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/5 border border-white/10 text-gray-300 hover:text-white hover:bg-white/10 transition-colors"
            >
              {copiedLink ? (
                <Check className="h-4 w-4 text-emerald-400" />
              ) : (
                <Share2 className="h-4 w-4" />
              )}
            </button>
          )}

          <button
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/5 border border-white/10 text-gray-300 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      </header>

      {/* Scrollable Main Area */}
      <div
        ref={containerRef}
        className="h-[calc(100vh-57px)] overflow-y-auto custom-scrollbar pb-24"
      >
        {error && !genre ? (
          /* INVALID GENRE ERROR STATE */
          <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 text-center space-y-6">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-red-500/10 border border-red-500/20 text-red-500">
              <AlertCircle className="h-10 w-10" />
            </div>
            <div className="space-y-2 max-w-md">
              <h2 className="text-2xl font-black text-white">Genre Not Found</h2>
              <p className="text-sm text-gray-400">
                {error || 'The requested genre category does not exist.'}
              </p>
            </div>
            <button
              onClick={handleBack}
              className="flex items-center gap-2 rounded-2xl bg-purple-600 hover:bg-purple-700 px-6 py-3 text-sm font-bold text-white shadow-xl glow-purple transition-all"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Return to Previous Page</span>
            </button>
          </div>
        ) : genre ? (
          <div className="space-y-8">
            {/* HERO BANNER FOR GENRE */}
            <div className={`relative w-full border-b border-white/10 bg-gradient-to-br ${genre.bgGradient} overflow-hidden py-10 sm:py-16 px-4 sm:px-8`}>
              {genre.bannerImage && (
                <div className="absolute inset-0 z-0 opacity-20">
                  <img
                    src={genre.bannerImage}
                    alt={genre.name}
                    className="h-full w-full object-cover filter blur-[2px] scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0a0b10] via-[#0a0b10]/60 to-transparent" />
                </div>
              )}

              <div className="relative z-10 max-w-7xl mx-auto space-y-4">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-4xl sm:text-5xl drop-shadow-md">{genre.emoji}</span>
                  <span className="px-3 py-1 rounded-full bg-purple-600/30 border border-purple-500/40 text-xs font-bold text-purple-300 uppercase tracking-wider backdrop-blur-md">
                    TMDB Genre #{genre.id}
                  </span>
                </div>

                <div className="space-y-2">
                  <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight drop-shadow-md">
                    {genre.name} Movies
                  </h1>
                  <p className="text-sm sm:text-base text-gray-300 max-w-3xl leading-relaxed font-normal">
                    {genre.description}
                  </p>
                </div>

                {/* Total Results Counter */}
                {totalResults > 0 && (
                  <div className="pt-2 flex items-center gap-2 text-xs font-semibold text-gray-400">
                    <Film className="h-4 w-4 text-purple-400" />
                    <span>Over {totalResults.toLocaleString()} titles cataloged in TMDB database</span>
                  </div>
                )}
              </div>
            </div>

            {/* FILTERS & SORT CONTROLS BAR */}
            <div className="max-w-7xl mx-auto px-4 sm:px-8">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 rounded-2xl bg-white/5 border border-white/10 p-4 backdrop-blur-xl">
                {/* Sort Tabs */}
                <div className="flex items-center gap-1.5 overflow-x-auto custom-scrollbar pb-2 lg:pb-0">
                  {[
                    { id: 'popular', label: 'Popular', icon: TrendingUp },
                    { id: 'top_rated', label: 'Top Rated', icon: Star },
                    { id: 'newest', label: 'Newest', icon: Sparkles },
                    { id: 'oldest', label: 'Oldest', icon: History },
                    { id: 'upcoming', label: 'Upcoming', icon: Calendar },
                  ].map((tab) => {
                    const Icon = tab.icon;
                    const isActive = sortBy === tab.id;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setSortBy(tab.id as any)}
                        className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                          isActive
                            ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30 scale-105'
                            : 'bg-white/5 text-gray-400 hover:text-white hover:bg-white/10'
                        }`}
                      >
                        <Icon className="h-3.5 w-3.5" />
                        <span>{tab.label}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Dropdown Filters: Language & Release Year */}
                <div className="flex flex-wrap items-center gap-3">
                  {/* Language Filter */}
                  <div className="flex items-center gap-2">
                    <Globe className="h-4 w-4 text-gray-400 shrink-0" />
                    <select
                      value={selectedLanguage}
                      onChange={(e) => setSelectedLanguage(e.target.value)}
                      className="rounded-xl bg-[#12141d] border border-white/10 px-3 py-2 text-xs font-bold text-gray-200 focus:outline-none focus:border-purple-500 transition-colors cursor-pointer"
                    >
                      {GENRE_LANGUAGES.map((lang) => (
                        <option key={lang.code} value={lang.code}>
                          {lang.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Year Filter */}
                  <div className="flex items-center gap-2">
                    <SlidersHorizontal className="h-4 w-4 text-gray-400 shrink-0" />
                    <select
                      value={selectedYear || ''}
                      onChange={(e) =>
                        setSelectedYear(e.target.value ? parseInt(e.target.value, 10) : null)
                      }
                      className="rounded-xl bg-[#12141d] border border-white/10 px-3 py-2 text-xs font-bold text-gray-200 focus:outline-none focus:border-purple-500 transition-colors cursor-pointer"
                    >
                      <option value="">All Years</option>
                      {yearOptions.map((y) => (
                        <option key={y} value={y}>
                          {y}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Reset Filters if active */}
                  {(selectedYear || selectedLanguage || sortBy !== 'popular') && (
                    <button
                      onClick={handleClearFilters}
                      title="Clear All Filters"
                      className="flex items-center gap-1.5 rounded-xl bg-white/10 hover:bg-red-600/80 px-3 py-2 text-xs font-bold text-gray-300 hover:text-white transition-all"
                    >
                      <RefreshCw className="h-3.5 w-3.5" />
                      <span>Reset</span>
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* MOVIE GRID & STATES */}
            <div className="max-w-7xl mx-auto px-4 sm:px-8">
              {isLoading ? (
                /* POLISHED SKELETON LOADING GRID */
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 animate-pulse">
                  {Array.from({ length: 12 }).map((_, i) => (
                    <div
                      key={i}
                      className="rounded-xl bg-white/5 border border-white/10 overflow-hidden space-y-3 p-2"
                    >
                      <div className="aspect-[2/3] w-full rounded-lg bg-white/10" />
                      <div className="h-4 w-3/4 bg-white/10 rounded" />
                      <div className="h-3 w-1/2 bg-white/10 rounded" />
                    </div>
                  ))}
                </div>
              ) : movies.length === 0 ? (
                /* EMPTY STATE */
                <div className="flex flex-col items-center justify-center rounded-3xl bg-white/5 border border-white/10 p-12 text-center space-y-4 my-8">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white/10 text-gray-400">
                    <Film className="h-8 w-8 text-purple-400" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-lg font-bold text-white">
                      No movies found for this combination.
                    </h3>
                    <p className="text-xs text-gray-400 max-w-sm">
                      Try resetting your language, year, or sorting parameters to discover titles.
                    </p>
                  </div>
                  <button
                    onClick={handleClearFilters}
                    className="flex items-center gap-2 rounded-xl bg-purple-600 hover:bg-purple-700 px-5 py-2.5 text-xs font-bold text-white transition-all shadow-lg glow-purple"
                  >
                    <RefreshCw className="h-3.5 w-3.5" />
                    <span>Clear All Filters</span>
                  </button>
                </div>
              ) : (
                /* MOVIE RESULTS GRID */
                <div className="space-y-8">
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                    {movies.map((movie) => (
                      <MovieCard
                        key={movie.id}
                        movie={movie}
                        onSelectMovie={onSelectMovie}
                        genreMap={genreMap}
                        className="w-full"
                      />
                    ))}
                  </div>

                  {/* LOAD MORE PAGINATION BUTTON */}
                  {page < totalPages && (
                    <div className="flex justify-center pt-6">
                      <button
                        onClick={handleLoadMore}
                        disabled={isLoadingMore}
                        className="flex items-center gap-2 rounded-2xl bg-white/10 hover:bg-purple-600 border border-white/20 hover:border-purple-500 px-8 py-3.5 text-sm font-bold text-white transition-all duration-300 shadow-xl disabled:opacity-50"
                      >
                        {isLoadingMore ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin text-white" />
                            <span>Loading More Movies...</span>
                          </>
                        ) : (
                          <>
                            <Film className="h-4 w-4" />
                            <span>Load More Movies (Page {page} of {totalPages})</span>
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
};
