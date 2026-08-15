import React from 'react';
import { Tv, ArrowRight, ChevronRight, Play } from 'lucide-react';
import { POPULAR_OTT_PLATFORMS, OttPlatformConfig } from '../data/ottProviders';

interface OttPlatformsProps {
  onSelectOttProvider: (providerSlug: string) => void;
  onSelectMovie?: (movieId: number) => void;
  genreMap?: Record<number, string>;
}

export const OttPlatforms: React.FC<OttPlatformsProps> = ({ onSelectOttProvider }) => {
  return (
    <section id="ott-platforms" className="relative max-w-7xl mx-auto px-4 sm:px-8 py-12 sm:py-16 space-y-8">
      {/* Section Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-white/10 pb-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 rounded-full bg-blue-500/10 border border-blue-500/20 px-3 py-1 text-xs font-bold text-blue-400 uppercase tracking-widest">
            <Tv className="h-3.5 w-3.5" />
            <span>Streaming Networks</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight flex items-center gap-3">
            <span>📺 Explore by Streaming Platform</span>
          </h2>
          <p className="text-sm text-gray-400 max-w-2xl leading-relaxed">
            Browse movies directly available on your favorite streaming subscriptions — including Netflix, Amazon Prime Video, JioHotstar, Apple TV+, Sony LIV, ZEE5, & JioCinema.
          </p>
        </div>
      </div>

      {/* Interactive Platform Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 gap-4 sm:gap-5">
        {POPULAR_OTT_PLATFORMS.map((platform: OttPlatformConfig) => (
          <div
            key={platform.id}
            id={`ott-card-${platform.id}`}
            onClick={() => onSelectOttProvider(platform.id)}
            className={`group relative flex flex-col justify-between min-h-[190px] rounded-3xl border border-white/10 bg-gradient-to-br ${platform.color} p-5 overflow-hidden cursor-pointer transition-all duration-300 hover:-translate-y-1.5 hover:border-white/20 hover:shadow-2xl shadow-xl`}
          >
            {/* Top Accent Pill */}
            <div className="relative z-10 flex items-center justify-between mb-3">
              <span className={`px-2.5 py-1 rounded-full text-[11px] font-black uppercase tracking-wider text-white ${platform.badgeBg} shadow-md`}>
                {platform.shortName || platform.name}
              </span>
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-black/40 text-gray-300 group-hover:text-white group-hover:bg-blue-600 transition-colors">
                <Play className="h-3.5 w-3.5 fill-current ml-0.5" />
              </div>
            </div>

            {/* Platform Title & Description */}
            <div className="relative z-10 space-y-1.5 my-auto">
              <h3 className="text-lg sm:text-xl font-black text-white group-hover:text-blue-300 transition-colors">
                {platform.name}
              </h3>
              <p className="text-xs text-gray-300/90 leading-relaxed line-clamp-2 font-normal">
                {platform.description}
              </p>
            </div>

            {/* Bottom Footer CTA */}
            <div className="relative z-10 pt-3 mt-auto border-t border-white/10 flex items-center justify-between text-xs font-bold text-blue-300 group-hover:text-white">
              <span className="flex items-center gap-1 group-hover:underline">
                Browse Catalog
                <ArrowRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-1" />
              </span>
              <ChevronRight className="h-4 w-4 text-gray-400 group-hover:text-white" />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
