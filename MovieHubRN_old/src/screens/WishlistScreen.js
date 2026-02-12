import React from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Image,
  ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { colors, spacing, fonts, borderRadius } from '../utils/theme';
import { useWishlist } from '../context/WishlistContext';
import { getImageUrl, formatRating } from '../utils/helpers';
import { addToRecentlyViewed } from '../components/RecentlyViewed';

const WishlistScreen = ({ navigation }) => {
  const { wishlist, removeFromWishlist, loading } = useWishlist();

  const handleMoviePress = (movie) => {
    addToRecentlyViewed(movie);
    navigation.navigate('MovieDetails', { movieId: movie.id });
  };

  const handleRemove = async (movieId) => {
    await removeFromWishlist(movieId);
  };

  const renderMovie = ({ item }) => (
    <TouchableOpacity
      style={styles.movieItem}
      onPress={() => handleMoviePress(item)}
      activeOpacity={0.8}
    >
      <Image
        source={{ uri: getImageUrl(item.poster_path) }}
        style={styles.poster}
        resizeMode="cover"
      />

      <View style={styles.info}>
        <Text style={styles.title} numberOfLines={2}>
          {item.title}
        </Text>

        <View style={styles.metadata}>
          <View style={styles.ratingContainer}>
            <Icon name="star" size={14} color={colors.accent} />
            <Text style={styles.rating}>{formatRating(item.vote_average)}</Text>
          </View>
          <Text style={styles.year}>
            {item.release_date ? new Date(item.release_date).getFullYear() : 'N/A'}
          </Text>
        </View>

        <TouchableOpacity
          style={styles.removeButton}
          onPress={() => handleRemove(item.id)}
        >
          <Icon name="trash-outline" size={20} color={colors.error} />
          <Text style={styles.removeText}>Remove</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (wishlist.length === 0) {
    return (
      <View style={styles.centerContainer}>
        <Icon name="bookmark-outline" size={64} color={colors.textSecondary} />
        <Text style={styles.emptyText}>Your wishlist is empty</Text>
        <Text style={styles.emptySubtext}>
          Add movies to your wishlist to watch them later
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Wishlist</Text>
        <Text style={styles.headerSubtitle}>{wishlist.length} movies</Text>
      </View>

      <FlatList
        data={wishlist}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderMovie}
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
    padding: spacing.xl,
  },
  header: {
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.surface,
  },
  headerTitle: {
    fontSize: fonts.sizes.xxl,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  headerSubtitle: {
    fontSize: fonts.sizes.md,
    color: colors.textSecondary,
  },
  listContent: {
    padding: spacing.lg,
  },
  movieItem: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    marginBottom: spacing.md,
    overflow: 'hidden',
  },
  poster: {
    width: 100,
    height: 150,
    backgroundColor: colors.darkGray,
  },
  info: {
    flex: 1,
    padding: spacing.md,
    justifyContent: 'space-between',
  },
  title: {
    fontSize: fonts.sizes.lg,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: spacing.sm,
  },
  metadata: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rating: {
    color: colors.text,
    fontSize: fonts.sizes.sm,
    fontWeight: 'bold',
    marginLeft: 4,
  },
  year: {
    color: colors.textSecondary,
    fontSize: fonts.sizes.sm,
  },
  removeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  removeText: {
    color: colors.error,
    fontSize: fonts.sizes.sm,
    fontWeight: '600',
  },
  emptyText: {
    fontSize: fonts.sizes.xl,
    color: colors.text,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  emptySubtext: {
    fontSize: fonts.sizes.md,
    color: colors.textSecondary,
    textAlign: 'center',
  },
});

export default WishlistScreen;
