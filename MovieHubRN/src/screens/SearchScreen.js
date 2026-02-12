import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { colors, spacing, fonts, borderRadius } from '../utils/theme';
import tmdbService from '../services/tmdb';
import MovieCard from '../components/MovieCard';
import GenreFilter from '../components/GenreFilter';
import { debounce } from '../utils/helpers';
import { addToRecentlyViewed } from '../components/RecentlyViewed';

const SearchScreen = ({ navigation }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [movies, setMovies] = useState([]);
  const [genres, setGenres] = useState([]);
  const [selectedGenre, setSelectedGenre] = useState(null);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);

  useEffect(() => {
    loadGenres();
  }, []);

  useEffect(() => {
    if (selectedGenre) {
      loadMoviesByGenre();
    }
  }, [selectedGenre]);

  const loadGenres = async () => {
    try {
      const data = await tmdbService.getGenres();
      setGenres(data.genres);
    } catch (error) {
      console.error('Error loading genres:', error);
    }
  };

  const loadMoviesByGenre = async () => {
    try {
      setLoading(true);
      const data = await tmdbService.getMoviesByGenre(selectedGenre, 1);
      setMovies(data.results);
      setPage(1);
    } catch (error) {
      console.error('Error loading movies by genre:', error);
    } finally {
      setLoading(false);
    }
  };

  const searchMovies = async (query) => {
    if (!query.trim()) {
      setMovies([]);
      return;
    }

    try {
      setLoading(true);
      const data = await tmdbService.searchMovies(query, 1);
      setMovies(data.results);
      setPage(1);
      setSelectedGenre(null);
    } catch (error) {
      console.error('Error searching movies:', error);
    } finally {
      setLoading(false);
    }
  };

  const searchRef = useRef(searchMovies);
  searchRef.current = searchMovies;

  const debouncedSearch = useMemo(
    () => debounce((...args) => searchRef.current(...args), 500),
    [],
  );

  const handleSearchChange = (text) => {
    setSearchQuery(text);
    debouncedSearch(text);
  };

  const handleGenreSelect = (genreId) => {
    setSelectedGenre(genreId);
    setSearchQuery('');
    if (genreId === null) {
      setMovies([]);
    }
  };

  const handleMoviePress = (movie) => {
    addToRecentlyViewed(movie);
    navigation.navigate('MovieDetails', { movieId: movie.id });
  };

  const loadMore = async () => {
    if (loading) return;

    try {
      setLoading(true);
      const nextPage = page + 1;
      let data;

      if (searchQuery) {
        data = await tmdbService.searchMovies(searchQuery, nextPage);
      } else if (selectedGenre) {
        data = await tmdbService.getMoviesByGenre(selectedGenre, nextPage);
      }

      if (data) {
        setMovies(prev => [...prev, ...data.results]);
        setPage(nextPage);
      }
    } catch (error) {
      console.error('Error loading more movies:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <Icon name="search" size={20} color={colors.textSecondary} style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search movies..."
          placeholderTextColor={colors.textSecondary}
          value={searchQuery}
          onChangeText={handleSearchChange}
          autoCapitalize="none"
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => handleSearchChange('')}>
            <Icon name="close-circle" size={20} color={colors.textSecondary} />
          </TouchableOpacity>
        )}
      </View>

      <GenreFilter
        genres={genres}
        selectedGenre={selectedGenre}
        onSelectGenre={handleGenreSelect}
      />

      {loading && movies.length === 0 ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : movies.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Icon name="film-outline" size={64} color={colors.textSecondary} />
          <Text style={styles.emptyText}>
            {searchQuery || selectedGenre ? 'No movies found' : 'Search for movies or select a genre'}
          </Text>
        </View>
      ) : (
        <FlatList
          data={movies}
          keyExtractor={(item) => item.id.toString()}
          numColumns={2}
          contentContainerStyle={styles.gridContent}
          renderItem={({ item }) => (
            <View style={styles.movieItem}>
              <MovieCard movie={item} onPress={handleMoviePress} />
            </View>
          )}
          onEndReached={loadMore}
          onEndReachedThreshold={0.5}
          ListFooterComponent={
            loading && movies.length > 0 ? (
              <ActivityIndicator size="small" color={colors.primary} style={styles.footerLoader} />
            ) : null
          }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    margin: spacing.lg,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.darkGray,
  },
  searchIcon: {
    marginRight: spacing.sm,
  },
  searchInput: {
    flex: 1,
    color: colors.text,
    fontSize: fonts.sizes.md,
    paddingVertical: spacing.md,
  },
  gridContent: {
    padding: spacing.md,
  },
  movieItem: {
    flex: 1,
    margin: spacing.sm,
    alignItems: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  emptyText: {
    color: colors.textSecondary,
    fontSize: fonts.sizes.lg,
    textAlign: 'center',
    marginTop: spacing.lg,
  },
  footerLoader: {
    marginVertical: spacing.lg,
  },
});

export default SearchScreen;
