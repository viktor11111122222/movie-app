import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native';
import FastImage from 'react-native-fast-image';
import Icon from 'react-native-vector-icons/Ionicons';
import {tmdbService} from '../services/tmdb';
import {useWishlist} from '../context/WishlistContext';

const {width} = Dimensions.get('window');
const CARD_WIDTH = width * 0.42;

const MovieCard = ({movie, onPress}) => {
  const {isInWishlist, toggleWishlist} = useWishlist();
  const inWishlist = isInWishlist(movie.id);

  const handleWishlistToggle = async () => {
    await toggleWishlist(movie);
  };

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={() => onPress(movie)}
      activeOpacity={0.8}>
      <FastImage
        source={{
          uri: tmdbService.getPosterUrl(movie.poster_path),
          priority: FastImage.priority.normal,
        }}
        style={styles.poster}
        resizeMode={FastImage.resizeMode.cover}
      />

      <TouchableOpacity
        style={styles.wishlistButton}
        onPress={handleWishlistToggle}
        hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}>
        <Icon
          name={inWishlist ? 'bookmark' : 'bookmark-outline'}
          size={24}
          color={inWishlist ? '#E50914' : '#fff'}
        />
      </TouchableOpacity>

      <View style={styles.info}>
        <Text style={styles.title} numberOfLines={2}>
          {movie.title}
        </Text>
        <View style={styles.meta}>
          <Icon name="star" size={14} color="#FFD700" />
          <Text style={styles.rating}>{movie.vote_average?.toFixed(1)}</Text>
          <Text style={styles.year}>
            {movie.release_date?.substring(0, 4)}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    width: CARD_WIDTH,
    marginRight: 12,
    marginBottom: 16,
  },
  poster: {
    width: '100%',
    height: CARD_WIDTH * 1.5,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  wishlistButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderRadius: 20,
    padding: 6,
  },
  info: {
    marginTop: 8,
  },
  title: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rating: {
    color: '#FFD700',
    fontSize: 13,
    fontWeight: '600',
    marginLeft: 4,
    marginRight: 8,
  },
  year: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 12,
  },
});

export default MovieCard;
