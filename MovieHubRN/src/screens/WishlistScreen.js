import React from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import {useWishlist} from '../context/WishlistContext';
import MovieCard from '../components/MovieCard';

const WishlistScreen = ({navigation}) => {
  const {wishlist, isLoading} = useWishlist();

  const handleMoviePress = movie => {
    navigation.navigate('MovieDetails', {movieId: movie.id});
  };

  if (wishlist.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Icon name="bookmark-outline" size={80} color="rgba(255,255,255,0.3)" />
        <Text style={styles.emptyTitle}>Your wishlist is empty</Text>
        <Text style={styles.emptyText}>
          Add movies to your wishlist to watch them later
        </Text>
        <TouchableOpacity
          style={styles.browseButton}
          onPress={() => navigation.navigate('Home')}>
          <Text style={styles.browseButtonText}>Browse Movies</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Wishlist</Text>
        <Text style={styles.count}>{wishlist.length} movies</Text>
      </View>

      <FlatList
        data={wishlist}
        numColumns={2}
        keyExtractor={item => item.id.toString()}
        renderItem={({item}) => (
          <View style={styles.cardWrapper}>
            <MovieCard movie={item} onPress={handleMoviePress} />
          </View>
        )}
        contentContainerStyle={styles.list}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0a',
  },
  header: {
    padding: 16,
    paddingTop: 60,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  headerTitle: {
    color: '#fff',
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 4,
  },
  count: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 14,
  },
  list: {
    padding: 16,
  },
  cardWrapper: {
    flex: 1,
  },
  emptyContainer: {
    flex: 1,
    backgroundColor: '#0a0a0a',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyTitle: {
    color: '#fff',
    fontSize: 22,
    fontWeight: '700',
    marginTop: 20,
    marginBottom: 8,
  },
  emptyText: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 15,
    textAlign: 'center',
    marginBottom: 24,
  },
  browseButton: {
    backgroundColor: '#E50914',
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 8,
  },
  browseButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default WishlistScreen;
