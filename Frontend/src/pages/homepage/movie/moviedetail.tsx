import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { fetchMovieById } from '../../../api/movieapi';
import { logwatch } from '../../../api/watchapi';
import { getWatchProgress, saveWatchProgress } from '../../../api/watchapi';
import type { Movie } from '../../../type/movie.type';
import SimilarMovies from './components/similarMovies';

// Available VidCore servers – try these if one is slow
export default function MovieDetail() {
  const { id } = useParams<{ id: string }>();
  const [movie, setMovie] = useState<Movie | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showPlayer, setShowPlayer] = useState(false);
  const [savedTime, setSavedTime] = useState<number>(0);
  const [playerReady, setPlayerReady] = useState(false);
  const [selectedServer, setSelectedServer] = useState('auto');
  const [loadAttempts, setLoadAttempts] = useState(0);
  const [showTimeoutMessage, setShowTimeoutMessage] = useState(false);

  // ✅ Validate tmdbId – if invalid, show error
  const tmdbId = Number(id);
  const isValidTmdbId = !isNaN(tmdbId) && tmdbId > 0;

  const iframeRef = useRef<HTMLIFrameElement>(null);
  const currentTimeRef = useRef<number>(0);
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const loadingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ----- Save current time to backend (debounced) -----
  const saveTime = useCallback(async (time: number) => {
    // ✅ Guard: only save if valid tmdbId and positive time
    if (!isValidTmdbId || time <= 0) return;

    try {
      console.log('💾 Saving progress:', { tmdbId, time });
      await saveWatchProgress({ tmdbId, time });
      console.log('✅ Progress saved successfully');
    } catch (error) {
      console.warn('Failed to save watch progress:', error);
    }
  }, [tmdbId, isValidTmdbId]);

  // ----- Build VidCore URL with current server and startAt -----
  const getVidCoreUrl = useCallback(() => {
    if (!isValidTmdbId) return '';
    let url = `https://vidcore.io/movie/${tmdbId}?autoPlay=true&theme=16A085`;
    if (selectedServer && selectedServer !== 'auto') {
      url += `&server=${selectedServer}`;
    }
    if (savedTime > 0) {
      url += `&startAt=${Math.floor(savedTime)}`;
    }
    if (loadAttempts > 0) {
      url += `&_=${loadAttempts}`;
    }
    return url;
  }, [tmdbId, selectedServer, savedTime, loadAttempts, isValidTmdbId]);

  // ----- Reload player with a (possibly) different server -----
  const retryWithServer = (server: string) => {
    setSelectedServer(server);
    setPlayerReady(false);
    setShowTimeoutMessage(false);
    setLoadAttempts(prev => prev + 1);
    if (loadingTimerRef.current) {
      clearTimeout(loadingTimerRef.current);
      loadingTimerRef.current = null;
    }
    loadingTimerRef.current = setTimeout(() => {
      setShowTimeoutMessage(true);
    }, 15000);
  };

  // ----- PostMessage listener for time updates -----
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.origin !== 'https://vidcore.io') return;

      let time: number | undefined;
      const data = event.data;
      if (data.currentTime !== undefined) {
        time = data.currentTime;
      } else if (data.data?.currentTime !== undefined) {
        time = data.data.currentTime;
      } else if (data.event === 'timeupdate' && data.data?.currentTime !== undefined) {
        time = data.data.currentTime;
      }

      if (typeof time === 'number' && !isNaN(time) && time > 0) {
        console.log('⏱️ Time update received:', time);
        currentTimeRef.current = time;

        // Debounce save to avoid too many requests
        if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
        saveTimeoutRef.current = setTimeout(() => {
          if (currentTimeRef.current > 0) {
            saveTime(currentTimeRef.current);
          }
        }, 5000);
      }
    };

    window.addEventListener('message', handleMessage);
    return () => {
      window.removeEventListener('message', handleMessage);
      if (currentTimeRef.current > 0) {
        saveTime(currentTimeRef.current);
      }
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    };
  }, [saveTime]);

  // ----- Fetch movie and progress in parallel -----
  useEffect(() => {
    if (!id) {
      setError('Movie ID is missing');
      setLoading(false);
      return;
    }
    if (!isValidTmdbId) {
      setError('Invalid movie ID');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    setShowPlayer(false);
    setPlayerReady(false);
    setShowTimeoutMessage(false);
    setLoadAttempts(0);

    const fetchData = async () => {
      try {
        const [movieData, progressTime] = await Promise.all([
          fetchMovieById(tmdbId),
          getWatchProgress(tmdbId).catch(() => 0),
        ]);

        setMovie(movieData.movie);
        setSavedTime(progressTime);
        currentTimeRef.current = progressTime;
        logwatch(tmdbId).catch(console.warn);
      } catch (err) {
        console.error('Failed to fetch movie:', err);
        setError('Unable to load movie details. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, tmdbId, isValidTmdbId]);

  // ----- Close player: save and hide -----
  const handleClosePlayer = useCallback(() => {
    if (currentTimeRef.current > 0) {
      saveTime(currentTimeRef.current);
    }
    setShowPlayer(false);
    setPlayerReady(false);
    setShowTimeoutMessage(false);
    if (loadingTimerRef.current) {
      clearTimeout(loadingTimerRef.current);
      loadingTimerRef.current = null;
    }
  }, [saveTime]);

  // ----- Save before unload -----
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (currentTimeRef.current > 0 && isValidTmdbId) {
        const payload = JSON.stringify({ movieId: tmdbId, time: currentTimeRef.current });
        navigator.sendBeacon('/api/watch-progress', payload);
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [tmdbId, isValidTmdbId]);

  // Clear timer on unmount
  useEffect(() => {
    return () => {
      if (loadingTimerRef.current) clearTimeout(loadingTimerRef.current);
    };
  }, []);

  // ----- Loading state -----
  if (loading) {
    return (
      <div className="bg-bg min-h-screen text-ink p-6 animate-pulse">
        <div className="max-w-6xl mx-auto">
          <div className="h-96 bg-edge rounded-xl mb-6" />
          <div className="h-10 bg-edge w-3/4 rounded mb-4" />
          <div className="h-6 bg-edge w-1/2 rounded mb-4" />
          <div className="flex gap-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-6 w-16 bg-edge rounded-full" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ----- Error state -----
  if (error || !movie) {
    return (
      <div className="bg-bg min-h-screen text-ink p-6 flex items-center justify-center">
        <div className="text-center">
          <p className="text-primary-dark text-xl mb-4">{error || 'Movie not found'}</p>
          <button
            onClick={() => window.history.back()}
            className="px-4 py-2 bg-surface border border-edge rounded-full hover:border-primary hover:text-primary transition"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  // ----- Main render -----
  return (
    <div className="hotflix-shell min-h-screen text-ink">
      {/* Detail header */}
      <div className="relative min-h-[34rem] w-full overflow-hidden bg-[#111114]">
        {movie.backdropUrl && (
          <img
            src={movie.backdropUrl}
            alt=""
            className="absolute right-0 top-0 h-full w-full object-cover opacity-65 md:w-[70%]"
            style={{ maskImage: "linear-gradient(to right, transparent 0%, black 45%, black 100%)" }}
          />
        )}

        <div className="page-width absolute inset-0 flex items-end pb-12 pt-12">
          <div className="mx-auto flex w-full max-w-6xl flex-col items-start gap-6 md:flex-row">
            <div className="w-40 flex-shrink-0 overflow-hidden rounded-md border border-white/10 bg-surface shadow-2xl md:w-56">
              {movie.posterUrl ? (
                <img
                  src={movie.posterUrl}
                  alt={movie.title}
                  className="w-full h-auto object-cover"
                />
              ) : (
                <div className="w-full aspect-[2/3] bg-edge flex items-center justify-center text-sm text-muted">
                  No poster
                </div>
              )}
            </div>

            <div className="flex-1 space-y-3 rounded-md border border-white/10 bg-black/35 p-6 backdrop-blur-md">
              <p className="mb-2 text-xs font-bold uppercase tracking-[.25em] text-primary">Movie details</p>
              <h1 className="font-display text-3xl font-extrabold leading-tight text-white md:text-5xl">
                {movie.title}
              </h1>
              <p className="text-sm text-muted">
                {movie.releaseYear} · {movie.durationMinutes} min ·{' '}
                <span className="inline-flex items-center">
                  ⭐ {movie.averageRating?.toFixed(1) ?? 'N/A'} (
                  {movie.ratingCount ?? 0} ratings)
                </span>
              </p>
              <div className="flex flex-wrap gap-2">
                {(movie.genres ?? []).map((g) => (
                  <span
                    key={g.id}
                    className="rounded border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-medium text-primary"
                  >
                    {g.name}
                  </span>
                ))}
              </div>
              <p className="text-muted max-w-2xl line-clamp-4">
                {movie.description || 'No description available.'}
              </p>

              {!showPlayer && (
                <button
                  onClick={() => {
                    setShowPlayer(true);
                    setPlayerReady(false);
                    setShowTimeoutMessage(false);
                    if (loadingTimerRef.current) clearTimeout(loadingTimerRef.current);
                    loadingTimerRef.current = setTimeout(() => {
                      setShowTimeoutMessage(true);
                    }, 15000);
                  }}
                  className="mt-2 rounded bg-primary px-6 py-3 font-bold text-black transition hover:bg-white"
                >
                  ▶ Watch Full Movie
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Player Section */}
      {showPlayer ? (
        <div className="page-width relative z-10 mx-auto -mt-10">
          <div className="relative aspect-video overflow-hidden rounded-md border border-white/10 bg-black shadow-2xl">
            {!playerReady && (
              <div className="absolute inset-0 flex items-center justify-center bg-surface/80 z-10 flex-col gap-3">
                <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                <span className="text-sm text-muted">Loading stream...</span>
                {showTimeoutMessage && (
                  <div className="text-center mt-2">
                    <p className="text-xs text-muted">Taking longer than usual.</p>
                    <div className="flex gap-2 mt-2 flex-wrap justify-center">
                      <button
                        onClick={() => retryWithServer('server1')}
                        className="text-xs bg-surface border border-edge px-3 py-1 rounded-full hover:border-primary transition"
                      >
                        Try Server 1
                      </button>
                      <button
                        onClick={() => retryWithServer('server2')}
                        className="text-xs bg-surface border border-edge px-3 py-1 rounded-full hover:border-primary transition"
                      >
                        Try Server 2
                      </button>
                      <button
                        onClick={() => retryWithServer('auto')}
                        className="text-xs bg-surface border border-edge px-3 py-1 rounded-full hover:border-primary transition"
                      >
                        Reset
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
            <iframe
              ref={iframeRef}
              src={getVidCoreUrl()}
              width="100%"
              height="100%"
              frameBorder="0"
              allowFullScreen
              allow="encrypted-media"
              title={`${movie.title} - VidCore Player`}
              onLoad={() => {
                setPlayerReady(true);
                setShowTimeoutMessage(false);
                if (loadingTimerRef.current) {
                  clearTimeout(loadingTimerRef.current);
                  loadingTimerRef.current = null;
                }
              }}
              className={playerReady ? 'opacity-100' : 'opacity-0'}
            />
          </div>
          <div className="mt-4 flex items-center justify-center gap-4 text-center">
            <button
              onClick={handleClosePlayer}
              className="text-sm text-muted hover:text-primary transition"
            >
              Close player
            </button>
            {playerReady && (
              <span className="text-xs text-muted">Server: {selectedServer}</span>
            )}
          </div>
        </div>
      ) : (
        movie.trailerKey && (
          <div className="max-w-4xl mx-auto px-4 -mt-12 relative z-10">
            <div className="overflow-hidden rounded-md border border-white/10 bg-black shadow-2xl">
              <iframe
                className="w-full aspect-video"
                src={`https://www.youtube.com/embed/${movie.trailerKey}`}
                title={`${movie.title} trailer`}
                allowFullScreen
              />
            </div>
          </div>
        )
      )}

      {/* Similar Movies */}
      <div className="page-width mx-auto py-12">
        <h2 className="mb-6 font-display text-3xl font-extrabold text-white">Discover</h2>
        <SimilarMovies title={movie.title} />
      </div>
    </div>
  );
}