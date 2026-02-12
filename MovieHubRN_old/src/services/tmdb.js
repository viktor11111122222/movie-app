const TMDB_API_KEY = '8265bd1679663a7ea12ac168da84d2e8';
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';

const fetchFromTMDB = async (endpoint, params = {}) => {
  try {
    const queryParams = new URLSearchParams({
      api_key: TMDB_API_KEY,
      ...params,
    });
    
    const response = await fetch(`${TMDB_BASE_URL}${endpoint}?${queryParams}`);
    
    if (!response.ok) {
      throw new Error(`TMDB API Error: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('TMDB API Error:', error);
    throw error;
  }
};

export const tmdbService = {
  getTrending: (timeWindow = 'week') => 
    fetchFromTMDB(`/trending/movie/${timeWindow}`),
  
  getPopular: (page = 1) => 
    fetchFromTMDB('/movie/popular', { page }),
  
  getTopRated: (page = 1) => 
    fetchFromTMDB('/movie/top_rated', { page }),
  
  getNowPlaying: (page = 1) => 
    fetchFromTMDB('/movie/now_playing', { page }),
  
  getUpcoming: (page = 1) => 
    fetchFromTMDB('/movie/upcoming', { page }),
  
  getMovieDetails: (movieId) => 
    fetchFromTMDB(`/movie/${movieId}`, { append_to_response: 'credits,videos,similar,watch/providers' }),
  
  searchMovies: (query, page = 1) => 
    fetchFromTMDB('/search/movie', { query, page }),
  
  getMoviesByGenre: (genreId, page = 1) => 
    fetchFromTMDB('/discover/movie', { with_genres: genreId, page }),
  
  getGenres: () => 
    fetchFromTMDB('/genre/movie/list'),
  
  getMovieVideos: (movieId) => 
    fetchFromTMDB(`/movie/${movieId}/videos`),
  
  getMovieCredits: (movieId) => 
    fetchFromTMDB(`/movie/${movieId}/credits`),
  
  getSimilarMovies: (movieId, page = 1) => 
    fetchFromTMDB(`/movie/${movieId}/similar`, { page }),
  
  getRecommendations: (movieId, page = 1) => 
    fetchFromTMDB(`/movie/${movieId}/recommendations`, { page }),
  
  getWatchProviders: (movieId) => 
    fetchFromTMDB(`/movie/${movieId}/watch/providers`),
};

export default tmdbService;
