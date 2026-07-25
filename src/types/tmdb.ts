export interface Movie {
  id: number;
  title: string;
  original_title?: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  release_date: string;
  vote_average: number;
  vote_count: number;
  genre_ids?: number[];
  popularity?: number;
  adult?: boolean;
}

export interface Genre {
  id: number;
  name: string;
}

export interface Video {
  id: string;
  key: string;
  name: string;
  site: string;
  type: string;
  official: boolean;
}

export interface CastMember {
  id: number;
  name: string;
  character: string;
  profile_path: string | null;
  order: number;
}

export interface WatchProvider {
  provider_id: number;
  provider_name: string;
  logo_path: string | null;
  display_priority?: number;
}

export interface MovieWatchProviders {
  link?: string;
  flatrate?: WatchProvider[];
  rent?: WatchProvider[];
  buy?: WatchProvider[];
}

export interface MovieDetails extends Movie {
  genres: Genre[];
  runtime: number;
  status: string;
  tagline: string | null;
  budget?: number;
  revenue?: number;
  videos?: {
    results: Video[];
  };
  credits?: {
    cast: CastMember[];
  };
  'watch/providers'?: {
    results: {
      [key: string]: MovieWatchProviders;
    };
  };
}

export interface Actor {
  id: number;
  name: string;
  profile_path: string | null;
  popularity: number;
  known_for_department?: string;
  known_for?: Movie[];
}

export interface ActorDetails extends Actor {
  biography: string;
  birthday: string | null;
  place_of_birth: string | null;
  deathday: string | null;
  movie_credits?: {
    cast: (Movie & { character: string })[];
  };
}

export interface MoodOption {
  id: string;
  name: string;
  tagline: string;
  emoji: string;
  iconName: string;
  bgGradient: string;
  borderGlow: string;
  genreIds: number[];
  sortBy?: string;
  minRating?: number;
}

export interface OttPlatform {
  id: string;
  name: string;
  providerId: number;
  logoUrl?: string;
  color: string;
  badgeBg: string;
  description: string;
}

export interface SearchResultItem {
  id: number;
  mediaType: 'movie' | 'actor';
  name: string;
  imagePath: string | null;
  releaseYear?: string;
  rating?: number;
  knownFor?: string;
  voteCount?: number;
}

