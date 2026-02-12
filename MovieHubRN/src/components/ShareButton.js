import React from 'react';
import { TouchableOpacity, StyleSheet, Share, Alert } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { colors, spacing } from '../utils/theme';

const ShareButton = ({ movie, style }) => {
  const handleShare = async () => {
    try {
      const message = `Check out "${movie.title}"!\n\nRating: ${movie.vote_average}/10\n\nhttps://www.themoviedb.org/movie/${movie.id}`;
      
      const result = await Share.share({
        message,
        title: movie.title,
      });

      if (result.action === Share.sharedAction) {
        if (result.activityType) {
          console.log('Shared with activity type:', result.activityType);
        } else {
          console.log('Shared successfully');
        }
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to share movie');
      console.error('Share error:', error);
    }
  };

  return (
    <TouchableOpacity 
      style={[styles.button, style]} 
      onPress={handleShare}
      activeOpacity={0.7}
    >
      <Icon name="share-social" size={24} color={colors.white} />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default ShareButton;
