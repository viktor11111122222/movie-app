import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { colors, spacing } from '../utils/theme';

const StarRating = ({ rating, maxRating = 5, size = 24, onRate, editable = false }) => {
  const handlePress = (value) => {
    if (editable && onRate) {
      onRate(value);
    }
  };

  return (
    <View style={styles.container}>
      {[...Array(maxRating)].map((_, index) => {
        const starValue = index + 1;
        const isFilled = starValue <= rating;
        const isHalfFilled = rating > index && rating < starValue;

        return (
          <TouchableOpacity
            key={index}
            onPress={() => handlePress(starValue)}
            disabled={!editable}
            activeOpacity={editable ? 0.7 : 1}
          >
            <Icon
              name={isFilled ? 'star' : isHalfFilled ? 'star-half' : 'star-outline'}
              size={size}
              color={colors.accent}
              style={styles.star}
            />
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  star: {
    marginHorizontal: 2,
  },
});

export default StarRating;
