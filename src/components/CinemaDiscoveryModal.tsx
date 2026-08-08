import React, { useEffect, useState, useRef } from 'react';
import {
  X,
  ArrowLeft,
  Globe,
  Star,
  Film,
  TrendingUp,
  Sparkles,
  Loader2,
  AlertCircle,
  Filter,
  Calendar,
  Share2,
  Check,
  RefreshCw,
  SlidersHorizontal,
} from 'lucide-react';
import { Movie } from '../types/tmdb';
import { tmdbService } from '../services/tmdbApi';
import { getCinemaById, CINEMA_CATEGORIES, CinemaCategory } from '../data/cinemas';
import { MovieCard } from './MovieCard';

interface CinemaDiscoveryModalProps {
  cinemaId: string | null;
  onClose: () => void;
  onSelectMovie: (movieId: number) => void;
  genreMap?: Record<number, string>;
}

export const CinemaDiscoveryModal: React.FC<CinemaDiscoveryModalProps> = ({
  cinemaId,
  onClose,
  onSelectMovie,
  genreMap = {},
}) => {
  const [cinema, setCinema] = useState<CinemaCategory | null>(null);
  const [movies, setMovies] = useState<Movie[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalResults, setTotalResults] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);

  // Filter States
  const [sortBy, setSortBy] = useState<'popular' | 'top_rated' | 'newest' | 'upcoming'>('popular');
  const [selectedYear, setSelectedYear] = useState<number | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);

  // Update selected cinema object whenever cinemaId prop changes
  useEffect(() => {
    if (!cinemaId) {
      setCinema(null);
      setMovies([]);
      setError(null);
      return;
    }

    const found = getCinemaById(cinemaId);
    if (!found) {
      setCinema(null);
      setError(`Invalid cinema category "${cinemaId}"`);
    } else {
      setCinema(found);
      setError(null);
      setSortBy('popular');
      setSelectedYear(null);
      setPage(1);
    }
  }, [cinemaId]);

  // Fetch movies when cinema, sortBy, selectedYear changes
  useEffect(() => {
    if (!cinema) return;

    const fetchCinemaMovies = async () => {
      setIsLoading(true);
      setError(null);
      setPage(1);

      if (containerRef.current) {
        containerRef.current.scrollTop = 0;
      }

      try {
        const response = await tmdbService.getMoviesByCinema(
          cinema.languageCode,
          cinema.countryCode,
          sortBy,
          selectedYear,
          1
        );

        setMovies(response.results);
        setTotalPages(response.totalPages);
        setTotalResults(response.totalResults);
      } catch (err) {
        console.error('Error fetching cinema movies:', err);
        setError('Failed to load movies for this cinema');
      } finally {
        setIsLoading(false);
      }
    };

    fetchCinemaMovies();
  }, [cinema, sortBy, selectedYear]);

  // Load More Handler (Pagination)
  const handleLoadMore = async () => {
    if (!cinema || isLoadingMore || page >= totalPages) return;

    const nextPage = page + 1;
    setIsLoadingMore(true);

    try {
      const response = await tmdbService.getMoviesByCinema(
        cinema.languageCode,
        cinema.countryCode,
        sortBy,
        selectedYear,
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
      console.error('Error loading more cinema movies:', err);
    } finally {
      setIsLoadingMore(false);
    }
  };

  // Keyboard navigation
  useEffect(() => {
    if (!cinemaId) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleBack();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [cinemaId]);

  const handleBack = () => {
    if (window.history.length > 1) {
      window.history.back();
    } else {
      onClose();
    }
  };

  const handleCopyLink = () => {
    if (!cinemaId) return;
    const url = `${window.location.origin}/cinema/${cinemaId}`;
    navigator.clipboard.writeText(url).then(() => {
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    });
  };

  if (!cinemaId) return null;

  // Year options list
  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from({ length: 15 }, (_, i) => currentYear - i);

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-[#0a0b10] animate-in fade-in duration-300">
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-40 flex items-center justify-between border-b border-white/10 bg-[#0a0b10]/90 px-4 sm:px-8 py-3.5 backdrop-blur-xl">
        <button
          onClick={handleBack}
          className="flex items-center gap-2 rounded-xl bg-white/5 border border-white/10 px-3.5 py-2 text-xs sm:text-sm font-bold text-gray-200 hover:bg-white/10 hover:text-white transition-all hover:scale-105 active:scale-95"
        >
          <ArrowLeft className="h-4 w-4 text-red-500" />
          <span>Back</span>
        </button>

        <div className="flex items-center gap-2 max-w-xs sm:max-w-md truncate">
          <Globe className="h-4 w-4 text-red-500 shrink-0" />
          <span className="text-xs sm:text-sm font-extrabold text-white truncate">
            {cinema ? `${cinema.flag} ${cinema.name}` : 'Cinema Discovery'}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {cinema && (
            <button
              onClick={handleCopyLink}
              title="Share Cinema Page"
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

      {/* Scrollable Container */}
      <div
        ref={containerRef}
        className="h-[calc(100vh-57px)] overflow-y-auto custom-scrollbar pb-24"
      >
        {error && !cinema ? (
          /* INVALID CINEMA ERROR STATE */
          <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 text-center space-y-6">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-red-500/10 border border-red-500/20 text-red-500">
              <AlertCircle className="h-10 w-10" />
            </div>
            <div className="space-y-2 max-w-md">
              <h2 className="text-2xl font-black text-white">Cinema Not Found</h2>
              <p className="text-sm text-gray-400">
                {error || 'The requested cinema category does not exist.'}
              </p>
            </div>
            <button
              onClick={handleBack}
              className="flex items-center gap-2 rounded-2xl bg-red-600 hover:bg-red-700 px-6 py-3 text-sm font-bold text-white shadow-xl glow-red transition-all"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Return to Previous Page</span>
            </button>
          </div>
        ) : cinema ? (
          <div className="space-y-8">
            {/* CINEMA HERO HEADER */}
            <div className={`relative w-full border-b border-white/10 bg-gradient-to-br ${cinema.bgGradient} overflow-hidden py-10 sm:py-16 px-4 sm:px-8`}>
              {cinema.bannerImage && (
                <div className="absolute inset-0 z-0 opacity-20">
                  <img
                    src={cinema.bannerImage}
                    alt={cinema.name}
                    className="h-full w-full object-cover filter blur-[2px] scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0a0b10] via-[#0a0b10]/60 to-transparent" />
                </div>
              )}

              <div className="relative z-10 max-w-7xl mx-auto space-y-4">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-4xl sm:text-5xl drop-shadow-md">{cinema.flag}</span>
                  <span className="px-3 py-1 rounded-full bg-white/10 border border-white/20 text-xs font-bold text-white uppercase tracking-wider backdrop-blur-md">
                    📍 {cinema.country}
                  </span>
                  <span className="px-3 py-1 rounded-full bg-red-600/30 border border-red-500/40 text-xs font-bold text-red-300 uppercase tracking-wider backdrop-blur-md">
                    🗣️ {cinema.language} Cinema
                  </span>
                </div>

                <div className="space-y-2">
                  <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight drop-shadow-md">
                    {cinema.name}
                  </h1>
                  <p className="text-sm sm:text-base text-gray-300 max-w-3xl leading-relaxed font-normal">
                    {cinema.description}
                  </p>
                </div>

                {/* Total Results Counter */}
                {totalResults > 0 && (
                  <div className="pt-2 flex items-center gap-2 text-xs font-semibold text-gray-400">
                    <Film className="h-4 w-4 text-amber-400" />
                    <span>Over {totalResults.toLocaleString()} titles available in TMDB database</span>
                  </div>
                )}
              </div>
            </div>

            {/* FILTERS BAR & CONTROLS */}
            <div className="max-w-7xl mx-auto px-4 sm:px-8">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 rounded-2xl bg-white/5 border border-white/10 p-4 backdrop-blur-xl">
                {/* Sort Tabs */}
                <div className="flex items-center gap-1.5 overflow-x-auto custom-scrollbar pb-1 md:pb-0">
                  {[
                    { id: 'popular', label: 'Popular', icon: TrendingUp },
                    { id: 'top_rated', label: 'Top Rated', icon: Star },
                    { id: 'newest', label: 'Newest', icon: Sparkles },
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
                            ? 'bg-red-600 text-white shadow-lg shadow-red-600/30'
                            : 'bg-white/5 text-gray-400 hover:text-white hover:bg-white/10'
                        }`}
                      >
                        <Icon className="h-3.5 w-3.5" />
                        <span>{tab.label}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Release Year Dropdown Filter */}
                <div className="flex items-center gap-2 self-end md:self-auto">
                  <SlidersHorizontal className="h-4 w-4 text-gray-400" />
                  <span className="text-xs font-semibold text-gray-400">Release Year:</span>
                  <select
                    value={selectedYear || ''}
                    onChange={(e) =>
                      setSelectedYear(e.target.value ? parseInt(e.target.value, 10) : null)
                    }
                    className="rounded-xl bg-[#12141d] border border-white/10 px-3 py-2 text-xs font-bold text-gray-200 focus:outline-none focus:border-red-500 transition-colors cursor-pointer"
                  >
                    <option value="">All Years</option>
                    {yearOptions.map((y) => (
                      <option key={y} value={y}>
                        {y}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* MOVIE GRID & STATES */}
            <div className="max-w-7xl mx-auto px-4 sm:px-8">
              {isLoading ? (
                /* SKELETON LOADING GRID */
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
                    <Film className="h-8 w-8" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-lg font-bold text-white">No movies found for this cinema yet</h3>
                    <p className="text-xs text-gray-400 max-w-sm">
                      Try resetting your year filter or selecting a different sorting category to discover titles.
                    </p>
                  </div>
                  {selectedYear && (
                    <button
                      onClick={() => setSelectedYear(null)}
                      className="flex items-center gap-2 rounded-xl bg-red-600/80 hover:bg-red-600 px-4 py-2 text-xs font-bold text-white transition-all"
                    >
                      <RefreshCw className="h-3.5 w-3.5" />
                      <span>Reset Year Filter</span>
                    </button>
                  )}
                </div>
              ) : (
                /* MOVIE GRID RESULTS */
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
                        className="flex items-center gap-2 rounded-2xl bg-white/10 hover:bg-red-600 border border-white/20 hover:border-red-500 px-8 py-3.5 text-sm font-bold text-white transition-all duration-300 shadow-xl disabled:opacity-50"
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
