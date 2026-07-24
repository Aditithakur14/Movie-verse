import React from 'react';
import { Film, Heart, Sparkles, ExternalLink } from 'lucide-react';

interface FooterProps {
  onNavigateHome: () => void;
  onOpenWatchlist: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigateHome, onOpenWatchlist }) => {
  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <footer className="mt-20 border-t border-white/10 bg-[#06070a] text-gray-400">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 lg:gap-12">
          {/* Brand Info */}
          <div className="md:col-span-5 space-y-4">
            <div
              onClick={onNavigateHome}
              className="flex cursor-pointer items-center gap-2.5 group"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-red-600 to-red-800 text-white shadow-lg glow-red">
                <Film className="h-5 w-5" />
              </div>
              <span className="text-xl font-black tracking-tight text-white">
                Movie<span className="text-red-600">Verse</span>
              </span>
            </div>

            <p className="text-xs sm:text-sm text-gray-400 font-normal leading-relaxed max-w-md">
              Discover Your Next Favorite Movie. MovieVerse helps film enthusiasts explore blockbusters, hidden gems, mood-based recommendations, and OTT availability without clutter.
            </p>

            <div className="flex items-center gap-2 text-xs text-gray-500 pt-2">
              <Sparkles className="h-4 w-4 text-red-500" />
              <span>Powered by TMDB (The Movie Database) API</span>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="md:col-span-3 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-white">
              Quick Discovery
            </h3>
            <ul className="space-y-2 text-xs font-medium">
              <li>
                <button
                  onClick={onNavigateHome}
                  className="hover:text-red-500 transition-colors"
                >
                  Featured Hero Banner
                </button>
              </li>
              <li>
                <button
                  onClick={() => scrollToSection('mood-discovery')}
                  className="hover:text-red-500 transition-colors"
                >
                  Mood Discovery Engine
                </button>
              </li>
              <li>
                <button
                  onClick={() => scrollToSection('trending-section')}
                  className="hover:text-red-500 transition-colors"
                >
                  Trending Weekly Movies
                </button>
              </li>
              <li>
                <button
                  onClick={() => scrollToSection('ott-platforms')}
                  className="hover:text-red-500 transition-colors"
                >
                  OTT Streaming Availability
                </button>
              </li>
              <li>
                <button
                  onClick={() => scrollToSection('genres-section')}
                  className="hover:text-red-500 transition-colors"
                >
                  Popular Movie Genres
                </button>
              </li>
            </ul>
          </div>

          {/* Features & Legal */}
          <div className="md:col-span-4 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-white">
              MovieVerse Features
            </h3>
            <ul className="space-y-2 text-xs font-medium">
              <li>
                <button
                  onClick={onOpenWatchlist}
                  className="hover:text-red-500 transition-colors"
                >
                  Personal Watchlist (Local Storage)
                </button>
              </li>
              <li>
                <button
                  onClick={() => scrollToSection('popular-actors')}
                  className="hover:text-red-500 transition-colors"
                >
                  Popular Stars & Filmography
                </button>
              </li>
              <li>
                <a
                  href="https://www.themoviedb.org"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-red-500 transition-colors inline-flex items-center gap-1"
                >
                  Official TMDB Database <ExternalLink className="h-3 w-3" />
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Footer Bottom Bar */}
        <div className="mt-12 border-t border-white/5 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-gray-500 gap-4">
          <p>© {new Date().getFullYear()} MovieVerse. All rights reserved.</p>

          <p className="text-[11px] text-gray-500 text-center sm:text-right max-w-md">
            This product uses the TMDB API but is not endorsed or certified by TMDB.
          </p>
        </div>
      </div>
    </footer>
  );
};
