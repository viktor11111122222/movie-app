import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiService } from '../services/api';
import { useAuth } from './AuthContext';

const WishlistContext = createContext();

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
};

export const WishlistProvider = ({ children }) => {
  const [wishlist, setWishlist] = useState([]);
  const [watchedMovies, setWatchedMovies] = useState([]);
  const [loading, setLoading] = useState(false);
  const { user, isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      loadWishlist();
      loadWatchedMovies();
    } else {
      loadLocalWishlist();
    }
  }, [isAuthenticated]);

  const loadLocalWishlist = async () => {
    try {
      const local = await AsyncStorage.getItem('localWishlist');
      if (local) {
        setWishlist(JSON.parse(local));
      }
    } catch (error) {
      console.error('Error loading local wishlist:', error);
    }
  };

  const saveLocalWishlist = async (list) => {
    try {
      await AsyncStorage.setItem('localWishlist', JSON.stringify(list));
    } catch (error) {
      console.error('Error saving local wishlist:', error);
    }
  };

  const loadWishlist = async () => {
    try {
      setLoading(true);
      const data = await apiService.getWishlist();
      setWishlist(data);
    } catch (error) {
      console.error('Error loading wishlist:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadWatchedMovies = async () => {
    try {
      const data = await apiService.getWatchedMovies();
      setWatchedMovies(data);
    } catch (error) {
      console.error('Error loading watched movies:', error);
    }
  };

  const addToWishlist = async (movie) => {
    try {
      const movieData = {
        id: movie.id,
        title: movie.title,
        poster_path: movie.poster_path,
        vote_average: movie.vote_average,
        release_date: movie.release_date,
      };

      if (isAuthenticated) {
        await apiService.addToWishlist(movie.id, movieData);
      } else {
        const updated = [...wishlist, movieData];
        setWishlist(updated);
        await saveLocalWishlist(updated);
      }
      
      setWishlist(prev => [...prev, movieData]);
      return { success: true };
    } catch (error) {
      console.error('Error adding to wishlist:', error);
      return { success: false, error: error.message };
    }
  };

  const removeFromWishlist = async (movieId) => {
    try {
      if (isAuthenticated) {
        await apiService.removeFromWishlist(movieId);
      } else {
        const updated = wishlist.filter(m => m.id !== movieId);
        setWishlist(updated);
        await saveLocalWishlist(updated);
      }
      
      setWishlist(prev => prev.filter(m => m.id !== movieId));
      return { success: true };
    } catch (error) {
      console.error('Error removing from wishlist:', error);
      return { success: false, error: error.message };
    }
  };

  const isInWishlist = (movieId) => {
    return wishlist.some(m => m.id === movieId);
  };

  const markAsWatched = async (movieId, rating) => {
    try {
      if (isAuthenticated) {
        await apiService.markAsWatched(movieId, rating);
      }
      
      const watched = { movieId, rating, watchedAt: new Date().toISOString() };
      setWatchedMovies(prev => [...prev, watched]);
      
      return { success: true };
    } catch (error) {
      console.error('Error marking as watched:', error);
      return { success: false, error: error.message };
    }
  };

  const isWatched = (movieId) => {
    return watchedMovies.some(m => m.movieId === movieId);
  };

  const value = {
    wishlist,
    watchedMovies,
    loading,
    addToWishlist,
    removeFromWishlist,
    isInWishlist,
    markAsWatched,
    isWatched,
    refreshWishlist: loadWishlist,
  };

  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>;
};
