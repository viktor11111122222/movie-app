import React, {useState, useEffect} from 'react';
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
import {tmdbService} from '../services/tmdb';
import MovieCard from '../components/MovieCard';

const SearchScreen = ({navigation}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  useEffect(() => {
    if (searchQuery.length > 2) {
      const timer = setTimeout(() => {
        handleSearch();
      }, 500);
      return () => clearTimeout(timer);
    } else {
      setResults([]);
      setHasSearched(false);
    }
  }, [searchQuery]);

  const handleSearch = async () => {
    try {
      setIsLoading(true);
      setHasSearched(true);
      const data = await tmdbService.searchMovies(searchQuery);
      setResults(data.results);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleMoviePress = movie => {
    navigation.navigate('MovieDetails', {movieId: movie.id});
  };

  return (
    <View style={styles.container}>
      <View style={styles.searchBar}>
        <Icon name="search" size={20} color="rgba(255,255,255,0.6)" />
        <TextInput
          style={styles.input}
          placeholder="Search movies..."
          placeholderTextColor="rgba(255,255,255,0.5)"
          value={searchQuery}
          onChangeText={setSearchQuery}
          autoFocus
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Icon name="close-circle" size={20} color="rgba(255,255,255,0.6)" />
          </TouchableOpacity>
        )}
      </View>

      {isLoading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#E50914" />
        </View>
      ) : results.length > 0 ? (
        <FlatList
          data={results}
          numColumns={2}
          keyExtractor={item => item.id.toString()}
          renderItem={({item}) => (
            <View style={styles.cardWrapper}>
              <MovieCard movie={item} onPress={handleMoviePress} />
            </View>
          )}
          contentContainerStyle={styles.list}
        />
      ) : hasSearched ? (
        <View style={styles.centerContainer}>
          <Icon name="film-outline" size={80} color="rgba(255,255,255,0.3)" />
          <Text style={styles.emptyTitle}>No results found</Text>
          <Text style={styles.emptyText}>
            Try searching with different keywords
          </Text>
        </View>
      ) : (
        <View style={styles.centerContainer}>
          <Icon name="search-outline" size={80} color="rgba(255,255,255,0.3)" />
          <Text style={styles.emptyTitle}>Search for movies</Text>
          <Text style={styles.emptyText}>
            Enter at least 3 characters to start searching
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0a',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    margin: 16,
    marginTop: 60,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  input: {
    flex: 1,
    color: '#fff',
    fontSize: 16,
    paddingVertical: 12,
    marginLeft: 10,
  },
  list: {
    padding: 16,
  },
  cardWrapper: {
    flex: 1,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '700',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 14,
    textAlign: 'center',
  },
});

export default SearchScreen;
