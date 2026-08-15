export interface OttPlatformConfig {
  id: string; // Slug (e.g. 'netflix', 'prime', 'hotstar')
  providerId: number; // Primary TMDB Provider ID
  regionalProviderIds?: Record<string, number>; // Region specific provider IDs e.g. { IN: 119, US: 9 }
  name: string;
  shortName?: string;
  logoUrl?: string; // Fallback or custom logo if TMDB logo unavailable
  color: string; // Tailwind gradient or color
  badgeBg: string;
  badgeText: string;
  description: string;
}

export const POPULAR_OTT_PLATFORMS: OttPlatformConfig[] = [
  {
    id: 'netflix',
    providerId: 8,
    name: 'Netflix',
    color: 'from-red-600 via-red-800 to-black',
    badgeBg: 'bg-red-600',
    badgeText: 'text-red-400',
    description: 'Blockbuster movies, award-winning originals & exclusive series',
  },
  {
    id: 'prime',
    providerId: 119, // Primary for IN (119 for Amazon Prime Video IN, 9 for US)
    regionalProviderIds: { IN: 119, US: 9, GB: 9, CA: 119, AU: 119 },
    name: 'Amazon Prime Video',
    shortName: 'Prime Video',
    color: 'from-blue-600 via-cyan-800 to-black',
    badgeBg: 'bg-blue-600',
    badgeText: 'text-blue-400',
    description: 'Exclusive Amazon Originals, global blockbusters & regional hits',
  },
  {
    id: 'hotstar',
    providerId: 122, // JioHotstar / Disney+ Hotstar in India (122)
    regionalProviderIds: { IN: 122, US: 337, GB: 337, CA: 337, AU: 337 },
    name: 'JioHotstar / Disney+',
    shortName: 'JioHotstar',
    color: 'from-amber-600 via-yellow-800 to-black',
    badgeBg: 'bg-amber-600',
    badgeText: 'text-amber-400',
    description: 'Indian blockbusters, Marvel, Star Wars, HBO & Disney classics',
  },
  {
    id: 'apple',
    providerId: 350,
    name: 'Apple TV+',
    shortName: 'Apple TV+',
    color: 'from-zinc-500 via-zinc-800 to-black',
    badgeBg: 'bg-zinc-600',
    badgeText: 'text-zinc-300',
    description: 'Premium Apple Original films & star-studded cinema',
  },
  {
    id: 'sonyliv',
    providerId: 237,
    name: 'Sony LIV',
    color: 'from-purple-600 via-purple-900 to-black',
    badgeBg: 'bg-purple-600',
    badgeText: 'text-purple-400',
    description: 'Critically acclaimed dramas, Indian cinema & originals',
  },
  {
    id: 'zee5',
    providerId: 220,
    name: 'ZEE5',
    color: 'from-pink-600 via-purple-800 to-black',
    badgeBg: 'bg-pink-600',
    badgeText: 'text-pink-400',
    description: 'Vast library of Hindi, South Indian & regional cinema',
  },
  {
    id: 'disney',
    providerId: 337,
    regionalProviderIds: { IN: 122, US: 337, GB: 337, CA: 337, AU: 337 },
    name: 'Disney+',
    color: 'from-indigo-600 via-blue-900 to-black',
    badgeBg: 'bg-indigo-600',
    badgeText: 'text-indigo-400',
    description: 'Disney, Pixar, Marvel, Star Wars & National Geographic',
  },
  {
    id: 'jiocinema',
    providerId: 532,
    regionalProviderIds: { IN: 532 },
    name: 'JioCinema',
    color: 'from-fuchsia-600 via-pink-800 to-black',
    badgeBg: 'bg-fuchsia-600',
    badgeText: 'text-fuchsia-400',
    description: 'Free & premium Indian cinema, Peacock & Hollywood movies',
  },
];

export const getOttPlatformBySlug = (slug: string): OttPlatformConfig | null => {
  if (!slug) return null;
  const clean = slug.toLowerCase().trim();

  // Try exact match by slug id
  const match = POPULAR_OTT_PLATFORMS.find((p) => p.id === clean);
  if (match) return match;

  // Try numeric ID match
  const numeric = parseInt(clean, 10);
  if (!isNaN(numeric)) {
    const numMatch = POPULAR_OTT_PLATFORMS.find(
      (p) => p.providerId === numeric || Object.values(p.regionalProviderIds || {}).includes(numeric)
    );
    if (numMatch) return numMatch;

    // Create dynamic platform config for unknown provider ID
    return {
      id: clean,
      providerId: numeric,
      name: `Streaming Provider #${numeric}`,
      color: 'from-purple-600 via-indigo-900 to-black',
      badgeBg: 'bg-purple-600',
      badgeText: 'text-purple-400',
      description: 'Discover movies available on this streaming platform',
    };
  }

  // Fuzzy match name
  const nameMatch = POPULAR_OTT_PLATFORMS.find(
    (p) =>
      p.name.toLowerCase().includes(clean) ||
      p.id.includes(clean) ||
      (p.shortName && p.shortName.toLowerCase().includes(clean))
  );

  return nameMatch || null;
};

// Helper to get effective provider ID for a given region
export const getProviderIdForRegion = (config: OttPlatformConfig, regionCode = 'IN'): number => {
  const normRegion = regionCode.toUpperCase();
  if (config.regionalProviderIds && config.regionalProviderIds[normRegion]) {
    return config.regionalProviderIds[normRegion];
  }
  return config.providerId;
};
