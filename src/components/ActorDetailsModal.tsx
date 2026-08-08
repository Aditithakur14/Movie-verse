import React, { useEffect, useState, useRef } from 'react';
import {
  X,
  Calendar,
  MapPin,
  Film,
  Star,
  Loader2,
  ArrowLeft,
  User,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Image as ImageIcon,
  Award,
  Clapperboard,
  BookOpen,
  Info,
  TrendingUp,
  AlertCircle,
  Share2,
  Check,
} from 'lucide-react';
import {
  ActorDetails,
  MovieCreditCastItem,
  MovieCreditCrewItem,
  Movie,
  ImageAsset,
} from '../types/tmdb';
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
  const [error, setError] = useState<string | null>(null);
  const [isBioExpanded, setIsBioExpanded] = useState(false);
  const [filmographySort, setFilmographySort] = useState<'newest' | 'oldest' | 'top_rated'>('newest');
  const [filmographyFilter, setFilmographyFilter] = useState<'all' | 'acting' | 'directing' | 'writing' | 'production'>('all');
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);

  // Fetch actor details on actorId change
  useEffect(() => {
    if (!actorId) {
      setActor(null);
      setError(null);
      return;
    }

    const fetchActorData = async () => {
      setIsLoading(true);
      setError(null);
      setIsBioExpanded(false);
      setFilmographyFilter('all');
      setFilmographySort('newest');
      setPreviewImage(null);

      if (containerRef.current) {
        containerRef.current.scrollTop = 0;
      }

      try {
        const data = await tmdbService.getActorDetails(actorId);
        if (!data || !data.name) {
          setError('Actor not found');
        } else {
          setActor(data);
        }
      } catch (err) {
        console.error('Error fetching actor details:', err);
        setError('Failed to load actor profile');
      } finally {
        setIsLoading(false);
      }
    };

    fetchActorData();
  }, [actorId]);

  // Keyboard navigation (Escape closes details view or lightbox)
  useEffect(() => {
    if (!actorId) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (previewImage) {
          setPreviewImage(null);
        } else {
          handleBack();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [actorId, previewImage]);

  const handleBack = () => {
    if (window.history.length > 1) {
      window.history.back();
    } else {
      onClose();
    }
  };

  const handleCopyLink = () => {
    const url = `${window.location.origin}/actor/${actorId}`;
    navigator.clipboard.writeText(url).then(() => {
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    });
  };

  if (!actorId) return null;

  // Helper functions for age & gender
  const calculateAge = (birthdayStr: string | null, deathdayStr: string | null) => {
    if (!birthdayStr) return null;
    const birthDate = new Date(birthdayStr);
    if (isNaN(birthDate.getTime())) return null;

    const endDate = deathdayStr ? new Date(deathdayStr) : new Date();
    if (isNaN(endDate.getTime())) return null;

    let age = endDate.getFullYear() - birthDate.getFullYear();
    const monthDiff = endDate.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && endDate.getDate() < birthDate.getDate())) {
      age--;
    }
    return age >= 0 ? age : null;
  };

  const getGenderLabel = (genderCode?: number) => {
    switch (genderCode) {
      case 1:
        return 'Female';
      case 2:
        return 'Male';
      case 3:
        return 'Non-binary';
      default:
        return 'Not specified';
    }
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return null;
    try {
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return dateStr;
      return date.toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  // Derive Hero Backdrop image from actor's top credited movie
  const castList = actor?.movie_credits?.cast || [];
  const crewList = actor?.movie_credits?.crew || [];

  const topMovieWithBackdrop = [...castList, ...crewList]
    .filter((m) => m.backdrop_path)
    .sort((a, b) => (b.vote_count || 0) - (a.vote_count || 0))[0];

  const backdropUrl = topMovieWithBackdrop
    ? getImageUrl(topMovieWithBackdrop.backdrop_path, 'original')
    : null;

  // Derive Known For Movies (top 8 popular cast movies)
  const knownForMovies = [...castList]
    .filter((m) => m.poster_path || m.title)
    .reduce((acc: MovieCreditCastItem[], current) => {
      const x = acc.find((item) => item.id === current.id);
      if (!x) {
        return acc.concat([current]);
      } else {
        return acc;
      }
    }, [])
    .sort((a, b) => (b.vote_count || 0) * (b.vote_average || 1) - (a.vote_count || 0) * (a.vote_average || 1))
    .slice(0, 8);

  // Compute Filmography department categories for filter tabs
  const actingCredits = castList;
  const directingCredits = crewList.filter(
    (c) => c.department === 'Directing' || c.job === 'Director'
  );
  const writingCredits = crewList.filter(
    (c) => c.department === 'Writing' || (c.job && c.job.toLowerCase().includes('writer'))
  );
  const productionCredits = crewList.filter(
    (c) => c.department === 'Production' || (c.job && c.job.toLowerCase().includes('producer'))
  );

  const availableFilters = [
    { id: 'all', label: 'All', count: castList.length + crewList.length },
    ...(actingCredits.length > 0 ? [{ id: 'acting', label: 'Acting', count: actingCredits.length }] : []),
    ...(directingCredits.length > 0 ? [{ id: 'directing', label: 'Directing', count: directingCredits.length }] : []),
    ...(writingCredits.length > 0 ? [{ id: 'writing', label: 'Writing', count: writingCredits.length }] : []),
    ...(productionCredits.length > 0 ? [{ id: 'production', label: 'Production', count: productionCredits.length }] : []),
  ];

  // Get filtered filmography items
  let filmographyItems: {
    id: number;
    title: string;
    poster_path: string | null;
    release_date?: string;
    vote_average?: number;
    vote_count?: number;
    role: string;
  }[] = [];

  if (filmographyFilter === 'acting') {
    filmographyItems = actingCredits.map((c) => ({
      id: c.id,
      title: c.title,
      poster_path: c.poster_path,
      release_date: c.release_date,
      vote_average: c.vote_average,
      vote_count: c.vote_count,
      role: c.character ? `as ${c.character}` : 'Cast',
    }));
  } else if (filmographyFilter === 'directing') {
    filmographyItems = directingCredits.map((c) => ({
      id: c.id,
      title: c.title,
      poster_path: c.poster_path,
      release_date: c.release_date,
      vote_average: c.vote_average,
      vote_count: c.vote_count,
      role: c.job || 'Director',
    }));
  } else if (filmographyFilter === 'writing') {
    filmographyItems = writingCredits.map((c) => ({
      id: c.id,
      title: c.title,
      poster_path: c.poster_path,
      release_date: c.release_date,
      vote_average: c.vote_average,
      vote_count: c.vote_count,
      role: c.job || 'Writer',
    }));
  } else if (filmographyFilter === 'production') {
    filmographyItems = productionCredits.map((c) => ({
      id: c.id,
      title: c.title,
      poster_path: c.poster_path,
      release_date: c.release_date,
      vote_average: c.vote_average,
      vote_count: c.vote_count,
      role: c.job || 'Producer',
    }));
  } else {
    // All combined (deduplicated by id & role)
    const allCombined = [
      ...actingCredits.map((c) => ({
        id: c.id,
        title: c.title,
        poster_path: c.poster_path,
        release_date: c.release_date,
        vote_average: c.vote_average,
        vote_count: c.vote_count,
        role: c.character ? `as ${c.character}` : 'Cast',
      })),
      ...crewList.map((c) => ({
        id: c.id,
        title: c.title,
        poster_path: c.poster_path,
        release_date: c.release_date,
        vote_average: c.vote_average,
        vote_count: c.vote_count,
        role: c.job || c.department || 'Crew',
      })),
    ];

    // Deduplicate
    const seen = new Set<string>();
    filmographyItems = allCombined.filter((item) => {
      const key = `${item.id}-${item.role}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }

  // Sort filmography items
  filmographyItems.sort((a, b) => {
    if (filmographySort === 'newest') {
      const dateA = a.release_date ? new Date(a.release_date).getTime() : 0;
      const dateB = b.release_date ? new Date(b.release_date).getTime() : 0;
      return dateB - dateA;
    } else if (filmographySort === 'oldest') {
      const dateA = a.release_date ? new Date(a.release_date).getTime() : 0;
      const dateB = b.release_date ? new Date(b.release_date).getTime() : 0;
      return dateA - dateB;
    } else if (filmographySort === 'top_rated') {
      return (b.vote_average || 0) - (a.vote_average || 0);
    }
    return 0;
  });

  // Profile image gallery
  const galleryImages = actor?.images?.profiles || [];

  const ageNum = calculateAge(actor?.birthday || null, actor?.deathday || null);

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-[#0a0b10] animate-in fade-in duration-300">
      {/* Top Fixed Header Navigation */}
      <header className="sticky top-0 z-40 flex items-center justify-between border-b border-white/10 bg-[#0a0b10]/90 px-4 sm:px-8 py-3.5 backdrop-blur-xl">
        <button
          onClick={handleBack}
          className="flex items-center gap-2 rounded-xl bg-white/5 border border-white/10 px-3.5 py-2 text-xs sm:text-sm font-bold text-gray-200 hover:bg-white/10 hover:text-white transition-all hover:scale-105 active:scale-95"
        >
          <ArrowLeft className="h-4 w-4 text-red-500" />
          <span>Back</span>
        </button>

        <div className="flex items-center gap-2 max-w-xs sm:max-w-md truncate">
          <User className="h-4 w-4 text-red-500 shrink-0" />
          <span className="text-xs sm:text-sm font-extrabold text-white truncate">
            {actor?.name || 'Actor Details'}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {actor && (
            <button
              onClick={handleCopyLink}
              title="Share Actor Profile"
              className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/5 border border-white/10 text-gray-300 hover:text-white hover:bg-white/10 transition-colors"
            >
              {copiedLink ? (
                <Check className="h-4 w-4 text-emerald-400" />
              ) : (
                <Share2 className="h-4 w-4" />
              )}
            </button>
          )}

          <button
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/5 border border-white/10 text-gray-300 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      </header>

      {/* Main Scroll Container */}
      <div
        ref={containerRef}
        className="h-[calc(100vh-57px)] overflow-y-auto custom-scrollbar pb-20"
      >
        {isLoading ? (
          /* SKELETON LOADING STATE */
          <div className="max-w-7xl mx-auto px-4 sm:px-8 py-8 space-y-8 animate-pulse">
            <div className="relative h-96 w-full rounded-3xl bg-white/5 border border-white/10 overflow-hidden flex flex-col justify-end p-8">
              <div className="flex flex-col sm:flex-row items-center sm:items-end gap-6">
                <div className="h-40 w-40 rounded-2xl bg-white/10 border border-white/10 shrink-0" />
                <div className="space-y-4 w-full">
                  <div className="h-8 w-64 bg-white/10 rounded-lg" />
                  <div className="h-4 w-48 bg-white/10 rounded-lg" />
                  <div className="flex gap-2">
                    <div className="h-6 w-24 bg-white/10 rounded-full" />
                    <div className="h-6 w-24 bg-white/10 rounded-full" />
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-2 space-y-4 rounded-3xl bg-white/5 p-6 border border-white/10">
                <div className="h-6 w-32 bg-white/10 rounded-md" />
                <div className="h-4 w-full bg-white/10 rounded-md" />
                <div className="h-4 w-5/6 bg-white/10 rounded-md" />
                <div className="h-4 w-4/6 bg-white/10 rounded-md" />
              </div>

              <div className="space-y-4 rounded-3xl bg-white/5 p-6 border border-white/10">
                <div className="h-6 w-32 bg-white/10 rounded-md" />
                <div className="space-y-3">
                  <div className="h-4 w-full bg-white/10 rounded-md" />
                  <div className="h-4 w-full bg-white/10 rounded-md" />
                  <div className="h-4 w-full bg-white/10 rounded-md" />
                </div>
              </div>
            </div>
          </div>
        ) : error || !actor ? (
          /* ERROR STATE */
          <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 text-center space-y-6">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-red-500/10 border border-red-500/20 text-red-500">
              <AlertCircle className="h-10 w-10" />
            </div>
            <div className="space-y-2 max-w-md">
              <h2 className="text-2xl font-black text-white">Actor Not Found</h2>
              <p className="text-sm text-gray-400">
                {error || "We couldn't retrieve information for this actor. The person ID may be invalid or missing from TMDB."}
              </p>
            </div>
            <button
              onClick={handleBack}
              className="flex items-center gap-2 rounded-2xl bg-red-600 hover:bg-red-700 px-6 py-3 text-sm font-bold text-white shadow-xl glow-red transition-all"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Return to Previous Page</span>
            </button>
          </div>
        ) : (
          /* ACTOR CONTENT */
          <div className="space-y-12">
            {/* HERO / PROFILE HEADER SECTION */}
            <div className="relative min-h-[420px] sm:min-h-[480px] w-full overflow-hidden bg-gradient-to-b from-[#141622] to-[#0a0b10] border-b border-white/10 flex flex-col justify-end">
              {/* Cinematic Backdrop Image */}
              {backdropUrl && (
                <div className="absolute inset-0 z-0 opacity-25">
                  <img
                    src={backdropUrl}
                    alt={actor.name}
                    className="h-full w-full object-cover filter blur-sm scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0a0b10] via-[#0a0b10]/70 to-transparent" />
                  <div className="absolute inset-0 bg-gradient-to-r from-[#0a0b10] via-transparent to-[#0a0b10]" />
                </div>
              )}

              <div className="relative z-10 max-w-7xl mx-auto w-full px-4 sm:px-8 py-8 sm:py-12">
                <div className="flex flex-col md:flex-row items-center md:items-end gap-6 sm:gap-8">
                  {/* Actor Profile Image */}
                  <div className="relative h-44 w-44 sm:h-56 sm:w-56 rounded-3xl overflow-hidden border-4 border-white/10 shadow-2xl bg-[#12141d] shrink-0 group">
                    {actor.profile_path ? (
                      <img
                        src={getProfileUrl(actor.profile_path)}
                        alt={actor.name}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full w-full flex-col items-center justify-center bg-white/5 text-gray-500">
                        <User className="h-20 w-20 text-gray-600" />
                        <span className="text-xs font-semibold mt-2">No Photo</span>
                      </div>
                    )}
                    <div className="absolute inset-0 rounded-3xl ring-1 ring-inset ring-white/20 pointer-events-none" />
                  </div>

                  {/* Actor Name & Primary Highlights */}
                  <div className="space-y-4 text-center md:text-left flex-1">
                    <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
                      <span className="px-3 py-1 rounded-full bg-red-500/10 border border-red-500/20 text-xs font-bold text-red-400 uppercase tracking-widest flex items-center gap-1.5">
                        <Award className="h-3.5 w-3.5" />
                        <span>{actor.known_for_department || 'Actor'}</span>
                      </span>

                      {actor.popularity > 0 && (
                        <span className="px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-xs font-bold text-amber-400 flex items-center gap-1.5">
                          <Star className="h-3.5 w-3.5 fill-current" />
                          <span>TMDB Popularity: {Math.round(actor.popularity)}</span>
                        </span>
                      )}
                    </div>

                    <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight drop-shadow-md">
                      {actor.name}
                    </h1>

                    {/* Key Attributes Line */}
                    <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-xs sm:text-sm font-semibold text-gray-300">
                      {actor.birthday && (
                        <div className="flex items-center gap-2 bg-white/5 border border-white/10 px-3 py-1.5 rounded-xl">
                          <Calendar className="h-4 w-4 text-amber-400" />
                          <span>
                            Born {formatDate(actor.birthday)}
                            {ageNum !== null && !actor.deathday && (
                              <span className="text-amber-400 font-bold ml-1">({ageNum} yrs)</span>
                            )}
                          </span>
                        </div>
                      )}

                      {actor.deathday && (
                        <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 px-3 py-1.5 rounded-xl text-red-300">
                          <Calendar className="h-4 w-4 text-red-400" />
                          <span>
                            Died {formatDate(actor.deathday)}
                            {ageNum !== null && (
                              <span className="font-bold ml-1">(Aged {ageNum})</span>
                            )}
                          </span>
                        </div>
                      )}

                      {actor.place_of_birth && (
                        <div className="flex items-center gap-2 bg-white/5 border border-white/10 px-3 py-1.5 rounded-xl">
                          <MapPin className="h-4 w-4 text-red-400" />
                          <span className="truncate max-w-xs">{actor.place_of_birth}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* MAIN CONTENT GRID (BIOGRAPHY & QUICK FACTS) */}
            <div className="max-w-7xl mx-auto px-4 sm:px-8">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* BIOGRAPHY SECTION (2 COLS) */}
                <div className="lg:col-span-2 space-y-4 rounded-3xl bg-white/5 border border-white/10 p-6 sm:p-8 backdrop-blur-xl">
                  <div className="flex items-center justify-between border-b border-white/10 pb-4">
                    <h2 className="text-xl font-black text-white flex items-center gap-2.5">
                      <BookOpen className="h-5 w-5 text-red-500" />
                      <span>Biography</span>
                    </h2>
                  </div>

                  {actor.biography && actor.biography.trim().length > 0 ? (
                    <div className="space-y-4 text-gray-300 text-sm sm:text-base leading-relaxed font-normal">
                      <p className="whitespace-pre-line">
                        {isBioExpanded
                          ? actor.biography
                          : actor.biography.length > 320
                          ? `${actor.biography.slice(0, 320)}...`
                          : actor.biography}
                      </p>

                      {actor.biography.length > 320 && (
                        <button
                          onClick={() => setIsBioExpanded(!isBioExpanded)}
                          className="flex items-center gap-1.5 text-xs font-bold text-red-400 hover:text-red-300 transition-colors uppercase tracking-wider pt-2"
                        >
                          <span>{isBioExpanded ? 'Show Less' : 'Read Full Biography'}</span>
                          {isBioExpanded ? (
                            <ChevronUp className="h-4 w-4" />
                          ) : (
                            <ChevronDown className="h-4 w-4" />
                          )}
                        </button>
                      )}
                    </div>
                  ) : (
                    <p className="text-sm italic text-gray-400 py-4">
                      Biography not available.
                    </p>
                  )}
                </div>

                {/* QUICK FACTS SECTION (1 COL) */}
                <div className="space-y-4 rounded-3xl bg-white/5 border border-white/10 p-6 sm:p-8 backdrop-blur-xl">
                  <h2 className="text-xl font-black text-white flex items-center gap-2.5 border-b border-white/10 pb-4">
                    <Info className="h-5 w-5 text-amber-400" />
                    <span>Quick Facts</span>
                  </h2>

                  <div className="space-y-4 text-xs sm:text-sm">
                    {/* Birthday / Age */}
                    <div className="flex items-start justify-between border-b border-white/5 pb-3">
                      <span className="text-gray-400 font-semibold flex items-center gap-2">
                        🎂 Birthday
                      </span>
                      <span className="font-bold text-white text-right">
                        {actor.birthday ? formatDate(actor.birthday) : 'Unknown'}
                        {ageNum !== null && !actor.deathday && (
                          <span className="block text-xs text-amber-400 font-semibold">
                            {ageNum} years old
                          </span>
                        )}
                      </span>
                    </div>

                    {/* Deathday if applicable */}
                    {actor.deathday && (
                      <div className="flex items-start justify-between border-b border-white/5 pb-3">
                        <span className="text-red-400 font-semibold flex items-center gap-2">
                          🪦 Deceased
                        </span>
                        <span className="font-bold text-white text-right">
                          {formatDate(actor.deathday)}
                          {ageNum !== null && (
                            <span className="block text-xs text-red-400 font-semibold">
                              Aged {ageNum}
                            </span>
                          )}
                        </span>
                      </div>
                    )}

                    {/* Known For */}
                    <div className="flex items-start justify-between border-b border-white/5 pb-3">
                      <span className="text-gray-400 font-semibold flex items-center gap-2">
                        🎭 Known For
                      </span>
                      <span className="font-bold text-white text-right">
                        {actor.known_for_department || 'Acting'}
                      </span>
                    </div>

                    {/* Place of Birth */}
                    <div className="flex items-start justify-between border-b border-white/5 pb-3">
                      <span className="text-gray-400 font-semibold flex items-center gap-2">
                        📍 Place of Birth
                      </span>
                      <span className="font-bold text-white text-right max-w-[180px] truncate">
                        {actor.place_of_birth || 'Not listed'}
                      </span>
                    </div>

                    {/* Popularity */}
                    <div className="flex items-start justify-between border-b border-white/5 pb-3">
                      <span className="text-gray-400 font-semibold flex items-center gap-2">
                        ⭐ Popularity
                      </span>
                      <span className="font-bold text-amber-400 text-right">
                        {actor.popularity ? Math.round(actor.popularity * 10) / 10 : 'N/A'}
                      </span>
                    </div>

                    {/* Gender */}
                    <div className="flex items-start justify-between">
                      <span className="text-gray-400 font-semibold flex items-center gap-2">
                        👤 Gender
                      </span>
                      <span className="font-bold text-white text-right">
                        {getGenderLabel(actor.gender)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* KNOWN FOR SECTION */}
            {knownForMovies.length > 0 && (
              <section className="max-w-7xl mx-auto px-4 sm:px-8 space-y-6">
                <div className="flex items-center justify-between border-b border-white/10 pb-4">
                  <div>
                    <h2 className="text-2xl font-black text-white flex items-center gap-2.5">
                      <Clapperboard className="h-6 w-6 text-red-500" />
                      <span>Known For</span>
                    </h2>
                    <p className="text-xs text-gray-400 mt-1">
                      Most acclaimed and popular titles starring {actor.name}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-8 gap-4">
                  {knownForMovies.map((movie) => {
                    const releaseYear = movie.release_date
                      ? movie.release_date.substring(0, 4)
                      : null;

                    return (
                      <div
                        key={movie.id}
                        onClick={() => onSelectMovie(movie.id)}
                        className="group cursor-pointer rounded-2xl bg-white/5 border border-white/10 overflow-hidden hover:border-red-500/50 hover:bg-white/10 transition-all duration-300 hover:-translate-y-1 shadow-lg flex flex-col"
                      >
                        <div className="relative aspect-[2/3] w-full overflow-hidden bg-black/40">
                          <img
                            src={getImageUrl(movie.poster_path, 'w300')}
                            alt={movie.title}
                            className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
                            loading="lazy"
                          />
                          {movie.vote_average && movie.vote_average > 0 ? (
                            <div className="absolute top-2 right-2 flex items-center gap-1 rounded-md bg-black/80 px-1.5 py-0.5 text-[10px] font-extrabold text-amber-400 backdrop-blur-md border border-white/10">
                              <Star className="h-3 w-3 fill-current" />
                              <span>{movie.vote_average.toFixed(1)}</span>
                            </div>
                          ) : null}
                        </div>

                        <div className="p-3 space-y-1 flex-1 flex flex-col justify-between">
                          <div>
                            <h4 className="text-xs font-bold text-white group-hover:text-red-400 transition-colors line-clamp-1">
                              {movie.title}
                            </h4>
                            {movie.character && (
                              <p className="text-[10px] text-gray-400 line-clamp-1">
                                {movie.character}
                              </p>
                            )}
                          </div>
                          {releaseYear && (
                            <p className="text-[10px] font-semibold text-gray-500">
                              {releaseYear}
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            )}

            {/* FILMOGRAPHY SECTION */}
            <section className="max-w-7xl mx-auto px-4 sm:px-8 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
                <div>
                  <h2 className="text-2xl font-black text-white flex items-center gap-2.5">
                    <Film className="h-6 w-6 text-red-500" />
                    <span>Complete Filmography ({filmographyItems.length})</span>
                  </h2>
                  <p className="text-xs text-gray-400 mt-1">
                    Explore all movie credits, roles, and creative projects
                  </p>
                </div>

                {/* Filter and Sort Controls */}
                <div className="flex flex-wrap items-center gap-3">
                  {/* Category Filter Pills */}
                  <div className="flex items-center bg-white/5 border border-white/10 rounded-xl p-1 overflow-x-auto max-w-full">
                    {availableFilters.map((filter) => (
                      <button
                        key={filter.id}
                        onClick={() => setFilmographyFilter(filter.id as any)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                          filmographyFilter === filter.id
                            ? 'bg-red-600 text-white shadow-md'
                            : 'text-gray-400 hover:text-white'
                        }`}
                      >
                        {filter.label} ({filter.count})
                      </button>
                    ))}
                  </div>

                  {/* Sort Dropdown */}
                  <select
                    value={filmographySort}
                    onChange={(e) => setFilmographySort(e.target.value as any)}
                    className="rounded-xl bg-white/5 border border-white/10 px-3 py-1.5 text-xs font-bold text-gray-200 focus:outline-none focus:border-red-500 transition-colors cursor-pointer"
                  >
                    <option value="newest" className="bg-[#12141d] text-white">
                      Newest First
                    </option>
                    <option value="oldest" className="bg-[#12141d] text-white">
                      Oldest First
                    </option>
                    <option value="top_rated" className="bg-[#12141d] text-white">
                      Highest Rated
                    </option>
                  </select>
                </div>
              </div>

              {/* Filmography Cards Grid */}
              {filmographyItems.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                  {filmographyItems.map((movie, idx) => {
                    const releaseYear = movie.release_date
                      ? movie.release_date.substring(0, 4)
                      : 'TBA';

                    return (
                      <div
                        key={`${movie.id}-${movie.role}-${idx}`}
                        onClick={() => onSelectMovie(movie.id)}
                        className="group cursor-pointer rounded-2xl bg-white/5 border border-white/10 overflow-hidden hover:border-red-500/50 hover:bg-white/10 transition-all duration-300 hover:-translate-y-1 shadow-md flex flex-col"
                      >
                        <div className="relative aspect-[2/3] w-full overflow-hidden bg-black/40">
                          {movie.poster_path ? (
                            <img
                              src={getImageUrl(movie.poster_path, 'w300')}
                              alt={movie.title}
                              className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
                              loading="lazy"
                            />
                          ) : (
                            <div className="flex h-full w-full flex-col items-center justify-center bg-white/5 text-gray-500 p-2 text-center">
                              <Film className="h-8 w-8 mb-1" />
                              <span className="text-[10px] font-semibold line-clamp-2">
                                {movie.title}
                              </span>
                            </div>
                          )}

                          {movie.vote_average && movie.vote_average > 0 ? (
                            <div className="absolute top-2 right-2 flex items-center gap-1 rounded-md bg-black/80 px-1.5 py-0.5 text-[10px] font-extrabold text-amber-400 backdrop-blur-md border border-white/10">
                              <Star className="h-3 w-3 fill-current" />
                              <span>{movie.vote_average.toFixed(1)}</span>
                            </div>
                          ) : null}
                        </div>

                        <div className="p-3 space-y-1 flex-1 flex flex-col justify-between">
                          <div>
                            <h4 className="text-xs font-bold text-white group-hover:text-red-400 transition-colors line-clamp-1">
                              {movie.title}
                            </h4>
                            <p className="text-[10px] text-gray-400 line-clamp-1">
                              {movie.role}
                            </p>
                          </div>
                          <span className="text-[10px] font-semibold text-gray-500">
                            {releaseYear}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="rounded-2xl bg-white/5 border border-white/10 p-8 text-center text-gray-400 text-sm">
                  No filmography records found for this filter.
                </div>
              )}
            </section>

            {/* ACTOR IMAGE GALLERY */}
            {galleryImages.length > 0 && (
              <section className="max-w-7xl mx-auto px-4 sm:px-8 space-y-6">
                <div className="flex items-center justify-between border-b border-white/10 pb-4">
                  <div>
                    <h2 className="text-2xl font-black text-white flex items-center gap-2.5">
                      <ImageIcon className="h-6 w-6 text-red-500" />
                      <span>Photo Gallery ({galleryImages.length})</span>
                    </h2>
                    <p className="text-xs text-gray-400 mt-1">
                      Official portraits and promotional stills
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4 overflow-x-auto custom-scrollbar pb-4 pt-1">
                  {galleryImages.map((img: ImageAsset, index: number) => {
                    const fullUrl = getImageUrl(img.file_path, 'w780');
                    return (
                      <div
                        key={img.file_path || index}
                        onClick={() => setPreviewImage(fullUrl)}
                        className="group relative h-48 w-36 sm:h-64 sm:w-44 shrink-0 rounded-2xl overflow-hidden border border-white/10 bg-black/40 cursor-pointer hover:border-red-500 transition-all duration-300 hover:scale-105 shadow-xl"
                      >
                        <img
                          src={getImageUrl(img.file_path, 'w300')}
                          alt={`${actor.name} photo ${index + 1}`}
                          className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-500"
                          loading="lazy"
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <span className="text-xs font-bold text-white bg-red-600 px-3 py-1.5 rounded-full shadow-lg">
                            Enlarge
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            )}
          </div>
        )}
      </div>

      {/* FULLSCREEN IMAGE LIGHTBOX MODAL */}
      {previewImage && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/95 backdrop-blur-2xl animate-in fade-in duration-200"
          onClick={() => setPreviewImage(null)}
        >
          <div
            className="relative max-w-4xl max-h-[90vh] overflow-hidden rounded-3xl border border-white/20 shadow-2xl bg-black flex items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setPreviewImage(null)}
              className="absolute top-4 right-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-black/70 text-white hover:bg-black border border-white/20 backdrop-blur-md transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
            <img
              src={previewImage}
              alt={actor?.name || 'Actor photo'}
              className="max-h-[85vh] w-auto max-w-full object-contain rounded-2xl"
            />
          </div>
        </div>
      )}
    </div>
  );
};
