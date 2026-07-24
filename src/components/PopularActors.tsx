import React from 'react';
import { Users, Star } from 'lucide-react';
import { Actor } from '../types/tmdb';
import { getProfileUrl } from '../services/tmdbApi';

interface PopularActorsProps {
  actors: Actor[];
  onSelectActor: (actorId: number) => void;
}

export const PopularActors: React.FC<PopularActorsProps> = ({ actors, onSelectActor }) => {
  return (
    <section id="popular-actors" className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8">
        <div className="inline-flex items-center gap-2 text-xs font-bold text-amber-400 uppercase tracking-widest mb-1.5">
          <Users className="h-4 w-4" />
          <span>Star Directory</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
          Popular Actors & Filmmakers
        </h2>
        <p className="text-xs sm:text-sm text-gray-400 mt-1">
          Explore iconic Hollywood performers and browse their famous filmography.
        </p>
      </div>

      {/* Actors Circle Avatar Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
        {actors.slice(0, 12).map((actor) => (
          <div
            key={actor.id}
            onClick={() => onSelectActor(actor.id)}
            id={`actor-card-${actor.id}`}
            className="group cursor-pointer text-center flex flex-col items-center"
          >
            {/* Circular Profile Image */}
            <div className="relative h-28 w-28 sm:h-32 sm:w-32 rounded-full overflow-hidden border-2 border-white/10 group-hover:border-red-500 shadow-xl group-hover:shadow-red-950/40 transition-all duration-300 group-hover:scale-105 mb-3 bg-[#12151e]">
              <img
                src={getProfileUrl(actor.profile_path)}
                alt={actor.name}
                loading="lazy"
                className="h-full w-full object-cover object-center transition-transform duration-500 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>

            {/* Actor Meta */}
            <h3 className="text-sm font-bold text-white group-hover:text-red-400 transition-colors line-clamp-1">
              {actor.name}
            </h3>

            {actor.known_for && actor.known_for.length > 0 && (
              <p className="text-[11px] text-gray-400 line-clamp-1 mt-0.5">
                {actor.known_for[0].title || actor.known_for[0].original_title}
              </p>
            )}

            <div className="mt-1 flex items-center gap-1 text-[10px] text-amber-400 font-semibold bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
              <Star className="h-3 w-3 fill-amber-400" />
              <span>{Math.round(actor.popularity)} Score</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
