export interface WatchRegion {
  code: string; // ISO 3166-1 (e.g. 'IN', 'US')
  name: string;
  flag: string;
}

export const WATCH_REGIONS: WatchRegion[] = [
  { code: 'IN', name: 'India', flag: '🇮🇳' },
  { code: 'US', name: 'United States', flag: '🇺🇸' },
  { code: 'GB', name: 'United Kingdom', flag: '🇬🇧' },
  { code: 'CA', name: 'Canada', flag: '🇨🇦' },
  { code: 'AU', name: 'Australia', flag: '🇦🇺' },
];

export const DEFAULT_WATCH_REGION = WATCH_REGIONS[0]; // India (IN)

export const getWatchRegionByCode = (code: string): WatchRegion => {
  const normalized = code.toUpperCase();
  return (
    WATCH_REGIONS.find((r) => r.code === normalized) || {
      code: normalized,
      name: normalized,
      flag: '🌐',
    }
  );
};
