import React, {createContext, useState, useContext, useEffect} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {wishlistService} from '../services/api';
import {useAuth} from './AuthContext';

const WishlistContext = createContext();

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used within WishlistProvider');
  }
  return context;
};

export const WishlistProvider = ({children}) => {
  const [wishlist, setWishlist] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const {isAuthenticated} = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      loadWishlist();
    } else {
      setWishlist([]);
    }
  }, [isAuthenticated]);

  const loadWishlist = async () => {
    try {
      setIsLoading(true);
      const data = await wishlistService.getWishlist();
      setWishlist(data.wishlist || []);
    } catch (error) {
      console.log('Load wishlist error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const addToWishlist = async movie => {
    try {
      await wishlistService.addToWishlist(movie);
      setWishlist(prev => [...prev, movie]);
      return {success: true};
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to add to wishlist',
      };
    }
  };

  const removeFromWishlist = async movieId => {
    try {
      await wishlistService.removeFromWishlist(movieId);
      setWishlist(prev => prev.filter(m => m.id !== movieId));
      return {success: true};
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to remove from wishlist',
      };
    }
  };

  const isInWishlist = movieId => {
    return wishlist.some(m => m.id === movieId);
  };

  const toggleWishlist = async movie => {
    if (isInWishlist(movie.id)) {
      return await removeFromWishlist(movie.id);
    } else {
      return await addToWishlist(movie);
    }
  };

  const value = {
    wishlist,
    isLoading,
    addToWishlist,
    removeFromWishlist,
    isInWishlist,
    toggleWishlist,
    loadWishlist,
  };

  return (
    <WishlistContext.Provider value={value}>
      {children}
    </WishlistContext.Provider>
  );
};
