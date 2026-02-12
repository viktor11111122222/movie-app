import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  Image,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/Ionicons';
import { colors, spacing, fonts, borderRadius } from '../utils/theme';
import tmdbService from '../services/tmdb';
import { useWishlist } from '../context/WishlistContext';
import { getImageUrl, formatDate, formatRuntime, formatCurrency } from '../utils/helpers';
import StarRating from '../components/StarRating';
import StreamingProviders from '../components/StreamingProviders';
import MovieRow from '../components/MovieRow';
import ShareButton from '../components/ShareButton';
import { addToRecentlyViewed } from '../components/RecentlyViewed';

const { width } = Dimensions.get('window');

const MovieDetailsScreen = ({ route, navigation }) => {
  const { movieId } = route.params;
  const [movie, setMovie] = useState(null);
  const [similar, setSimilar] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userRating, setUserRating] = useState(0);

  const { isInWishlist, addToWishlist, removeFromWishlist, markAsWatched, isWatched } = useWishlist();

  useEffect(() => {
    loadMovieDetails();
  }, [movieId]);

  const loadMovieDetails = async () => {
    try {
      setLoading(true);
      const [movieData, similarData] = await Promise.all([
        tmdbService.getMovieDetails(movieId),
        tmdbService.getSimilarMovies(movieId),
      ]);

      setMovie(movieData);
      setSimilar(similarData.results);
      addToRecentlyViewed(movieData);
    } catch (error) {
      console.error('Error loading movie details:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleWishlistToggle = async () => {
    if (isInWishlist(movieId)) {
      await removeFromWishlist(movieId);
    } else {
      await addToWishlist(movie);
    }
  };

  const handleMarkWatched = async () => {
    if (userRating > 0) {
      await markAsWatched(movieId, userRating);
    }
  };

  const handlePlayTrailer = async () => {
    try {
      if (movie.videos?.results?.length > 0) {
        const trailer = movie.videos.results.find(v => v.type === 'Trailer');
        if (trailer) {
          navigation.navigate('VideoPlayer', { videoKey: trailer.key });
        }
      }
    } catch (error) {
      console.error('Error playing trailer:', error);
    }
  };

  const handleSimilarMoviePress = (similarMovie) => {
    navigation.push('MovieDetails', { movieId: similarMovie.id });
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!movie) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Movie not found</Text>
      </View>
    );
  }

  const inWishlist = isInWishlist(movieId);
  const watched = isWatched(movieId);

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Image
          source={{ uri: getImageUrl(movie.backdrop_path || movie.poster_path, 'original') }}
          style={styles.backdrop}
          resizeMode="cover"
        />
        <LinearGradient
          colors={['transparent', colors.background]}
          style={styles.gradient}
        />

        <View style={styles.headerButtons}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Icon name="arrow-back" size={24} color={colors.white} />
          </TouchableOpacity>
          <ShareButton movie={movie} />
        </View>
      </View>

      <View style={styles.content}>
        <View style={styles.posterRow}>
          <Image
            source={{ uri: getImageUrl(movie.poster_path) }}
            style={styles.poster}
            resizeMode="cover"
          />

          <View style={styles.titleContainer}>
            <Text style={styles.title}>{movie.title}</Text>
            <Text style={styles.tagline}>{movie.tagline}</Text>

            <View style={styles.metadata}>
              <View style={styles.ratingContainer}>
                <Icon name="star" size={16} color={colors.accent} />
                <Text style={styles.rating}>{movie.vote_average?.toFixed(1)}</Text>
              </View>
              <Text style={styles.metadataText}>{formatDate(movie.release_date)}</Text>
              <Text style={styles.metadataText}>{formatRuntime(movie.runtime)}</Text>
            </View>

            <View style={styles.genres}>
              {movie.genres?.map((genre) => (
                <View key={genre.id} style={styles.genreTag}>
                  <Text style={styles.genreText}>{genre.name}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>

        <View style={styles.actions}>
          <TouchableOpacity
            style={[styles.actionButton, styles.primaryButton]}
            onPress={handlePlayTrailer}
          >
            <Icon name="play" size={20} color={colors.white} />
            <Text style={styles.actionButtonText}>Trailer</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, inWishlist && styles.activeButton]}
            onPress={handleWishlistToggle}
          >
            <Icon
              name={inWishlist ? 'bookmark' : 'bookmark-outline'}
              size={20}
              color={colors.white}
            />
            <Text style={styles.actionButtonText}>
              {inWishlist ? 'In Wishlist' : 'Wishlist'}
            </Text>
          </TouchableOpacity>
        </View>

        {!watched && (
          <View style={styles.ratingSection}>
            <Text style={styles.sectionTitle}>Rate this movie</Text>
            <StarRating
              rating={userRating}
              onRate={setUserRating}
              editable
              size={32}
            />
            {userRating > 0 && (
              <TouchableOpacity style={styles.watchedButton} onPress={handleMarkWatched}>
                <Text style={styles.watchedButtonText}>Mark as Watched</Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Overview</Text>
          <Text style={styles.overview}>{movie.overview}</Text>
        </View>

        {movie.budget > 0 && (
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Budget:</Text>
            <Text style={styles.infoValue}>{formatCurrency(movie.budget)}</Text>
          </View>
        )}

        {movie.revenue > 0 && (
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Revenue:</Text>
            <Text style={styles.infoValue}>{formatCurrency(movie.revenue)}</Text>
          </View>
        )}

        {movie.credits?.cast && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Cast</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {movie.credits.cast.slice(0, 10).map((person) => (
                <View key={person.id} style={styles.castItem}>
                  <Image
                    source={{
                      uri: person.profile_path
                        ? getImageUrl(person.profile_path, 'w185')
                        : 'https://via.placeholder.com/185x278?text=No+Image',
                    }}
                    style={styles.castImage}
                  />
                  <Text style={styles.castName}>{person.name}</Text>
                  <Text style={styles.castCharacter}>{person.character}</Text>
                </View>
              ))}
            </ScrollView>
          </View>
        )}

        {movie['watch/providers'] && (
          <StreamingProviders providers={movie['watch/providers'].results} />
        )}

        {similar.length > 0 && (
          <MovieRow
            title="Similar Movies"
            movies={similar}
            onMoviePress={handleSimilarMoviePress}
          />
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  errorText: {
    color: colors.text,
    fontSize: fonts.sizes.lg,
  },
  header: {
    height: 300,
    position: 'relative',
  },
  backdrop: {
    width: '100%',
    height: '100%',
  },
  gradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '50%',
  },
  headerButtons: {
    position: 'absolute',
    top: 50,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    padding: spacing.lg,
  },
  posterRow: {
    flexDirection: 'row',
    marginBottom: spacing.lg,
  },
  poster: {
    width: 120,
    height: 180,
    borderRadius: borderRadius.md,
  },
  titleContainer: {
    flex: 1,
    marginLeft: spacing.lg,
  },
  title: {
    fontSize: fonts.sizes.xxl,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  tagline: {
    fontSize: fonts.sizes.sm,
    color: colors.textSecondary,
    fontStyle: 'italic',
    marginBottom: spacing.md,
  },
  metadata: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: spacing.md,
    gap: spacing.sm,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rating: {
    color: colors.text,
    fontSize: fonts.sizes.md,
    fontWeight: 'bold',
    marginLeft: 4,
  },
  metadataText: {
    color: colors.textSecondary,
    fontSize: fonts.sizes.sm,
  },
  genres: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  genreTag: {
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
  },
  genreText: {
    color: colors.textSecondary,
    fontSize: fonts.sizes.xs,
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    gap: spacing.sm,
  },
  primaryButton: {
    backgroundColor: colors.primary,
  },
  activeButton: {
    backgroundColor: colors.secondary,
  },
  actionButtonText: {
    color: colors.white,
    fontSize: fonts.sizes.md,
    fontWeight: 'bold',
  },
  ratingSection: {
    backgroundColor: colors.surface,
    padding: spacing.lg,
    borderRadius: borderRadius.md,
    marginBottom: spacing.lg,
    alignItems: 'center',
  },
  section: {
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    fontSize: fonts.sizes.xl,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: spacing.md,
  },
  overview: {
    fontSize: fonts.sizes.md,
    color: colors.textSecondary,
    lineHeight: 22,
  },
  watchedButton: {
    backgroundColor: colors.success,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    marginTop: spacing.md,
  },
  watchedButtonText: {
    color: colors.white,
    fontSize: fonts.sizes.md,
    fontWeight: 'bold',
  },
  infoRow: {
    flexDirection: 'row',
    marginBottom: spacing.sm,
  },
  infoLabel: {
    fontSize: fonts.sizes.md,
    color: colors.textSecondary,
    fontWeight: 'bold',
    marginRight: spacing.sm,
  },
  infoValue: {
    fontSize: fonts.sizes.md,
    color: colors.text,
  },
  castItem: {
    width: 100,
    marginRight: spacing.md,
  },
  castImage: {
    width: 100,
    height: 150,
    borderRadius: borderRadius.md,
    marginBottom: spacing.xs,
    backgroundColor: colors.surface,
  },
  castName: {
    fontSize: fonts.sizes.sm,
    color: colors.text,
    fontWeight: '600',
    marginBottom: 2,
  },
  castCharacter: {
    fontSize: fonts.sizes.xs,
    color: colors.textSecondary,
  },
});

export default MovieDetailsScreen;
