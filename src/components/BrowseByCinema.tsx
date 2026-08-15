import React from 'react';
import { Globe, ArrowRight, Film, Compass, ChevronRight } from 'lucide-react';
import { CINEMA_CATEGORIES, CinemaCategory } from '../data/cinemas';

interface BrowseByCinemaProps {
  onSelectCinema: (cinemaId: string) => void;
}

export const BrowseByCinema: React.FC<BrowseByCinemaProps> = ({ onSelectCinema }) => {
  return (
    <section id="browse-by-cinema-section" className="relative max-w-7xl mx-auto px-4 sm:px-8 py-12 sm:py-16 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-white/10 pb-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 rounded-full bg-red-500/10 border border-red-500/20 px-3 py-1 text-xs font-bold text-red-400 uppercase tracking-widest">
            <Globe className="h-3.5 w-3.5" />
            <span>Global Film Industries</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight flex items-center gap-3">
            <span>🌍 Explore by Cinema</span>
          </h2>
          <p className="text-sm text-gray-400 max-w-2xl leading-relaxed">
            Immerse yourself in iconic film regions across the world — from Hollywood blockbusters & Bollywood spectacles to East Asian masterworks & regional Indian hits.
          </p>
        </div>
      </div>

      {/* Cinema Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
        {CINEMA_CATEGORIES.map((cinema: CinemaCategory) => (
          <div
            key={cinema.id}
            id={`cinema-card-${cinema.id}`}
            onClick={() => onSelectCinema(cinema.id)}
            className={`group relative flex flex-col justify-between min-h-[220px] rounded-3xl border border-white/10 bg-gradient-to-br ${cinema.bgGradient} p-6 overflow-hidden cursor-pointer transition-all duration-300 hover:-translate-y-1.5 ${cinema.borderGlow} hover:bg-white/10 shadow-xl`}
          >
            {/* Background Image / Texture Overlay */}
            {cinema.bannerImage && (
              <div className="absolute inset-0 z-0 opacity-15 transition-opacity duration-500 group-hover:opacity-25">
                <img
                  src={cinema.bannerImage}
                  alt={cinema.name}
                  className="h-full w-full object-cover filter blur-[1px] group-hover:scale-105 transition-transform duration-700"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#090a0f] via-[#090a0f]/80 to-transparent" />
              </div>
            )}

            {/* Top Card Info */}
            <div className="relative z-10 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-3xl sm:text-4xl filter drop-shadow-md transition-transform group-hover:scale-110">
                  {cinema.flag}
                </span>

                <span className="rounded-full bg-black/60 border border-white/10 px-2.5 py-1 text-[11px] font-bold text-gray-300 backdrop-blur-md">
                  {cinema.language}
                </span>
              </div>

              <div>
                <h3 className="text-xl font-black text-white group-hover:text-red-400 transition-colors flex items-center gap-2">
                  <span>{cinema.name}</span>
                </h3>
                <span className="text-xs font-semibold text-gray-400 block mt-0.5">
                  📍 {cinema.country}
                </span>
              </div>

              <p className="text-xs text-gray-300/90 leading-relaxed line-clamp-2 pt-1 font-normal">
                {cinema.description}
              </p>
            </div>

            {/* Bottom Action Footer */}
            <div className="relative z-10 pt-4 mt-auto border-t border-white/10 flex items-center justify-between">
              <span className={`text-xs font-bold ${cinema.accentColor} flex items-center gap-1 group-hover:underline`}>
                <span>Browse Titles</span>
                <ArrowRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-1" />
              </span>

              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-white/10 text-white group-hover:bg-red-600 transition-colors shadow-md">
                <ChevronRight className="h-4 w-4" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
