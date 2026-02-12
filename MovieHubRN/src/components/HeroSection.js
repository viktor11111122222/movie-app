import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import FastImage from 'react-native-fast-image';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/Ionicons';
import {tmdbService} from '../services/tmdb';

const {width, height} = Dimensions.get('window');
const HERO_HEIGHT = height * 0.6;

const HeroSection = ({movie, onPress}) => {
  if (!movie) return null;

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={() => onPress(movie)}
      activeOpacity={0.9}>
      <FastImage
        source={{
          uri: tmdbService.getBackdropUrl(movie.backdrop_path),
          priority: FastImage.priority.high,
        }}
        style={styles.image}
        resizeMode={FastImage.resizeMode.cover}
      />

      <LinearGradient
        colors={['transparent', 'rgba(0,0,0,0.3)', 'rgba(0,0,0,0.9)', '#0a0a0a']}
        style={styles.gradient}
      />

      <View style={styles.content}>
        <Text style={styles.title}>{movie.title}</Text>
        <View style={styles.meta}>
          <View style={styles.rating}>
            <Icon name="star" size={18} color="#FFD700" />
            <Text style={styles.ratingText}>{movie.vote_average?.toFixed(1)}</Text>
          </View>
          <Text style={styles.year}>
            {movie.release_date?.substring(0, 4)}
          </Text>
        </View>
        <Text style={styles.overview} numberOfLines={3}>
          {movie.overview}
        </Text>

        <View style={styles.buttons}>
          <TouchableOpacity
            style={styles.playButton}
            onPress={() => onPress(movie)}>
            <Icon name="play" size={20} color="#fff" />
            <Text style={styles.playButtonText}>Watch Now</Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    height: HERO_HEIGHT,
    width: width,
    marginBottom: 20,
  },
  image: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  gradient: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  content: {
    position: 'absolute',
    bottom: 30,
    left: 16,
    right: 16,
  },
  title: {
    color: '#fff',
    fontSize: 32,
    fontWeight: '700',
    marginBottom: 8,
  },
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
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
  },
  overview: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 16,
  },
  buttons: {
    flexDirection: 'row',
  },
  playButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E50914',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 8,
  },
  playButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});

export default HeroSection;
