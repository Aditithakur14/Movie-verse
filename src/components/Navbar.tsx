import React, { useState, useEffect } from 'react';
import { Film, Search, Bookmark, Menu, X, Key, Sparkles, SlidersHorizontal } from 'lucide-react';
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
  const apiKey = getApiKey();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (sectionId: string) => {
    setMobileMenuOpen(false);
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
          ? 'glass-nav py-3 shadow-xl'
          : 'bg-gradient-to-b from-black/90 via-black/50 to-transparent py-5'
      }`}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div
            onClick={onNavigateHome}
            id="brand-logo"
            className="flex cursor-pointer items-center gap-2.5 group"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-red-600 to-red-800 text-white shadow-lg glow-red group-hover:scale-105 transition-transform duration-300">
              <Film className="h-5 w-5" />
            </div>
            <div>
              <span className="text-xl font-black tracking-tight text-white group-hover:text-red-500 transition-colors">
                Movie<span className="text-red-600">Verse</span>
              </span>
              <span className="hidden sm:block text-[10px] font-medium tracking-widest text-gray-400 uppercase -mt-1">
                Discovery Engine
              </span>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-8">
            <button
              onClick={onNavigateHome}
              className="text-sm font-semibold text-gray-200 hover:text-red-500 transition-colors"
            >
              Home
            </button>
            <button
              onClick={() => scrollToSection('mood-discovery')}
              className="text-sm font-semibold text-gray-300 hover:text-red-500 transition-colors"
            >
              Moods
            </button>
            <button
              onClick={() => scrollToSection('trending-section')}
              className="text-sm font-semibold text-gray-300 hover:text-red-500 transition-colors"
            >
              Trending
            </button>
            <button
              onClick={() => scrollToSection('ott-platforms')}
              className="text-sm font-semibold text-gray-300 hover:text-red-500 transition-colors"
            >
              OTT Services
            </button>
            <button
              onClick={() => scrollToSection('genres-section')}
              className="text-sm font-semibold text-gray-300 hover:text-red-500 transition-colors"
            >
              Genres
            </button>
            <button
              onClick={() => scrollToSection('popular-actors')}
              className="text-sm font-semibold text-gray-300 hover:text-red-500 transition-colors"
            >
              Stars
            </button>
          </nav>

          {/* Action Buttons */}
          <div className="flex items-center gap-2.5 sm:gap-3.5">
            {/* Search Trigger */}
            <button
              onClick={onOpenSearch}
              id="nav-search-btn"
              title="Search Movies"
              className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/5 hover:bg-white/10 text-gray-200 hover:text-white border border-white/10 transition-all duration-200 hover:scale-105"
            >
              <Search className="h-4.5 w-4.5" />
            </button>

            {/* Watchlist Trigger */}
            <button
              onClick={onOpenWatchlist}
              id="nav-watchlist-btn"
              title="My Watchlist"
              className="relative flex h-10 items-center gap-2 rounded-xl bg-white/5 hover:bg-white/10 px-3.5 text-gray-200 hover:text-white border border-white/10 transition-all duration-200 hover:scale-105"
            >
              <Bookmark className="h-4.5 w-4.5 text-red-500 fill-red-500/20" />
              <span className="hidden sm:inline text-xs font-semibold">Watchlist</span>
              {watchlist.length > 0 && (
                <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-red-600 px-1.5 text-[11px] font-extrabold text-white shadow-md shadow-red-600/50">
                  {watchlist.length}
                </span>
              )}
            </button>

            {/* TMDB Key Settings Button */}
            <button
              onClick={onOpenApiKeyModal}
              id="nav-key-btn"
              title="TMDB API Settings"
              className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/20 transition-all duration-200 hover:scale-105"
            >
              <Key className="h-4 w-4" />
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

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden glass-panel border-b border-white/10 px-6 py-6 mt-3 animate-in fade-in slide-in-from-top-4 duration-200">
          <div className="flex flex-col gap-4">
            <button
              onClick={() => {
                onNavigateHome();
                setMobileMenuOpen(false);
              }}
              className="flex items-center gap-3 text-left font-semibold text-gray-200 hover:text-red-500 py-2 border-b border-white/5"
            >
              <Film className="h-4 w-4 text-red-500" />
              <span>Home</span>
            </button>
            <button
              onClick={() => scrollToSection('mood-discovery')}
              className="flex items-center gap-3 text-left font-semibold text-gray-300 hover:text-red-500 py-2 border-b border-white/5"
            >
              <Sparkles className="h-4 w-4 text-purple-400" />
              <span>Mood Discovery</span>
            </button>
            <button
              onClick={() => scrollToSection('trending-section')}
              className="flex items-center gap-3 text-left font-semibold text-gray-300 hover:text-red-500 py-2 border-b border-white/5"
            >
              <SlidersHorizontal className="h-4 w-4 text-amber-400" />
              <span>Trending Movies</span>
            </button>
            <button
              onClick={() => scrollToSection('ott-platforms')}
              className="flex items-center gap-3 text-left font-semibold text-gray-300 hover:text-red-500 py-2 border-b border-white/5"
            >
              <Film className="h-4 w-4 text-blue-400" />
              <span>OTT Streaming Services</span>
            </button>
            <button
              onClick={() => scrollToSection('genres-section')}
              className="flex items-center gap-3 text-left font-semibold text-gray-300 hover:text-red-500 py-2 border-b border-white/5"
            >
              <span>Popular Genres</span>
            </button>
            <button
              onClick={() => scrollToSection('popular-actors')}
              className="flex items-center gap-3 text-left font-semibold text-gray-300 hover:text-red-500 py-2 border-b border-white/5"
            >
              <span>Popular Stars</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
