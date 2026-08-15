import React from 'react';
import {
  X,
  RotateCcw,
  Sparkles,
  Film,
  Globe2,
  Calendar,
  Star,
  Tv,
  Check,
  ChevronDown,
  SlidersHorizontal,
  Layers,
} from 'lucide-react';
import { MovieFilterParams } from '../types/tmdb';
import { GENRE_CONFIGS, GENRE_LANGUAGES } from '../data/genres';
import { CINEMA_CATEGORIES } from '../data/cinemas';
import { POPULAR_OTT_PLATFORMS } from '../data/ottProviders';
import { WATCH_REGIONS } from '../data/watchRegions';

interface AdvancedFilterPanelProps {
  filters: MovieFilterParams;
  onFilterChange: (newFilters: Partial<MovieFilterParams>) => void;
  onResetFilters: () => void;
  onApply?: () => void;
  onClose?: () => void;
  activeFilterCount: number;
  isMobileDrawer?: boolean;
}

const RELEASE_YEARS = Array.from({ length: 45 }, (_, i) => new Date().getFullYear() - i + 1); // 2026 down to 1982
const FROM_YEARS = [2025, 2020, 2015, 2010, 2005, 2000, 1990, 1980, 1970, 1950];
const TO_YEARS = [2026, 2025, 2024, 2023, 2022, 2020, 2015, 2010, 2000];

const RATING_PRESETS = [
  { label: 'All Ratings', min: null, max: null },
  { label: '6.0+ ⭐', min: 6.0, max: null },
  { label: '7.0+ ⭐ Good', min: 7.0, max: null },
  { label: '8.0+ ⭐ Masterpiece', min: 8.0, max: null },
  { label: '9.0+ ⭐ Legend', min: 9.0, max: null },
];

const SORT_OPTIONS = [
  { id: 'popular', label: '🔥 Most Popular' },
  { id: 'top_rated', label: '⭐ Highest Rated' },
  { id: 'newest', label: '📅 Newest Releases' },
  { id: 'oldest', label: '🏛️ Classic & Oldest' },
  { id: 'most_voted', label: '🗳️ Most Voted' },
];

const RELEASE_STATUS_OPTIONS = [
  { id: 'all', label: 'All Movies' },
  { id: 'released', label: 'Released' },
  { id: 'now_playing', label: 'Now in Theatres' },
  { id: 'upcoming', label: 'Upcoming' },
];

export const AdvancedFilterPanel: React.FC<AdvancedFilterPanelProps> = ({
  filters,
  onFilterChange,
  onResetFilters,
  onApply,
  onClose,
  activeFilterCount,
  isMobileDrawer = false,
}) => {
  return (
    <div className="flex flex-col h-full bg-[#0d0f18] text-gray-200">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-white/10 bg-black/40">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-red-600/20 text-red-400 border border-red-500/30">
            <SlidersHorizontal className="h-4 w-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-black text-white tracking-tight">Advanced Filters</h3>
              {activeFilterCount > 0 && (
                <span className="flex h-5 items-center justify-center rounded-full bg-red-600 px-2 text-[10px] font-extrabold text-white shadow-md shadow-red-600/40">
                  {activeFilterCount} Active
                </span>
              )}
            </div>
            <p className="text-[11px] text-gray-400">Refine TMDB discovery criteria</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {activeFilterCount > 0 && (
            <button
              onClick={onResetFilters}
              id="reset-all-filters-btn"
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-semibold text-gray-300 hover:text-white border border-white/10 transition-colors"
              title="Reset all filters"
            >
              <RotateCcw className="h-3 w-3" />
              <span>Reset All</span>
            </button>
          )}

          {onClose && (
            <button
              onClick={onClose}
              id="close-filter-panel-btn"
              className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white border border-white/10 transition-colors"
              title="Close filter panel"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* Scrollable Filter Sections */}
      <div className="flex-1 overflow-y-auto p-5 space-y-6 divide-y divide-white/5">
        {/* 1. Sort By & Release Status */}
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Sort Selection */}
            <div>
              <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-2">
                Sort Order
              </label>
              <div className="relative">
                <select
                  value={filters.sortBy || 'popular'}
                  onChange={(e) => onFilterChange({ sortBy: e.target.value as any, page: 1 })}
                  id="sort-by-select"
                  className="w-full appearance-none rounded-xl bg-black/60 border border-white/15 px-3.5 py-2.5 text-xs sm:text-sm text-white focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500 transition-colors"
                >
                  {SORT_OPTIONS.map((opt) => (
                    <option key={opt.id} value={opt.id} className="bg-gray-900 text-white">
                      {opt.label}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
              </div>
            </div>

            {/* Release Status */}
            <div>
              <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-2">
                Release Status
              </label>
              <div className="relative">
                <select
                  value={filters.releaseStatus || 'all'}
                  onChange={(e) => onFilterChange({ releaseStatus: e.target.value as any, page: 1 })}
                  id="release-status-select"
                  className="w-full appearance-none rounded-xl bg-black/60 border border-white/15 px-3.5 py-2.5 text-xs sm:text-sm text-white focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500 transition-colors"
                >
                  {RELEASE_STATUS_OPTIONS.map((opt) => (
                    <option key={opt.id} value={opt.id} className="bg-gray-900 text-white">
                      {opt.label}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
              </div>
            </div>
          </div>
        </div>

        {/* 2. Genre Selection */}
        <div className="pt-5 space-y-3">
          <div className="flex items-center justify-between">
            <label className="flex items-center gap-1.5 text-xs font-bold text-gray-300 uppercase tracking-wider">
              <Film className="h-3.5 w-3.5 text-red-500" />
              <span>Genre</span>
            </label>
            {filters.genreId && (
              <button
                onClick={() => onFilterChange({ genreId: null, page: 1 })}
                className="text-[11px] text-red-400 hover:text-red-300"
              >
                Clear Genre
              </button>
            )}
          </div>

          <div className="flex flex-wrap gap-1.5 max-h-40 overflow-y-auto p-1 rounded-xl bg-black/30 border border-white/5">
            <button
              onClick={() => onFilterChange({ genreId: null, page: 1 })}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                !filters.genreId
                  ? 'bg-red-600 text-white shadow-md'
                  : 'bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white'
              }`}
            >
              All Genres
            </button>
            {GENRE_CONFIGS.map((g) => {
              const isSelected = filters.genreId === g.id;
              return (
                <button
                  key={g.id}
                  onClick={() => onFilterChange({ genreId: isSelected ? null : g.id, page: 1 })}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    isSelected
                      ? 'bg-red-600 text-white shadow-md scale-105'
                      : 'bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white border border-white/5'
                  }`}
                >
                  <span>{g.emoji}</span>
                  <span>{g.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 3. Cinema Industry / Country */}
        <div className="pt-5 space-y-3">
          <div className="flex items-center justify-between">
            <label className="flex items-center gap-1.5 text-xs font-bold text-gray-300 uppercase tracking-wider">
              <Globe2 className="h-3.5 w-3.5 text-blue-400" />
              <span>Cinema / Film Industry</span>
            </label>
            {filters.cinemaId && (
              <button
                onClick={() => onFilterChange({ cinemaId: null, page: 1 })}
                className="text-[11px] text-red-400 hover:text-red-300"
              >
                Clear Cinema
              </button>
            )}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            <button
              onClick={() => onFilterChange({ cinemaId: null, page: 1 })}
              className={`flex items-center justify-center gap-1.5 p-2 rounded-xl text-xs font-semibold transition-all border ${
                !filters.cinemaId
                  ? 'bg-red-600 text-white border-red-500 shadow-md'
                  : 'bg-black/40 text-gray-400 border-white/10 hover:border-white/20 hover:text-white'
              }`}
            >
              <span>🌍 All Cinemas</span>
            </button>
            {CINEMA_CATEGORIES.map((c) => {
              const isSelected = filters.cinemaId === c.id;
              return (
                <button
                  key={c.id}
                  onClick={() => onFilterChange({ cinemaId: isSelected ? null : c.id, page: 1 })}
                  className={`flex items-center gap-2 p-2 rounded-xl text-xs font-semibold transition-all border text-left ${
                    isSelected
                      ? 'bg-red-950/70 border-red-500 text-white shadow-md shadow-red-950/50 scale-[1.02]'
                      : 'bg-black/40 hover:bg-white/5 text-gray-300 border-white/10 hover:border-white/20'
                  }`}
                >
                  <span className="text-base shrink-0">{c.flag}</span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-bold">{c.name.split(' ')[0]}</p>
                    <p className="text-[10px] text-gray-400 truncate">{c.language}</p>
                  </div>
                  {isSelected && <Check className="h-3.5 w-3.5 text-red-400 shrink-0" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* 4. Language Filter (if cinema not strictly overriding) */}
        <div className="pt-5 space-y-3">
          <div className="flex items-center justify-between">
            <label className="flex items-center gap-1.5 text-xs font-bold text-gray-300 uppercase tracking-wider">
              <span>Original Language</span>
            </label>
            {filters.languageCode && (
              <button
                onClick={() => onFilterChange({ languageCode: null, page: 1 })}
                className="text-[11px] text-red-400 hover:text-red-300"
              >
                Clear Language
              </button>
            )}
          </div>

          <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto p-1 rounded-xl bg-black/30 border border-white/5">
            {GENRE_LANGUAGES.map((lang) => {
              const isSelected = (filters.languageCode || '') === lang.code;
              return (
                <button
                  key={lang.code || 'all'}
                  onClick={() => onFilterChange({ languageCode: lang.code || null, page: 1 })}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    isSelected
                      ? 'bg-red-600 text-white shadow-md'
                      : 'bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white border border-white/5'
                  }`}
                >
                  {lang.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* 5. Release Year Filter */}
        <div className="pt-5 space-y-3">
          <div className="flex items-center justify-between">
            <label className="flex items-center gap-1.5 text-xs font-bold text-gray-300 uppercase tracking-wider">
              <Calendar className="h-3.5 w-3.5 text-amber-400" />
              <span>Release Year</span>
            </label>
            {(filters.year || filters.fromYear || filters.toYear) && (
              <button
                onClick={() =>
                  onFilterChange({
                    yearType: 'any',
                    year: null,
                    fromYear: null,
                    toYear: null,
                    page: 1,
                  })
                }
                className="text-[11px] text-red-400 hover:text-red-300"
              >
                Clear Year
              </button>
            )}
          </div>

          {/* Year Mode Toggle */}
          <div className="flex items-center gap-1 bg-black/40 p-1 rounded-xl border border-white/10">
            <button
              onClick={() => onFilterChange({ yearType: 'any', year: null, fromYear: null, toYear: null, page: 1 })}
              className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                (filters.yearType || 'any') === 'any'
                  ? 'bg-red-600 text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Any Year
            </button>
            <button
              onClick={() => onFilterChange({ yearType: 'specific', page: 1 })}
              className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                filters.yearType === 'specific'
                  ? 'bg-red-600 text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Specific Year
            </button>
            <button
              onClick={() => onFilterChange({ yearType: 'range', page: 1 })}
              className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                filters.yearType === 'range'
                  ? 'bg-red-600 text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Year Range
            </button>
          </div>

          {/* Specific Year Selector */}
          {filters.yearType === 'specific' && (
            <div className="relative">
              <select
                value={filters.year || ''}
                onChange={(e) =>
                  onFilterChange({
                    year: e.target.value ? parseInt(e.target.value, 10) : null,
                    page: 1,
                  })
                }
                id="specific-year-select"
                className="w-full appearance-none rounded-xl bg-black/60 border border-white/15 px-3.5 py-2.5 text-xs sm:text-sm text-white focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
              >
                <option value="">Select Release Year</option>
                {RELEASE_YEARS.map((yr) => (
                  <option key={yr} value={yr} className="bg-gray-900 text-white">
                    {yr}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
            </div>
          )}

          {/* Year Range Selectors */}
          {filters.yearType === 'range' && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <span className="block text-[11px] text-gray-400 mb-1">From Year</span>
                <select
                  value={filters.fromYear || ''}
                  onChange={(e) =>
                    onFilterChange({
                      fromYear: e.target.value ? parseInt(e.target.value, 10) : null,
                      page: 1,
                    })
                  }
                  id="from-year-select"
                  className="w-full rounded-xl bg-black/60 border border-white/15 px-3 py-2 text-xs text-white focus:border-red-500 focus:outline-none"
                >
                  <option value="">Any</option>
                  {FROM_YEARS.map((yr) => (
                    <option key={yr} value={yr} className="bg-gray-900 text-white">
                      {yr}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <span className="block text-[11px] text-gray-400 mb-1">To Year</span>
                <select
                  value={filters.toYear || ''}
                  onChange={(e) =>
                    onFilterChange({
                      toYear: e.target.value ? parseInt(e.target.value, 10) : null,
                      page: 1,
                    })
                  }
                  id="to-year-select"
                  className="w-full rounded-xl bg-black/60 border border-white/15 px-3 py-2 text-xs text-white focus:border-red-500 focus:outline-none"
                >
                  <option value="">Any</option>
                  {TO_YEARS.map((yr) => (
                    <option key={yr} value={yr} className="bg-gray-900 text-white">
                      {yr}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}
        </div>

        {/* 6. TMDB Rating Filter */}
        <div className="pt-5 space-y-3">
          <div className="flex items-center justify-between">
            <label className="flex items-center gap-1.5 text-xs font-bold text-gray-300 uppercase tracking-wider">
              <Star className="h-3.5 w-3.5 text-amber-400 fill-amber-400" />
              <span>TMDB Rating</span>
            </label>
            {(filters.minRating || filters.maxRating) && (
              <button
                onClick={() => onFilterChange({ minRating: null, maxRating: null, page: 1 })}
                className="text-[11px] text-red-400 hover:text-red-300"
              >
                Clear Rating
              </button>
            )}
          </div>

          <div className="flex flex-wrap gap-2">
            {RATING_PRESETS.map((preset, idx) => {
              const isSelected =
                (preset.min === null && !filters.minRating) ||
                (filters.minRating === preset.min && filters.maxRating === preset.max);
              return (
                <button
                  key={idx}
                  onClick={() =>
                    onFilterChange({
                      minRating: preset.min,
                      maxRating: preset.max,
                      page: 1,
                    })
                  }
                  className={`px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                    isSelected
                      ? 'bg-amber-500 text-black shadow-md shadow-amber-500/20'
                      : 'bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white border border-white/5'
                  }`}
                >
                  {preset.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* 7. OTT Streaming Provider & Region */}
        <div className="pt-5 space-y-3">
          <div className="flex items-center justify-between">
            <label className="flex items-center gap-1.5 text-xs font-bold text-gray-300 uppercase tracking-wider">
              <Tv className="h-3.5 w-3.5 text-purple-400" />
              <span>OTT Streaming Platform</span>
            </label>
            {filters.ottProviderId && (
              <button
                onClick={() => onFilterChange({ ottProviderId: null, page: 1 })}
                className="text-[11px] text-red-400 hover:text-red-300"
              >
                Clear OTT
              </button>
            )}
          </div>

          {/* Region Switcher for OTT availability */}
          <div className="flex items-center justify-between bg-black/40 p-2.5 rounded-xl border border-white/10 text-xs">
            <span className="text-gray-400">Streaming Country:</span>
            <select
              value={filters.ottRegion || 'IN'}
              onChange={(e) => onFilterChange({ ottRegion: e.target.value, page: 1 })}
              id="ott-region-select"
              className="bg-black border border-white/20 rounded-lg px-2.5 py-1 text-xs text-white focus:outline-none focus:border-red-500"
            >
              {WATCH_REGIONS.map((r) => (
                <option key={r.code} value={r.code}>
                  {r.flag} {r.name}
                </option>
              ))}
            </select>
          </div>

          {/* OTT Platform Chips */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <button
              onClick={() => onFilterChange({ ottProviderId: null, page: 1 })}
              className={`p-2 rounded-xl text-xs font-semibold transition-all border text-center ${
                !filters.ottProviderId
                  ? 'bg-red-600 text-white border-red-500 shadow-md'
                  : 'bg-black/40 text-gray-400 border-white/10 hover:border-white/20 hover:text-white'
              }`}
            >
              All Platforms
            </button>
            {POPULAR_OTT_PLATFORMS.map((platform) => {
              const isSelected = filters.ottProviderId === platform.providerId;
              return (
                <button
                  key={platform.id}
                  onClick={() =>
                    onFilterChange({
                      ottProviderId: isSelected ? null : platform.providerId,
                      page: 1,
                    })
                  }
                  className={`flex items-center justify-center gap-1.5 p-2 rounded-xl text-xs font-bold transition-all border ${
                    isSelected
                      ? `${platform.badgeBg} text-white border-white/40 shadow-lg scale-105`
                      : 'bg-black/40 hover:bg-white/5 text-gray-300 border-white/10 hover:border-white/20'
                  }`}
                >
                  <span className="truncate">{platform.shortName || platform.name}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Footer / Apply Action Bar */}
      <div className="p-4 border-t border-white/10 bg-black/80 flex items-center justify-between gap-3">
        <button
          onClick={onResetFilters}
          className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-bold text-gray-300 hover:text-white border border-white/10 transition-colors"
        >
          Reset All
        </button>

        <button
          onClick={() => {
            if (onApply) onApply();
            if (onClose) onClose();
          }}
          id="apply-filters-btn"
          className="flex-1 py-2.5 px-6 rounded-xl bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-bold text-xs sm:text-sm shadow-lg shadow-red-600/30 transition-all flex items-center justify-center gap-2"
        >
          <Sparkles className="h-4 w-4" />
          <span>Apply Filters {activeFilterCount > 0 ? `(${activeFilterCount})` : ''}</span>
        </button>
      </div>
    </div>
  );
};
