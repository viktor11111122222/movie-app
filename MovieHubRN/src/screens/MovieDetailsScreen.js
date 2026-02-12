import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
  Alert,
} from 'react-native';
import FastImage from 'react-native-fast-image';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/Ionicons';
import {tmdbService} from '../services/tmdb';
import {useWishlist} from '../context/WishlistContext';
import {movieService} from '../services/api';
import MovieRow from '../components/MovieRow';

const {width, height} = Dimensions.get('window');

const MovieDetailsScreen = ({route, navigation}) => {
  const {movieId} = route.params;
  const [movie, setMovie] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [similarMovies, setSimilarMovies] = useState([]);
  const {isInWishlist, toggleWishlist} = useWishlist();

  useEffect(() => {
    loadMovieDetails();
  }, [movieId]);

  const loadMovieDetails = async () => {
    try {
      const [movieData, similarData] = await Promise.all([
        tmdbService.getMovieDetails(movieId),
        tmdbService.getSimilarMovies(movieId),
      ]);

      setMovie(movieData);
      setSimilarMovies(similarData.results.slice(0, 10));
      
      // Track view
      movieService.trackView(movieId);
    } catch (error) {
      console.error('Error loading movie details:', error);
      Alert.alert('Error', 'Failed to load movie details');
      navigation.goBack();
    } finally {
      setIsLoading(false);
    }
  };

  const handleWishlistToggle = async () => {
    await toggleWishlist(movie);
  };

  const handleMoviePress = selectedMovie => {
    navigation.push('MovieDetails', {movieId: selectedMovie.id});
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#E50914" />
      </View>
    );
  }

  if (!movie) return null;

  const inWishlist = isInWishlist(movie.id);

  return (
    <View style={styles.container}>
      <ScrollView>
        {/* Hero Image */}
        <View style={styles.heroContainer}>
          <FastImage
            source={{uri: tmdbService.getBackdropUrl(movie.backdrop_path)}}
            style={styles.backdrop}
            resizeMode={FastImage.resizeMode.cover}
          />
          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.5)', '#0a0a0a']}
            style={styles.gradient}
          />

          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}>
            <Icon name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.wishlistButton}
            onPress={handleWishlistToggle}>
            <Icon
              name={inWishlist ? 'bookmark' : 'bookmark-outline'}
              size={28}
              color={inWishlist ? '#E50914' : '#fff'}
            />
          </TouchableOpacity>
        </View>

        {/* Movie Info */}
        <View style={styles.content}>
          <Text style={styles.title}>{movie.title}</Text>

          <View style={styles.meta}>
            <View style={styles.rating}>
              <Icon name="star" size={20} color="#FFD700" />
              <Text style={styles.ratingText}>{movie.vote_average?.toFixed(1)}</Text>
            </View>
            <Text style={styles.year}>
              {movie.release_date?.substring(0, 4)}
            </Text>
            <Text style={styles.runtime}>{movie.runtime} min</Text>
          </View>

          <View style={styles.genres}>
            {movie.genres?.slice(0, 3).map(genre => (
              <View key={genre.id} style={styles.genreTag}>
                <Text style={styles.genreText}>{genre.name}</Text>
              </View>
            ))}
          </View>

          <Text style={styles.sectionTitle}>Overview</Text>
          <Text style={styles.overview}>{movie.overview}</Text>

          {movie.credits?.cast && movie.credits.cast.length > 0 && (
            <>
              <Text style={styles.sectionTitle}>Cast</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.castScroll}>
                {movie.credits.cast.slice(0, 10).map(person => (
                  <View key={person.id} style={styles.castCard}>
                    <FastImage
                      source={{
                        uri: person.profile_path
                          ? tmdbService.getImageUrl(person.profile_path)
                          : 'https://via.placeholder.com/200x300',
                      }}
                      style={styles.castImage}
                      resizeMode={FastImage.resizeMode.cover}
                    />
                    <Text style={styles.castName} numberOfLines={1}>
                      {person.name}
                    </Text>
                    <Text style={styles.castCharacter} numberOfLines={1}>
                      {person.character}
                    </Text>
                  </View>
                ))}
              </ScrollView>
            </>
          )}

          {similarMovies.length > 0 && (
            <MovieRow
              title="Similar Movies"
              movies={similarMovies}
              onMoviePress={handleMoviePress}
            />
          )}
        </View>
      </ScrollView>
    </View>
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
  heroContainer: {
    height: height * 0.5,
    width: width,
  },
  backdrop: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  gradient: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  backButton: {
    position: 'absolute',
    top: 50,
    left: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 25,
    padding: 10,
  },
  wishlistButton: {
    position: 'absolute',
    top: 50,
    right: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 25,
    padding: 10,
  },
  content: {
    padding: 16,
  },
  title: {
    color: '#fff',
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 12,
  },
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  rating: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 15,
  },
  ratingText: {
    color: '#FFD700',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 4,
  },
  year: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 16,
    marginRight: 15,
  },
  runtime: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 16,
  },
  genres: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 20,
  },
  genreTag: {
    backgroundColor: 'rgba(229, 9, 20, 0.2)',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
    marginBottom: 8,
  },
  genreText: {
    color: '#E50914',
    fontSize: 12,
    fontWeight: '600',
  },
  sectionTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 12,
    marginTop: 8,
  },
  overview: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 20,
  },
  castScroll: {
    marginBottom: 20,
  },
  castCard: {
    width: 100,
    marginRight: 12,
  },
  castImage: {
    width: 100,
    height: 150,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    marginBottom: 8,
  },
  castName: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 2,
  },
  castCharacter: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 12,
  },
});

export default MovieDetailsScreen;
