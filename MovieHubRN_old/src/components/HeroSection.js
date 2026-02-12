import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/Ionicons';
import { colors, spacing, fonts } from '../utils/theme';
import { getImageUrl, truncateText } from '../utils/helpers';

const { width } = Dimensions.get('window');

const HeroSection = ({ movie, onPress, onPlayTrailer }) => {
  if (!movie) return null;

  return (
    <TouchableOpacity style={styles.container} onPress={() => onPress(movie)} activeOpacity={0.9}>
      <Image
        source={{ uri: getImageUrl(movie.backdrop_path || movie.poster_path, 'original') }}
        style={styles.backgroundImage}
        resizeMode="cover"
      />
      
      <LinearGradient
        colors={['transparent', 'rgba(20, 20, 20, 0.7)', colors.background]}
        style={styles.gradient}
      >
        <View style={styles.content}>
          <Text style={styles.title}>{movie.title}</Text>
          
          <View style={styles.metadata}>
            <View style={styles.ratingContainer}>
              <Icon name="star" size={16} color={colors.accent} />
              <Text style={styles.rating}>{movie.vote_average?.toFixed(1)}</Text>
            </View>
            
            <Text style={styles.year}>
              {movie.release_date ? new Date(movie.release_date).getFullYear() : 'N/A'}
            </Text>
          </View>
          
          <Text style={styles.overview} numberOfLines={3}>
            {truncateText(movie.overview, 150)}
          </Text>
          
          <View style={styles.buttons}>
            <TouchableOpacity 
              style={styles.playButton} 
              onPress={() => onPlayTrailer && onPlayTrailer(movie)}
            >
              <Icon name="play" size={20} color={colors.white} />
              <Text style={styles.playButtonText}>Watch Trailer</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.infoButton} 
              onPress={() => onPress(movie)}
            >
              <Icon name="information-circle-outline" size={20} color={colors.white} />
              <Text style={styles.infoButtonText}>More Info</Text>
            </TouchableOpacity>
          </View>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    width: width,
    height: 500,
    position: 'relative',
  },
  backgroundImage: {
    width: '100%',
    height: '100%',
  },
  gradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '70%',
    justifyContent: 'flex-end',
  },
  content: {
    padding: spacing.lg,
    paddingBottom: spacing.xl,
  },
  title: {
    fontSize: fonts.sizes.huge,
    fontWeight: 'bold',
    color: colors.white,
    marginBottom: spacing.sm,
  },
  metadata: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  rating: {
    color: colors.white,
    fontSize: fonts.sizes.md,
    fontWeight: 'bold',
    marginLeft: 4,
  },
  year: {
    color: colors.textSecondary,
    fontSize: fonts.sizes.md,
  },
  overview: {
    color: colors.textSecondary,
    fontSize: fonts.sizes.md,
    lineHeight: 20,
    marginBottom: spacing.lg,
  },
  buttons: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  playButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    borderRadius: 8,
  },
  playButtonText: {
    color: colors.white,
    fontSize: fonts.sizes.md,
    fontWeight: 'bold',
    marginLeft: spacing.sm,
  },
  infoButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingVertical: spacing.md,
    borderRadius: 8,
  },
  infoButtonText: {
    color: colors.white,
    fontSize: fonts.sizes.md,
    fontWeight: 'bold',
    marginLeft: spacing.sm,
  },
});

export default HeroSection;
