import React, {useState, useEffect} from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import HeroSection from '../components/HeroSection';
import MovieRow from '../components/MovieRow';
import {tmdbService} from '../services/tmdb';

const HomeScreen = ({navigation}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [trending, setTrending] = useState([]);
  const [popular, setPopular] = useState([]);
  const [topRated, setTopRated] = useState([]);
  const [upcoming, setUpcoming] = useState([]);
  const [heroMovie, setHeroMovie] = useState(null);

  useEffect(() => {
    loadMovies();
  }, []);

  const loadMovies = async () => {
    try {
      const [trendingData, popularData, topRatedData, upcomingData] =
        await Promise.all([
          tmdbService.getTrending(),
          tmdbService.getPopular(),
          tmdbService.getTopRated(),
          tmdbService.getUpcoming(),
        ]);

      setTrending(trendingData.results);
      setPopular(popularData.results);
      setTopRated(topRatedData.results);
      setUpcoming(upcomingData.results);
      setHeroMovie(trendingData.results[0]);
    } catch (error) {
      console.error('Error loading movies:', error);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadMovies();
  };

  const handleMoviePress = movie => {
    navigation.navigate('MovieDetails', {movieId: movie.id});
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#E50914" />
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={handleRefresh}
          tintColor="#E50914"
        />
      }>
      <HeroSection movie={heroMovie} onPress={handleMoviePress} />

      <MovieRow
        title="Trending Now"
        movies={trending}
        onMoviePress={handleMoviePress}
      />

      <MovieRow
        title="Popular"
        movies={popular}
        onMoviePress={handleMoviePress}
      />

      <MovieRow
        title="Top Rated"
        movies={topRated}
        onMoviePress={handleMoviePress}
      />

      <MovieRow
        title="Coming Soon"
        movies={upcoming}
        onMoviePress={handleMoviePress}
      />

      <View style={styles.bottomPadding} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0a',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0a0a0a',
  },
  bottomPadding: {
    height: 20,
  },
});

export default HomeScreen;
