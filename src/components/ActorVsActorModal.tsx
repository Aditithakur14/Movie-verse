import React, { useEffect, useState, useRef } from 'react';
import {
  X,
  ArrowLeft,
  Users,
  Search,
  ArrowLeftRight,
  Sparkles,
  Loader2,
  Film,
  Share2,
  Check,
  AlertCircle,
  RotateCcw,
  UserCheck,
  UserX,
} from 'lucide-react';
import { Actor, Movie } from '../types/tmdb';
import { tmdbService, getProfileUrl } from '../services/tmdbApi';
import { MovieCard } from './MovieCard';

interface ActorVsActorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectMovie: (movieId: number) => void;
  onSelectActor?: (actorId: number) => void;
  genreMap?: Record<number, string>;
  initialActor1Id?: number | null;
  initialActor2Id?: number | null;
}

// Popular iconic pairings for instant inspiration
const POPULAR_PAIRS = [
  { actor1: { id: 1136406, name: 'Tom Holland' }, actor2: { id: 505710, name: 'Zendaya' }, label: 'Spider-Man Duo' },
  { actor1: { id: 6193, name: 'Leonardo DiCaprio' }, actor2: { id: 287, name: 'Brad Pitt' }, label: 'Hollywood Icons' },
  { actor1: { id: 10859, name: 'Ryan Reynolds' }, actor2: { id: 6968, name: 'Hugh Jackman' }, label: 'Deadpool & Wolverine' },
  { actor1: { id: 54693, name: 'Emma Stone' }, actor2: { id: 30614, name: 'Ryan Gosling' }, label: 'La La Land Pair' },
  { actor1: { id: 3223, name: 'Robert Downey Jr.' }, actor2: { id: 74568, name: 'Chris Hemsworth' }, label: 'Avengers' },
];

export const ActorVsActorModal: React.FC<ActorVsActorModalProps> = ({
  isOpen,
  onClose,
  onSelectMovie,
  genreMap = {},
  initialActor1Id = null,
  initialActor2Id = null,
}) => {
  const [actor1, setActor1] = useState<Actor | null>(null);
  const [actor2, setActor2] = useState<Actor | null>(null);

  const [query1, setQuery1] = useState('');
  const [query2, setQuery2] = useState('');

  const [suggestions1, setSuggestions1] = useState<Actor[]>([]);
  const [suggestions2, setSuggestions2] = useState<Actor[]>([]);

  const [isSearching1, setIsSearching1] = useState(false);
  const [isSearching2, setIsSearching2] = useState(false);

  const [showDropdown1, setShowDropdown1] = useState(false);
  const [showDropdown2, setShowDropdown2] = useState(false);

  const [commonMovies, setCommonMovies] = useState<Movie[]>([]);
  const [isFinding, setIsFinding] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);

  const searchContainerRef1 = useRef<HTMLDivElement>(null);
  const searchContainerRef2 = useRef<HTMLDivElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchContainerRef1.current && !searchContainerRef1.current.contains(e.target as Node)) {
        setShowDropdown1(false);
      }
      if (searchContainerRef2.current && !searchContainerRef2.current.contains(e.target as Node)) {
        setShowDropdown2(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Keyboard escape
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleBack();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  // Load initial actors if specified in URL / props
  useEffect(() => {
    if (!isOpen) return;

    const loadInitialActors = async () => {
      // Check URL query parameters first (?actor1=123&actor2=456)
      const searchParams = new URLSearchParams(window.location.search);
      const urlA1 = searchParams.get('actor1') || (initialActor1Id ? String(initialActor1Id) : null);
      const urlA2 = searchParams.get('actor2') || (initialActor2Id ? String(initialActor2Id) : null);

      if (urlA1 && !isNaN(Number(urlA1))) {
        const details1 = await tmdbService.getActorDetails(Number(urlA1));
        if (details1) {
          setActor1({
            id: details1.id,
            name: details1.name,
            profile_path: details1.profile_path,
            popularity: details1.popularity,
            known_for_department: details1.known_for_department,
          });
        }
      }

      if (urlA2 && !isNaN(Number(urlA2))) {
        const details2 = await tmdbService.getActorDetails(Number(urlA2));
        if (details2) {
          setActor2({
            id: details2.id,
            name: details2.name,
            profile_path: details2.profile_path,
            popularity: details2.popularity,
            known_for_department: details2.known_for_department,
          });
        }
      }
    };

    loadInitialActors();
  }, [isOpen, initialActor1Id, initialActor2Id]);

  // Debounced search for Actor 1
  useEffect(() => {
    if (!query1.trim() || query1.length < 2) {
      setSuggestions1([]);
      setIsSearching1(false);
      return;
    }

    setIsSearching1(true);
    const timer = setTimeout(async () => {
      try {
        const results = await tmdbService.searchActors(query1.trim());
        setSuggestions1(results.slice(0, 8));
        setShowDropdown1(true);
      } catch (err) {
        console.error('Error searching Actor 1:', err);
      } finally {
        setIsSearching1(false);
      }
    }, 280);

    return () => clearTimeout(timer);
  }, [query1]);

  // Debounced search for Actor 2
  useEffect(() => {
    if (!query2.trim() || query2.length < 2) {
      setSuggestions2([]);
      setIsSearching2(false);
      return;
    }

    setIsSearching2(true);
    const timer = setTimeout(async () => {
      try {
        const results = await tmdbService.searchActors(query2.trim());
        setSuggestions2(results.slice(0, 8));
        setShowDropdown2(true);
      } catch (err) {
        console.error('Error searching Actor 2:', err);
      } finally {
        setIsSearching2(false);
      }
    }, 280);

    return () => clearTimeout(timer);
  }, [query2]);

  // Execute matching when user triggers Find Movies Together
  const handleFindSharedMovies = async (act1 = actor1, act2 = actor2) => {
    if (!act1 || !act2) return;

    if (act1.id === act2.id) {
      setErrorMessage('Please select two different actors.');
      return;
    }

    setIsFinding(true);
    setErrorMessage(null);
    setHasSearched(true);

    // Update URL query parameters seamlessly
    const currentUrl = new URL(window.location.href);
    currentUrl.pathname = '/actor-vs-actor';
    currentUrl.searchParams.set('actor1', String(act1.id));
    currentUrl.searchParams.set('actor2', String(act2.id));
    window.history.replaceState({ actor1: act1.id, actor2: act2.id }, '', currentUrl.toString());

    try {
      const shared = await tmdbService.findSharedMovies(act1.id, act2.id);
      setCommonMovies(shared);

      // Scroll to results on mobile/desktop smoothly
      setTimeout(() => {
        if (resultsRef.current) {
          resultsRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 100);
    } catch (err) {
      console.error('Error finding shared movies:', err);
      setErrorMessage('Failed to fetch movies. Please check your network connection and try again.');
    } finally {
      setIsFinding(false);
    }
  };

  // Swap Actor 1 and Actor 2
  const handleSwapActors = () => {
    const temp = actor1;
    setActor1(actor2);
    setActor2(temp);

    // If movies were already calculated, we keep them or re-match
    if (actor1 && actor2 && hasSearched) {
      const currentUrl = new URL(window.location.href);
      currentUrl.searchParams.set('actor1', String(actor2.id));
      currentUrl.searchParams.set('actor2', String(temp.id));
      window.history.replaceState({}, '', currentUrl.toString());
    }
  };

  // Select quick popular pair
  const handleSelectPopularPair = async (pair: (typeof POPULAR_PAIRS)[0]) => {
    setIsFinding(true);
    setHasSearched(false);
    setErrorMessage(null);

    try {
      const [d1, d2] = await Promise.all([
        tmdbService.getActorDetails(pair.actor1.id),
        tmdbService.getActorDetails(pair.actor2.id),
      ]);

      const a1: Actor = d1
        ? {
            id: d1.id,
            name: d1.name,
            profile_path: d1.profile_path,
            popularity: d1.popularity,
            known_for_department: d1.known_for_department,
          }
        : { id: pair.actor1.id, name: pair.actor1.name, profile_path: null, popularity: 0 };

      const a2: Actor = d2
        ? {
            id: d2.id,
            name: d2.name,
            profile_path: d2.profile_path,
            popularity: d2.popularity,
            known_for_department: d2.known_for_department,
          }
        : { id: pair.actor2.id, name: pair.actor2.name, profile_path: null, popularity: 0 };

      setActor1(a1);
      setActor2(a2);
      setQuery1('');
      setQuery2('');

      await handleFindSharedMovies(a1, a2);
    } catch (e) {
      console.error('Error loading pair:', e);
    } finally {
      setIsFinding(false);
    }
  };

  const handleBack = () => {
    if (window.history.length > 1 && window.location.pathname.startsWith('/actor-vs-actor')) {
      window.history.back();
    } else {
      onClose();
    }
  };

  const handleCopyLink = () => {
    const url = actor1 && actor2
      ? `${window.location.origin}/actor-vs-actor?actor1=${actor1.id}&actor2=${actor2.id}`
      : `${window.location.origin}/actor-vs-actor`;

    navigator.clipboard.writeText(url).then(() => {
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    });
  };

  const handleReset = () => {
    setActor1(null);
    setActor2(null);
    setQuery1('');
    setQuery2('');
    setCommonMovies([]);
    setHasSearched(false);
    setErrorMessage(null);
    window.history.replaceState({}, '', '/actor-vs-actor');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-[#0a0b10] animate-in fade-in duration-300">
      {/* Top Header Bar */}
      <header className="sticky top-0 z-40 flex items-center justify-between border-b border-white/10 bg-[#0a0b10]/95 px-4 sm:px-8 py-3.5 backdrop-blur-xl">
        <button
          onClick={handleBack}
          id="actor-vs-actor-back-btn"
          className="flex items-center gap-2 rounded-xl bg-white/5 border border-white/10 px-3.5 py-2 text-xs sm:text-sm font-bold text-gray-200 hover:bg-white/10 hover:text-white transition-all hover:scale-105 active:scale-95"
        >
          <ArrowLeft className="h-4 w-4 text-red-500" />
          <span>Back</span>
        </button>

        <div className="flex items-center gap-2 max-w-xs sm:max-w-md truncate">
          <Users className="h-4.5 w-4.5 text-red-500 shrink-0" />
          <span className="text-sm sm:text-base font-extrabold text-white tracking-tight truncate">
            Actor × Actor Discovery
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleCopyLink}
            id="share-actor-pair-btn"
            title="Share Discovery Link"
            className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/5 border border-white/10 text-gray-300 hover:text-white hover:bg-white/10 transition-colors"
          >
            {copiedLink ? <Check className="h-4 w-4 text-emerald-400" /> : <Share2 className="h-4 w-4" />}
          </button>

          <button
            onClick={onClose}
            id="close-actor-vs-actor-modal"
            className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/5 border border-white/10 text-gray-300 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      </header>

      {/* Main Scrollable Canvas */}
      <div ref={containerRef} className="h-[calc(100vh-57px)] overflow-y-auto custom-scrollbar pb-24">
        {/* Hero Section */}
        <div className="relative w-full border-b border-white/10 bg-gradient-to-b from-red-950/20 via-[#0d0f17] to-[#0a0b10] py-8 sm:py-12 px-4 sm:px-8">
          <div className="max-w-4xl mx-auto text-center space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-600/20 border border-red-500/30 text-xs font-bold text-red-400 uppercase tracking-widest backdrop-blur-md">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Co-Star Collaboration Finder</span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
              Actor <span className="text-red-500">×</span> Actor
            </h1>

            <p className="text-sm sm:text-base text-gray-400 max-w-xl mx-auto">
              Find movies where your favorite actors worked together. Select two actors to discover their shared filmography.
            </p>
          </div>
        </div>

        <div className="max-w-5xl mx-auto px-4 sm:px-8 py-8 space-y-8">
          {/* ACTOR SELECTION AREA */}
          <div className="relative rounded-3xl bg-[#11131c]/90 border border-white/10 p-5 sm:p-8 backdrop-blur-xl shadow-2xl">
            {/* Desktop Side-by-Side / Mobile Stacked */}
            <div className="grid grid-cols-1 md:grid-cols-[1fr,auto,1fr] items-center gap-4 sm:gap-6">
              {/* ACTOR 1 CARD / SEARCH */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold uppercase tracking-wider text-red-400 flex items-center gap-1.5">
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-red-600/30 border border-red-500/40 text-[11px] text-white">
                      1
                    </span>
                    Actor 1
                  </span>
                  {actor1 && (
                    <button
                      onClick={() => {
                        setActor1(null);
                        setQuery1('');
                      }}
                      className="text-xs text-gray-400 hover:text-red-400 transition-colors flex items-center gap-1"
                    >
                      <UserX className="h-3.5 w-3.5" />
                      <span>Change</span>
                    </button>
                  )}
                </div>

                {actor1 ? (
                  /* SELECTED ACTOR 1 CARD */
                  <div
                    id="selected-actor-1-card"
                    className="relative flex items-center gap-4 p-3.5 rounded-2xl bg-white/5 border border-red-500/30 hover:border-red-500/50 transition-all group"
                  >
                    <div className="relative h-16 w-16 sm:h-20 sm:w-20 rounded-xl overflow-hidden bg-white/10 shrink-0 border border-white/10 shadow-md">
                      <img
                        src={getProfileUrl(actor1.profile_path)}
                        alt={actor1.name}
                        className="h-full w-full object-cover group-hover:scale-105 transition-transform"
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="text-base sm:text-lg font-black text-white truncate group-hover:text-red-400 transition-colors">
                        {actor1.name}
                      </h3>
                      <p className="text-xs text-gray-400 truncate mt-0.5">
                        {actor1.known_for_department || 'Actor'}
                      </p>
                      <div className="mt-1.5 flex items-center gap-1.5 text-[11px] text-emerald-400 font-semibold">
                        <UserCheck className="h-3.5 w-3.5" />
                        <span>Selected</span>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        setActor1(null);
                        setQuery1('');
                      }}
                      className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/10 hover:bg-red-600 text-gray-400 hover:text-white transition-all shrink-0"
                      title="Remove Actor"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ) : (
                  /* ACTOR 1 SEARCH INPUT */
                  <div ref={searchContainerRef1} className="relative">
                    <div className="relative flex items-center">
                      <Search className="absolute left-3.5 h-4 w-4 text-gray-400 pointer-events-none" />
                      <input
                        type="text"
                        id="actor-1-search-input"
                        value={query1}
                        onChange={(e) => setQuery1(e.target.value)}
                        onFocus={() => {
                          if (suggestions1.length > 0) setShowDropdown1(true);
                        }}
                        placeholder="Search Actor 1 (e.g. Tom Holland)..."
                        className="w-full rounded-2xl bg-white/5 border border-white/10 pl-10 pr-10 py-3.5 text-sm font-medium text-white placeholder-gray-500 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all"
                      />
                      {isSearching1 ? (
                        <Loader2 className="absolute right-3.5 h-4 w-4 animate-spin text-red-500" />
                      ) : query1 ? (
                        <button
                          onClick={() => {
                            setQuery1('');
                            setSuggestions1([]);
                          }}
                          className="absolute right-3.5 text-gray-400 hover:text-white"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      ) : null}
                    </div>

                    {/* Autocomplete Dropdown 1 */}
                    {showDropdown1 && suggestions1.length > 0 && (
                      <div className="absolute top-full left-0 right-0 mt-2 rounded-2xl bg-[#121520] border border-white/15 p-2 shadow-2xl z-50 max-h-72 overflow-y-auto custom-scrollbar space-y-1 animate-in fade-in zoom-in-95 duration-150">
                        {suggestions1.map((item) => (
                          <div
                            key={item.id}
                            onClick={() => {
                              setActor1(item);
                              setQuery1('');
                              setShowDropdown1(false);
                            }}
                            className="flex items-center gap-3 p-2 rounded-xl hover:bg-white/10 cursor-pointer transition-colors"
                          >
                            <img
                              src={getProfileUrl(item.profile_path)}
                              alt={item.name}
                              className="h-10 w-10 rounded-lg object-cover bg-white/5 border border-white/10 shrink-0"
                            />
                            <div className="min-w-0 flex-1">
                              <div className="text-sm font-bold text-white truncate">{item.name}</div>
                              <div className="text-xs text-gray-400 truncate">{item.known_for_department || 'Actor'}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* SWAP BUTTON IN THE CENTER */}
              <div className="flex justify-center my-1 md:my-0">
                <button
                  onClick={handleSwapActors}
                  id="swap-actors-btn"
                  title="Swap Actors"
                  disabled={!actor1 && !actor2}
                  className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/5 hover:bg-red-600/90 border border-white/10 hover:border-red-500 text-gray-300 hover:text-white transition-all duration-300 hover:scale-110 active:scale-95 disabled:opacity-30 disabled:hover:scale-100 disabled:hover:bg-white/5 shadow-lg"
                >
                  <ArrowLeftRight className="h-5 w-5" />
                </button>
              </div>

              {/* ACTOR 2 CARD / SEARCH */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold uppercase tracking-wider text-red-400 flex items-center gap-1.5">
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-red-600/30 border border-red-500/40 text-[11px] text-white">
                      2
                    </span>
                    Actor 2
                  </span>
                  {actor2 && (
                    <button
                      onClick={() => {
                        setActor2(null);
                        setQuery2('');
                      }}
                      className="text-xs text-gray-400 hover:text-red-400 transition-colors flex items-center gap-1"
                    >
                      <UserX className="h-3.5 w-3.5" />
                      <span>Change</span>
                    </button>
                  )}
                </div>

                {actor2 ? (
                  /* SELECTED ACTOR 2 CARD */
                  <div
                    id="selected-actor-2-card"
                    className="relative flex items-center gap-4 p-3.5 rounded-2xl bg-white/5 border border-red-500/30 hover:border-red-500/50 transition-all group"
                  >
                    <div className="relative h-16 w-16 sm:h-20 sm:w-20 rounded-xl overflow-hidden bg-white/10 shrink-0 border border-white/10 shadow-md">
                      <img
                        src={getProfileUrl(actor2.profile_path)}
                        alt={actor2.name}
                        className="h-full w-full object-cover group-hover:scale-105 transition-transform"
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="text-base sm:text-lg font-black text-white truncate group-hover:text-red-400 transition-colors">
                        {actor2.name}
                      </h3>
                      <p className="text-xs text-gray-400 truncate mt-0.5">
                        {actor2.known_for_department || 'Actor'}
                      </p>
                      <div className="mt-1.5 flex items-center gap-1.5 text-[11px] text-emerald-400 font-semibold">
                        <UserCheck className="h-3.5 w-3.5" />
                        <span>Selected</span>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        setActor2(null);
                        setQuery2('');
                      }}
                      className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/10 hover:bg-red-600 text-gray-400 hover:text-white transition-all shrink-0"
                      title="Remove Actor"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ) : (
                  /* ACTOR 2 SEARCH INPUT */
                  <div ref={searchContainerRef2} className="relative">
                    <div className="relative flex items-center">
                      <Search className="absolute left-3.5 h-4 w-4 text-gray-400 pointer-events-none" />
                      <input
                        type="text"
                        id="actor-2-search-input"
                        value={query2}
                        onChange={(e) => setQuery2(e.target.value)}
                        onFocus={() => {
                          if (suggestions2.length > 0) setShowDropdown2(true);
                        }}
                        placeholder="Search Actor 2 (e.g. Zendaya)..."
                        className="w-full rounded-2xl bg-white/5 border border-white/10 pl-10 pr-10 py-3.5 text-sm font-medium text-white placeholder-gray-500 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all"
                      />
                      {isSearching2 ? (
                        <Loader2 className="absolute right-3.5 h-4 w-4 animate-spin text-red-500" />
                      ) : query2 ? (
                        <button
                          onClick={() => {
                            setQuery2('');
                            setSuggestions2([]);
                          }}
                          className="absolute right-3.5 text-gray-400 hover:text-white"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      ) : null}
                    </div>

                    {/* Autocomplete Dropdown 2 */}
                    {showDropdown2 && suggestions2.length > 0 && (
                      <div className="absolute top-full left-0 right-0 mt-2 rounded-2xl bg-[#121520] border border-white/15 p-2 shadow-2xl z-50 max-h-72 overflow-y-auto custom-scrollbar space-y-1 animate-in fade-in zoom-in-95 duration-150">
                        {suggestions2.map((item) => (
                          <div
                            key={item.id}
                            onClick={() => {
                              setActor2(item);
                              setQuery2('');
                              setShowDropdown2(false);
                            }}
                            className="flex items-center gap-3 p-2 rounded-xl hover:bg-white/10 cursor-pointer transition-colors"
                          >
                            <img
                              src={getProfileUrl(item.profile_path)}
                              alt={item.name}
                              className="h-10 w-10 rounded-lg object-cover bg-white/5 border border-white/10 shrink-0"
                            />
                            <div className="min-w-0 flex-1">
                              <div className="text-sm font-bold text-white truncate">{item.name}</div>
                              <div className="text-xs text-gray-400 truncate">{item.known_for_department || 'Actor'}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* ACTION BUTTON: FIND MOVIES TOGETHER */}
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3 pt-4 border-t border-white/10">
              <button
                onClick={() => handleFindSharedMovies()}
                id="find-movies-together-btn"
                disabled={!actor1 || !actor2 || isFinding}
                className="w-full sm:w-auto flex items-center justify-center gap-2.5 rounded-2xl bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 px-8 py-4 text-sm sm:text-base font-extrabold text-white shadow-xl shadow-red-950/40 transition-all duration-300 hover:scale-105 active:scale-95 disabled:opacity-40 disabled:hover:scale-100 disabled:cursor-not-allowed"
              >
                {isFinding ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    <span>Finding Movies They Made Together...</span>
                  </>
                ) : (
                  <>
                    <Film className="h-5 w-5" />
                    <span>Find Movies Together</span>
                  </>
                )}
              </button>

              {(actor1 || actor2 || hasSearched) && (
                <button
                  onClick={handleReset}
                  id="reset-actor-pair-btn"
                  className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 px-5 py-4 text-sm font-bold text-gray-300 hover:text-white transition-all"
                >
                  <RotateCcw className="h-4 w-4" />
                  <span>Reset</span>
                </button>
              )}
            </div>

            {errorMessage && (
              <div className="mt-4 flex items-center gap-2 p-3 rounded-xl bg-red-900/30 border border-red-500/30 text-xs sm:text-sm text-red-300 justify-center">
                <AlertCircle className="h-4 w-4 shrink-0 text-red-400" />
                <span>{errorMessage}</span>
              </div>
            )}
          </div>

          {/* POPULAR PAIRS QUICK SELECTION */}
          {!hasSearched && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-gray-400">
                <Sparkles className="h-3.5 w-3.5 text-amber-400" />
                <span>Try Iconic Hollywood Collaborations:</span>
              </div>

              <div className="flex flex-wrap gap-2.5">
                {POPULAR_PAIRS.map((pair, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSelectPopularPair(pair)}
                    className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-gray-200 hover:text-white hover:border-red-500/40 transition-all hover:scale-105 active:scale-95"
                  >
                    <span>👥</span>
                    <span className="font-bold text-white">{pair.actor1.name}</span>
                    <span className="text-red-500 font-bold">×</span>
                    <span className="font-bold text-white">{pair.actor2.name}</span>
                    <span className="text-[10px] text-gray-400 hidden sm:inline">({pair.label})</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* RESULTS SECTION */}
          <div ref={resultsRef} className="pt-2 space-y-6">
            {isFinding ? (
              /* LOADING SKELETON */
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Loader2 className="h-5 w-5 animate-spin text-red-500" />
                  <h2 className="text-lg sm:text-xl font-black text-white">
                    Finding movies featuring both actors...
                  </h2>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 animate-pulse">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="rounded-xl bg-white/5 border border-white/10 p-2 space-y-3">
                      <div className="aspect-[2/3] w-full rounded-lg bg-white/10" />
                      <div className="h-4 w-3/4 bg-white/10 rounded" />
                      <div className="h-3 w-1/2 bg-white/10 rounded" />
                    </div>
                  ))}
                </div>
              </div>
            ) : hasSearched ? (
              commonMovies.length > 0 ? (
                /* MATCHING MOVIES GRID */
                <div className="space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-white/10">
                    <div>
                      <h2 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
                        <span>Movies Featuring Both Actors</span>
                        <span className="px-2.5 py-0.5 rounded-full bg-red-600/30 border border-red-500/40 text-xs font-extrabold text-red-300">
                          {commonMovies.length} {commonMovies.length === 1 ? 'Movie' : 'Movies'}
                        </span>
                      </h2>
                      <p className="text-xs sm:text-sm text-gray-400 mt-0.5">
                        Credited appearances featuring both <strong className="text-white">{actor1?.name}</strong> and{' '}
                        <strong className="text-white">{actor2?.name}</strong>.
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    {commonMovies.map((movie) => (
                      <MovieCard
                        key={movie.id}
                        movie={movie}
                        onSelectMovie={onSelectMovie}
                        genreMap={genreMap}
                        className="w-full"
                      />
                    ))}
                  </div>
                </div>
              ) : (
                /* NO COLLABORATION STATE */
                <div className="flex flex-col items-center justify-center rounded-3xl bg-white/5 border border-white/10 p-10 sm:p-14 text-center space-y-4">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white/10 text-gray-400">
                    <Film className="h-8 w-8" />
                  </div>
                  <div className="space-y-1.5 max-w-md">
                    <h3 className="text-xl font-bold text-white">No movies found with both actors</h3>
                    <p className="text-xs sm:text-sm text-gray-400">
                      <span className="text-white font-semibold">{actor1?.name}</span> and{' '}
                      <span className="text-white font-semibold">{actor2?.name}</span> have not been credited in any shared movie together on TMDB yet.
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setActor2(null);
                      setQuery2('');
                      setHasSearched(false);
                    }}
                    className="flex items-center gap-2 rounded-xl bg-red-600 hover:bg-red-700 px-5 py-2.5 text-xs sm:text-sm font-bold text-white transition-all shadow-lg glow-red"
                  >
                    <RotateCcw className="h-4 w-4" />
                    <span>Try Another Pair</span>
                  </button>
                </div>
              )
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
};
