import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { colors, spacing, fonts, borderRadius } from '../utils/theme';

const GenreFilter = ({ genres, selectedGenre, onSelectGenre }) => {
  return (
    <View style={styles.container}>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <TouchableOpacity
          style={[
            styles.genreButton,
            selectedGenre === null && styles.genreButtonActive,
          ]}
          onPress={() => onSelectGenre(null)}
        >
          <Text
            style={[
              styles.genreText,
              selectedGenre === null && styles.genreTextActive,
            ]}
          >
            All
          </Text>
        </TouchableOpacity>
        
        {genres.map((genre) => (
          <TouchableOpacity
            key={genre.id}
            style={[
              styles.genreButton,
              selectedGenre === genre.id && styles.genreButtonActive,
            ]}
            onPress={() => onSelectGenre(genre.id)}
          >
            <Text
              style={[
                styles.genreText,
                selectedGenre === genre.id && styles.genreTextActive,
              ]}
            >
              {genre.name}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: spacing.md,
  },
  scrollContent: {
    paddingHorizontal: spacing.md,
  },
  genreButton: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    marginRight: spacing.sm,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.darkGray,
  },
  genreButtonActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  genreText: {
    color: colors.textSecondary,
    fontSize: fonts.sizes.md,
    fontWeight: '500',
  },
  genreTextActive: {
    color: colors.white,
    fontWeight: 'bold',
  },
});

export default GenreFilter;
