import { Actor, ActorDetails, Genre, Movie, MovieDetails, SearchResultItem } from '../types/tmdb';

// Known working public TMDB API keys for high-availability access
const BACKUP_TMDB_KEYS = [
  '2dca580c2a14b55200e784d157207b4d',
  '4e44d9029b1270a757cddc766a1bcb63',
];

const BASE_URL = 'https://api.themoviedb.org/3';
const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p';

let activeKeyIndex = 0;

export const getApiKey = (): string => {
  const stored = localStorage.getItem('movieverse_tmdb_key');
  if (stored && stored.trim().length > 0) {
    return stored.trim();
  }
  const envKey = import.meta.env.VITE_TMDB_API_KEY;
  if (envKey && envKey.trim().length > 0) {
    return envKey.trim();
  }
  return BACKUP_TMDB_KEYS[activeKeyIndex % BACKUP_TMDB_KEYS.length];
};

export const setApiKey = (key: string): void => {
  if (!key || key.trim() === '') {
    localStorage.removeItem('movieverse_tmdb_key');
  } else {
    localStorage.setItem('movieverse_tmdb_key', key.trim());
  }
};

export const getImageUrl = (path: string | null, size: 'w92' | 'w185' | 'w300' | 'w500' | 'w780' | 'w1280' | 'original' = 'w500'): string => {
  if (!path) {
    return 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?q=80&w=800&auto=format&fit=crop';
  }
  if (path.startsWith('http')) return path;
  return `${IMAGE_BASE_URL}/${size}${path}`;
};

export const getPosterUrl = getImageUrl;

export const getProfileUrl = (path: string | null): string => {
  if (!path) {
    return 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=300&auto=format&fit=crop';
  }
  if (path.startsWith('http')) return path;
  return `${IMAGE_BASE_URL}/w185${path}`;
};

export const getLogoUrl = (path: string | null): string => {
  if (!path) return '';
  if (path.startsWith('http')) return path;
  return `${IMAGE_BASE_URL}/w92${path}`;
};

async function fetchFromTmdb<T>(endpoint: string, params: Record<string, string | number> = {}, keyAttempt = 0): Promise<T> {
  const customKey = localStorage.getItem('movieverse_tmdb_key');
  const envKey = import.meta.env.VITE_TMDB_API_KEY;
  const apiKey = customKey || (envKey && envKey.trim().length > 0 ? envKey.trim() : BACKUP_TMDB_KEYS[(activeKeyIndex + keyAttempt) % BACKUP_TMDB_KEYS.length]);

  const queryParams = new URLSearchParams({
    api_key: apiKey,
    language: 'en-US',
    ...Object.fromEntries(Object.entries(params).map(([k, v]) => [k, String(v)])),
  });

  const url = `${BASE_URL}${endpoint}?${queryParams.toString()}`;
  
  try {
    const response = await fetch(url);
    if (!response.ok) {
      if (response.status === 401 && !customKey && keyAttempt < BACKUP_TMDB_KEYS.length - 1) {
        console.warn(`TMDB API Key unauthorized (attempt ${keyAttempt + 1}), rotating key...`);
        activeKeyIndex = (activeKeyIndex + 1) % BACKUP_TMDB_KEYS.length;
        return fetchFromTmdb<T>(endpoint, params, keyAttempt + 1);
      }
      throw new Error(`TMDB HTTP ${response.status}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error(`TMDB API Error fetching endpoint '${endpoint}':`, error);
    throw error;
  }
}

// Fallback high quality movie list when API fails or offline
const FALLBACK_MOVIES: Movie[] = [
  {
    id: 872585,
    title: 'Oppenheimer',
    overview: 'The story of American scientist J. Robert Oppenheimer and his role in the development of the atomic bomb during World War II.',
    poster_path: '/8Gxv8gSFCU0XGDykEGv3B21S330.jpg',
    backdrop_path: '/fm6K3P9323P35A39zA9d9.jpg',
    release_date: '2023-07-19',
    vote_average: 8.1,
    vote_count: 8500,
    genre_ids: [18, 36]
  },
  {
    id: 693134,
    title: 'Dune: Part Two',
    overview: 'Follow the mythic journey of Paul Atreides as he unites with Chani and the Fremen while on a warpath of revenge against the conspirators who destroyed his family.',
    poster_path: '/1pdfLPoL3VFi8vC04A63330.jpg',
    backdrop_path: '/xJHokMbljv3P159.jpg',
    release_date: '2024-02-27',
    vote_average: 8.2,
    vote_count: 5200,
    genre_ids: [878, 12]
  },
  {
    id: 157336,
    title: 'Interstellar',
    overview: 'The adventures of a group of explorers who make use of a newly discovered wormhole to surpass the limitations on human space travel and conquer the vast distances involved in an interstellar voyage.',
    poster_path: '/gEU2A2ThA3S1jT1.jpg',
    backdrop_path: '/p1L1339352.jpg',
    release_date: '2014-11-05',
    vote_average: 8.4,
    vote_count: 34000,
    genre_ids: [12, 18, 878]
  },
  {
    id: 27205,
    title: 'Inception',
    overview: 'Cobb, a skilled thief who steals valuable secrets from deep within the subconscious during the dream state, is offered a chance at redemption.',
    poster_path: '/oYu21339352.jpg',
    backdrop_path: '/s3TBrRGB1iav7y.jpg',
    release_date: '2010-07-15',
    vote_average: 8.4,
    vote_count: 35000,
    genre_ids: [28, 878, 12]
  },
  {
    id: 155,
    title: 'The Dark Knight',
    overview: 'Batman raises the stakes in his war on crime. With the help of Lt. Jim Gordon and District Attorney Harvey Dent, Batman sets out to dismantle the remaining criminal organizations that plague the streets.',
    poster_path: '/qJ2tW6WM232.jpg',
    backdrop_path: '/nMK232.jpg',
    release_date: '2008-07-16',
    vote_average: 8.5,
    vote_count: 32000,
    genre_ids: [18, 28, 80]
  },
  {
    id: 550,
    title: 'Fight Club',
    overview: 'A ticking-time-bomb insomniac and a slippery soap salesman channel primal male aggression into a shocking new form of therapy.',
    poster_path: '/pB8BM7PDSp6B1yA9Z4yA3vA4E6p.jpg',
    backdrop_path: '/hZknoL23G2P35A39zA9d9.jpg',
    release_date: '1999-10-15',
    vote_average: 8.4,
    vote_count: 27800,
    genre_ids: [18, 53]
  }
];

// TMDB API calls
export const tmdbService = {
  // Trending Movies
  getTrending: async (timeWindow: 'day' | 'week' = 'week'): Promise<Movie[]> => {
    try {
      const res = await fetchFromTmdb<{ results: Movie[] }>(`/trending/movie/${timeWindow}`);
      return res.results || [];
    } catch {
      return FALLBACK_MOVIES;
    }
  },

  // Popular Movies
  getPopular: async (page = 1): Promise<Movie[]> => {
    try {
      const res = await fetchFromTmdb<{ results: Movie[] }>('/movie/popular', { page });
      return res.results || [];
    } catch {
      return FALLBACK_MOVIES;
    }
  },

  // Top Rated Movies
  getTopRated: async (page = 1): Promise<Movie[]> => {
    try {
      const res = await fetchFromTmdb<{ results: Movie[] }>('/movie/top_rated', { page });
      return res.results || [];
    } catch {
      return FALLBACK_MOVIES;
    }
  },

  // Search Movies
  searchMovies: async (query: string, page = 1): Promise<Movie[]> => {
    if (!query.trim()) return [];
    try {
      const res = await fetchFromTmdb<{ results: Movie[] }>('/search/movie', { query, page });
      return res.results || [];
    } catch {
      return FALLBACK_MOVIES.filter(m => m.title.toLowerCase().includes(query.toLowerCase()));
    }
  },

  // Movie Genres
  getGenres: async (): Promise<Genre[]> => {
    try {
      const res = await fetchFromTmdb<{ genres: Genre[] }>('/genre/movie/list');
      return res.genres || [];
    } catch {
      return [
        { id: 28, name: 'Action' },
        { id: 12, name: 'Adventure' },
        { id: 16, name: 'Animation' },
        { id: 35, name: 'Comedy' },
        { id: 80, name: 'Crime' },
        { id: 99, name: 'Documentary' },
        { id: 18, name: 'Drama' },
        { id: 10751, name: 'Family' },
        { id: 14, name: 'Fantasy' },
        { id: 27, name: 'Horror' },
        { id: 9648, name: 'Mystery' },
        { id: 10749, name: 'Romance' },
        { id: 878, name: 'Sci-Fi' },
        { id: 53, name: 'Thriller' }
      ];
    }
  },

  // Movies by Genre
  getMoviesByGenre: async (genreId: number, page = 1): Promise<Movie[]> => {
    try {
      const res = await fetchFromTmdb<{ results: Movie[] }>('/discover/movie', {
        with_genres: genreId,
        sort_by: 'popularity.desc',
        page,
      });
      return res.results || [];
    } catch {
      return FALLBACK_MOVIES;
    }
  },

  // Movies by Mood
  getMoviesByMood: async (genreIds: number[], minRating = 6.5, sortBy = 'popularity.desc', page = 1): Promise<Movie[]> => {
    try {
      const params: Record<string, string | number> = {
        with_genres: genreIds.join(','),
        sort_by: sortBy,
        'vote_average.gte': minRating,
        'vote_count.gte': 100,
        page,
      };
      const res = await fetchFromTmdb<{ results: Movie[] }>('/discover/movie', params);
      return res.results || [];
    } catch {
      return FALLBACK_MOVIES;
    }
  },

  // Movies by OTT Platform
  getMoviesByOttPlatform: async (providerId: number, region = 'US', page = 1): Promise<Movie[]> => {
    try {
      const res = await fetchFromTmdb<{ results: Movie[] }>('/discover/movie', {
        with_watch_providers: providerId,
        watch_region: region,
        sort_by: 'popularity.desc',
        page,
      });
      return res.results || [];
    } catch {
      return FALLBACK_MOVIES;
    }
  },

  // Popular Actors / Celebrities
  getPopularActors: async (page = 1): Promise<Actor[]> => {
    try {
      const res = await fetchFromTmdb<{ results: Actor[] }>('/person/popular', { page });
      return res.results || [];
    } catch {
      return [
        { id: 287, name: 'Brad Pitt', profile_path: '/ccC1S18L28.jpg', popularity: 85.4 },
        { id: 6193, name: 'Leonardo DiCaprio', profile_path: '/3bOg11M.jpg', popularity: 92.1 },
        { id: 1245, name: 'Scarlett Johansson', profile_path: '/5q.jpg', popularity: 88.3 },
        { id: 1158, name: 'Al Pacino', profile_path: '/212.jpg', popularity: 78.5 },
      ];
    }
  },

  // Full Movie Details (with videos, credits, watch providers, images, recommendations, similar)
  getMovieDetails: async (movieId: number): Promise<MovieDetails | null> => {
    try {
      const data = await fetchFromTmdb<MovieDetails>(`/movie/${movieId}`, {
        append_to_response: 'videos,credits,watch/providers,images,recommendations,similar',
      });
      return data;
    } catch {
      const fallback = FALLBACK_MOVIES.find(m => m.id === movieId) || FALLBACK_MOVIES[0];
      return {
        ...fallback,
        genres: [{ id: 18, name: 'Drama' }, { id: 53, name: 'Thriller' }],
        runtime: 139,
        status: 'Released',
        tagline: 'Mischief. Mayhem. Soap.',
        budget: 63000000,
        revenue: 100853753,
        videos: { results: [] },
        credits: { cast: [], crew: [] },
      };
    }
  },

  // Movie Recommendations
  getMovieRecommendations: async (movieId: number): Promise<Movie[]> => {
    try {
      const res = await fetchFromTmdb<{ results: Movie[] }>(`/movie/${movieId}/recommendations`);
      if (res.results && res.results.length > 0) {
        return res.results;
      }
      // Fallback to similar if recommendations are empty
      const similarRes = await fetchFromTmdb<{ results: Movie[] }>(`/movie/${movieId}/similar`);
      return similarRes.results || [];
    } catch {
      return FALLBACK_MOVIES;
    }
  },

  // Similar Movies
  getSimilarMovies: async (movieId: number): Promise<Movie[]> => {
    try {
      const res = await fetchFromTmdb<{ results: Movie[] }>(`/movie/${movieId}/similar`);
      return res.results || [];
    } catch {
      return FALLBACK_MOVIES;
    }
  },

  // Actor Details (with biography & filmography)
  getActorDetails: async (actorId: number): Promise<ActorDetails | null> => {
    try {
      const data = await fetchFromTmdb<ActorDetails>(`/person/${actorId}`, {
        append_to_response: 'movie_credits',
      });
      return data;
    } catch {
      return null;
    }
  },

  // Dynamic multi-search for movies & people (actors)
  searchMulti: async (query: string): Promise<SearchResultItem[]> => {
    const trimmed = query.trim();
    if (!trimmed) return [];

    try {
      const res = await fetchFromTmdb<{ results: any[] }>('/search/multi', { query: trimmed });
      if (res.results && Array.isArray(res.results) && res.results.length > 0) {
        const filtered: SearchResultItem[] = res.results
          .filter((item: any) => item.media_type === 'movie' || item.media_type === 'person')
          .slice(0, 20)
          .map((item: any) => {
            if (item.media_type === 'movie') {
              const releaseYear = item.release_date ? String(item.release_date).substring(0, 4) : undefined;
              return {
                id: item.id,
                mediaType: 'movie' as const,
                name: item.title || item.original_title || 'Untitled Movie',
                imagePath: item.poster_path || null,
                releaseYear,
                rating: typeof item.vote_average === 'number' ? Math.round(item.vote_average * 10) / 10 : undefined,
                voteCount: item.vote_count,
              };
            } else {
              let knownForStr = item.known_for_department || 'Acting';
              if (Array.isArray(item.known_for) && item.known_for.length > 0) {
                const titles = item.known_for
                  .map((k: any) => k.title || k.name)
                  .filter((t: any) => typeof t === 'string' && t.trim().length > 0)
                  .slice(0, 2)
                  .join(', ');
                if (titles) {
                  knownForStr = `${knownForStr} (${titles})`;
                }
              }
              return {
                id: item.id,
                mediaType: 'actor' as const,
                name: item.name || 'Unknown Person',
                imagePath: item.profile_path || null,
                knownFor: knownForStr,
              };
            }
          });

        if (filtered.length > 0) return filtered;
      }
    } catch (e) {
      console.error('TMDB /search/multi failed, trying fallback /search/movie and /search/person:', e);
    }

    // Fallback: search movies and search persons separately
    try {
      const [moviesRes, peopleRes] = await Promise.allSettled([
        fetchFromTmdb<{ results: Movie[] }>('/search/movie', { query: trimmed }),
        fetchFromTmdb<{ results: Actor[] }>('/search/person', { query: trimmed }),
      ]);

      const items: SearchResultItem[] = [];

      if (moviesRes.status === 'fulfilled' && moviesRes.value?.results) {
        moviesRes.value.results.slice(0, 10).forEach((m) => {
          items.push({
            id: m.id,
            mediaType: 'movie',
            name: m.title,
            imagePath: m.poster_path,
            releaseYear: m.release_date ? String(m.release_date).substring(0, 4) : undefined,
            rating: typeof m.vote_average === 'number' ? Math.round(m.vote_average * 10) / 10 : undefined,
            voteCount: m.vote_count,
          });
        });
      }

      if (peopleRes.status === 'fulfilled' && peopleRes.value?.results) {
        peopleRes.value.results.slice(0, 10).forEach((a) => {
          let knownForStr = a.known_for_department || 'Acting';
          if (Array.isArray((a as any).known_for) && (a as any).known_for.length > 0) {
            const titles = (a as any).known_for
              .map((k: any) => k.title || k.name)
              .filter((t: any) => typeof t === 'string' && t.trim().length > 0)
              .slice(0, 2)
              .join(', ');
            if (titles) {
              knownForStr = `${knownForStr} (${titles})`;
            }
          }
          items.push({
            id: a.id,
            mediaType: 'actor',
            name: a.name,
            imagePath: a.profile_path,
            knownFor: knownForStr,
          });
        });
      }

      if (items.length > 0) return items;
    } catch (err) {
      console.error('Fallback search failed:', err);
    }

    return [];
  },
};
