import React, { useState, useEffect } from 'react';
import { View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import MovieRow from './MovieRow';

const RECENTLY_VIEWED_KEY = 'recentlyViewed';
const MAX_RECENT_ITEMS = 20;

const RecentlyViewed = ({ onMoviePress }) => {
  const [recentMovies, setRecentMovies] = useState([]);

  useEffect(() => {
    loadRecentlyViewed();
  }, []);

  const loadRecentlyViewed = async () => {
    try {
      const stored = await AsyncStorage.getItem(RECENTLY_VIEWED_KEY);
      if (stored) {
        setRecentMovies(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Error loading recently viewed:', error);
    }
  };

  if (recentMovies.length === 0) {
    return null;
  }

  return (
    <View>
      <MovieRow
        title="Recently Viewed"
        movies={recentMovies}
        onMoviePress={onMoviePress}
      />
    </View>
  );
};

export const addToRecentlyViewed = async (movie) => {
  try {
    const stored = await AsyncStorage.getItem(RECENTLY_VIEWED_KEY);
    let recent = stored ? JSON.parse(stored) : [];
    
    // Remove if already exists
    recent = recent.filter(m => m.id !== movie.id);
    
    // Add to beginning
    recent.unshift({
      id: movie.id,
      title: movie.title,
      poster_path: movie.poster_path,
      vote_average: movie.vote_average,
      release_date: movie.release_date,
    });
    
    // Keep only MAX_RECENT_ITEMS
    recent = recent.slice(0, MAX_RECENT_ITEMS);
    
    await AsyncStorage.setItem(RECENTLY_VIEWED_KEY, JSON.stringify(recent));
  } catch (error) {
    console.error('Error saving to recently viewed:', error);
  }
};

export default RecentlyViewed;
