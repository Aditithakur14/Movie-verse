import React, { useState } from 'react';
import { Film, Clapperboard, Loader2 } from 'lucide-react';
import { Genre, Movie } from '../types/tmdb';
import { tmdbService } from '../services/tmdbApi';
import { MovieCard } from './MovieCard';

interface PopularGenresProps {
  genres: Genre[];
  onSelectMovie: (movieId: number) => void;
  genreMap?: Record<number, string>;
}

export const PopularGenres: React.FC<PopularGenresProps> = ({
  genres,
  onSelectMovie,
  genreMap = {},
}) => {
  const [selectedGenre, setSelectedGenre] = useState<Genre | null>(null);
  const [movies, setMovies] = useState<Movie[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleGenreClick = async (genre: Genre) => {
    setSelectedGenre(genre);
    setIsLoading(true);
    try {
      const data = await tmdbService.getMoviesByGenre(genre.id);
      setMovies(data);
    } catch (err) {
      console.error('Error fetching genre movies:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section id="genres-section" className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8">
        <div className="inline-flex items-center gap-2 text-xs font-bold text-purple-400 uppercase tracking-widest mb-1.5">
          <Clapperboard className="h-4 w-4" />
          <span>Curated Categories</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
          Explore Popular Genres
        </h2>
        <p className="text-xs sm:text-sm text-gray-400 mt-1">
          Select a category to explore top movies rated by film lovers around the globe.
        </p>
      </div>

      {/* Genre Chips Grid */}
      <div className="flex flex-wrap gap-2.5 sm:gap-3">
        {genres.map((genre) => {
          const isSelected = selectedGenre?.id === genre.id;
          return (
            <button
              key={genre.id}
              onClick={() => handleGenreClick(genre)}
              id={`genre-chip-${genre.id}`}
              className={`rounded-xl px-4 py-2.5 text-xs sm:text-sm font-bold transition-all duration-200 border ${
                isSelected
                  ? 'bg-purple-600 border-purple-500 text-white shadow-lg glow-purple scale-105'
                  : 'bg-[#12151e] border-white/10 text-gray-300 hover:bg-white/10 hover:text-white hover:border-purple-500/30'
              }`}
            >
              {genre.name}
            </button>
          );
        })}
      </div>

      {/* Dynamic Genre Movies Shelf */}
      {selectedGenre && (
        <div className="mt-8 glass-panel rounded-2xl p-6 border border-white/10 animate-in fade-in duration-300">
          <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-6">
            <div>
              <h3 className="text-xl font-extrabold text-white">
                Top <span className="text-purple-400">{selectedGenre.name}</span> Movies
              </h3>
              <p className="text-xs text-gray-400">Discover top trending releases in this category</p>
            </div>

            <button
              onClick={() => setSelectedGenre(null)}
              className="text-xs font-semibold text-gray-400 hover:text-white bg-white/5 px-3 py-1.5 rounded-lg border border-white/10 transition-colors"
            >
              Close Genre
            </button>
          </div>

          {isLoading ? (
            <div className="flex justify-center items-center py-16">
              <Loader2 className="h-8 w-8 text-purple-500 animate-spin" />
            </div>
          ) : movies.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6">
              {movies.slice(0, 10).map((movie) => (
                <MovieCard
                  key={movie.id}
                  movie={movie}
                  onSelectMovie={onSelectMovie}
                  genreMap={genreMap}
                  className="w-full"
                />
              ))}
            </div>
          ) : (
            <p className="text-center py-8 text-sm text-gray-400">
              No movies found for this genre.
            </p>
          )}
        </div>
      )}
    </section>
  );
};
