import React, { useState, useEffect, useRef } from 'react';
import {
  Film,
  Search,
  Bookmark,
  Menu,
  X,
  Key,
  Sparkles,
  TrendingUp,
  Tv,
  Layers,
  ChevronRight,
  Star,
  Globe,
  Users,
  Trophy,
} from 'lucide-react';
import { useWatchlist } from '../context/WatchlistContext';
import { getApiKey } from '../services/tmdbApi';

interface NavbarProps {
  onOpenSearch: () => void;
  onOpenWatchlist: () => void;
  onOpenApiKeyModal: () => void;
  onNavigateHome: () => void;
  activeSection?: string;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenSearch,
  onOpenWatchlist,
  onOpenApiKeyModal,
  onNavigateHome,
}) => {
  const { watchlist } = useWatchlist();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isSeeMoreOpen, setIsSeeMoreOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const apiKey = getApiKey();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Handle clicking outside and escape key to close the See More dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsSeeMoreOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsSeeMoreOpen(false);
      }
    };

    if (isSeeMoreOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isSeeMoreOpen]);

  const scrollToSection = (sectionId: string) => {
    setMobileMenuOpen(false);
    setIsSeeMoreOpen(false);
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header
      id="main-header"
      className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
        isScrolled
          ? 'glass-nav py-3.5 shadow-xl'
          : 'bg-gradient-to-b from-black/95 via-black/60 to-transparent py-5'
      }`}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          {/* Left Area: MovieVerse Logo & Spacious Desktop Navigation */}
          <div className="flex items-center gap-10 lg:gap-14 xl:gap-16 min-w-0">
            {/* 1. MovieVerse Logo */}
            <div
              onClick={() => {
                onNavigateHome();
                setIsSeeMoreOpen(false);
              }}
              id="brand-logo"
              className="flex cursor-pointer items-center gap-3 group shrink-0 select-none"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-red-600 to-red-800 text-white shadow-lg glow-red group-hover:scale-105 transition-transform duration-300">
                <Film className="h-5 w-5" />
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-black tracking-tight text-white group-hover:text-red-500 transition-colors leading-tight">
                  Movie<span className="text-red-600">Verse</span>
                </span>
                <span className="text-[9px] font-semibold tracking-widest text-gray-400 uppercase leading-none mt-0.5">
                  Discovery Engine
                </span>
              </div>
            </div>

            {/* Desktop Navigation Links: Home | Moods | Trending | OTT Services | Genres | See More > */}
            <nav className="hidden md:flex items-center gap-6 lg:gap-8 xl:gap-9">
              {/* 2. Home (Active state with red underline) */}
              <button
                onClick={() => {
                  onNavigateHome();
                  setIsSeeMoreOpen(false);
                }}
                className="relative text-sm font-semibold text-red-500 hover:text-red-400 transition-colors whitespace-nowrap py-1 flex flex-col items-center"
              >
                <span>Home</span>
                <span className="absolute -bottom-1.5 left-0 right-0 h-[2px] bg-red-600 rounded-full" />
              </button>

              {/* 3. Moods */}
              <button
                onClick={() => scrollToSection('mood-discovery')}
                className="text-sm font-medium text-gray-300 hover:text-white transition-colors whitespace-nowrap py-1"
              >
                Moods
              </button>

              {/* 4. Trending */}
              <button
                onClick={() => scrollToSection('trending-section')}
                className="text-sm font-medium text-gray-300 hover:text-white transition-colors whitespace-nowrap py-1"
              >
                Trending
              </button>

              {/* 5. OTT Services */}
              <button
                onClick={() => scrollToSection('ott-platforms')}
                className="text-sm font-medium text-gray-300 hover:text-white transition-colors whitespace-nowrap py-1"
              >
                OTT Services
              </button>

              {/* 6. Genres */}
              <button
                onClick={() => scrollToSection('genres-section')}
                className="text-sm font-medium text-gray-300 hover:text-white transition-colors whitespace-nowrap py-1"
              >
                Genres
              </button>

              {/* 7. See More > Dropdown */}
              <div className="relative ml-1" ref={dropdownRef}>
                <button
                  onClick={() => setIsSeeMoreOpen((prev) => !prev)}
                  id="see-more-nav-btn"
                  aria-expanded={isSeeMoreOpen}
                  aria-haspopup="true"
                  className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200 whitespace-nowrap ${
                    isSeeMoreOpen
                      ? 'bg-white/15 text-white border border-white/25 shadow-lg shadow-black/60'
                      : 'bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white border border-white/10'
                  }`}
                >
                  <span>See More</span>
                  <ChevronRight
                    className={`h-3.5 w-3.5 transition-transform duration-200 ${
                      isSeeMoreOpen ? 'rotate-90 text-red-500' : 'text-gray-400'
                    }`}
                  />
                </button>

                {/* Compact Floating Dropdown Menu */}
                {isSeeMoreOpen && (
                  <div
                    id="see-more-dropdown"
                    className="absolute top-full left-0 mt-2.5 w-56 rounded-xl bg-[#0f111a]/98 backdrop-blur-xl border border-white/15 p-1.5 shadow-2xl shadow-black/90 animate-in fade-in zoom-in-95 duration-150 z-50 space-y-0.5"
                  >
                    {/* 1. ⭐ Stars */}
                    <button
                      onClick={() => scrollToSection('popular-actors')}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs sm:text-sm font-medium text-gray-200 hover:text-white hover:bg-white/10 transition-colors text-left"
                    >
                      <span>⭐</span>
                      <span>Stars</span>
                    </button>

                    {/* 2. 🌍 Browse by Cinema */}
                    <button
                      onClick={() => scrollToSection('browse-by-cinema-section')}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs sm:text-sm font-medium text-gray-200 hover:text-white hover:bg-white/10 transition-colors text-left"
                    >
                      <span>🌍</span>
                      <span>Browse by Cinema</span>
                    </button>

                    {/* 3. 👥 Actor × Actor */}
                    <button
                      onClick={() => scrollToSection('popular-actors')}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs sm:text-sm font-medium text-gray-200 hover:text-white hover:bg-white/10 transition-colors text-left"
                    >
                      <span>👥</span>
                      <span>Actor × Actor</span>
                    </button>

                    {/* 4. 🏆 Top Rated */}
                    <button
                      onClick={() => scrollToSection('top-rated-section')}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs sm:text-sm font-medium text-gray-200 hover:text-white hover:bg-white/10 transition-colors text-left"
                    >
                      <span>🏆</span>
                      <span>Top Rated</span>
                    </button>

                    {/* 5. Separator */}
                    <div className="my-1 border-t border-white/10" />

                    {/* 6. 🔑 TMDB API Settings */}
                    <button
                      onClick={() => {
                        setIsSeeMoreOpen(false);
                        onOpenApiKeyModal();
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs sm:text-sm font-medium text-amber-300/90 hover:text-amber-300 hover:bg-amber-500/10 transition-colors text-left"
                    >
                      <span>🔑</span>
                      <span>TMDB API Settings</span>
                    </button>
                  </div>
                )}
              </div>
            </nav>
          </div>

          {/* Right Side Actions: Search | Watchlist */}
          <div className="flex items-center gap-3 shrink-0 ml-4">
            {/* Search Trigger */}
            <button
              onClick={onOpenSearch}
              id="nav-search-btn"
              title="Search Movies"
              className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white border border-white/10 transition-all duration-200 hover:scale-105"
            >
              <Search className="h-4.5 w-4.5" />
            </button>

            {/* Watchlist Trigger */}
            <button
              onClick={onOpenWatchlist}
              id="nav-watchlist-btn"
              title="My Watchlist"
              className="relative flex h-10 items-center gap-2.5 rounded-xl bg-white/5 hover:bg-white/10 px-4 text-gray-200 hover:text-white border border-white/10 transition-all duration-200 hover:scale-105"
            >
              <Bookmark className="h-4.5 w-4.5 text-red-500 fill-red-500" />
              <span className="text-xs sm:text-sm font-semibold">Watchlist</span>
              {watchlist.length > 0 ? (
                <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-red-600 px-1.5 text-[11px] font-extrabold text-white shadow-md shadow-red-600/50">
                  {watchlist.length}
                </span>
              ) : (
                <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-red-600 px-1.5 text-[11px] font-extrabold text-white shadow-md shadow-red-600/50">
                  0
                </span>
              )}
            </button>

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="flex md:hidden h-10 w-10 items-center justify-center rounded-xl bg-white/5 text-gray-200 border border-white/10"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Drawer containing ALL navigation items */}
      {mobileMenuOpen && (
        <div className="md:hidden glass-panel border-b border-white/10 px-6 py-6 mt-3 animate-in fade-in slide-in-from-top-4 duration-200 max-h-[80vh] overflow-y-auto">
          <div className="flex flex-col gap-2 divide-y divide-white/5">
            <div className="space-y-1 pb-2">
              <button
                onClick={() => {
                  onNavigateHome();
                  setMobileMenuOpen(false);
                }}
                className="flex w-full items-center gap-3 text-left font-bold text-white hover:text-red-500 py-2.5 px-2 rounded-xl hover:bg-white/5"
              >
                <Film className="h-4 w-4 text-red-500" />
                <span>Home</span>
              </button>
              <button
                onClick={() => scrollToSection('mood-discovery')}
                className="flex w-full items-center gap-3 text-left font-semibold text-gray-300 hover:text-red-500 py-2.5 px-2 rounded-xl hover:bg-white/5"
              >
                <Sparkles className="h-4 w-4 text-purple-400" />
                <span>Moods</span>
              </button>
              <button
                onClick={() => scrollToSection('trending-section')}
                className="flex w-full items-center gap-3 text-left font-semibold text-gray-300 hover:text-red-500 py-2.5 px-2 rounded-xl hover:bg-white/5"
              >
                <TrendingUp className="h-4 w-4 text-amber-400" />
                <span>Trending</span>
              </button>
              <button
                onClick={() => scrollToSection('ott-platforms')}
                className="flex w-full items-center gap-3 text-left font-semibold text-gray-300 hover:text-red-500 py-2.5 px-2 rounded-xl hover:bg-white/5"
              >
                <Tv className="h-4 w-4 text-blue-400" />
                <span>OTT Services</span>
              </button>
              <button
                onClick={() => scrollToSection('genres-section')}
                className="flex w-full items-center gap-3 text-left font-semibold text-gray-300 hover:text-red-500 py-2.5 px-2 rounded-xl hover:bg-white/5"
              >
                <Layers className="h-4 w-4 text-emerald-400" />
                <span>Genres</span>
              </button>
            </div>

            <div className="space-y-1 pt-2">
              <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest px-2 mb-1">
                More Categories
              </span>
              <button
                onClick={() => scrollToSection('popular-actors')}
                className="flex w-full items-center gap-3 text-left font-semibold text-gray-300 hover:text-white py-2.5 px-2 rounded-xl hover:bg-white/5"
              >
                <span>⭐ Stars</span>
              </button>
              <button
                onClick={() => scrollToSection('browse-by-cinema-section')}
                className="flex w-full items-center gap-3 text-left font-semibold text-gray-300 hover:text-white py-2.5 px-2 rounded-xl hover:bg-white/5"
              >
                <span>🌍 Browse by Cinema</span>
              </button>
              <button
                onClick={() => scrollToSection('popular-actors')}
                className="flex w-full items-center gap-3 text-left font-semibold text-gray-300 hover:text-white py-2.5 px-2 rounded-xl hover:bg-white/5"
              >
                <span>👥 Actor × Actor</span>
              </button>
              <button
                onClick={() => scrollToSection('top-rated-section')}
                className="flex w-full items-center gap-3 text-left font-semibold text-gray-300 hover:text-white py-2.5 px-2 rounded-xl hover:bg-white/5"
              >
                <span>🏆 Top Rated</span>
              </button>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenApiKeyModal();
                }}
                className="flex w-full items-center gap-3 text-left font-semibold text-amber-300 hover:text-amber-200 py-2.5 px-2 rounded-xl hover:bg-amber-500/10"
              >
                <span>🔑 TMDB API Settings</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

