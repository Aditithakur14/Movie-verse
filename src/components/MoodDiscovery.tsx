import React, { useState } from 'react';
import { Smile, Zap, Heart, Ghost, Users, Brain, Sparkles, Loader2 } from 'lucide-react';
import { MoodOption, Movie } from '../types/tmdb';
import { tmdbService } from '../services/tmdbApi';
import { MovieCard } from './MovieCard';

const MOODS: MoodOption[] = [
  {
    id: 'feel-good',
    name: 'Feel Good',
    tagline: 'Laughter, uplifting stories & warmth',
    emoji: '😃',
    iconName: 'Smile',
    bgGradient: 'from-amber-500/20 via-orange-500/10 to-transparent',
    borderGlow: 'hover:border-amber-500/40 hover:shadow-amber-500/10',
    genreIds: [35, 10751, 16], // Comedy, Family, Animation
    minRating: 6.8,
  },
  {
    id: 'action-night',
    name: 'Action Night',
    tagline: 'Adrenaline, explosions & high-stakes',
    emoji: '⚡',
    iconName: 'Zap',
    bgGradient: 'from-red-600/20 via-red-900/10 to-transparent',
    borderGlow: 'hover:border-red-500/40 hover:shadow-red-500/10',
    genreIds: [28, 53, 12], // Action, Thriller, Adventure
    minRating: 6.5,
  },
  {
    id: 'romantic',
    name: 'Romantic',
    tagline: 'Love stories, passion & emotional journeys',
    emoji: '💕',
    iconName: 'Heart',
    bgGradient: 'from-pink-500/20 via-rose-500/10 to-transparent',
    borderGlow: 'hover:border-pink-500/40 hover:shadow-pink-500/10',
    genreIds: [10749, 18], // Romance, Drama
    minRating: 6.8,
  },
  {
    id: 'horror',
    name: 'Horror',
    tagline: 'Chills, jumpscares & psychological dread',
    emoji: '😱',
    iconName: 'Ghost',
    bgGradient: 'from-purple-900/30 via-indigo-950/20 to-transparent',
    borderGlow: 'hover:border-purple-500/40 hover:shadow-purple-500/10',
    genreIds: [27, 9648], // Horror, Mystery
    minRating: 6.0,
  },
  {
    id: 'family-time',
    name: 'Family Time',
    tagline: 'Wholesome adventures for everyone',
    emoji: '🍿',
    iconName: 'Users',
    bgGradient: 'from-emerald-500/20 via-teal-500/10 to-transparent',
    borderGlow: 'hover:border-emerald-500/40 hover:shadow-emerald-500/10',
    genreIds: [10751, 16, 14], // Family, Animation, Fantasy
    minRating: 6.8,
  },
  {
    id: 'mind-bending',
    name: 'Mind Bending',
    tagline: 'Plot twists, sci-fi concepts & paradoxes',
    emoji: '🤯',
    iconName: 'Brain',
    bgGradient: 'from-cyan-500/20 via-blue-500/10 to-transparent',
    borderGlow: 'hover:border-cyan-500/40 hover:shadow-cyan-500/10',
    genreIds: [878, 9648, 53], // Sci-Fi, Mystery, Thriller
    minRating: 7.0,
  },
];

interface MoodDiscoveryProps {
  onSelectMovie: (movieId: number) => void;
  genreMap?: Record<number, string>;
}

export const MoodDiscovery: React.FC<MoodDiscoveryProps> = ({ onSelectMovie, genreMap = {} }) => {
  const [selectedMood, setSelectedMood] = useState<MoodOption | null>(null);
  const [moodMovies, setMoodMovies] = useState<Movie[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const renderIcon = (iconName: string) => {
    switch (iconName) {
      case 'Smile':
        return <Smile className="h-6 w-6 text-amber-400" />;
      case 'Zap':
        return <Zap className="h-6 w-6 text-red-400" />;
      case 'Heart':
        return <Heart className="h-6 w-6 text-pink-400" />;
      case 'Ghost':
        return <Ghost className="h-6 w-6 text-purple-400" />;
      case 'Users':
        return <Users className="h-6 w-6 text-emerald-400" />;
      case 'Brain':
        return <Brain className="h-6 w-6 text-cyan-400" />;
      default:
        return <Sparkles className="h-6 w-6 text-amber-400" />;
    }
  };

  const handleMoodClick = async (mood: MoodOption) => {
    setSelectedMood(mood);
    setIsLoading(true);
    try {
      const movies = await tmdbService.getMoviesByMood(mood.genreIds, mood.minRating);
      setMoodMovies(movies);
    } catch (err) {
      console.error('Error fetching mood movies:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section id="mood-discovery" className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
      {/* Section Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
        <div>
          <div className="inline-flex items-center gap-2 text-xs font-bold text-red-500 uppercase tracking-widest mb-2">
            <Sparkles className="h-4 w-4" />
            <span>AI & Genre Guided</span>
          </div>
          <h2 className="text-3xl font-black text-white tracking-tight">
            How Are You Feeling Tonight?
          </h2>
          <p className="text-sm text-gray-400 mt-1">
            Select a mood to immediately discover hand-picked blockbusters matching your state of mind.
          </p>
        </div>
      </div>

      {/* Mood Grid Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5 sm:gap-4">
        {MOODS.map((mood) => {
          const isSelected = selectedMood?.id === mood.id;
          return (
            <div
              key={mood.id}
              onClick={() => handleMoodClick(mood)}
              id={`mood-card-${mood.id}`}
              className={`relative cursor-pointer rounded-2xl p-4 sm:p-5 border transition-all duration-300 group ${
                isSelected
                  ? 'bg-gradient-to-b from-red-600/30 to-black border-red-500 shadow-xl shadow-red-600/20 scale-[1.02]'
                  : `bg-[#12151e] border-white/5 bg-gradient-to-b ${mood.bgGradient} ${mood.borderGlow} hover:-translate-y-1`
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-2xl sm:text-3xl">{mood.emoji}</span>
                <div className="p-2 rounded-xl bg-black/40 border border-white/10">
                  {renderIcon(mood.iconName)}
                </div>
              </div>

              <h3 className="text-base font-bold text-white group-hover:text-red-400 transition-colors">
                {mood.name}
              </h3>

              <p className="line-clamp-2 text-[11px] text-gray-400 mt-1 font-medium leading-tight">
                {mood.tagline}
              </p>
            </div>
          );
        })}
      </div>

      {/* Dynamic Mood Movie Results */}
      {selectedMood && (
        <div className="mt-8 glass-panel rounded-2xl p-6 border border-white/10 animate-in fade-in duration-300">
          <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-6">
            <div className="flex items-center gap-3">
              <span className="text-2xl">{selectedMood.emoji}</span>
              <div>
                <h3 className="text-xl font-extrabold text-white">
                  Top Picks for <span className="text-red-500">{selectedMood.name}</span>
                </h3>
                <p className="text-xs text-gray-400">{selectedMood.tagline}</p>
              </div>
            </div>

            <button
              onClick={() => setSelectedMood(null)}
              className="text-xs font-semibold text-gray-400 hover:text-white bg-white/5 px-3 py-1.5 rounded-lg border border-white/10 transition-colors"
            >
              Close Mood
            </button>
          </div>

          {isLoading ? (
            <div className="flex justify-center items-center py-16">
              <Loader2 className="h-8 w-8 text-red-500 animate-spin" />
            </div>
          ) : moodMovies.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6">
              {moodMovies.slice(0, 10).map((movie) => (
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
              No movies matched this mood right now. Please try another mood!
            </p>
          )}
        </div>
      )}
    </section>
  );
};
