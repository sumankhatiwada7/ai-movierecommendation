import React,{ createContext, useState, useContext, useEffect } from 'react';
import type { ReactNode } from 'react';
import { getwatchlist, addtowatchlist, removefromwatchlist } from '../api/watchlistapi';

interface WatchlistContextType {
  watchlistIds: Set<number>;
  loading: boolean;
  addMovie: (tmdbId: number, title: string) => Promise<void>;
  removeMovie: (tmdbId: number) => Promise<void>;
  refreshWatchlist: () => Promise<void>;
}

const WatchlistContext = createContext<WatchlistContextType | undefined>(undefined);

export const WatchlistProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [watchlistIds, setWatchlistIds] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(true);

  const refreshWatchlist = async () => {
    try {
      setLoading(true);
      const res = await getwatchlist();
      const ids = (res.data || []).map((movie: any) => movie.tmdbId);
      setWatchlistIds(new Set(ids));
    } catch (err) {
      console.error('Failed to fetch watchlist:', err);
    } finally {
      setLoading(false);
    }
  };

  const addMovie = async (tmdbId: number, title: string) => {
    await addtowatchlist(tmdbId, title);
    setWatchlistIds((prev) => new Set(prev).add(tmdbId));
  };

  const removeMovie = async (tmdbId: number) => {
    await removefromwatchlist(tmdbId);
    setWatchlistIds((prev) => {
      const newSet = new Set(prev);
      newSet.delete(tmdbId);
      return newSet;
    });
  };

  useEffect(() => {
    refreshWatchlist();
  }, []);

  return (
    <WatchlistContext.Provider value={{ watchlistIds, loading, addMovie, removeMovie, refreshWatchlist }}>
      {children}
    </WatchlistContext.Provider>
  );
};

export const useWatchlist = () => {
  const context = useContext(WatchlistContext);
  if (!context) throw new Error('useWatchlist must be used within a WatchlistProvider');
  return context;
};