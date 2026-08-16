import { Actor, ActorDetails, Genre, Movie, MovieCreditCastItem, MovieCreditCrewItem, MovieDetails, MovieFilterParams, MovieWatchProviders, SearchResultItem, WatchProvider } from '../types/tmdb';
import { getCinemaById } from '../data/cinemas';

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

async function fetchFromTmdb<T>(
  endpoint: string,
  params: Record<string, string | number | boolean | undefined | null> = {},
  keyAttempt = 0
): Promise<T> {
  const customKey = localStorage.getItem('movieverse_tmdb_key');
  const envKey = import.meta.env.VITE_TMDB_API_KEY;
  const apiKey =
    customKey ||
    (envKey && envKey.trim().length > 0
      ? envKey.trim()
      : BACKUP_TMDB_KEYS[(activeKeyIndex + keyAttempt) % BACKUP_TMDB_KEYS.length]);

  const cleanEntries: [string, string][] = Object.entries(params)
    .filter(([, v]) => v !== undefined && v !== null)
    .map(([k, v]) => [k, String(v)]);

  const queryParams = new URLSearchParams({
    api_key: apiKey,
    language: 'en-US',
    ...Object.fromEntries(cleanEntries),
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

  // Actor Details (with biography, filmography & profile images)
  getActorDetails: async (actorId: number): Promise<ActorDetails | null> => {
    try {
      const data = await fetchFromTmdb<ActorDetails>(`/person/${actorId}`, {
        append_to_response: 'movie_credits,images',
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

  // Discover Movies by Cinema Category (Language + Region)
  getMoviesByCinema: async (
    languageCode: string,
    countryCode?: string,
    sortBy: 'popular' | 'top_rated' | 'newest' | 'upcoming' = 'popular',
    year?: number | null,
    page = 1
  ): Promise<{ results: Movie[]; totalPages: number; totalResults: number }> => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const params: Record<string, string | number> = {
        page,
        with_original_language: languageCode,
      };

      if (countryCode) {
        params.with_origin_country = countryCode;
      }

      if (sortBy === 'popular') {
        params.sort_by = 'popularity.desc';
      } else if (sortBy === 'top_rated') {
        params.sort_by = 'vote_average.desc';
        params['vote_count.gte'] = 20;
      } else if (sortBy === 'newest') {
        params.sort_by = 'primary_release_date.desc';
        params['primary_release_date.lte'] = today;
      } else if (sortBy === 'upcoming') {
        params.sort_by = 'primary_release_date.asc';
        params['primary_release_date.gte'] = today;
      }

      if (year && !isNaN(year)) {
        params.primary_release_year = year;
      }

      let res = await fetchFromTmdb<{
        results: Movie[];
        total_pages: number;
        total_results: number;
      }>('/discover/movie', params);

      // Smart fallback: if strictly specifying origin_country returned 0 results, retry without origin_country
      if ((!res.results || res.results.length === 0) && countryCode) {
        delete params.with_origin_country;
        res = await fetchFromTmdb<{
          results: Movie[];
          total_pages: number;
          total_results: number;
        }>('/discover/movie', params);
      }

      return {
        results: res.results || [],
        totalPages: res.total_pages || 1,
        totalResults: res.total_results || 0,
      };
    } catch (error) {
      console.error('Error fetching movies by cinema:', error);
      return {
        results: FALLBACK_MOVIES,
        totalPages: 1,
        totalResults: FALLBACK_MOVIES.length,
      };
    }
  },

  // Discover Movies by Genre with advanced filtering (Sort, Year, Language, Pagination)
  getMoviesByGenreAdvanced: async (
    genreId: number,
    sortBy: 'popular' | 'top_rated' | 'newest' | 'oldest' | 'upcoming' = 'popular',
    year?: number | null,
    languageCode?: string | null,
    page = 1
  ): Promise<{ results: Movie[]; totalPages: number; totalResults: number }> => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const params: Record<string, string | number> = {
        with_genres: genreId,
        page,
      };

      if (sortBy === 'popular') {
        params.sort_by = 'popularity.desc';
      } else if (sortBy === 'top_rated') {
        params.sort_by = 'vote_average.desc';
        params['vote_count.gte'] = 50;
      } else if (sortBy === 'newest') {
        params.sort_by = 'primary_release_date.desc';
        params['primary_release_date.lte'] = today;
      } else if (sortBy === 'oldest') {
        params.sort_by = 'primary_release_date.asc';
        params['primary_release_date.gte'] = '1900-01-01';
      } else if (sortBy === 'upcoming') {
        params.sort_by = 'primary_release_date.asc';
        params['primary_release_date.gte'] = today;
      }

      if (year && !isNaN(year)) {
        params.primary_release_year = year;
      }

      if (languageCode && languageCode.trim().length > 0) {
        params.with_original_language = languageCode.trim();
      }

      const res = await fetchFromTmdb<{
        results: Movie[];
        total_pages: number;
        total_results: number;
      }>('/discover/movie', params);

      return {
        results: res.results || [],
        totalPages: res.total_pages || 1,
        totalResults: res.total_results || 0,
      };
    } catch (error) {
      console.error('Error fetching movies by genre:', error);
      return {
        results: FALLBACK_MOVIES.filter((m) => m.genre_ids?.includes(genreId)) || FALLBACK_MOVIES,
        totalPages: 1,
        totalResults: FALLBACK_MOVIES.length,
      };
    }
  },

  // Fetch watch providers for a specific movie directly
  getMovieWatchProviders: async (movieId: number): Promise<Record<string, MovieWatchProviders>> => {
    try {
      const res = await fetchFromTmdb<{ results: Record<string, MovieWatchProviders> }>(
        `/movie/${movieId}/watch/providers`
      );
      return res.results || {};
    } catch (error) {
      console.error(`Error fetching watch providers for movie #${movieId}:`, error);
      return {};
    }
  },

  // Fetch available watch providers in a region
  getWatchProvidersByRegion: async (region = 'IN'): Promise<WatchProvider[]> => {
    try {
      const res = await fetchFromTmdb<{ results: WatchProvider[] }>(
        '/watch/providers/movie',
        { watch_region: region }
      );
      return res.results || [];
    } catch (error) {
      console.error(`Error fetching watch providers for region ${region}:`, error);
      return [];
    }
  },

  // Discover movies by OTT platform with advanced filters (Region, Sort, Genre, Release Year, Pagination)
  getMoviesByOttPlatformAdvanced: async (
    providerId: number,
    region = 'IN',
    sortBy: 'popular' | 'top_rated' | 'newest' | 'upcoming' = 'popular',
    genreId?: number | null,
    year?: number | null,
    page = 1
  ): Promise<{ results: Movie[]; totalPages: number; totalResults: number }> => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const params: Record<string, string | number> = {
        with_watch_providers: providerId,
        watch_region: region,
        page,
      };

      if (sortBy === 'popular') {
        params.sort_by = 'popularity.desc';
      } else if (sortBy === 'top_rated') {
        params.sort_by = 'vote_average.desc';
        params['vote_count.gte'] = 20;
      } else if (sortBy === 'newest') {
        params.sort_by = 'primary_release_date.desc';
        params['primary_release_date.lte'] = today;
      } else if (sortBy === 'upcoming') {
        params.sort_by = 'primary_release_date.asc';
        params['primary_release_date.gte'] = today;
      }

      if (genreId && !isNaN(genreId)) {
        params.with_genres = genreId;
      }

      if (year && !isNaN(year)) {
        params.primary_release_year = year;
      }

      const res = await fetchFromTmdb<{
        results: Movie[];
        total_pages: number;
        total_results: number;
      }>('/discover/movie', params);

      return {
        results: res.results || [],
        totalPages: res.total_pages || 1,
        totalResults: res.total_results || 0,
      };
    } catch (error) {
      console.error(`Error discovering movies for OTT provider #${providerId}:`, error);
      return {
        results: FALLBACK_MOVIES,
        totalPages: 1,
        totalResults: FALLBACK_MOVIES.length,
      };
    }
  },

  // Search Actors / People
  searchActors: async (query: string, page = 1): Promise<Actor[]> => {
    const trimmed = query.trim();
    if (!trimmed) return [];
    try {
      const res = await fetchFromTmdb<{ results: any[] }>('/search/person', { query: trimmed, page });
      if (res.results && Array.isArray(res.results)) {
        return res.results.map((item) => {
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
            name: item.name || 'Unknown Actor',
            profile_path: item.profile_path || null,
            popularity: item.popularity || 0,
            known_for_department: knownForStr,
            known_for: item.known_for,
          };
        });
      }
      return [];
    } catch (error) {
      console.error('Error searching actors:', error);
      return [];
    }
  },

  // Get person movie credits
  getPersonMovieCredits: async (
    personId: number
  ): Promise<{ cast: MovieCreditCastItem[]; crew: MovieCreditCrewItem[] }> => {
    try {
      const data = await fetchFromTmdb<{
        cast: MovieCreditCastItem[];
        crew: MovieCreditCrewItem[];
      }>(`/person/${personId}/movie_credits`);
      return {
        cast: data.cast || [],
        crew: data.crew || [],
      };
    } catch (error) {
      console.error(`Error fetching movie credits for person #${personId}:`, error);
      return { cast: [], crew: [] };
    }
  },

  // Find movies where BOTH actors appear (Actor x Actor discovery)
  findSharedMovies: async (actor1Id: number, actor2Id: number): Promise<Movie[]> => {
    try {
      // 1. Fetch credits for both actors concurrently
      const [actor1Credits, actor2Credits] = await Promise.all([
        tmdbService.getPersonMovieCredits(actor1Id),
        tmdbService.getPersonMovieCredits(actor2Id),
      ]);

      // Map actor 1's movies by ID
      const actor1MovieMap = new Map<number, MovieCreditCastItem>();
      (actor1Credits.cast || []).forEach((m) => {
        if (m && m.id) {
          actor1MovieMap.set(m.id, m);
        }
      });

      // Find intersection in actor 2's movies
      const sharedMap = new Map<number, Movie>();
      (actor2Credits.cast || []).forEach((m2) => {
        if (m2 && m2.id && actor1MovieMap.has(m2.id)) {
          const m1 = actor1MovieMap.get(m2.id)!;
          sharedMap.set(m2.id, {
            id: m2.id,
            title: m2.title || m1.title || 'Untitled Movie',
            original_title: m2.original_title || m1.original_title,
            overview: m2.overview || m1.overview || '',
            poster_path: m2.poster_path || m1.poster_path,
            backdrop_path: m2.backdrop_path || m1.backdrop_path,
            release_date: m2.release_date || m1.release_date || '',
            vote_average: m2.vote_average || m1.vote_average || 0,
            vote_count: m2.vote_count || m1.vote_count || 0,
            genre_ids: m2.genre_ids || m1.genre_ids || [],
            popularity: Math.max(m2.popularity || 0, m1.popularity || 0),
          });
        }
      });

      // Also query TMDB discover with with_cast/with_people as a supplementary source
      try {
        const discoverRes = await fetchFromTmdb<{ results: Movie[] }>('/discover/movie', {
          with_cast: `${actor1Id},${actor2Id}`,
          sort_by: 'popularity.desc',
        });
        if (discoverRes.results && Array.isArray(discoverRes.results)) {
          discoverRes.results.forEach((m) => {
            if (m && m.id && !sharedMap.has(m.id)) {
              sharedMap.set(m.id, m);
            }
          });
        }
      } catch {
        // Ignore discover fallback error, person movie credits is the primary ground truth
      }

      const results = Array.from(sharedMap.values());
      // Sort by popularity / release date descending
      results.sort((a, b) => {
        const popDiff = (b.popularity || 0) - (a.popularity || 0);
        if (Math.abs(popDiff) > 1) return popDiff;
        const dateA = a.release_date ? new Date(a.release_date).getTime() : 0;
        const dateB = b.release_date ? new Date(b.release_date).getTime() : 0;
        return dateB - dateA;
      });

      return results;
    } catch (error) {
      console.error(`Error finding shared movies for actors ${actor1Id} & ${actor2Id}:`, error);
      return [];
    }
  },

  // Advanced Movie Search with Multi-Criteria Filtering
  advancedSearchMovies: async (
    filterParams: MovieFilterParams
  ): Promise<{ results: Movie[]; totalPages: number; totalResults: number }> => {
    try {
      const {
        query,
        genreId,
        languageCode,
        cinemaId,
        yearType = 'any',
        year,
        fromYear,
        toYear,
        minRating,
        maxRating,
        ottProviderId,
        ottRegion = 'IN',
        releaseStatus = 'all',
        sortBy = 'popular',
        page = 1,
      } = filterParams;

      const trimmedQuery = query ? query.trim() : '';

      // Check if user has active discover filters
      const hasAdvancedFilters = Boolean(
        genreId ||
        languageCode ||
        cinemaId ||
        (yearType === 'specific' && year) ||
        (yearType === 'range' && (fromYear || toYear)) ||
        (minRating !== null && minRating !== undefined && minRating > 0) ||
        (maxRating !== null && maxRating !== undefined && maxRating < 10) ||
        ottProviderId ||
        (releaseStatus && releaseStatus !== 'all') ||
        (sortBy && sortBy !== 'popular')
      );

      const today = new Date().toISOString().split('T')[0];

      // If user provided a text query without complex discover filters, use TMDB /search/movie
      if (trimmedQuery && !hasAdvancedFilters) {
        const res = await fetchFromTmdb<{
          results: Movie[];
          total_pages: number;
          total_results: number;
        }>('/search/movie', {
          query: trimmedQuery,
          page,
          include_adult: 'false',
        });

        return {
          results: res.results || [],
          totalPages: res.total_pages || 1,
          totalResults: res.total_results || 0,
        };
      }

      // Build TMDB /discover/movie parameters
      const params: Record<string, string | number | boolean> = {
        page,
        include_adult: false,
      };

      // 1. Genre filter
      if (genreId && !isNaN(genreId)) {
        params.with_genres = genreId;
      }

      // 2. Cinema or Language filter
      if (cinemaId) {
        const cinema = getCinemaById(cinemaId);
        if (cinema) {
          params.with_original_language = cinema.languageCode;
          if (cinema.countryCode === 'IN') {
            params.with_origin_country = 'IN';
          }
        }
      } else if (languageCode && languageCode.trim().length > 0) {
        params.with_original_language = languageCode.trim();
      }

      // 3. Release Year filter
      if (yearType === 'specific' && year && !isNaN(year)) {
        params.primary_release_year = year;
      } else if (yearType === 'range') {
        if (fromYear && !isNaN(fromYear)) {
          params['primary_release_date.gte'] = `${fromYear}-01-01`;
        }
        if (toYear && !isNaN(toYear)) {
          params['primary_release_date.lte'] = `${toYear}-12-31`;
        }
      } else if (year && !isNaN(year)) {
        params.primary_release_year = year;
      }

      // 4. Rating filters
      if (minRating !== null && minRating !== undefined && minRating > 0) {
        params['vote_average.gte'] = minRating;
        params['vote_count.gte'] = minRating >= 7 ? 20 : 10;
      }
      if (maxRating !== null && maxRating !== undefined && maxRating < 10) {
        params['vote_average.lte'] = maxRating;
      }

      // 5. OTT Watch Provider filter
      if (ottProviderId && !isNaN(ottProviderId)) {
        params.with_watch_providers = ottProviderId;
        params.watch_region = ottRegion || 'IN';
      }

      // 6. Release Status
      if (releaseStatus === 'released') {
        params['primary_release_date.lte'] = today;
      } else if (releaseStatus === 'upcoming') {
        params['primary_release_date.gte'] = today;
      } else if (releaseStatus === 'now_playing') {
        const d = new Date();
        d.setDate(d.getDate() - 45);
        params['primary_release_date.gte'] = d.toISOString().split('T')[0];
        params['primary_release_date.lte'] = today;
      }

      // 7. Sort By
      if (sortBy === 'popular') {
        params.sort_by = 'popularity.desc';
      } else if (sortBy === 'top_rated' || sortBy === 'highest_rated') {
        params.sort_by = 'vote_average.desc';
        if (!params['vote_count.gte']) {
          params['vote_count.gte'] = 50;
        }
      } else if (sortBy === 'newest') {
        params.sort_by = 'primary_release_date.desc';
        if (releaseStatus !== 'upcoming') {
          params['primary_release_date.lte'] = today;
        }
      } else if (sortBy === 'oldest') {
        params.sort_by = 'primary_release_date.asc';
        params['primary_release_date.gte'] = '1920-01-01';
      } else if (sortBy === 'most_voted') {
        params.sort_by = 'vote_count.desc';
      }

      // If user typed a query AND also configured filters:
      if (trimmedQuery) {
        const searchParams: Record<string, string | number | boolean> = {
          query: trimmedQuery,
          page,
          include_adult: false,
        };
        if (params.primary_release_year) {
          searchParams.primary_release_year = params.primary_release_year;
        }
        if (params.with_original_language) {
          searchParams.language = params.with_original_language;
        }

        const res = await fetchFromTmdb<{
          results: Movie[];
          total_pages: number;
          total_results: number;
        }>('/search/movie', searchParams);

        let filtered = res.results || [];
        if (genreId) {
          filtered = filtered.filter((m) => m.genre_ids?.includes(genreId));
        }
        if (minRating) {
          filtered = filtered.filter((m) => (m.vote_average || 0) >= minRating);
        }
        if (maxRating) {
          filtered = filtered.filter((m) => (m.vote_average || 0) <= maxRating);
        }

        return {
          results: filtered,
          totalPages: res.total_pages || 1,
          totalResults: filtered.length,
        };
      }

      // Query TMDB Discover API
      const res = await fetchFromTmdb<{
        results: Movie[];
        total_pages: number;
        total_results: number;
      }>('/discover/movie', params);

      return {
        results: res.results || [],
        totalPages: res.total_pages || 1,
        totalResults: res.total_results || 0,
      };
    } catch (error) {
      console.error('Error in advanced movie search:', error);
      return {
        results: [],
        totalPages: 0,
        totalResults: 0,
      };
    }
  },
};


