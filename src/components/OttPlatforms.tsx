import React, { useState } from 'react';
import { Tv, Loader2, Sparkles, Film } from 'lucide-react';
import { OttPlatform, Movie } from '../types/tmdb';
import { tmdbService } from '../services/tmdbApi';
import { MovieCard } from './MovieCard';

const OTT_PLATFORMS: OttPlatform[] = [
  {
    id: 'netflix',
    name: 'Netflix',
    providerId: 8,
    color: 'from-red-600 via-red-800 to-black',
    badgeBg: 'bg-red-600',
    description: 'Blockbuster originals, TV shows & exclusives',
  },
  {
    id: 'prime',
    name: 'Prime Video',
    providerId: 9,
    color: 'from-blue-600 via-cyan-800 to-black',
    badgeBg: 'bg-blue-600',
    description: 'Award-winning Amazon Originals & movies',
  },
  {
    id: 'disney',
    name: 'Disney+',
    providerId: 337,
    color: 'from-indigo-600 via-blue-900 to-black',
    badgeBg: 'bg-indigo-600',
    description: 'Disney, Marvel, Star Wars & Pixar sagas',
  },
  {
    id: 'apple',
    name: 'Apple TV+',
    providerId: 350,
    color: 'from-zinc-500 via-zinc-800 to-black',
    badgeBg: 'bg-zinc-600',
    description: 'Premium Apple Original movies & series',
  },
  {
    id: 'hotstar',
    name: 'JioHotstar',
    providerId: 122,
    color: 'from-amber-600 via-yellow-800 to-black',
    badgeBg: 'bg-amber-600',
    description: 'Indian blockbusters, HBO & live specials',
  },
  {
    id: 'sonyliv',
    name: 'Sony LIV',
    providerId: 237,
    color: 'from-purple-600 via-purple-900 to-black',
    badgeBg: 'bg-purple-600',
    description: 'Critically acclaimed dramas & originals',
  },
];

interface OttPlatformsProps {
  onSelectMovie: (movieId: number) => void;
  genreMap?: Record<number, string>;
}

export const OttPlatforms: React.FC<OttPlatformsProps> = ({ onSelectMovie, genreMap = {} }) => {
  const [selectedPlatform, setSelectedPlatform] = useState<OttPlatform | null>(null);
  const [movies, setMovies] = useState<Movie[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const handlePlatformClick = async (platform: OttPlatform) => {
    setSelectedPlatform(platform);
    setIsLoading(true);
    try {
      const data = await tmdbService.getMoviesByOttPlatform(platform.providerId, 'US');
      setMovies(data);
    } catch (err) {
      console.error('Error fetching OTT platform movies:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section id="ott-platforms" className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
      {/* Section Header */}
      <div className="mb-8">
        <div className="inline-flex items-center gap-2 text-xs font-bold text-blue-400 uppercase tracking-widest mb-1.5">
          <Tv className="h-4 w-4" />
          <span>Streaming Service Availability</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
          Where to Stream Tonight
        </h2>
        <p className="text-xs sm:text-sm text-gray-400 mt-1">
          Select your active subscription to browse movies available on that streaming service.
        </p>
      </div>

      {/* Platform Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5 sm:gap-4">
        {OTT_PLATFORMS.map((platform) => {
          const isSelected = selectedPlatform?.id === platform.id;
          return (
            <div
              key={platform.id}
              onClick={() => handlePlatformClick(platform)}
              id={`ott-card-${platform.id}`}
              className={`relative cursor-pointer rounded-2xl p-4 border transition-all duration-300 group overflow-hidden ${
                isSelected
                  ? 'bg-gradient-to-b from-blue-600/30 to-black border-blue-500 shadow-xl shadow-blue-500/20 scale-[1.02]'
                  : 'bg-[#12151e] border-white/5 hover:border-white/20 hover:-translate-y-1'
              }`}
            >
              {/* Card Subtle Top Highlight Bar */}
              <div className={`h-1.5 w-full -mt-4 -mx-4 mb-3 ${platform.badgeBg}`} />

              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-black text-white tracking-wider group-hover:text-blue-400 transition-colors">
                  {platform.name}
                </span>
                <div className={`h-2.5 w-2.5 rounded-full ${platform.badgeBg}`} />
              </div>

              <p className="line-clamp-2 text-[11px] text-gray-400 font-medium leading-tight">
                {platform.description}
              </p>
            </div>
          );
        })}
      </div>

      {/* Dynamic Streaming Movies Gallery */}
      {selectedPlatform && (
        <div className="mt-8 glass-panel rounded-2xl p-6 border border-white/10 animate-in fade-in duration-300">
          <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-6">
            <div className="flex items-center gap-3">
              <div className={`h-3 w-3 rounded-full ${selectedPlatform.badgeBg}`} />
              <div>
                <h3 className="text-xl font-extrabold text-white">
                  Trending on <span className="text-blue-400">{selectedPlatform.name}</span>
                </h3>
                <p className="text-xs text-gray-400">{selectedPlatform.description}</p>
              </div>
            </div>

            <button
              onClick={() => setSelectedPlatform(null)}
              className="text-xs font-semibold text-gray-400 hover:text-white bg-white/5 px-3 py-1.5 rounded-lg border border-white/10 transition-colors"
            >
              Close Platform
            </button>
          </div>

          {isLoading ? (
            <div className="flex justify-center items-center py-16">
              <Loader2 className="h-8 w-8 text-blue-500 animate-spin" />
            </div>
          ) : movies.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6">
              {movies.slice(0, 10).map((movie) => (
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
            <p className="text-center py-8 text-sm text-gray-400">
              No titles currently listed for this service in your region.
            </p>
          )}
        </div>
      )}
    </section>
  );
};
