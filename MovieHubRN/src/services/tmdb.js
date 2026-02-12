import axios from 'axios';

const TMDB_API_KEY = '8265bd1679663a7ea12ac168da84d2e8';
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const TMDB_IMAGE_BASE = 'https://image.tmdb.org/t/p/w500';
const TMDB_IMAGE_HERO = 'https://image.tmdb.org/t/p/original';

const tmdbApi = axios.create({
  baseURL: TMDB_BASE_URL,
  timeout: 10000,
  params: {
    api_key: TMDB_API_KEY,
  },
});

export const tmdbService = {
  // Get trending movies
  async getTrending(page = 1) {
    const response = await tmdbApi.get('/trending/movie/week', {
      params: {page},
    });
    return response.data;
  },

  // Get popular movies
  async getPopular(page = 1) {
    const response = await tmdbApi.get('/movie/popular', {
      params: {page},
    });
    return response.data;
  },

  // Get top rated movies
  async getTopRated(page = 1) {
    const response = await tmdbApi.get('/movie/top_rated', {
      params: {page},
    });
    return response.data;
  },

  // Get upcoming movies
  async getUpcoming(page = 1) {
    const response = await tmdbApi.get('/movie/upcoming', {
      params: {page},
    });
    return response.data;
  },

  // Search movies
  async searchMovies(query, page = 1) {
    const response = await tmdbApi.get('/search/movie', {
      params: {query, page},
    });
    return response.data;
  },

  // Get movie details
  async getMovieDetails(movieId) {
    const response = await tmdbApi.get(`/movie/${movieId}`, {
      params: {
        append_to_response: 'credits,videos,similar,recommendations,watch/providers',
      },
    });
    return response.data;
  },

  // Get movie videos
  async getMovieVideos(movieId) {
    const response = await tmdbApi.get(`/movie/${movieId}/videos`);
    return response.data;
  },

  // Get movie credits
  async getMovieCredits(movieId) {
    const response = await tmdbApi.get(`/movie/${movieId}/credits`);
    return response.data;
  },

  // Get similar movies
  async getSimilarMovies(movieId, page = 1) {
    const response = await tmdbApi.get(`/movie/${movieId}/similar`, {
      params: {page},
    });
    return response.data;
  },

  // Get movie recommendations
  async getMovieRecommendations(movieId, page = 1) {
    const response = await tmdbApi.get(`/movie/${movieId}/recommendations`, {
      params: {page},
    });
    return response.data;
  },

  // Get genres
  async getGenres() {
    const response = await tmdbApi.get('/genre/movie/list');
    return response.data.genres;
  },

  // Discover movies by genre
  async discoverByGenre(genreId, page = 1) {
    const response = await tmdbApi.get('/discover/movie', {
      params: {
        with_genres: genreId,
        page,
        sort_by: 'popularity.desc',
      },
    });
    return response.data;
  },

  // Get image URL
  getImageUrl(path, size = 'w500') {
    if (!path) return null;
    const baseUrl = size === 'original' ? TMDB_IMAGE_HERO : TMDB_IMAGE_BASE;
    return `${baseUrl}${path}`;
  },

  getPosterUrl(path) {
    return this.getImageUrl(path, 'w500');
  },

  getBackdropUrl(path) {
    return this.getImageUrl(path, 'original');
  },
};

export default tmdbService;
