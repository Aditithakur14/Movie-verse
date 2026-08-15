import React, { useEffect, useState } from 'react';
import { WatchlistProvider } from './context/WatchlistContext';
import { Movie, Genre, Actor } from './types/tmdb';
import { tmdbService } from './services/tmdbApi';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { SearchSection } from './components/SearchSection';
import { MoodDiscovery } from './components/MoodDiscovery';
import { BrowseByCinema } from './components/BrowseByCinema';
import { BrowseByGenre } from './components/BrowseByGenre';
import { TrendingMovies } from './components/TrendingMovies';
import { OttPlatforms } from './components/OttPlatforms';
import { PopularGenres } from './components/PopularGenres';
import { PopularActors } from './components/PopularActors';
import { MovieDetailsModal } from './components/MovieDetailsModal';
import { ActorDetailsModal } from './components/ActorDetailsModal';
import { CinemaDiscoveryModal } from './components/CinemaDiscoveryModal';
import { GenreDiscoveryModal } from './components/GenreDiscoveryModal';
import { OttDiscoveryModal } from './components/OttDiscoveryModal';
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
  const [selectedCinemaId, setSelectedCinemaId] = useState<string | null>(null);
  const [selectedGenreSlug, setSelectedGenreSlug] = useState<string | null>(null);
  const [selectedOttProvider, setSelectedOttProvider] = useState<string | null>(null);
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

  // Handle URL path synchronization (/movie/:id, /actor/:id, /cinema/:cinema & /genre/:genre)
  useEffect(() => {
    const handleUrlChange = () => {
      const path = window.location.pathname;
      const hash = window.location.hash;

      const movieMatch = path.match(/\/movie\/(\d+)/) || hash.match(/#\/movie\/(\d+)/);
      const actorMatch = path.match(/\/actor\/(\d+)/) || hash.match(/#\/actor\/(\d+)/);
      const cinemaMatch = path.match(/\/cinema\/([a-zA-Z0-9_-]+)/) || hash.match(/#\/cinema\/([a-zA-Z0-9_-]+)/);
      const genreMatch = path.match(/\/genre\/([a-zA-Z0-9_-]+)/) || hash.match(/#\/genre\/([a-zA-Z0-9_-]+)/);
      const ottMatch = path.match(/\/ott\/([a-zA-Z0-9_-]+)/) || hash.match(/#\/ott\/([a-zA-Z0-9_-]+)/);

      if (movieMatch) {
        const id = parseInt(movieMatch[1], 10);
        if (!isNaN(id)) setSelectedMovieId(id);
      } else {
        setSelectedMovieId(null);
      }

      if (actorMatch) {
        const id = parseInt(actorMatch[1], 10);
        if (!isNaN(id)) setSelectedActorId(id);
      } else {
        setSelectedActorId(null);
      }

      if (cinemaMatch) {
        setSelectedCinemaId(cinemaMatch[1]);
      } else {
        setSelectedCinemaId(null);
      }

      if (genreMatch) {
        setSelectedGenreSlug(genreMatch[1]);
      } else {
        setSelectedGenreSlug(null);
      }

      if (ottMatch) {
        setSelectedOttProvider(ottMatch[1]);
      } else {
        setSelectedOttProvider(null);
      }
    };

    handleUrlChange();
    window.addEventListener('popstate', handleUrlChange);
    return () => window.removeEventListener('popstate', handleUrlChange);
  }, []);

  const handleSelectMovie = (id: number | null) => {
    setSelectedMovieId(id);
    if (id) {
      window.history.pushState({ movieId: id }, '', `/movie/${id}`);
    } else {
      if (window.location.pathname.startsWith('/movie/')) {
        window.history.pushState({}, '', '/');
      }
    }
  };

  const handleSelectActor = (id: number | null) => {
    setSelectedActorId(id);
    if (id) {
      window.history.pushState({ actorId: id }, '', `/actor/${id}`);
    } else {
      if (window.location.pathname.startsWith('/actor/')) {
        window.history.pushState({}, '', '/');
      }
    }
  };

  const handleSelectCinema = (cinemaId: string | null) => {
    setSelectedCinemaId(cinemaId);
    if (cinemaId) {
      window.history.pushState({ cinemaId }, '', `/cinema/${cinemaId}`);
    } else {
      if (window.location.pathname.startsWith('/cinema/')) {
        window.history.pushState({}, '', '/');
      }
    }
  };

  const handleSelectGenre = (genreSlug: string | null) => {
    setSelectedGenreSlug(genreSlug);
    if (genreSlug) {
      window.history.pushState({ genreSlug }, '', `/genre/${genreSlug}`);
    } else {
      if (window.location.pathname.startsWith('/genre/')) {
        window.history.pushState({}, '', '/');
      }
    }
  };

  const handleSelectOttProvider = (providerSlug: string | null) => {
    setSelectedOttProvider(providerSlug);
    if (providerSlug) {
      window.history.pushState({ providerSlug }, '', `/ott/${providerSlug}`);
    } else {
      if (window.location.pathname.startsWith('/ott/')) {
        window.history.pushState({}, '', '/');
      }
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
          onSelectMovie={handleSelectMovie}
          isLoading={isLoading}
        />

        {/* Search Section */}
        <SearchSection
          onSelectMovie={handleSelectMovie}
          genreMap={genreMap}
        />

        {/* Mood Discovery Section */}
        <MoodDiscovery
          onSelectMovie={handleSelectMovie}
          genreMap={genreMap}
        />

        {/* Explore by Genre Section */}
        <BrowseByGenre onSelectGenre={handleSelectGenre} />

        {/* Browse by Cinema Section */}
        <BrowseByCinema onSelectCinema={handleSelectCinema} />


        {/* Trending Movies Section */}
        <TrendingMovies
          movies={trendingMovies}
          onSelectMovie={handleSelectMovie}
          genreMap={genreMap}
          title="Trending This Week"
          subtitle="Top movies currently dominating global TMDB charts"
        />

        {/* Top Rated Blockbusters Section */}
        <TrendingMovies
          movies={topRatedMovies}
          onSelectMovie={handleSelectMovie}
          genreMap={genreMap}
          title="All-Time Classics & Top Rated"
          subtitle="Highest critically rated masterpieces of cinema history"
        />

        {/* OTT Streaming Services Section */}
        <OttPlatforms
          onSelectOttProvider={handleSelectOttProvider}
          onSelectMovie={handleSelectMovie}
          genreMap={genreMap}
        />

        {/* Popular Genres Section */}
        <PopularGenres
          genres={genres}
          onSelectMovie={handleSelectMovie}
          genreMap={genreMap}
        />

        {/* Popular Actors Section */}
        <PopularActors
          actors={actors}
          onSelectActor={handleSelectActor}
        />

        {/* Footer */}
        <Footer
          onNavigateHome={handleNavigateHome}
          onOpenWatchlist={() => setIsWatchlistOpen(true)}
        />

        {/* Modals & Drawers */}
        <MovieDetailsModal
          movieId={selectedMovieId}
          onClose={() => handleSelectMovie(null)}
          onSelectMovie={handleSelectMovie}
          onSelectActor={handleSelectActor}
        />

        <ActorDetailsModal
          actorId={selectedActorId}
          onClose={() => handleSelectActor(null)}
          onSelectMovie={handleSelectMovie}
        />

        <CinemaDiscoveryModal
          cinemaId={selectedCinemaId}
          onClose={() => handleSelectCinema(null)}
          onSelectMovie={handleSelectMovie}
          genreMap={genreMap}
        />

        <GenreDiscoveryModal
          genreSlug={selectedGenreSlug}
          onClose={() => handleSelectGenre(null)}
          onSelectMovie={handleSelectMovie}
          genreMap={genreMap}
        />

        <OttDiscoveryModal
          providerSlug={selectedOttProvider}
          onClose={() => handleSelectOttProvider(null)}
          onSelectMovie={handleSelectMovie}
          genreMap={genreMap}
        />


        <WatchlistModal
          isOpen={isWatchlistOpen}
          onClose={() => setIsWatchlistOpen(false)}
          onSelectMovie={handleSelectMovie}
        />

        <ApiKeyModal
          isOpen={isApiKeyModalOpen}
          onClose={() => setIsApiKeyModalOpen(false)}
          onKeySaved={loadInitialData}
        />

        <SearchModal
          isOpen={isSearchModalOpen}
          onClose={() => setIsSearchModalOpen(false)}
          onSelectMovie={handleSelectMovie}
          onSelectActor={handleSelectActor}
        />
      </div>
    </WatchlistProvider>
  );
}

