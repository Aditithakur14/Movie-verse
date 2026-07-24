import React, { useEffect, useState } from 'react';
import { X, Star, Bookmark, Check, Play, Clock, Calendar, Film, ExternalLink, Loader2, Users, Tv } from 'lucide-react';
import { MovieDetails, Movie } from '../types/tmdb';
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
  const [similarMovies, setSimilarMovies] = useState<Movie[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'trailer' | 'cast' | 'similar'>('overview');
  const [selectedTrailerKey, setSelectedTrailerKey] = useState<string | null>(null);

  const { isInWatchlist, toggleWatchlist } = useWatchlist();

  useEffect(() => {
    if (!movieId) {
      setDetails(null);
      setSelectedTrailerKey(null);
      return;
    }

    const fetchDetails = async () => {
      setIsLoading(true);
      try {
        const data = await tmdbService.getMovieDetails(movieId);
        setDetails(data);

        const similar = await tmdbService.getSimilarMovies(movieId);
        setSimilarMovies(similar);

        // Find YouTube official trailer
        if (data?.videos?.results && data.videos.results.length > 0) {
          const trailer =
            data.videos.results.find(
              (v) => v.site === 'YouTube' && (v.type === 'Trailer' || v.type === 'Teaser')
            ) || data.videos.results[0];
          if (trailer) {
            setSelectedTrailerKey(trailer.key);
          }
        } else {
          setSelectedTrailerKey(null);
        }
      } catch (err) {
        console.error('Error loading movie details:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDetails();
    setActiveTab('overview');
  }, [movieId]);

  if (!movieId) return null;

  const inWatchlist = details ? isInWatchlist(details.id) : false;
  const releaseYear = details?.release_date ? details.release_date.split('-')[0] : 'N/A';
  const rating = details?.vote_average ? details.vote_average.toFixed(1) : 'NR';
  const runtimeHours = details?.runtime ? Math.floor(details.runtime / 60) : 0;
  const runtimeMinutes = details?.runtime ? details.runtime % 60 : 0;

  // Extract US watch providers if available
  const watchProviders = details?.['watch/providers']?.results?.US || details?.['watch/providers']?.results?.IN;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6 bg-black/80 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200">
      {/* Backdrop Click Close */}
      <div className="fixed inset-0" onClick={onClose} />

      {/* Modal Container */}
      <div className="relative z-10 w-full max-w-4xl rounded-3xl bg-[#0d0f17] border border-white/10 shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col">
        {/* Close Button */}
        <button
          onClick={onClose}
          id="close-movie-modal-btn"
          className="absolute top-4 right-4 z-30 flex h-10 w-10 items-center justify-center rounded-full bg-black/70 text-gray-300 hover:text-white border border-white/10 backdrop-blur-md transition-colors"
        >
          <X className="h-5 w-5" />
        </button>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-28 text-gray-400 gap-3">
            <Loader2 className="h-10 w-10 text-red-500 animate-spin" />
            <p className="text-sm font-semibold">Loading Movie Experience...</p>
          </div>
        ) : details ? (
          <div className="overflow-y-auto no-scrollbar">
            {/* Modal Header Backdrop Banner */}
            <div className="relative h-64 sm:h-80 md:h-96 w-full overflow-hidden bg-black">
              <img
                src={getImageUrl(details.backdrop_path || details.poster_path, 'w1280')}
                alt={details.title}
                className="h-full w-full object-cover object-center opacity-80"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0d0f17] via-[#0d0f17]/50 to-transparent" />

              {/* Title & Banner Overlay */}
              <div className="absolute bottom-6 left-6 right-6 flex flex-col sm:flex-row items-start sm:items-end gap-5">
                <img
                  src={getImageUrl(details.poster_path, 'w300')}
                  alt={details.title}
                  className="hidden sm:block h-36 w-24 rounded-xl object-cover border-2 border-white/20 shadow-2xl"
                />

                <div className="space-y-2 max-w-2xl">
                  {details.tagline && (
                    <p className="text-xs font-semibold text-red-400 italic">
                      &quot;{details.tagline}&quot;
                    </p>
                  )}

                  <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight leading-tight">
                    {details.title}
                  </h2>

                  <div className="flex flex-wrap items-center gap-3 text-xs font-semibold text-gray-300">
                    <div className="flex items-center gap-1.5 text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-md border border-amber-500/20">
                      <Star className="h-3.5 w-3.5 fill-amber-400" />
                      <span>{rating} / 10</span>
                    </div>

                    <div className="flex items-center gap-1 text-gray-300">
                      <Calendar className="h-3.5 w-3.5" />
                      <span>{releaseYear}</span>
                    </div>

                    {details.runtime > 0 && (
                      <div className="flex items-center gap-1 text-gray-300">
                        <Clock className="h-3.5 w-3.5" />
                        <span>{runtimeHours}h {runtimeMinutes}m</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Tab Navigation */}
            <div className="flex items-center gap-4 px-6 pt-4 border-b border-white/10 bg-[#0d0f17]">
              <button
                onClick={() => setActiveTab('overview')}
                className={`pb-3 text-sm font-bold border-b-2 transition-colors ${
                  activeTab === 'overview'
                    ? 'border-red-500 text-red-500'
                    : 'border-transparent text-gray-400 hover:text-white'
                }`}
              >
                Overview
              </button>

              {selectedTrailerKey && (
                <button
                  onClick={() => setActiveTab('trailer')}
                  className={`pb-3 text-sm font-bold border-b-2 transition-colors flex items-center gap-1.5 ${
                    activeTab === 'trailer'
                      ? 'border-red-500 text-red-500'
                      : 'border-transparent text-gray-400 hover:text-white'
                  }`}
                >
                  <Play className="h-3.5 w-3.5 fill-current text-red-500" />
                  <span>Trailer</span>
                </button>
              )}

              <button
                onClick={() => setActiveTab('cast')}
                className={`pb-3 text-sm font-bold border-b-2 transition-colors ${
                  activeTab === 'cast'
                    ? 'border-red-500 text-red-500'
                    : 'border-transparent text-gray-400 hover:text-white'
                }`}
              >
                Cast & Crew
              </button>

              <button
                onClick={() => setActiveTab('similar')}
                className={`pb-3 text-sm font-bold border-b-2 transition-colors ${
                  activeTab === 'similar'
                    ? 'border-red-500 text-red-500'
                    : 'border-transparent text-gray-400 hover:text-white'
                }`}
              >
                Similar Movies ({similarMovies.length})
              </button>

              {/* Action Watchlist Button in Modal Header */}
              <button
                onClick={() => toggleWatchlist(details)}
                className={`ml-auto mb-2 flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-all ${
                  inWatchlist
                    ? 'bg-red-600/20 text-red-400 border border-red-500/40'
                    : 'bg-red-600 hover:bg-red-700 text-white shadow-lg glow-red'
                }`}
              >
                {inWatchlist ? (
                  <>
                    <Check className="h-3.5 w-3.5" />
                    <span>In Watchlist</span>
                  </>
                ) : (
                  <>
                    <Bookmark className="h-3.5 w-3.5" />
                    <span>Save to Watchlist</span>
                  </>
                )}
              </button>
            </div>

            {/* Modal Body Content */}
            <div className="p-6">
              {/* TAB 1: OVERVIEW */}
              {activeTab === 'overview' && (
                <div className="space-y-6">
                  {/* Genres */}
                  <div className="flex flex-wrap gap-2">
                    {details.genres?.map((g) => (
                      <span
                        key={g.id}
                        className="rounded-lg bg-white/5 border border-white/10 px-3 py-1 text-xs font-semibold text-gray-300"
                      >
                        {g.name}
                      </span>
                    ))}
                  </div>

                  {/* Synopsis */}
                  <div>
                    <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-2">
                      Storyline
                    </h3>
                    <p className="text-sm sm:text-base text-gray-200 leading-relaxed font-normal">
                      {details.overview || 'No storyline overview available for this movie.'}
                    </p>
                  </div>

                  {/* Watch Providers / Where to Stream */}
                  {watchProviders && (watchProviders.flatrate || watchProviders.rent) && (
                    <div className="rounded-2xl bg-white/5 border border-white/10 p-4">
                      <div className="flex items-center gap-2 text-xs font-bold text-blue-400 uppercase tracking-wider mb-3">
                        <Tv className="h-4 w-4" />
                        <span>Where to Watch</span>
                      </div>

                      <div className="flex flex-wrap items-center gap-3">
                        {watchProviders.flatrate?.map((provider) => (
                          <div
                            key={provider.provider_id}
                            className="flex items-center gap-2 rounded-xl bg-black/40 px-3 py-1.5 border border-white/10"
                          >
                            <img
                              src={getLogoUrl(provider.logo_path)}
                              alt={provider.provider_name}
                              className="h-6 w-6 rounded-md object-cover"
                            />
                            <span className="text-xs font-semibold text-gray-200">
                              {provider.provider_name}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Quick Trailer Button if not active tab */}
                  {selectedTrailerKey && (
                    <div>
                      <button
                        onClick={() => setActiveTab('trailer')}
                        className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-red-600 to-red-800 px-5 py-3 text-sm font-bold text-white shadow-lg glow-red transition-transform hover:scale-105"
                      >
                        <Play className="h-4 w-4 fill-current" />
                        <span>Watch Official Trailer</span>
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 2: TRAILER */}
              {activeTab === 'trailer' && selectedTrailerKey && (
                <div className="relative aspect-video w-full rounded-2xl overflow-hidden border border-white/10 bg-black shadow-2xl">
                  <iframe
                    src={`https://www.youtube-nocookie.com/embed/${selectedTrailerKey}?autoplay=1&modestbranding=1`}
                    title={`${details.title} Official Trailer`}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="h-full w-full border-0"
                  />
                </div>
              )}

              {/* TAB 3: CAST */}
              {activeTab === 'cast' && (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {details.credits?.cast?.slice(0, 12).map((actor) => (
                    <div
                      key={actor.id}
                      onClick={() => {
                        onClose();
                        onSelectActor(actor.id);
                      }}
                      className="group cursor-pointer flex items-center gap-3 rounded-xl bg-white/5 p-2.5 border border-white/5 hover:border-red-500/40 hover:bg-white/10 transition-all"
                    >
                      <img
                        src={getProfileUrl(actor.profile_path)}
                        alt={actor.name}
                        className="h-12 w-12 rounded-full object-cover border border-white/10"
                      />
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-white group-hover:text-red-400 transition-colors truncate">
                          {actor.name}
                        </p>
                        <p className="text-[11px] text-gray-400 truncate">{actor.character}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* TAB 4: SIMILAR MOVIES */}
              {activeTab === 'similar' && (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {similarMovies.slice(0, 8).map((movie) => (
                    <div
                      key={movie.id}
                      onClick={() => onSelectMovie(movie.id)}
                      className="group cursor-pointer rounded-xl bg-white/5 border border-white/5 overflow-hidden hover:border-red-500/40 transition-all"
                    >
                      <img
                        src={getImageUrl(movie.poster_path, 'w300')}
                        alt={movie.title}
                        className="h-44 w-full object-cover"
                      />
                      <div className="p-2.5">
                        <p className="text-xs font-bold text-white truncate">{movie.title}</p>
                        <p className="text-[10px] text-amber-400 font-semibold mt-0.5">
                          ⭐ {movie.vote_average?.toFixed(1) || 'NR'}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
};
