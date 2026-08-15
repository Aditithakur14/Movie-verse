import React, { useState, useEffect } from 'react';
import {
  Tv,
  Globe,
  ExternalLink,
  Loader2,
  Film,
  AlertCircle,
  Sparkles,
  Info,
} from 'lucide-react';
import { MovieWatchProviders, WatchProvider } from '../types/tmdb';
import { tmdbService, getLogoUrl } from '../services/tmdbApi';
import { WATCH_REGIONS, WatchRegion, DEFAULT_WATCH_REGION } from '../data/watchRegions';

interface WhereToWatchSectionProps {
  movieId: number;
  initialWatchProviders?: Record<string, MovieWatchProviders> | null;
}

type AvailabilityCategory = 'all' | 'flatrate' | 'free' | 'ads' | 'rent' | 'buy';

interface ProcessedProviderItem {
  provider_id: number;
  provider_name: string;
  logo_path: string | null;
  category: 'flatrate' | 'free' | 'ads' | 'rent' | 'buy';
  categoryLabel: string;
  categoryBg: string;
  categoryText: string;
}

export const WhereToWatchSection: React.FC<WhereToWatchSectionProps> = ({
  movieId,
  initialWatchProviders,
}) => {
  const [selectedRegion, setSelectedRegion] = useState<WatchRegion>(DEFAULT_WATCH_REGION); // Default India (IN)
  const [allRegionProviders, setAllRegionProviders] = useState<Record<string, MovieWatchProviders>>(
    initialWatchProviders || {}
  );
  const [regionProviderData, setRegionProviderData] = useState<MovieWatchProviders | null>(null);
  const [activeCategoryFilter, setActiveCategoryFilter] = useState<AvailabilityCategory>('all');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [hasFetchedMap, setHasFetchedMap] = useState<boolean>(!!initialWatchProviders);

  // Sync initialWatchProviders or fetch when movieId/region changes
  useEffect(() => {
    let isMounted = true;

    const loadWatchProvidersForRegion = async () => {
      // If we already have providers object in memory for this region
      if (allRegionProviders[selectedRegion.code]) {
        setRegionProviderData(allRegionProviders[selectedRegion.code]);
        return;
      }

      setIsLoading(true);
      try {
        let providersMap = allRegionProviders;
        if (!hasFetchedMap || Object.keys(providersMap).length === 0) {
          providersMap = await tmdbService.getMovieWatchProviders(movieId);
          if (isMounted) {
            setAllRegionProviders(providersMap);
            setHasFetchedMap(true);
          }
        }

        if (isMounted) {
          const regionData = providersMap[selectedRegion.code] || null;
          setRegionProviderData(regionData);
        }
      } catch (err) {
        console.error('Error loading watch providers for region:', err);
        if (isMounted) {
          setRegionProviderData(null);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadWatchProvidersForRegion();

    return () => {
      isMounted = false;
    };
  }, [movieId, selectedRegion.code, hasFetchedMap]);

  // Reset category filter on region change
  useEffect(() => {
    setActiveCategoryFilter('all');
  }, [selectedRegion.code]);

  // Process and combine available providers for the selected region
  const flatrate = regionProviderData?.flatrate || [];
  const free = regionProviderData?.free || [];
  const ads = regionProviderData?.ads || [];
  const rent = regionProviderData?.rent || [];
  const buy = regionProviderData?.buy || [];
  const tmdbLink = regionProviderData?.link || null;

  // Build combined items with availability tags
  const allProvidersList: ProcessedProviderItem[] = [];

  flatrate.forEach((p) => {
    allProvidersList.push({
      ...p,
      category: 'flatrate',
      categoryLabel: 'Stream',
      categoryBg: 'bg-blue-600/30 border-blue-500/40',
      categoryText: 'text-blue-300',
    });
  });

  free.forEach((p) => {
    allProvidersList.push({
      ...p,
      category: 'free',
      categoryLabel: 'Free',
      categoryBg: 'bg-emerald-600/30 border-emerald-500/40',
      categoryText: 'text-emerald-300',
    });
  });

  ads.forEach((p) => {
    allProvidersList.push({
      ...p,
      category: 'ads',
      categoryLabel: 'Ads',
      categoryBg: 'bg-amber-600/30 border-amber-500/40',
      categoryText: 'text-amber-300',
    });
  });

  rent.forEach((p) => {
    allProvidersList.push({
      ...p,
      category: 'rent',
      categoryLabel: 'Rent',
      categoryBg: 'bg-purple-600/30 border-purple-500/40',
      categoryText: 'text-purple-300',
    });
  });

  buy.forEach((p) => {
    allProvidersList.push({
      ...p,
      category: 'buy',
      categoryLabel: 'Buy',
      categoryBg: 'bg-indigo-600/30 border-indigo-500/40',
      categoryText: 'text-indigo-300',
    });
  });

  // Unique provider items for display or filtering
  const availableCategories: { key: AvailabilityCategory; label: string; count: number }[] = [
    { key: 'all', label: 'All', count: allProvidersList.length },
  ];

  if (flatrate.length > 0)
    availableCategories.push({ key: 'flatrate', label: 'Stream', count: flatrate.length });
  if (free.length > 0)
    availableCategories.push({ key: 'free', label: 'Free', count: free.length });
  if (ads.length > 0)
    availableCategories.push({ key: 'ads', label: 'Ads', count: ads.length });
  if (rent.length > 0)
    availableCategories.push({ key: 'rent', label: 'Rent', count: rent.length });
  if (buy.length > 0)
    availableCategories.push({ key: 'buy', label: 'Buy', count: buy.length });

  // Filter list based on selected category
  const filteredList =
    activeCategoryFilter === 'all'
      ? allProvidersList
      : allProvidersList.filter((item) => item.category === activeCategoryFilter);

  // Deduplicate items in filtered list by provider_id + category
  const uniqueFilteredList = filteredList.filter(
    (item, index, self) =>
      index === self.findIndex((t) => t.provider_id === item.provider_id && t.category === item.category)
  );

  const hasAnyProviders = allProvidersList.length > 0;

  return (
    <div id="where-to-watch-section" className="rounded-3xl bg-[#10121b] border border-white/10 p-6 sm:p-8 space-y-6 shadow-2xl">
      {/* SECTION HEADER & REGION SELECTOR */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-5">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 text-xs font-bold text-red-400 uppercase tracking-widest">
            <Tv className="h-4 w-4" />
            <span>Streaming & OTT Availability</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
            <span>Where to Watch</span>
          </h3>
        </div>

        {/* REGION SELECTOR */}
        <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-2xl p-1.5 self-start sm:self-auto">
          <Globe className="h-4 w-4 text-gray-400 ml-2 shrink-0" />
          <span className="text-xs font-semibold text-gray-400 hidden xs:inline">Region:</span>
          <div className="flex items-center gap-1 overflow-x-auto custom-scrollbar">
            {WATCH_REGIONS.map((region) => {
              const isSelected = selectedRegion.code === region.code;
              return (
                <button
                  key={region.code}
                  onClick={() => setSelectedRegion(region)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                    isSelected
                      ? 'bg-red-600 text-white shadow-lg glow-red'
                      : 'text-gray-400 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <span>{region.flag}</span>
                  <span>{region.code}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* SKELETON LOADER STATE */}
      {isLoading ? (
        <div className="space-y-4 py-4 animate-pulse">
          <div className="h-8 w-48 bg-white/10 rounded-xl" />
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-16 rounded-2xl bg-white/5 border border-white/10 p-3 flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-white/10 shrink-0" />
                <div className="space-y-2 flex-1">
                  <div className="h-3 w-3/4 bg-white/10 rounded" />
                  <div className="h-2 w-1/2 bg-white/10 rounded" />
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : !hasAnyProviders ? (
        /* NO AVAILABILITY STATE */
        <div className="flex flex-col items-center justify-center rounded-2xl bg-white/5 border border-white/10 p-8 text-center space-y-3 my-2">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-500/10 text-red-400 border border-red-500/20">
            <AlertCircle className="h-6 w-6" />
          </div>
          <p className="text-sm font-semibold text-gray-200 max-w-md">
            Streaming availability isn&apos;t available for this movie in your region ({selectedRegion.name} {selectedRegion.flag}).
          </p>
          <p className="text-xs text-gray-400 max-w-sm">
            Try switching regions using the region selector above to check global OTT options.
          </p>
        </div>
      ) : (
        /* PROVIDERS DISPLAY & CATEGORY FILTERS */
        <div className="space-y-5">
          {/* CATEGORY FILTER BUTTONS */}
          {availableCategories.length > 2 && (
            <div className="flex items-center gap-1.5 overflow-x-auto custom-scrollbar pb-1">
              <span className="text-xs font-semibold text-gray-400 mr-1 shrink-0">Filter:</span>
              {availableCategories.map((cat) => {
                const isActive = activeCategoryFilter === cat.key;
                return (
                  <button
                    key={cat.key}
                    onClick={() => setActiveCategoryFilter(cat.key)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                      isActive
                        ? 'bg-white text-black shadow-lg scale-105'
                        : 'bg-white/5 text-gray-300 hover:bg-white/10 hover:text-white border border-white/10'
                    }`}
                  >
                    <span>{cat.label}</span>
                    <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${isActive ? 'bg-black/20 text-black' : 'bg-white/10 text-gray-400'}`}>
                      {cat.count}
                    </span>
                  </button>
                );
              })}
            </div>
          )}

          {/* PROVIDER CARDS GRID */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3.5">
            {uniqueFilteredList.map((item, idx) => (
              <div
                key={`${item.provider_id}-${item.category}-${idx}`}
                className="group relative flex items-center gap-3 rounded-2xl bg-black/50 border border-white/10 p-3 hover:border-white/20 transition-all hover:-translate-y-0.5 hover:shadow-lg"
              >
                {/* Logo */}
                {item.logo_path ? (
                  <img
                    src={getLogoUrl(item.logo_path)}
                    alt={item.provider_name}
                    className="h-10 w-10 rounded-xl object-cover shrink-0 border border-white/10 shadow-md group-hover:scale-105 transition-transform"
                    loading="lazy"
                  />
                ) : (
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 text-gray-300 shrink-0 font-bold text-xs">
                    {item.provider_name.slice(0, 2)}
                  </div>
                )}

                {/* Name & Availability Tag */}
                <div className="min-w-0 flex-1 space-y-0.5">
                  <p className="text-xs font-extrabold text-white truncate group-hover:text-red-400 transition-colors">
                    {item.provider_name}
                  </p>
                  <span
                    className={`inline-block px-2 py-0.5 rounded-md border text-[10px] font-bold ${item.categoryBg} ${item.categoryText}`}
                  >
                    {item.categoryLabel}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* TMDB STREAMING OPTIONS LINK & DISCLAIMER */}
          <div className="pt-4 border-t border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-gray-400">
            <div className="flex items-center gap-2">
              <Info className="h-3.5 w-3.5 text-gray-500 shrink-0" />
              <span>
                Streaming data powered by JustWatch via TMDB. MovieVerse is a movie discovery platform and does not host videos.
              </span>
            </div>

            {tmdbLink && (
              <a
                href={tmdbLink}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-xl bg-red-600/20 hover:bg-red-600/30 border border-red-500/40 px-4 py-2 text-xs font-bold text-red-300 hover:text-white transition-all shrink-0 hover:scale-105 shadow-md"
              >
                <span>View Streaming Options</span>
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
