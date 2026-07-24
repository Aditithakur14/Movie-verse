import React, { useEffect, useState } from 'react';
import { X, Calendar, MapPin, Film, Star, Loader2 } from 'lucide-react';
import { ActorDetails } from '../types/tmdb';
import { tmdbService, getProfileUrl, getImageUrl } from '../services/tmdbApi';

interface ActorDetailsModalProps {
  actorId: number | null;
  onClose: () => void;
  onSelectMovie: (movieId: number) => void;
}

export const ActorDetailsModal: React.FC<ActorDetailsModalProps> = ({
  actorId,
  onClose,
  onSelectMovie,
}) => {
  const [actor, setActor] = useState<ActorDetails | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!actorId) {
      setActor(null);
      return;
    }

    const fetchActor = async () => {
      setIsLoading(true);
      try {
        const data = await tmdbService.getActorDetails(actorId);
        setActor(data);
      } catch (err) {
        console.error('Error fetching actor details:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchActor();
  }, [actorId]);

  if (!actorId) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200">
      <div className="fixed inset-0" onClick={onClose} />

      <div className="relative z-10 w-full max-w-3xl rounded-3xl bg-[#0d0f17] border border-white/10 shadow-2xl overflow-hidden my-auto max-h-[90vh] flex flex-col">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-30 flex h-10 w-10 items-center justify-center rounded-full bg-black/70 text-gray-300 hover:text-white border border-white/10 backdrop-blur-md transition-colors"
        >
          <X className="h-5 w-5" />
        </button>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-24 text-gray-400 gap-3">
            <Loader2 className="h-10 w-10 text-red-500 animate-spin" />
            <p className="text-sm font-semibold">Loading Actor Profile...</p>
          </div>
        ) : actor ? (
          <div className="overflow-y-auto no-scrollbar p-6 sm:p-8">
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 border-b border-white/10 pb-6 mb-6">
              <img
                src={getProfileUrl(actor.profile_path)}
                alt={actor.name}
                className="h-36 w-36 rounded-full object-cover border-4 border-red-500/30 shadow-2xl"
              />

              <div className="space-y-2 text-center sm:text-left">
                <h2 className="text-2xl sm:text-3xl font-black text-white">{actor.name}</h2>

                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 text-xs text-gray-300 font-semibold">
                  {actor.birthday && (
                    <div className="flex items-center gap-1.5 bg-white/5 px-2.5 py-1 rounded-md border border-white/10">
                      <Calendar className="h-3.5 w-3.5 text-amber-400" />
                      <span>Born {actor.birthday}</span>
                    </div>
                  )}

                  {actor.place_of_birth && (
                    <div className="flex items-center gap-1.5 bg-white/5 px-2.5 py-1 rounded-md border border-white/10">
                      <MapPin className="h-3.5 w-3.5 text-red-400" />
                      <span>{actor.place_of_birth}</span>
                    </div>
                  )}
                </div>

                <div className="pt-1">
                  <span className="inline-block text-xs font-bold text-amber-400 bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20">
                    ⭐ TMDB Popularity: {Math.round(actor.popularity)}
                  </span>
                </div>
              </div>
            </div>

            {/* Biography */}
            {actor.biography && (
              <div className="mb-8">
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">
                  Biography
                </h3>
                <p className="text-xs sm:text-sm text-gray-300 leading-relaxed font-normal line-clamp-6">
                  {actor.biography}
                </p>
              </div>
            )}

            {/* Known For Movies */}
            {actor.movie_credits?.cast && actor.movie_credits.cast.length > 0 && (
              <div>
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                  <Film className="h-4 w-4 text-red-500" />
                  <span>Notable Movies ({actor.movie_credits.cast.length})</span>
                </h3>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {actor.movie_credits.cast.slice(0, 8).map((movie) => (
                    <div
                      key={movie.id}
                      onClick={() => {
                        onClose();
                        onSelectMovie(movie.id);
                      }}
                      className="group cursor-pointer rounded-xl bg-white/5 border border-white/5 overflow-hidden hover:border-red-500/40 transition-all"
                    >
                      <img
                        src={getImageUrl(movie.poster_path, 'w300')}
                        alt={movie.title}
                        className="h-40 w-full object-cover"
                      />
                      <div className="p-2.5">
                        <p className="text-xs font-bold text-white truncate">{movie.title}</p>
                        <p className="text-[10px] text-gray-400 truncate">{movie.character}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : null}
      </div>
    </div>
  );
};
