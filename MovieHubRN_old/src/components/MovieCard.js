import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { colors, spacing, fonts, borderRadius, shadows } from '../utils/theme';
import { getImageUrl, formatRating } from '../utils/helpers';
import { useWishlist } from '../context/WishlistContext';

const MovieCard = ({ movie, onPress }) => {
  const { isInWishlist, isWatched } = useWishlist();
  const inWishlist = isInWishlist(movie.id);
  const watched = isWatched(movie.id);

  return (
    <TouchableOpacity style={styles.container} onPress={() => onPress(movie)} activeOpacity={0.8}>
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: getImageUrl(movie.poster_path) }}
          style={styles.poster}
          resizeMode="cover"
        />
        
        {watched && (
          <View style={styles.watchedBadge}>
            <Icon name="checkmark-circle" size={20} color={colors.success} />
          </View>
        )}
        
        {inWishlist && !watched && (
          <View style={styles.wishlistBadge}>
            <Icon name="bookmark" size={20} color={colors.primary} />
          </View>
        )}
        
        <View style={styles.ratingContainer}>
          <Icon name="star" size={12} color={colors.accent} />
          <Text style={styles.rating}>{formatRating(movie.vote_average)}</Text>
        </View>
      </View>
      
      <View style={styles.info}>
        <Text style={styles.title} numberOfLines={2}>
          {movie.title}
        </Text>
        <Text style={styles.year}>
          {movie.release_date ? new Date(movie.release_date).getFullYear() : 'N/A'}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    width: 140,
    marginRight: spacing.md,
  },
  imageContainer: {
    position: 'relative',
    borderRadius: borderRadius.md,
    overflow: 'hidden',
    ...shadows.medium,
  },
  poster: {
    width: '100%',
    height: 200,
    backgroundColor: colors.surface,
  },
  ratingContainer: {
    position: 'absolute',
    top: spacing.sm,
    left: spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: spacing.xs,
    paddingVertical: 4,
    borderRadius: borderRadius.sm,
  },
  rating: {
    color: colors.white,
    fontSize: fonts.sizes.xs,
    fontWeight: 'bold',
    marginLeft: 4,
  },
  watchedBadge: {
    position: 'absolute',
    top: spacing.sm,
    right: spacing.sm,
    backgroundColor: 'rgba(76, 175, 80, 0.9)',
    borderRadius: borderRadius.round,
    padding: 4,
  },
  wishlistBadge: {
    position: 'absolute',
    top: spacing.sm,
    right: spacing.sm,
    backgroundColor: 'rgba(229, 9, 20, 0.9)',
    borderRadius: borderRadius.round,
    padding: 4,
  },
  info: {
    marginTop: spacing.sm,
  },
  title: {
    color: colors.text,
    fontSize: fonts.sizes.sm,
    fontWeight: '600',
    marginBottom: 4,
  },
  year: {
    color: colors.textSecondary,
    fontSize: fonts.sizes.xs,
  },
});

export default MovieCard;
