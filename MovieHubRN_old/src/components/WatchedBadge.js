import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { colors, spacing, fonts } from '../utils/theme';

const WatchedBadge = ({ watched, rating }) => {
  if (!watched) return null;

  return (
    <View style={styles.container}>
      <Icon name="checkmark-circle" size={16} color={colors.success} />
      <Text style={styles.text}>Watched</Text>
      {rating && (
        <>
          <View style={styles.separator} />
          <Icon name="star" size={14} color={colors.accent} />
          <Text style={styles.ratingText}>{rating}</Text>
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(76, 175, 80, 0.2)',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.success,
  },
  text: {
    color: colors.success,
    fontSize: fonts.sizes.xs,
    fontWeight: 'bold',
    marginLeft: 4,
  },
  separator: {
    width: 1,
    height: 12,
    backgroundColor: colors.success,
    marginHorizontal: spacing.xs,
  },
  ratingText: {
    color: colors.accent,
    fontSize: fonts.sizes.xs,
    fontWeight: 'bold',
    marginLeft: 2,
  },
});

export default WatchedBadge;
