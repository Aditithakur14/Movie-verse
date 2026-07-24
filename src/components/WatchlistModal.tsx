import React from 'react';
import { X, Trash2, Bookmark, Film, Star, Play, Check } from 'lucide-react';
import { useWatchlist } from '../context/WatchlistContext';
import { getImageUrl } from '../services/tmdbApi';

interface WatchlistModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectMovie: (movieId: number) => void;
}

export const WatchlistModal: React.FC<WatchlistModalProps> = ({
  isOpen,
  onClose,
  onSelectMovie,
}) => {
  const { watchlist, removeFromWatchlist, clearWatchlist } = useWatchlist();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="fixed inset-0" onClick={onClose} />

      {/* Drawer Container */}
      <div className="relative z-10 h-full w-full max-w-md bg-[#0d0f17] border-l border-white/10 p-6 shadow-2xl flex flex-col justify-between overflow-hidden">
        {/* Header */}
        <div>
          <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-6">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-red-600/20 text-red-500 border border-red-500/30">
                <Bookmark className="h-5 w-5 fill-current" />
              </div>
              <div>
                <h2 className="text-lg font-extrabold text-white">Your Watchlist</h2>
                <p className="text-xs text-gray-400">{watchlist.length} movies saved</p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="flex h-9 w-9 items-center justify-center rounded-full bg-white/5 hover:bg-white/10 text-gray-300 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Watchlist Movies List */}
          <div className="overflow-y-auto max-h-[70vh] space-y-3 no-scrollbar pr-1">
            {watchlist.length > 0 ? (
              watchlist.map((movie) => (
                <div
                  key={movie.id}
                  onClick={() => {
                    onClose();
                    onSelectMovie(movie.id);
                  }}
                  className="group cursor-pointer flex items-center justify-between rounded-xl bg-white/5 p-3 border border-white/5 hover:border-red-500/40 hover:bg-white/10 transition-all"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <img
                      src={getImageUrl(movie.poster_path, 'w185')}
                      alt={movie.title}
                      className="h-16 w-12 rounded-lg object-cover border border-white/10"
                    />

                    <div className="min-w-0">
                      <h3 className="text-sm font-bold text-white group-hover:text-red-400 transition-colors truncate">
                        {movie.title}
                      </h3>

                      <div className="flex items-center gap-2 mt-1 text-xs text-gray-400">
                        <span>{movie.release_date ? movie.release_date.split('-')[0] : 'N/A'}</span>
                        <span className="text-amber-400 font-semibold">
                          ⭐ {movie.vote_average ? movie.vote_average.toFixed(1) : 'NR'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Remove Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      removeFromWatchlist(movie.id);
                    }}
                    title="Remove from Watchlist"
                    className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-600/10 hover:bg-red-600 text-red-400 hover:text-white transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))
            ) : (
              <div className="text-center py-16 text-gray-400 space-y-3">
                <Film className="h-12 w-12 mx-auto text-gray-600 mb-2" />
                <p className="text-base font-bold text-gray-300">Your Watchlist is Empty</p>
                <p className="text-xs text-gray-400 max-w-xs mx-auto">
                  Click the bookmark icon on any movie card or hero banner to save titles for later.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        {watchlist.length > 0 && (
          <div className="border-t border-white/10 pt-4 flex items-center justify-between">
            <button
              onClick={clearWatchlist}
              className="text-xs font-semibold text-gray-400 hover:text-red-400 transition-colors"
            >
              Clear All Watchlist
            </button>

            <button
              onClick={onClose}
              className="rounded-xl bg-red-600 px-4 py-2 text-xs font-bold text-white shadow-lg"
            >
              Done
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
