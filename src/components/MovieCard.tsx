import React from 'react';
import { Star, Bookmark, Check, Play, Info } from 'lucide-react';
import { Movie } from '../types/tmdb';
import { getImageUrl } from '../services/tmdbApi';
import { useWatchlist } from '../context/WatchlistContext';

interface MovieCardProps {
  movie: Movie;
  onSelectMovie: (movieId: number) => void;
  className?: string;
  genreMap?: Record<number, string>;
}

export const MovieCard: React.FC<MovieCardProps> = ({
  movie,
  onSelectMovie,
  className = '',
  genreMap = {},
}) => {
  const { isInWatchlist, toggleWatchlist } = useWatchlist();
  const inWatchlist = isInWatchlist(movie.id);

  const releaseYear = movie.release_date ? movie.release_date.split('-')[0] : 'N/A';
  const rating = movie.vote_average ? movie.vote_average.toFixed(1) : 'NR';

  const genres = movie.genre_ids
    ?.slice(0, 2)
    .map((id) => genreMap[id])
    .filter(Boolean);

  const handleWatchlistClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleWatchlist(movie);
  };

  return (
    <div
      onClick={() => onSelectMovie(movie.id)}
      id={`movie-card-${movie.id}`}
      className={`group relative flex-none w-48 sm:w-56 cursor-pointer rounded-xl bg-[#12151e] border border-white/5 overflow-hidden transition-all duration-300 hover:-translate-y-2 hover:border-red-500/30 hover:shadow-2xl hover:shadow-red-950/20 movie-card-shadow ${className}`}
    >
      {/* Poster Image Container */}
      <div className="relative aspect-[2/3] w-full overflow-hidden bg-[#181d2a]">
        <img
          src={getImageUrl(movie.poster_path, 'w500')}
          alt={movie.title}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
        />

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#12151e] via-transparent to-black/30 opacity-80 group-hover:opacity-90 transition-opacity" />

        {/* Top Badges */}
        <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between pointer-events-none">
          {/* Rating Badge */}
          <div className="flex items-center gap-1 rounded-md bg-black/70 px-2 py-1 text-xs font-semibold text-amber-400 backdrop-blur-md border border-amber-400/20">
            <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
            <span>{rating}</span>
          </div>

          {/* Watchlist Toggle Button */}
          <button
            onClick={handleWatchlistClick}
            title={inWatchlist ? 'Remove from Watchlist' : 'Add to Watchlist'}
            className={`pointer-events-auto flex h-8 w-8 items-center justify-center rounded-full backdrop-blur-md transition-all duration-200 ${
              inWatchlist
                ? 'bg-red-600 text-white shadow-lg shadow-red-600/40'
                : 'bg-black/60 text-white/80 hover:bg-red-600 hover:text-white hover:scale-110'
            }`}
          >
            {inWatchlist ? <Check className="h-4 w-4" /> : <Bookmark className="h-4 w-4" />}
          </button>
        </div>

        {/* Quick View Hover Action Overlay */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-black/40 backdrop-blur-[2px]">
          <div className="flex items-center gap-2 rounded-full bg-red-600 px-4 py-2 text-xs font-bold text-white shadow-lg glow-red transition-transform duration-300 group-hover:scale-105">
            <Play className="h-3.5 w-3.5 fill-current" />
            <span>Quick View</span>
          </div>
        </div>
      </div>

      {/* Content Meta */}
      <div className="p-3.5">
        <h3 className="line-clamp-1 text-sm font-semibold text-gray-100 group-hover:text-red-400 transition-colors">
          {movie.title}
        </h3>

        <div className="mt-1.5 flex items-center justify-between text-xs text-gray-400">
          <span>{releaseYear}</span>
          {genres && genres.length > 0 && (
            <span className="line-clamp-1 max-w-[110px] text-right text-gray-400">
              {genres.join(' • ')}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
