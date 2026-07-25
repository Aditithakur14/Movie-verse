import React, { useEffect, useState, useRef } from 'react';
import {
  X,
  Star,
  Bookmark,
  Check,
  Play,
  Clock,
  Calendar,
  Film,
  Loader2,
  Users,
  Tv,
  ArrowLeft,
  DollarSign,
  Globe,
  Clapperboard,
  Image as ImageIcon,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  AlertCircle,
  Building2,
  User,
  Music,
} from 'lucide-react';
import { MovieDetails, Movie, CastMember, CrewMember, Video, ImageAsset } from '../types/tmdb';
import { tmdbService, getImageUrl, getProfileUrl, getLogoUrl } from '../services/tmdbApi';
import { useWatchlist } from '../context/WatchlistContext';

interface MovieDetailsModalProps {
  movieId: number | null;
  onClose: () => void;
  onSelectMovie: (id: number) => void;
  onSelectActor: (actorId: number) => void;
}

export const MovieDetailsModal: React.FC<MovieDetailsModalProps> = ({
  movieId,
  onClose,
  onSelectMovie,
  onSelectActor,
}) => {
  const [details, setDetails] = useState<MovieDetails | null>(null);
  const [recommendations, setRecommendations] = useState<Movie[]>([]);
  const [similarMovies, setSimilarMovies] = useState<Movie[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);
  const [isTrailerModalOpen, setIsTrailerModalOpen] = useState(false);
  const [showFullCast, setShowFullCast] = useState(false);
  const [activeMediaTab, setActiveMediaTab] = useState<'trailer' | 'backdrops' | 'posters'>('trailer');
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const { isInWatchlist, toggleWatchlist } = useWatchlist();

  const containerRef = useRef<HTMLDivElement>(null);
  const recScrollRef = useRef<HTMLDivElement>(null);
  const simScrollRef = useRef<HTMLDivElement>(null);

  // Fetch full details whenever movieId changes
  useEffect(() => {
    if (!movieId) {
      setDetails(null);
      setError(null);
      setSelectedVideo(null);
      setPreviewImage(null);
      setIsTrailerModalOpen(false);
      setShowFullCast(false);
      return;
    }

    const fetchAllData = async () => {
      setIsLoading(true);
      setError(null);
      setIsTrailerModalOpen(false);
      setShowFullCast(false);

      // Reset scroll position to top
      if (containerRef.current) {
        containerRef.current.scrollTop = 0;
      }

      try {
        const movieData = await tmdbService.getMovieDetails(movieId);
        if (!movieData) {
          throw new Error('Movie details not found.');
        }

        setDetails(movieData);

        // Process videos (prefer YouTube Official Trailer or Teaser)
        const videosList = movieData.videos?.results || [];
        const officialTrailer =
          videosList.find((v) => v.site === 'YouTube' && v.type === 'Trailer') ||
          videosList.find((v) => v.site === 'YouTube' && v.type === 'Teaser') ||
          videosList[0] ||
          null;

        setSelectedVideo(officialTrailer);

        // Handle Recommendations & Similar
        if (movieData.recommendations?.results && movieData.recommendations.results.length > 0) {
          setRecommendations(movieData.recommendations.results);
        } else {
          const recData = await tmdbService.getMovieRecommendations(movieId);
          setRecommendations(recData);
        }

        if (movieData.similar?.results && movieData.similar.results.length > 0) {
          setSimilarMovies(movieData.similar.results);
        } else {
          const simData = await tmdbService.getSimilarMovies(movieId);
          setSimilarMovies(simData);
        }
      } catch (err) {
        console.error('Failed to load movie details page:', err);
        setError('Unable to load movie details. Please check your network connection.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchAllData();
  }, [movieId]);

  // Keyboard navigation (Escape closes details view or modals)
  useEffect(() => {
    if (!movieId) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (isTrailerModalOpen) {
          setIsTrailerModalOpen(false);
        } else if (previewImage) {
          setPreviewImage(null);
        } else {
          onClose();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [movieId, isTrailerModalOpen, previewImage, onClose]);

  if (!movieId) return null;

  // Helpers
  const inWatchlist = details ? isInWatchlist(details.id) : false;
  const releaseYear = details?.release_date ? details.release_date.split('-')[0] : 'N/A';
  const rating = details?.vote_average ? details.vote_average.toFixed(1) : 'NR';
  const runtimeHours = details?.runtime ? Math.floor(details.runtime / 60) : 0;
  const runtimeMinutes = details?.runtime ? details.runtime % 60 : 0;

  const formatCurrency = (val?: number) => {
    if (!val || val === 0) return 'Not Reported';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(val);
  };

  const getLanguageName = (code?: string) => {
    if (!code) return 'N/A';
    if (details?.spoken_languages && details.spoken_languages.length > 0) {
      const match = details.spoken_languages.find((l) => l.iso_639_1 === code);
      if (match) return match.english_name || match.name;
    }
    try {
      const display = new Intl.DisplayNames(['en'], { type: 'language' });
      return display.of(code) || code.toUpperCase();
    } catch {
      return code.toUpperCase();
    }
  };

  // Group Crew members
  const crewList = details?.credits?.crew || [];
  const directors = crewList.filter((c) => c.job === 'Director' || c.department === 'Directing');
  const writers = crewList.filter(
    (c) =>
      c.department === 'Writing' ||
      ['Writer', 'Screenplay', 'Story', 'Co-Writer', 'Author'].includes(c.job)
  );
  const producers = crewList.filter(
    (c) => c.job === 'Producer' || c.job === 'Executive Producer'
  );
  const composers = crewList.filter(
    (c) =>
      ['Original Music Composer', 'Music Composer', 'Composer', 'Music', 'Music Director'].includes(c.job) ||
      (c.department === 'Sound' && (c.job.includes('Composer') || c.job.includes('Music')))
  );

  const uniquePeople = (arr: CrewMember[]) => {
    const seen = new Set<number>();
    return arr.filter((item) => {
      if (seen.has(item.id)) return false;
      seen.add(item.id);
      return true;
    });
  };

  const topDirectors = uniquePeople(directors);
  const topWriters = uniquePeople(writers).slice(0, 4);
  const topProducers = uniquePeople(producers).slice(0, 4);
  const topComposers = uniquePeople(composers).slice(0, 4);

  // Watch Providers (US / IN or fallback first available region)
  const watchProvidersObj = details?.['watch/providers']?.results;
  const watchProviders = watchProvidersObj?.US || watchProvidersObj?.IN || (watchProvidersObj ? Object.values(watchProvidersObj)[0] : null);

  // Scroll helpers for sliders
  const scrollSection = (ref: React.RefObject<HTMLDivElement>, direction: 'left' | 'right') => {
    if (ref.current) {
      const scrollAmount = direction === 'left' ? -400 : 400;
      ref.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-50 bg-[#090a0f] text-gray-100 overflow-y-auto animate-in fade-in duration-200"
    >
      {/* Sticky Top Header Control Bar */}
      <div className="sticky top-0 z-40 bg-[#090a0f]/90 backdrop-blur-xl border-b border-white/10 px-4 sm:px-8 py-3.5 flex items-center justify-between shadow-2xl">
        <button
          onClick={onClose}
          id="movie-details-back-btn"
          className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-xs sm:text-sm font-bold text-gray-200 hover:text-white border border-white/10 transition-all hover:scale-105"
        >
          <ArrowLeft className="h-4 w-4 text-red-500" />
          <span>Back</span>
        </button>

        {/* Title Snippet */}
        {details && (
          <div className="hidden md:flex items-center gap-3 max-w-md truncate">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Movie Verse</span>
            <span className="text-gray-600">•</span>
            <span className="text-sm font-bold text-white truncate">{details.title}</span>
          </div>
        )}

        <div className="flex items-center gap-2">
          {details && (
            <button
              onClick={() => toggleWatchlist(details)}
              className={`flex items-center gap-2 rounded-xl px-3.5 py-1.5 text-xs font-bold transition-all ${
                inWatchlist
                  ? 'bg-red-600/20 text-red-400 border border-red-500/40'
                  : 'bg-red-600 hover:bg-red-700 text-white shadow-lg glow-red'
              }`}
            >
              {inWatchlist ? (
                <>
                  <Check className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">In Watchlist</span>
                </>
              ) : (
                <>
                  <Bookmark className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">Add to Watchlist</span>
                </>
              )}
            </button>
          )}

          <button
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white border border-white/10 transition-colors"
            title="Close movie details"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      {isLoading ? (
        /* Full Page Skeleton Loader */
        <div className="max-w-7xl mx-auto px-4 sm:px-8 py-8 space-y-10">
          <div className="relative h-96 sm:h-[480px] w-full rounded-3xl skeleton border border-white/5 overflow-hidden" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <div className="h-8 w-2/3 skeleton rounded-xl" />
              <div className="h-20 w-full skeleton rounded-2xl" />
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="h-24 skeleton rounded-2xl" />
                ))}
              </div>
            </div>
            <div className="space-y-4">
              <div className="h-40 skeleton rounded-2xl" />
            </div>
          </div>
        </div>
      ) : error ? (
        /* Error State */
        <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 text-center space-y-4">
          <div className="h-16 w-16 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-500">
            <AlertCircle className="h-8 w-8" />
          </div>
          <h2 className="text-xl font-bold text-white">Movie Loading Failed</h2>
          <p className="text-sm text-gray-400 max-w-md">{error}</p>
          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl bg-red-600 text-white font-bold text-sm hover:bg-red-700 transition-colors shadow-lg shadow-red-950/50"
          >
            Return to Discovery
          </button>
        </div>
      ) : details ? (
        <div className="space-y-12 pb-20">
          {/* SECTION 1: HERO BANNER */}
          <section className="relative w-full overflow-hidden bg-black border-b border-white/10">
            {/* Backdrop Image with Multi-Gradient Overlay */}
            <div className="relative h-[480px] sm:h-[560px] md:h-[620px] w-full overflow-hidden">
              <img
                src={getImageUrl(details.backdrop_path || details.poster_path, 'original')}
                alt={details.title}
                className="h-full w-full object-cover object-center filter contrast-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#090a0f] via-[#090a0f]/60 to-black/40" />
              <div className="absolute inset-0 bg-gradient-to-r from-[#090a0f] via-[#090a0f]/40 to-transparent" />
            </div>

            {/* Hero Content Overlay */}
            <div className="absolute inset-0 flex items-end pb-8 sm:pb-12">
              <div className="max-w-7xl mx-auto px-4 sm:px-8 w-full flex flex-col md:flex-row items-start md:items-end gap-6 sm:gap-8">
                {/* Movie Poster Card */}
                <div className="relative group shrink-0 hidden sm:block">
                  <div className="h-64 sm:h-80 w-44 sm:w-56 rounded-2xl overflow-hidden border-2 border-white/20 shadow-2xl bg-black shadow-red-950/30">
                    <img
                      src={getImageUrl(details.poster_path, 'w500')}
                      alt={details.title}
                      className="h-full w-full object-cover"
                    />
                  </div>
                </div>

                {/* Hero Title & Info */}
                <div className="flex-1 space-y-4">
                  {details.tagline && (
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-red-500/10 border border-red-500/20 text-xs font-bold text-red-400 italic">
                      <Sparkles className="h-3.5 w-3.5" />
                      <span>&quot;{details.tagline}&quot;</span>
                    </div>
                  )}

                  <h1 className="text-3xl sm:text-5xl md:text-6xl font-black text-white tracking-tight leading-tight">
                    {details.title}
                  </h1>

                  {/* Badges Bar */}
                  <div className="flex flex-wrap items-center gap-3 text-xs sm:text-sm font-semibold text-gray-300">
                    {/* Rating */}
                    <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 font-bold">
                      <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                      <span>{rating}</span>
                      <span className="text-[11px] text-amber-400/70 font-normal">
                        ({details.vote_count.toLocaleString()} votes)
                      </span>
                    </div>

                    {/* Release Year */}
                    <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-white/5 border border-white/10 text-gray-200">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      <span>{releaseYear}</span>
                    </div>

                    {/* Runtime */}
                    {details.runtime > 0 && (
                      <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-white/5 border border-white/10 text-gray-200">
                        <Clock className="h-4 w-4 text-gray-400" />
                        <span>{runtimeHours}h {runtimeMinutes}m</span>
                      </div>
                    )}

                    {/* Status */}
                    {details.status && (
                      <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-medium">
                        <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                        <span>{details.status}</span>
                      </div>
                    )}

                    {/* Language */}
                    <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-white/5 border border-white/10 text-gray-300">
                      <Globe className="h-4 w-4 text-gray-400" />
                      <span>{getLanguageName(details.original_language)}</span>
                    </div>
                  </div>

                  {/* Short Overview */}
                  <p className="text-sm sm:text-base text-gray-300 line-clamp-3 max-w-3xl font-normal leading-relaxed">
                    {details.overview}
                  </p>

                  {/* Primary CTA Buttons */}
                  <div className="flex flex-wrap items-center gap-4 pt-2">
                    {selectedVideo ? (
                      <button
                        onClick={() => setIsTrailerModalOpen(true)}
                        id="movie-details-watch-trailer-btn"
                        className="flex items-center gap-2.5 rounded-2xl bg-gradient-to-r from-red-600 to-red-800 px-6 py-3.5 text-sm font-extrabold text-white shadow-xl glow-red transition-all hover:scale-105"
                      >
                        <Play className="h-5 w-5 fill-current" />
                        <span>Watch Official Trailer</span>
                      </button>
                    ) : (
                      <button
                        disabled
                        className="flex items-center gap-2.5 rounded-2xl bg-white/5 border border-white/10 px-6 py-3.5 text-sm font-semibold text-gray-400 cursor-not-allowed opacity-70"
                      >
                        <Play className="h-5 w-5 text-gray-500" />
                        <span>No Trailer Available</span>
                      </button>
                    )}

                    <button
                      onClick={() => toggleWatchlist(details)}
                      className={`flex items-center gap-2 rounded-2xl px-6 py-3.5 text-sm font-extrabold transition-all ${
                        inWatchlist
                          ? 'bg-red-600/20 text-red-400 border border-red-500/40'
                          : 'bg-white/10 hover:bg-white/20 text-white border border-white/15'
                      }`}
                    >
                      {inWatchlist ? (
                        <>
                          <Check className="h-5 w-5 text-red-400" />
                          <span>In Watchlist</span>
                        </>
                      ) : (
                        <>
                          <Bookmark className="h-5 w-5 text-gray-300" />
                          <span>Add to Watchlist</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* SECTION 2: MOVIE INFORMATION & METADATA GRID */}
          <section className="max-w-7xl mx-auto px-4 sm:px-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left 2 Cols: Storyline & Details */}
            <div className="lg:col-span-2 space-y-8">
              {/* Full Overview */}
              <div className="rounded-3xl bg-white/5 border border-white/10 p-6 sm:p-8 space-y-4">
                <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                  <Film className="h-4 w-4 text-red-500" />
                  <span>Storyline Overview</span>
                </h3>
                <p className="text-base sm:text-lg text-gray-200 leading-relaxed font-normal">
                  {details.overview || 'No overview available for this movie.'}
                </p>

                {/* Genre Tags */}
                <div className="pt-4 border-t border-white/10 flex flex-wrap gap-2">
                  {details.genres?.map((g) => (
                    <span
                      key={g.id}
                      className="rounded-xl bg-red-950/30 border border-red-500/30 px-3.5 py-1.5 text-xs font-bold text-red-300"
                    >
                      {g.name}
                    </span>
                  ))}
                </div>
              </div>

              {/* Streaming Availability (Watch Providers) */}
              {watchProviders && (watchProviders.flatrate || watchProviders.rent || watchProviders.buy) && (
                <div className="rounded-3xl bg-white/5 border border-white/10 p-6 sm:p-8 space-y-4">
                  <div className="flex items-center gap-2 text-xs font-bold text-blue-400 uppercase tracking-widest">
                    <Tv className="h-4 w-4" />
                    <span>Streaming Availability</span>
                  </div>

                  <div className="space-y-4">
                    {watchProviders.flatrate && watchProviders.flatrate.length > 0 && (
                      <div>
                        <p className="text-xs font-semibold text-gray-400 mb-2">Stream Subscription:</p>
                        <div className="flex flex-wrap gap-3">
                          {watchProviders.flatrate.map((provider) => (
                            <div
                              key={provider.provider_id}
                              className="flex items-center gap-2.5 rounded-2xl bg-black/60 px-3.5 py-2 border border-white/10"
                            >
                              <img
                                src={getLogoUrl(provider.logo_path)}
                                alt={provider.provider_name}
                                className="h-7 w-7 rounded-lg object-cover"
                              />
                              <span className="text-xs font-bold text-gray-200">{provider.provider_name}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {(watchProviders.rent || watchProviders.buy) && (
                      <div>
                        <p className="text-xs font-semibold text-gray-400 mb-2">Rent / Buy:</p>
                        <div className="flex flex-wrap gap-3">
                          {[...(watchProviders.rent || []), ...(watchProviders.buy || [])]
                            .filter((v, i, a) => a.findIndex((t) => t.provider_id === v.provider_id) === i)
                            .slice(0, 6)
                            .map((provider) => (
                              <div
                                key={provider.provider_id}
                                className="flex items-center gap-2.5 rounded-2xl bg-black/40 px-3 py-1.5 border border-white/5 text-gray-300"
                              >
                                <img
                                  src={getLogoUrl(provider.logo_path)}
                                  alt={provider.provider_name}
                                  className="h-6 w-6 rounded-md object-cover"
                                />
                                <span className="text-xs font-medium">{provider.provider_name}</span>
                              </div>
                            ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Right Col: Financial & Production Specs */}
            <div className="space-y-6">
              <div className="rounded-3xl bg-white/5 border border-white/10 p-6 space-y-6">
                <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest pb-3 border-b border-white/10">
                  Movie Metadata
                </h3>

                {/* Specs List */}
                <div className="space-y-4 text-xs sm:text-sm">
                  {/* Budget */}
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400 flex items-center gap-2">
                      <DollarSign className="h-4 w-4 text-emerald-400" />
                      Budget
                    </span>
                    <span className="font-bold text-gray-200">{formatCurrency(details.budget)}</span>
                  </div>

                  {/* Revenue */}
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400 flex items-center gap-2">
                      <DollarSign className="h-4 w-4 text-emerald-400" />
                      Box Office Revenue
                    </span>
                    <span className="font-bold text-gray-200">{formatCurrency(details.revenue)}</span>
                  </div>

                  {/* Spoken Languages */}
                  <div className="flex items-start justify-between gap-4">
                    <span className="text-gray-400 flex items-center gap-2 shrink-0">
                      <Globe className="h-4 w-4 text-blue-400" />
                      Spoken Languages
                    </span>
                    <span className="font-semibold text-gray-200 text-right">
                      {details.spoken_languages?.map((l) => l.english_name || l.name).join(', ') || 'N/A'}
                    </span>
                  </div>

                  {/* Production Countries */}
                  <div className="flex items-start justify-between gap-4">
                    <span className="text-gray-400 flex items-center gap-2 shrink-0">
                      <Globe className="h-4 w-4 text-purple-400" />
                      Countries
                    </span>
                    <span className="font-semibold text-gray-200 text-right">
                      {details.production_countries?.map((c) => c.name).join(', ') || 'N/A'}
                    </span>
                  </div>
                </div>

                {/* Production Companies */}
                {details.production_companies && details.production_companies.length > 0 && (
                  <div className="pt-4 border-t border-white/10 space-y-3">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                      <Building2 className="h-4 w-4 text-amber-400" />
                      <span>Production Companies</span>
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {details.production_companies.map((company) => (
                        <div
                          key={company.id}
                          className="flex items-center gap-2 rounded-xl bg-black/50 px-3 py-1.5 border border-white/10"
                        >
                          {company.logo_path ? (
                            <img
                              src={getLogoUrl(company.logo_path)}
                              alt={company.name}
                              className="h-5 max-w-[60px] object-contain invert opacity-80"
                            />
                          ) : null}
                          <span className="text-xs font-semibold text-gray-300">{company.name}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </section>

          {/* SECTION 3: TOP BILLED CAST */}
          {details.credits?.cast && details.credits.cast.length > 0 && (
            <section className="max-w-7xl mx-auto px-4 sm:px-8 space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2.5">
                    <Users className="h-6 w-6 text-red-500" />
                    <span>Top Billed Cast</span>
                  </h2>
                  <p className="text-xs text-gray-400 mt-1">Click an actor to view their full filmography & biography</p>
                </div>

                {details.credits.cast.length > 15 && (
                  <button
                    onClick={() => setShowFullCast(!showFullCast)}
                    className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs sm:text-sm font-bold text-red-400 hover:text-red-300 transition-all"
                  >
                    {showFullCast ? 'Show Top Cast' : `View Full Cast (${details.credits.cast.length})`}
                  </button>
                )}
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                {(showFullCast ? details.credits.cast : details.credits.cast.slice(0, 15)).map((actor: CastMember) => (
                  <div
                    key={actor.id}
                    onClick={() => onSelectActor(actor.id)}
                    className="group cursor-pointer rounded-2xl bg-white/5 border border-white/5 p-3 hover:border-red-500/50 hover:bg-white/10 transition-all hover:scale-105 shadow-md flex flex-col items-center text-center"
                  >
                    <div className="relative h-24 w-24 rounded-full overflow-hidden mb-3 border-2 border-white/10 group-hover:border-red-500 transition-colors bg-white/5 flex items-center justify-center">
                      {actor.profile_path ? (
                        <img
                          src={getProfileUrl(actor.profile_path)}
                          alt={actor.name}
                          className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-300"
                          loading="lazy"
                          onError={(e) => {
                            (e.target as HTMLElement).style.display = 'none';
                          }}
                        />
                      ) : (
                        <User className="h-10 w-10 text-gray-500" />
                      )}
                    </div>
                    <h4 className="text-xs sm:text-sm font-bold text-white group-hover:text-red-400 transition-colors line-clamp-1">
                      {actor.name}
                    </h4>
                    <p className="text-[11px] text-gray-400 line-clamp-1 mt-0.5">{actor.character}</p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* SECTION 4: KEY CREW */}
          {(topDirectors.length > 0 || topWriters.length > 0 || topProducers.length > 0 || topComposers.length > 0) && (
            <section className="max-w-7xl mx-auto px-4 sm:px-8 space-y-6">
              <h2 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2.5">
                <Clapperboard className="h-6 w-6 text-red-500" />
                <span>Key Filmmakers & Crew</span>
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Directors */}
                {topDirectors.length > 0 && (
                  <div className="rounded-2xl bg-white/5 border border-white/10 p-5 space-y-3">
                    <span className="text-xs font-bold text-red-400 uppercase tracking-widest">Director</span>
                    <div className="space-y-3">
                      {topDirectors.map((d) => (
                        <div key={d.id} className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full bg-white/10 flex items-center justify-center overflow-hidden border border-white/10 shrink-0">
                            {d.profile_path ? (
                              <img
                                src={getProfileUrl(d.profile_path)}
                                alt={d.name}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <User className="h-5 w-5 text-gray-400" />
                            )}
                          </div>
                          <div>
                            <p className="text-sm font-bold text-white line-clamp-1">{d.name}</p>
                            <p className="text-xs text-gray-400">Director</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Writers */}
                {topWriters.length > 0 && (
                  <div className="rounded-2xl bg-white/5 border border-white/10 p-5 space-y-3">
                    <span className="text-xs font-bold text-purple-400 uppercase tracking-widest">Writers & Screenplay</span>
                    <div className="space-y-3">
                      {topWriters.map((w) => (
                        <div key={w.id} className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full bg-white/10 flex items-center justify-center overflow-hidden border border-white/10 shrink-0">
                            {w.profile_path ? (
                              <img
                                src={getProfileUrl(w.profile_path)}
                                alt={w.name}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <User className="h-5 w-5 text-gray-400" />
                            )}
                          </div>
                          <div>
                            <p className="text-sm font-bold text-white line-clamp-1">{w.name}</p>
                            <p className="text-xs text-gray-400">{w.job}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Producers */}
                {topProducers.length > 0 && (
                  <div className="rounded-2xl bg-white/5 border border-white/10 p-5 space-y-3">
                    <span className="text-xs font-bold text-amber-400 uppercase tracking-widest">Producers</span>
                    <div className="space-y-3">
                      {topProducers.map((p) => (
                        <div key={p.id} className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full bg-white/10 flex items-center justify-center overflow-hidden border border-white/10 shrink-0">
                            {p.profile_path ? (
                              <img
                                src={getProfileUrl(p.profile_path)}
                                alt={p.name}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <User className="h-5 w-5 text-gray-400" />
                            )}
                          </div>
                          <div>
                            <p className="text-sm font-bold text-white line-clamp-1">{p.name}</p>
                            <p className="text-xs text-gray-400">{p.job}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Music Composers */}
                {topComposers.length > 0 && (
                  <div className="rounded-2xl bg-white/5 border border-white/10 p-5 space-y-3">
                    <span className="text-xs font-bold text-cyan-400 uppercase tracking-widest flex items-center gap-1.5">
                      <Music className="h-3.5 w-3.5" />
                      <span>Music & Score</span>
                    </span>
                    <div className="space-y-3">
                      {topComposers.map((mc) => (
                        <div key={mc.id} className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full bg-white/10 flex items-center justify-center overflow-hidden border border-white/10 shrink-0">
                            {mc.profile_path ? (
                              <img
                                src={getProfileUrl(mc.profile_path)}
                                alt={mc.name}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <User className="h-5 w-5 text-gray-400" />
                            )}
                          </div>
                          <div>
                            <p className="text-sm font-bold text-white line-clamp-1">{mc.name}</p>
                            <p className="text-xs text-gray-400">{mc.job}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </section>
          )}

          {/* SECTION 5: MEDIA GALLERY (TRAILER & BACKDROPS & POSTERS) */}
          <section id="media-section" className="max-w-7xl mx-auto px-4 sm:px-8 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
              <h2 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2.5">
                <ImageIcon className="h-6 w-6 text-red-500" />
                <span>Media & Videos</span>
              </h2>

              {/* Media Tabs */}
              <div className="flex items-center gap-2 bg-white/5 p-1 rounded-2xl border border-white/10">
                <button
                  onClick={() => setActiveMediaTab('trailer')}
                  className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    activeMediaTab === 'trailer'
                      ? 'bg-red-600 text-white shadow-md'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  Videos ({details.videos?.results?.length || 0})
                </button>
                <button
                  onClick={() => setActiveMediaTab('backdrops')}
                  className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    activeMediaTab === 'backdrops'
                      ? 'bg-red-600 text-white shadow-md'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  Backdrops ({details.images?.backdrops?.length || 0})
                </button>
                <button
                  onClick={() => setActiveMediaTab('posters')}
                  className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    activeMediaTab === 'posters'
                      ? 'bg-red-600 text-white shadow-md'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  Posters ({details.images?.posters?.length || 0})
                </button>
              </div>
            </div>

            {/* TAB 1: TRAILER / VIDEO PLAYER */}
            {activeMediaTab === 'trailer' && (
              <div className="space-y-4">
                {selectedVideo ? (
                  <div className="relative aspect-video w-full rounded-3xl overflow-hidden border border-white/15 bg-black shadow-2xl">
                    <iframe
                      src={`https://www.youtube-nocookie.com/embed/${selectedVideo.key}?autoplay=0&modestbranding=1`}
                      title={selectedVideo.name}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      className="h-full w-full border-0"
                    />
                  </div>
                ) : (
                  <div className="p-12 rounded-3xl bg-white/5 text-center text-gray-400 space-y-2">
                    <Play className="h-8 w-8 text-gray-600 mx-auto" />
                    <p className="font-bold text-gray-300">No official trailer video available for this movie.</p>
                  </div>
                )}

                {/* Video Selector Pills if multiple videos */}
                {details.videos?.results && details.videos.results.length > 1 && (
                  <div className="flex flex-wrap gap-2 pt-2">
                    {details.videos.results.slice(0, 6).map((vid: Video) => (
                      <button
                        key={vid.id}
                        onClick={() => setSelectedVideo(vid)}
                        className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold border transition-all ${
                          selectedVideo?.id === vid.id
                            ? 'bg-red-600 text-white border-red-500 shadow-md'
                            : 'bg-white/5 hover:bg-white/10 text-gray-300 border-white/10'
                        }`}
                      >
                        <Play className="h-3.5 w-3.5" />
                        <span className="truncate max-w-[200px]">{vid.name}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* TAB 2: BACKDROPS GALLERY */}
            {activeMediaTab === 'backdrops' && (
              <div>
                {details.images?.backdrops && details.images.backdrops.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    {details.images.backdrops.slice(0, 9).map((img: ImageAsset, idx: number) => (
                      <div
                        key={idx}
                        onClick={() => setPreviewImage(getImageUrl(img.file_path, 'original'))}
                        className="group cursor-pointer relative aspect-video rounded-2xl overflow-hidden border border-white/10 bg-black hover:border-red-500 transition-all hover:scale-[1.02]"
                      >
                        <img
                          src={getImageUrl(img.file_path, 'w780')}
                          alt={`Backdrop ${idx + 1}`}
                          className="h-full w-full object-cover"
                          loading="lazy"
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <span className="text-xs font-bold text-white bg-black/80 px-3 py-1.5 rounded-xl border border-white/20">
                            Click to Expand
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-8 rounded-2xl bg-white/5 text-center text-gray-400">
                    No backdrops available for this movie.
                  </div>
                )}
              </div>
            )}

            {/* TAB 3: POSTERS GALLERY */}
            {activeMediaTab === 'posters' && (
              <div>
                {details.images?.posters && details.images.posters.length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
                    {details.images.posters.slice(0, 12).map((img: ImageAsset, idx: number) => (
                      <div
                        key={idx}
                        onClick={() => setPreviewImage(getImageUrl(img.file_path, 'original'))}
                        className="group cursor-pointer relative aspect-[2/3] rounded-2xl overflow-hidden border border-white/10 bg-black hover:border-red-500 transition-all hover:scale-[1.03]"
                      >
                        <img
                          src={getImageUrl(img.file_path, 'w500')}
                          alt={`Poster ${idx + 1}`}
                          className="h-full w-full object-cover"
                          loading="lazy"
                        />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-8 rounded-2xl bg-white/5 text-center text-gray-400">
                    No posters available for this movie.
                  </div>
                )}
              </div>
            )}
          </section>

          {/* SECTION 6: RECOMMENDATIONS */}
          {recommendations.length > 0 && (
            <section className="max-w-7xl mx-auto px-4 sm:px-8 space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2.5">
                    <Sparkles className="h-6 w-6 text-red-500" />
                    <span>Recommended Movies</span>
                  </h2>
                  <p className="text-xs text-gray-400 mt-0.5">Handpicked TMDB titles based on this movie</p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => scrollSection(recScrollRef, 'left')}
                    className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white border border-white/10 transition-colors"
                    title="Scroll left"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => scrollSection(recScrollRef, 'right')}
                    className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white border border-white/10 transition-colors"
                    title="Scroll right"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </div>
              </div>

              {/* Horizontal Scroll Bar */}
              <div
                ref={recScrollRef}
                className="flex items-center gap-4 overflow-x-auto no-scrollbar py-2"
              >
                {recommendations.map((m: Movie) => (
                  <div
                    key={m.id}
                    onClick={() => onSelectMovie(m.id)}
                    className="group cursor-pointer shrink-0 w-40 sm:w-48 rounded-2xl bg-white/5 border border-white/10 overflow-hidden hover:border-red-500/50 hover:bg-white/10 transition-all hover:scale-105 shadow-xl"
                  >
                    <div className="relative aspect-[2/3] w-full overflow-hidden bg-black">
                      <img
                        src={getImageUrl(m.poster_path, 'w500')}
                        alt={m.title}
                        className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-300"
                        loading="lazy"
                      />
                      {m.vote_average > 0 && (
                        <div className="absolute top-2 right-2 flex items-center gap-1 rounded-lg bg-black/80 px-2 py-0.5 text-[11px] font-bold text-amber-400 backdrop-blur-md border border-white/10">
                          <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                          <span>{m.vote_average.toFixed(1)}</span>
                        </div>
                      )}
                    </div>
                    <div className="p-3">
                      <h4 className="text-xs sm:text-sm font-bold text-white truncate group-hover:text-red-400 transition-colors">
                        {m.title}
                      </h4>
                      <p className="text-[11px] text-gray-400 mt-0.5">
                        {m.release_date ? m.release_date.split('-')[0] : 'N/A'}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* SECTION 7: SIMILAR MOVIES */}
          {similarMovies.length > 0 && (
            <section className="max-w-7xl mx-auto px-4 sm:px-8 space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2.5">
                    <Film className="h-6 w-6 text-red-500" />
                    <span>More Like This</span>
                  </h2>
                  <p className="text-xs text-gray-400 mt-0.5">Movies with similar genres and themes</p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => scrollSection(simScrollRef, 'left')}
                    className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white border border-white/10 transition-colors"
                    title="Scroll left"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => scrollSection(simScrollRef, 'right')}
                    className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white border border-white/10 transition-colors"
                    title="Scroll right"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </div>
              </div>

              {/* Horizontal Scroll Bar */}
              <div
                ref={simScrollRef}
                className="flex items-center gap-4 overflow-x-auto no-scrollbar py-2"
              >
                {similarMovies.map((m: Movie) => (
                  <div
                    key={m.id}
                    onClick={() => onSelectMovie(m.id)}
                    className="group cursor-pointer shrink-0 w-40 sm:w-48 rounded-2xl bg-white/5 border border-white/10 overflow-hidden hover:border-red-500/50 hover:bg-white/10 transition-all hover:scale-105 shadow-xl"
                  >
                    <div className="relative aspect-[2/3] w-full overflow-hidden bg-black">
                      <img
                        src={getImageUrl(m.poster_path, 'w500')}
                        alt={m.title}
                        className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-300"
                        loading="lazy"
                      />
                      {m.vote_average > 0 && (
                        <div className="absolute top-2 right-2 flex items-center gap-1 rounded-lg bg-black/80 px-2 py-0.5 text-[11px] font-bold text-amber-400 backdrop-blur-md border border-white/10">
                          <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                          <span>{m.vote_average.toFixed(1)}</span>
                        </div>
                      )}
                    </div>
                    <div className="p-3">
                      <h4 className="text-xs sm:text-sm font-bold text-white truncate group-hover:text-red-400 transition-colors">
                        {m.title}
                      </h4>
                      <p className="text-[11px] text-gray-400 mt-0.5">
                        {m.release_date ? m.release_date.split('-')[0] : 'N/A'}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      ) : null}

      {/* Official YouTube Trailer Modal Popup */}
      {isTrailerModalOpen && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center p-4 sm:p-6 bg-black/90 backdrop-blur-2xl animate-in fade-in duration-200"
          onClick={() => setIsTrailerModalOpen(false)}
        >
          <div
            className="relative w-full max-w-5xl rounded-3xl bg-[#0e1017] border border-white/20 shadow-2xl overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-white/5">
              <div className="flex items-center gap-2">
                <Play className="h-5 w-5 text-red-500 fill-current" />
                <h3 className="text-base sm:text-lg font-extrabold text-white truncate max-w-xl">
                  {details?.title} — Official Trailer
                </h3>
              </div>
              <button
                onClick={() => setIsTrailerModalOpen(false)}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="relative aspect-video w-full bg-black">
              {selectedVideo ? (
                <iframe
                  src={`https://www.youtube-nocookie.com/embed/${selectedVideo.key}?autoplay=1&rel=0&modestbranding=1`}
                  title={`${details?.title} Trailer`}
                  className="h-full w-full border-0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-center p-8 space-y-4">
                  <Film className="h-12 w-12 text-gray-500" />
                  <p className="text-gray-300 text-sm font-semibold">No official trailer video available for this movie.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Fullscreen Image Preview Lightbox */}
      {previewImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/95 backdrop-blur-2xl animate-in fade-in duration-200"
          onClick={() => setPreviewImage(null)}
        >
          <button
            onClick={() => setPreviewImage(null)}
            className="absolute top-6 right-6 z-10 flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
          <img
            src={previewImage}
            alt="Preview"
            className="max-h-[90vh] max-w-[90vw] object-contain rounded-2xl shadow-2xl border border-white/20"
          />
        </div>
      )}
    </div>
  );
};
