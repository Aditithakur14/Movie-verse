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
  SlidersHorizontal,
  Grid,
  List,
  ChevronLeft,
  ChevronRight,
  Filter,
  RotateCcw,
} from 'lucide-react';
import { Movie, MovieFilterParams, SearchResultItem } from '../types/tmdb';
import { tmdbService, getPosterUrl, getProfileUrl } from '../services/tmdbApi';
import { MovieCard } from './MovieCard';
import { AdvancedFilterPanel } from './AdvancedFilterPanel';
import { getGenreById } from '../data/genres';
import { getCinemaById } from '../data/cinemas';
import { getOttPlatformBySlug, POPULAR_OTT_PLATFORMS } from '../data/ottProviders';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectMovie: (movieId: number) => void;
  onSelectActor: (actorId: number) => void;
  initialQuery?: string;
  initialFilters?: Partial<MovieFilterParams>;
  genreMap?: Record<number, string>;
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

const DEFAULT_FILTERS: MovieFilterParams = {
  query: '',
  genreId: null,
  languageCode: null,
  cinemaId: null,
  yearType: 'any',
  year: null,
  fromYear: null,
  toYear: null,
  minRating: null,
  maxRating: null,
  ottProviderId: null,
  ottRegion: 'IN',
  releaseStatus: 'all',
  sortBy: 'popular',
  page: 1,
};

export const SearchModal: React.FC<SearchModalProps> = ({
  isOpen,
  onClose,
  onSelectMovie,
  onSelectActor,
  initialQuery = '',
  initialFilters = {},
  genreMap = {},
}) => {
  // Query & Filters State
  const [query, setQuery] = useState(initialQuery);
  const [filters, setFilters] = useState<MovieFilterParams>({
    ...DEFAULT_FILTERS,
    ...initialFilters,
    query: initialQuery,
  });

  // UI View States
  const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'quick' | 'discover'>('quick');

  // Quick Multi-Search state
  const [multiResults, setMultiResults] = useState<SearchResultItem[]>([]);
  const [multiFilterType, setMultiFilterType] = useState<'all' | 'movie' | 'actor'>('all');
  const [isMultiLoading, setIsMultiLoading] = useState(false);
  const [hasMultiSearched, setHasMultiSearched] = useState(false);
  const [activeIndex, setActiveIndex] = useState<number>(0);

  // Discover Movies Filtered Results state
  const [discoverMovies, setDiscoverMovies] = useState<Movie[]>([]);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalResults, setTotalResults] = useState<number>(0);
  const [isDiscoverLoading, setIsDiscoverLoading] = useState(false);
  const [hasDiscoverFetched, setHasDiscoverFetched] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // Calculate number of active discover filters (excluding defaults and query)
  const activeFilterCount = [
    Boolean(filters.genreId),
    Boolean(filters.languageCode),
    Boolean(filters.cinemaId),
    Boolean(filters.yearType === 'specific' && filters.year),
    Boolean(filters.yearType === 'range' && (filters.fromYear || filters.toYear)),
    Boolean(filters.minRating !== null && filters.minRating !== undefined && filters.minRating > 0),
    Boolean(filters.maxRating !== null && filters.maxRating !== undefined && filters.maxRating < 10),
    Boolean(filters.ottProviderId),
    Boolean(filters.releaseStatus && filters.releaseStatus !== 'all'),
    Boolean(filters.sortBy && filters.sortBy !== 'popular'),
  ].filter(Boolean).length;

  // Filter multi-search results based on selected pill
  const filteredMultiResults = multiResults.filter((item) => {
    if (multiFilterType === 'movie') return item.mediaType === 'movie';
    if (multiFilterType === 'actor') return item.mediaType === 'actor';
    return true;
  });

  // Parse URL search parameters when modal opens
  useEffect(() => {
    if (isOpen) {
      setError(null);
      setActiveIndex(0);

      // Check current URL parameters
      try {
        const urlParams = new URLSearchParams(window.location.search);
        const qParam = urlParams.get('q') || initialQuery || '';
        const genreParam = urlParams.get('genre') ? parseInt(urlParams.get('genre')!, 10) : null;
        const langParam = urlParams.get('language') || null;
        const cinemaParam = urlParams.get('cinema') || null;
        const yearParam = urlParams.get('year') ? parseInt(urlParams.get('year')!, 10) : null;
        const fromYearParam = urlParams.get('fromYear') ? parseInt(urlParams.get('fromYear')!, 10) : null;
        const toYearParam = urlParams.get('toYear') ? parseInt(urlParams.get('toYear')!, 10) : null;
        const minRatingParam = urlParams.get('minRating') ? parseFloat(urlParams.get('minRating')!) : null;
        const maxRatingParam = urlParams.get('maxRating') ? parseFloat(urlParams.get('maxRating')!) : null;
        const ottParam = urlParams.get('ott') ? parseInt(urlParams.get('ott')!, 10) : null;
        const ottRegionParam = urlParams.get('region') || 'IN';
        const statusParam = (urlParams.get('status') as any) || 'all';
        const sortParam = (urlParams.get('sort') as any) || 'popular';
        const pageParam = urlParams.get('page') ? parseInt(urlParams.get('page')!, 10) : 1;

        const hasUrlFilters = Boolean(
          genreParam ||
            langParam ||
            cinemaParam ||
            yearParam ||
            fromYearParam ||
            toYearParam ||
            minRatingParam ||
            ottParam ||
            (sortParam && sortParam !== 'popular') ||
            (statusParam && statusParam !== 'all')
        );

        if (hasUrlFilters) {
          setActiveTab('discover');
        }

        setQuery(qParam);
        setFilters((prev) => ({
          ...prev,
          query: qParam,
          genreId: genreParam || prev.genreId,
          languageCode: langParam || prev.languageCode,
          cinemaId: cinemaParam || prev.cinemaId,
          year: yearParam || prev.year,
          yearType: yearParam ? 'specific' : fromYearParam || toYearParam ? 'range' : 'any',
          fromYear: fromYearParam || prev.fromYear,
          toYear: toYearParam || prev.toYear,
          minRating: minRatingParam !== null ? minRatingParam : prev.minRating,
          maxRating: maxRatingParam !== null ? maxRatingParam : prev.maxRating,
          ottProviderId: ottParam || prev.ottProviderId,
          ottRegion: ottRegionParam || prev.ottRegion,
          releaseStatus: statusParam || prev.releaseStatus,
          sortBy: sortParam || prev.sortBy,
          page: pageParam || 1,
        }));
      } catch (err) {
        console.error('Error parsing search URL params:', err);
      }

      const timer = setTimeout(() => {
        inputRef.current?.focus();
      }, 80);
      return () => clearTimeout(timer);
    }
  }, [isOpen, initialQuery]);

  // Sync state to URL search parameters
  const updateUrlParams = useCallback(
    (currentFilters: MovieFilterParams) => {
      if (!isOpen) return;
      const params = new URLSearchParams();

      if (currentFilters.query?.trim()) params.set('q', currentFilters.query.trim());
      if (currentFilters.genreId) params.set('genre', String(currentFilters.genreId));
      if (currentFilters.languageCode) params.set('language', currentFilters.languageCode);
      if (currentFilters.cinemaId) params.set('cinema', currentFilters.cinemaId);
      if (currentFilters.yearType === 'specific' && currentFilters.year) {
        params.set('year', String(currentFilters.year));
      } else if (currentFilters.yearType === 'range') {
        if (currentFilters.fromYear) params.set('fromYear', String(currentFilters.fromYear));
        if (currentFilters.toYear) params.set('toYear', String(currentFilters.toYear));
      }
      if (currentFilters.minRating) params.set('minRating', String(currentFilters.minRating));
      if (currentFilters.maxRating && currentFilters.maxRating < 10) {
        params.set('maxRating', String(currentFilters.maxRating));
      }
      if (currentFilters.ottProviderId) params.set('ott', String(currentFilters.ottProviderId));
      if (currentFilters.ottRegion && currentFilters.ottRegion !== 'IN') {
        params.set('region', currentFilters.ottRegion);
      }
      if (currentFilters.releaseStatus && currentFilters.releaseStatus !== 'all') {
        params.set('status', currentFilters.releaseStatus);
      }
      if (currentFilters.sortBy && currentFilters.sortBy !== 'popular') {
        params.set('sort', currentFilters.sortBy);
      }
      if (currentFilters.page && currentFilters.page > 1) {
        params.set('page', String(currentFilters.page));
      }

      const queryString = params.toString();
      const newUrl = queryString ? `/search?${queryString}` : '/search';
      window.history.replaceState({}, '', newUrl);
    },
    [isOpen]
  );

  // 1. Debounced Multi-Search for Quick Tab (300ms)
  useEffect(() => {
    const trimmed = query.trim();
    if (!trimmed) {
      setMultiResults([]);
      setHasMultiSearched(false);
      setIsMultiLoading(false);
      return;
    }

    setIsMultiLoading(true);
    const timer = setTimeout(async () => {
      try {
        const data = await tmdbService.searchMulti(trimmed);
        setMultiResults(data);
        setHasMultiSearched(true);
        setActiveIndex(0);
      } catch (err) {
        console.error('TMDB Search Error:', err);
      } finally {
        setIsMultiLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  // 2. Discover Movies Fetcher for Advanced Discover Tab & active filters
  const fetchDiscoverMovies = useCallback(async () => {
    setIsDiscoverLoading(true);
    setError(null);
    try {
      const data = await tmdbService.advancedSearchMovies(filters);
      setDiscoverMovies(data.results || []);
      setTotalPages(Math.min(data.totalPages || 1, 500));
      setTotalResults(data.totalResults || 0);
      setHasDiscoverFetched(true);
    } catch (err) {
      console.error('Discover Movies Error:', err);
      setError('Unable to fetch matching movies. Please try different filters.');
    } finally {
      setIsDiscoverLoading(false);
    }
  }, [filters]);

  // Trigger discover search whenever filters change or when switching to discover tab
  useEffect(() => {
    if (isOpen) {
      fetchDiscoverMovies();
      updateUrlParams(filters);
    }
  }, [isOpen, filters, fetchDiscoverMovies, updateUrlParams]);

  // Synchronize query input change with filters
  const handleQueryChange = (val: string) => {
    setQuery(val);
    setFilters((prev) => ({ ...prev, query: val, page: 1 }));
  };

  const handleFilterUpdate = (newFilters: Partial<MovieFilterParams>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
    setActiveTab('discover');
  };

  const handleResetFilters = () => {
    setFilters({
      ...DEFAULT_FILTERS,
      query: query,
      page: 1,
    });
  };

  const handleCloseModal = () => {
    if (window.location.pathname.startsWith('/search')) {
      window.history.pushState({}, '', '/');
    }
    onClose();
  };

  // Keyboard navigation for Quick Multi-Search
  useEffect(() => {
    if (!isOpen || activeTab !== 'quick') return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        handleCloseModal();
        return;
      }

      if (filteredMultiResults.length === 0) return;

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setActiveIndex((prev) => (prev + 1) % filteredMultiResults.length);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setActiveIndex((prev) => (prev - 1 + filteredMultiResults.length) % filteredMultiResults.length);
      } else if (e.key === 'Enter') {
        e.preventDefault();
        const selected = filteredMultiResults[activeIndex];
        if (selected) {
          handleCloseModal();
          if (selected.mediaType === 'movie') {
            onSelectMovie(selected.id);
          } else {
            onSelectActor(selected.id);
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, activeTab, filteredMultiResults, activeIndex, onSelectMovie, onSelectActor]);

  // Scroll active item into view in quick search
  useEffect(() => {
    if (listRef.current && filteredMultiResults.length > 0) {
      const activeEl = listRef.current.children[activeIndex] as HTMLElement;
      if (activeEl) {
        activeEl.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
      }
    }
  }, [activeIndex, filteredMultiResults.length]);

  if (!isOpen) return null;

  // Derive human-readable labels for active filter tags
  const selectedGenre = filters.genreId ? getGenreById(filters.genreId) : null;
  const selectedCinema = filters.cinemaId ? getCinemaById(filters.cinemaId) : null;
  const selectedOtt = filters.ottProviderId
    ? POPULAR_OTT_PLATFORMS.find((p) => p.providerId === filters.ottProviderId)
    : null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-8 sm:pt-14 px-2 sm:px-4 pb-6 bg-black/85 backdrop-blur-xl animate-in fade-in duration-200">
      {/* Click outside backdrop */}
      <div className="fixed inset-0" onClick={handleCloseModal} aria-hidden="true" />

      {/* Modal Container */}
      <div className="relative z-10 w-full max-w-5xl bg-[#0c0e16]/98 border border-white/15 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] transition-all">
        {/* Modal Top Header & Search Bar */}
        <div className="p-4 sm:p-5 border-b border-white/10 bg-white/5 space-y-3">
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Search Input Box */}
            <div className="relative flex-1 flex items-center">
              <Search className="absolute left-4 h-5 w-5 text-red-500 pointer-events-none" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => handleQueryChange(e.target.value)}
                placeholder="Search movies, actors, genres, language keywords..."
                id="advanced-search-input"
                className="w-full rounded-2xl bg-black/75 border border-white/15 py-3.5 pl-12 pr-12 text-sm sm:text-base text-white placeholder-gray-400 focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/30 transition-all font-medium shadow-inner"
              />

              {/* Loader or Clear Button */}
              {isMultiLoading || isDiscoverLoading ? (
                <Loader2 className="absolute right-4 h-5 w-5 animate-spin text-red-500" />
              ) : query ? (
                <button
                  onClick={() => handleQueryChange('')}
                  className="absolute right-4 flex h-6 w-6 items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-gray-300 transition-colors"
                  title="Clear input"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              ) : null}
            </div>

            {/* Filter Drawer Toggle Button */}
            <button
              onClick={() => setIsFilterPanelOpen((prev) => !prev)}
              id="toggle-filter-panel-btn"
              className={`relative flex items-center gap-2 px-3.5 sm:px-4 py-3.5 rounded-2xl border font-bold text-xs sm:text-sm transition-all shadow-md ${
                isFilterPanelOpen || activeFilterCount > 0
                  ? 'bg-red-600 border-red-500 text-white shadow-red-600/30'
                  : 'bg-white/5 hover:bg-white/10 text-gray-200 border-white/10'
              }`}
            >
              <SlidersHorizontal className="h-4 w-4" />
              <span className="hidden sm:inline">Filters</span>
              {activeFilterCount > 0 && (
                <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-white text-red-600 text-[10px] font-black px-1 shadow">
                  {activeFilterCount}
                </span>
              )}
            </button>

            {/* Close Modal Button */}
            <button
              onClick={handleCloseModal}
              className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white border border-white/10 transition-colors"
              title="Close search"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Sub-Header: Active Mode Switcher & Filter Chips */}
          <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
            {/* View Mode Switcher */}
            <div className="flex items-center gap-1 bg-black/60 p-1 rounded-xl border border-white/10 text-xs">
              <button
                onClick={() => setActiveTab('quick')}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-lg font-semibold transition-all ${
                  activeTab === 'quick'
                    ? 'bg-red-600 text-white shadow-md'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <List className="h-3.5 w-3.5" />
                <span>Instant Multi-Search</span>
              </button>

              <button
                onClick={() => setActiveTab('discover')}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-lg font-semibold transition-all ${
                  activeTab === 'discover'
                    ? 'bg-red-600 text-white shadow-md'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <Grid className="h-3.5 w-3.5" />
                <span>Discovery Grid ({discoverMovies.length})</span>
              </button>
            </div>

            {/* Quick Suggestions / Active Filters Preview */}
            <div className="flex flex-wrap items-center gap-1.5">
              {/* Active Filter Chips */}
              {selectedGenre && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-red-950/60 border border-red-500/40 text-[11px] font-bold text-red-300">
                  {selectedGenre.emoji} {selectedGenre.name}
                  <button
                    onClick={() => handleFilterUpdate({ genreId: null })}
                    className="hover:text-white ml-0.5"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              )}

              {selectedCinema && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-950/60 border border-blue-500/40 text-[11px] font-bold text-blue-300">
                  {selectedCinema.flag} {selectedCinema.name}
                  <button
                    onClick={() => handleFilterUpdate({ cinemaId: null })}
                    className="hover:text-white ml-0.5"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              )}

              {filters.languageCode && !selectedCinema && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-950/60 border border-emerald-500/40 text-[11px] font-bold text-emerald-300">
                  Lang: {filters.languageCode.toUpperCase()}
                  <button
                    onClick={() => handleFilterUpdate({ languageCode: null })}
                    className="hover:text-white ml-0.5"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              )}

              {filters.year && filters.yearType === 'specific' && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-950/60 border border-amber-500/40 text-[11px] font-bold text-amber-300">
                  Year: {filters.year}
                  <button
                    onClick={() => handleFilterUpdate({ year: null, yearType: 'any' })}
                    className="hover:text-white ml-0.5"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              )}

              {filters.minRating && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-950/60 border border-amber-500/40 text-[11px] font-bold text-amber-300">
                  <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                  {filters.minRating}+ ⭐
                  <button
                    onClick={() => handleFilterUpdate({ minRating: null })}
                    className="hover:text-white ml-0.5"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              )}

              {selectedOtt && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-purple-950/60 border border-purple-500/40 text-[11px] font-bold text-purple-300">
                  {selectedOtt.shortName || selectedOtt.name} ({filters.ottRegion || 'IN'})
                  <button
                    onClick={() => handleFilterUpdate({ ottProviderId: null })}
                    className="hover:text-white ml-0.5"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              )}

              {activeFilterCount > 0 && (
                <button
                  onClick={handleResetFilters}
                  className="inline-flex items-center gap-1 text-[11px] text-gray-400 hover:text-red-400 px-2 py-1 transition-colors"
                >
                  <RotateCcw className="h-3 w-3" />
                  <span>Clear All</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Main Body with Split View for Filter Panel */}
        <div className="flex-1 overflow-hidden flex flex-col md:flex-row relative">
          {/* Main Results Column */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
            {/* Error Message */}
            {error && (
              <div className="flex items-center gap-3 rounded-2xl bg-red-500/10 border border-red-500/20 p-4 text-xs text-red-300">
                <AlertCircle className="h-5 w-5 text-red-400 shrink-0" />
                <p className="flex-1 font-medium">{error}</p>
              </div>
            )}

            {/* TAB 1: Instant Multi-Search View */}
            {activeTab === 'quick' && (
              <div className="space-y-4">
                {/* Result Type Tabs when multiResults exist */}
                {multiResults.length > 0 && !isMultiLoading && (
                  <div className="flex items-center justify-between px-1 text-xs text-gray-400">
                    <div className="flex items-center gap-1.5 bg-black/40 p-1 rounded-xl border border-white/10">
                      <button
                        onClick={() => {
                          setMultiFilterType('all');
                          setActiveIndex(0);
                        }}
                        className={`px-3 py-1 rounded-lg font-semibold transition-all ${
                          multiFilterType === 'all'
                            ? 'bg-red-600 text-white shadow-md'
                            : 'text-gray-400 hover:text-white hover:bg-white/5'
                        }`}
                      >
                        All ({multiResults.length})
                      </button>
                      <button
                        onClick={() => {
                          setMultiFilterType('movie');
                          setActiveIndex(0);
                        }}
                        className={`px-3 py-1 rounded-lg font-semibold transition-all ${
                          multiFilterType === 'movie'
                            ? 'bg-red-600 text-white shadow-md'
                            : 'text-gray-400 hover:text-white hover:bg-white/5'
                        }`}
                      >
                        Movies ({multiResults.filter((i) => i.mediaType === 'movie').length})
                      </button>
                      <button
                        onClick={() => {
                          setMultiFilterType('actor');
                          setActiveIndex(0);
                        }}
                        className={`px-3 py-1 rounded-lg font-semibold transition-all ${
                          multiFilterType === 'actor'
                            ? 'bg-red-600 text-white shadow-md'
                            : 'text-gray-400 hover:text-white hover:bg-white/5'
                        }`}
                      >
                        Actors ({multiResults.filter((i) => i.mediaType === 'actor').length})
                      </button>
                    </div>

                    <span className="hidden sm:block text-[11px] text-gray-400">
                      Use <ArrowUp className="inline h-3 w-3" /> <ArrowDown className="inline h-3 w-3" /> to navigate,{' '}
                      <CornerDownLeft className="inline h-3 w-3" /> to select
                    </span>
                  </div>
                )}

                {/* Empty Query State / Suggestions */}
                {!query.trim() && (
                  <div className="py-6 px-2 space-y-6">
                    <div className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-wider">
                      <TrendingUp className="h-4 w-4 text-red-500" />
                      <span>Popular Trending Searches</span>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {POPULAR_SUGGESTIONS.map((suggestion) => (
                        <button
                          key={suggestion}
                          onClick={() => {
                            handleQueryChange(suggestion);
                            inputRef.current?.focus();
                          }}
                          className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/5 hover:bg-red-600/20 hover:border-red-500/40 border border-white/10 text-xs font-semibold text-gray-300 hover:text-white transition-all hover:scale-105"
                        >
                          <Search className="h-3 w-3 text-red-500" />
                          <span>{suggestion}</span>
                        </button>
                      ))}
                    </div>

                    {/* Feature callout banner */}
                    <div className="rounded-2xl bg-white/5 border border-white/10 p-4 text-xs text-gray-400 flex items-start gap-3">
                      <Sparkles className="h-5 w-5 text-amber-400 shrink-0 mt-0.5" />
                      <div>
                        <p className="font-bold text-gray-200">Advanced Multi-Criteria Discovery</p>
                        <p className="text-gray-400 mt-0.5 leading-relaxed">
                          Filter by official TMDB Genre, Film Industry (Hollywood, Bollywood, Tollywood, Korean, Japanese), Release Year, Rating 0–10, and real-time OTT Streaming Availability.
                        </p>
                        <button
                          onClick={() => setIsFilterPanelOpen(true)}
                          className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-600/20 hover:bg-red-600/30 text-red-400 border border-red-500/30 font-bold transition-colors"
                        >
                          <SlidersHorizontal className="h-3.5 w-3.5" />
                          <span>Open Advanced Filters</span>
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Multi Search Loading Skeleton */}
                {isMultiLoading && (
                  <div className="space-y-3 py-2">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <div
                        key={i}
                        className="flex items-center gap-4 p-3 rounded-2xl skeleton border border-white/5"
                      >
                        <div className="h-16 w-12 rounded-xl bg-white/10 shrink-0" />
                        <div className="flex-1 space-y-2">
                          <div className="h-4 w-1/3 bg-white/10 rounded" />
                          <div className="h-3 w-1/4 bg-white/5 rounded" />
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Multi Search Results List */}
                {hasMultiSearched && !isMultiLoading && filteredMultiResults.length > 0 && (
                  <div ref={listRef} className="space-y-2">
                    {filteredMultiResults.map((item, index) => {
                      const isActive = index === activeIndex;
                      const isMovie = item.mediaType === 'movie';
                      const imageSrc = isMovie
                        ? getPosterUrl(item.imagePath, 'w92')
                        : getProfileUrl(item.imagePath);

                      return (
                        <div
                          key={`${item.mediaType}-${item.id}`}
                          onClick={() => {
                            handleCloseModal();
                            if (isMovie) {
                              onSelectMovie(item.id);
                            } else {
                              onSelectActor(item.id);
                            }
                          }}
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

                {/* No Multi Results Found */}
                {hasMultiSearched && !isMultiLoading && filteredMultiResults.length === 0 && (
                  <div className="text-center py-12 px-4 space-y-3">
                    <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white/5 border border-white/10 mx-auto text-gray-500">
                      <Film className="h-7 w-7 text-gray-400" />
                    </div>
                    <h3 className="text-base font-bold text-white">No results found for &quot;{query}&quot;</h3>
                    <p className="text-xs text-gray-400 max-w-sm mx-auto">
                      Try exploring the Discovery Grid or adjusting your spelling and search terms.
                    </p>
                    <button
                      onClick={() => setActiveTab('discover')}
                      className="mt-2 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold transition-all shadow-md"
                    >
                      <Grid className="h-4 w-4" />
                      <span>Switch to Discovery Grid</span>
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* TAB 2: Discovery Grid View (with multi-criteria filter support & pagination) */}
            {activeTab === 'discover' && (
              <div className="space-y-6">
                {/* Result Status Header */}
                <div className="flex flex-wrap items-center justify-between gap-3 bg-black/40 p-3 rounded-2xl border border-white/10 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white">
                      {isDiscoverLoading ? (
                        <span className="inline-flex items-center gap-1 text-gray-400">
                          <Loader2 className="h-3.5 w-3.5 animate-spin text-red-500" /> Searching TMDB...
                        </span>
                      ) : (
                        <span>Found {totalResults.toLocaleString()} Movies</span>
                      )}
                    </span>
                    {activeFilterCount > 0 && (
                      <span className="text-gray-400">
                        • with {activeFilterCount} active {activeFilterCount === 1 ? 'filter' : 'filters'}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-3 text-gray-400">
                    <span>
                      Page <strong className="text-white">{filters.page || 1}</strong> of{' '}
                      <strong className="text-white">{totalPages}</strong>
                    </span>
                  </div>
                </div>

                {/* Loading Skeleton Grid */}
                {isDiscoverLoading && (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                      <div
                        key={i}
                        className="aspect-[2/3] rounded-2xl skeleton border border-white/5"
                      />
                    ))}
                  </div>
                )}

                {/* Movies Grid */}
                {!isDiscoverLoading && discoverMovies.length > 0 && (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                    {discoverMovies.map((movie) => (
                      <MovieCard
                        key={movie.id}
                        movie={movie}
                        onSelectMovie={(id) => {
                          handleCloseModal();
                          onSelectMovie(id);
                        }}
                        genreMap={genreMap}
                        className="w-full"
                      />
                    ))}
                  </div>
                )}

                {/* No Movies Found State */}
                {!isDiscoverLoading && hasDiscoverFetched && discoverMovies.length === 0 && (
                  <div className="text-center py-16 px-4 space-y-4">
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white/5 border border-white/10 mx-auto text-gray-500">
                      <Filter className="h-8 w-8 text-gray-400" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-white">No movies found</h3>
                      <p className="text-xs text-gray-400 max-w-md mx-auto mt-1">
                        We couldn&apos;t find any movies matching your current combination of filters and query. Try clearing some filters.
                      </p>
                    </div>
                    <button
                      onClick={handleResetFilters}
                      className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold shadow-lg shadow-red-600/30 transition-all"
                    >
                      <RotateCcw className="h-3.5 w-3.5" />
                      <span>Reset All Filters</span>
                    </button>
                  </div>
                )}

                {/* Pagination Controls */}
                {!isDiscoverLoading && totalPages > 1 && (
                  <div className="flex items-center justify-center gap-2 pt-6 border-t border-white/10">
                    <button
                      disabled={(filters.page || 1) <= 1}
                      onClick={() => handleFilterUpdate({ page: Math.max(1, (filters.page || 1) - 1) })}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 disabled:opacity-40 disabled:pointer-events-none text-xs font-bold text-white border border-white/10 transition-colors"
                    >
                      <ChevronLeft className="h-4 w-4" />
                      <span>Previous</span>
                    </button>

                    <div className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-black/60 border border-white/10 text-xs font-semibold text-gray-300">
                      <span>Page</span>
                      <span className="text-white font-bold">{filters.page || 1}</span>
                      <span>of</span>
                      <span className="text-white font-bold">{totalPages}</span>
                    </div>

                    <button
                      disabled={(filters.page || 1) >= totalPages}
                      onClick={() => handleFilterUpdate({ page: (filters.page || 1) + 1 })}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 disabled:opacity-40 disabled:pointer-events-none text-xs font-bold text-white border border-white/10 transition-colors"
                    >
                      <span>Next</span>
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Collapsible / Responsive Advanced Filter Drawer */}
          {isFilterPanelOpen && (
            <div className="w-full md:w-96 border-t md:border-t-0 md:border-l border-white/10 bg-[#0d0f18] shrink-0 z-20 transition-all">
              <AdvancedFilterPanel
                filters={filters}
                onFilterChange={handleFilterUpdate}
                onResetFilters={handleResetFilters}
                onClose={() => setIsFilterPanelOpen(false)}
                activeFilterCount={activeFilterCount}
              />
            </div>
          )}
        </div>

        {/* Modal Bottom Footer */}
        <div className="p-3.5 border-t border-white/10 bg-black/80 flex items-center justify-between text-[11px] text-gray-400 px-5">
          <div className="flex items-center gap-1.5 text-gray-400">
            <Sparkles className="h-3.5 w-3.5 text-red-500" />
            <span>TMDB Live Search & Multi-Criteria Discovery</span>
          </div>

          <div className="flex items-center gap-4">
            <span className="hidden sm:inline">
              {activeFilterCount > 0 ? `${activeFilterCount} filters active` : 'No active filters'}
            </span>
            <button
              onClick={handleCloseModal}
              className="hover:text-white transition-colors font-medium"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
