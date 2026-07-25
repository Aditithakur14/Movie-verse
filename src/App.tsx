import React, { useEffect, useState } from 'react';
import { WatchlistProvider } from './context/WatchlistContext';
import { Movie, Genre, Actor } from './types/tmdb';
import { tmdbService } from './services/tmdbApi';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { SearchSection } from './components/SearchSection';
import { MoodDiscovery } from './components/MoodDiscovery';
import { TrendingMovies } from './components/TrendingMovies';
import { OttPlatforms } from './components/OttPlatforms';
import { PopularGenres } from './components/PopularGenres';
import { PopularActors } from './components/PopularActors';
import { MovieDetailsModal } from './components/MovieDetailsModal';
import { ActorDetailsModal } from './components/ActorDetailsModal';
import { WatchlistModal } from './components/WatchlistModal';
import { ApiKeyModal } from './components/ApiKeyModal';
import { SearchModal } from './components/SearchModal';
import { Footer } from './components/Footer';

export default function App() {
  const [trendingMovies, setTrendingMovies] = useState<Movie[]>([]);
  const [popularMovies, setPopularMovies] = useState<Movie[]>([]);
  const [topRatedMovies, setTopRatedMovies] = useState<Movie[]>([]);
  const [genres, setGenres] = useState<Genre[]>([]);
  const [genreMap, setGenreMap] = useState<Record<number, string>>({});
  const [actors, setActors] = useState<Actor[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Modals state
  const [selectedMovieId, setSelectedMovieId] = useState<number | null>(null);
  const [selectedActorId, setSelectedActorId] = useState<number | null>(null);
  const [isWatchlistOpen, setIsWatchlistOpen] = useState(false);
  const [isApiKeyModalOpen, setIsApiKeyModalOpen] = useState(false);
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);

  const loadInitialData = async () => {
    setIsLoading(true);
    try {
      const [trendingData, popularData, topRatedData, genreData, actorData] = await Promise.all([
        tmdbService.getTrending('week'),
        tmdbService.getPopular(1),
        tmdbService.getTopRated(1),
        tmdbService.getGenres(),
        tmdbService.getPopularActors(1),
      ]);

      setTrendingMovies(trendingData);
      setPopularMovies(popularData);
      setTopRatedMovies(topRatedData);
      setGenres(genreData);

      const map: Record<number, string> = {};
      genreData.forEach((g) => {
        map[g.id] = g.name;
      });
      setGenreMap(map);

      setActors(actorData);
    } catch (err) {
      console.error('Failed loading initial TMDB data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadInitialData();

    // Global keyboard shortcut (Cmd/Ctrl + K) to open search modal
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsSearchModalOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleOpenSearch = () => {
    setIsSearchModalOpen(true);
  };

  const handleNavigateHome = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <WatchlistProvider>
      <div className="min-h-screen bg-[#090a0f] text-gray-100 flex flex-col font-sans selection:bg-red-600 selection:text-white">
        {/* Sticky Header Navigation */}
        <Navbar
          onOpenSearch={handleOpenSearch}
          onOpenWatchlist={() => setIsWatchlistOpen(true)}
          onOpenApiKeyModal={() => setIsApiKeyModalOpen(true)}
          onNavigateHome={handleNavigateHome}
        />

        {/* Hero Section */}
        <Hero
          movies={trendingMovies}
          onSelectMovie={(id) => setSelectedMovieId(id)}
          isLoading={isLoading}
        />

        {/* Search Section */}
        <SearchSection
          onSelectMovie={(id) => setSelectedMovieId(id)}
          genreMap={genreMap}
        />

        {/* Mood Discovery Section */}
        <MoodDiscovery
          onSelectMovie={(id) => setSelectedMovieId(id)}
          genreMap={genreMap}
        />

        {/* Trending Movies Section */}
        <TrendingMovies
          movies={trendingMovies}
          onSelectMovie={(id) => setSelectedMovieId(id)}
          genreMap={genreMap}
          title="Trending This Week"
          subtitle="Top movies currently dominating global TMDB charts"
        />

        {/* Top Rated Blockbusters Section */}
        <TrendingMovies
          movies={topRatedMovies}
          onSelectMovie={(id) => setSelectedMovieId(id)}
          genreMap={genreMap}
          title="All-Time Classics & Top Rated"
          subtitle="Highest critically rated masterpieces of cinema history"
        />

        {/* OTT Streaming Services Section */}
        <OttPlatforms
          onSelectMovie={(id) => setSelectedMovieId(id)}
          genreMap={genreMap}
        />

        {/* Popular Genres Section */}
        <PopularGenres
          genres={genres}
          onSelectMovie={(id) => setSelectedMovieId(id)}
          genreMap={genreMap}
        />

        {/* Popular Actors Section */}
        <PopularActors
          actors={actors}
          onSelectActor={(id) => setSelectedActorId(id)}
        />

        {/* Footer */}
        <Footer
          onNavigateHome={handleNavigateHome}
          onOpenWatchlist={() => setIsWatchlistOpen(true)}
        />

        {/* Modals & Drawers */}
        <MovieDetailsModal
          movieId={selectedMovieId}
          onClose={() => setSelectedMovieId(null)}
          onSelectMovie={(id) => setSelectedMovieId(id)}
          onSelectActor={(id) => setSelectedActorId(id)}
        />

        <ActorDetailsModal
          actorId={selectedActorId}
          onClose={() => setSelectedActorId(null)}
          onSelectMovie={(id) => setSelectedMovieId(id)}
        />

        <WatchlistModal
          isOpen={isWatchlistOpen}
          onClose={() => setIsWatchlistOpen(false)}
          onSelectMovie={(id) => setSelectedMovieId(id)}
        />

        <ApiKeyModal
          isOpen={isApiKeyModalOpen}
          onClose={() => setIsApiKeyModalOpen(false)}
          onKeySaved={loadInitialData}
        />

        <SearchModal
          isOpen={isSearchModalOpen}
          onClose={() => setIsSearchModalOpen(false)}
          onSelectMovie={(id) => setSelectedMovieId(id)}
          onSelectActor={(id) => setSelectedActorId(id)}
        />
      </div>
    </WatchlistProvider>
  );
}
