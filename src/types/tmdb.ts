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
  free?: WatchProvider[];
  ads?: WatchProvider[];
  rent?: WatchProvider[];
  buy?: WatchProvider[];
}

export interface CrewMember {
  id: number;
  name: string;
  job: string;
  department: string;
  profile_path: string | null;
}

export interface ImageAsset {
  file_path: string;
  height: number;
  width: number;
  aspect_ratio: number;
  vote_average: number;
}

export interface ProductionCompany {
  id: number;
  name: string;
  logo_path: string | null;
  origin_country: string;
}

export interface ProductionCountry {
  iso_3166_1: string;
  name: string;
}

export interface SpokenLanguage {
  english_name?: string;
  iso_639_1: string;
  name: string;
}

export interface MovieDetails extends Movie {
  genres: Genre[];
  runtime: number;
  status: string;
  tagline: string | null;
  budget?: number;
  revenue?: number;
  original_language?: string;
  spoken_languages?: SpokenLanguage[];
  production_companies?: ProductionCompany[];
  production_countries?: ProductionCountry[];
  videos?: {
    results: Video[];
  };
  credits?: {
    cast: CastMember[];
    crew?: CrewMember[];
  };
  images?: {
    backdrops?: ImageAsset[];
    posters?: ImageAsset[];
  };
  recommendations?: {
    results: Movie[];
  };
  similar?: {
    results: Movie[];
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

export interface MovieCreditCastItem extends Movie {
  character: string;
  credit_id?: string;
  order?: number;
}

export interface MovieCreditCrewItem extends Movie {
  job: string;
  department: string;
  credit_id?: string;
}

export interface ActorDetails extends Actor {
  biography: string;
  birthday: string | null;
  place_of_birth: string | null;
  deathday: string | null;
  gender?: number; // 0: Not specified, 1: Female, 2: Male, 3: Non-binary
  movie_credits?: {
    cast: MovieCreditCastItem[];
    crew?: MovieCreditCrewItem[];
  };
  images?: {
    profiles: ImageAsset[];
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

