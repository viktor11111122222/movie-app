import React, { useState, useEffect } from 'react';
import { View, ScrollView, StyleSheet, RefreshControl, ActivityIndicator } from 'react-native';
import { colors, spacing } from '../utils/theme';
import tmdbService from '../services/tmdb';
import HeroSection from '../components/HeroSection';
import MovieRow from '../components/MovieRow';
import RecentlyViewed, { addToRecentlyViewed } from '../components/RecentlyViewed';

const HomeScreen = ({ navigation }) => {
  const [trending, setTrending] = useState([]);
  const [popular, setPopular] = useState([]);
  const [topRated, setTopRated] = useState([]);
  const [nowPlaying, setNowPlaying] = useState([]);
  const [upcoming, setUpcoming] = useState([]);
  const [heroMovie, setHeroMovie] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadMovies();
  }, []);

  const loadMovies = async () => {
    try {
      const [
        trendingData,
        popularData,
        topRatedData,
        nowPlayingData,
        upcomingData,
      ] = await Promise.all([
        tmdbService.getTrending(),
        tmdbService.getPopular(),
        tmdbService.getTopRated(),
        tmdbService.getNowPlaying(),
        tmdbService.getUpcoming(),
      ]);

      setTrending(trendingData.results);
      setPopular(popularData.results);
      setTopRated(topRatedData.results);
      setNowPlaying(nowPlayingData.results);
      setUpcoming(upcomingData.results);
      setHeroMovie(trendingData.results[0]);
    } catch (error) {
      console.error('Error loading movies:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadMovies();
  };

  const handleMoviePress = (movie) => {
    addToRecentlyViewed(movie);
    navigation.navigate('MovieDetails', { movieId: movie.id });
  };

  const handlePlayTrailer = async (movie) => {
    try {
      const videos = await tmdbService.getMovieVideos(movie.id);
      const trailer = videos.results.find(v => v.type === 'Trailer');
      if (trailer) {
        navigation.navigate('VideoPlayer', { videoKey: trailer.key });
      }
    } catch (error) {
      console.error('Error loading trailer:', error);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor={colors.primary}
        />
      }
    >
      <HeroSection
        movie={heroMovie}
        onPress={handleMoviePress}
        onPlayTrailer={handlePlayTrailer}
      />

      <View style={styles.content}>
        <RecentlyViewed onMoviePress={handleMoviePress} />
        <MovieRow title="Trending Now" movies={trending} onMoviePress={handleMoviePress} />
        <MovieRow title="Popular" movies={popular} onMoviePress={handleMoviePress} />
        <MovieRow title="Now Playing" movies={nowPlaying} onMoviePress={handleMoviePress} />
        <MovieRow title="Top Rated" movies={topRated} onMoviePress={handleMoviePress} />
        <MovieRow title="Coming Soon" movies={upcoming} onMoviePress={handleMoviePress} />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    paddingBottom: spacing.xxxl,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
});

export default HomeScreen;
