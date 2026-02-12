import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// ZAMENI OVO SA TVOJIM SERVEROM!!!
const API_BASE_URL = '192.168.0.255'; // STAVI TVOJU IP ADRESU ILI DEPLOYED SERVER

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use(
  async config => {
    const token = await AsyncStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  error => Promise.reject(error),
);

// Handle responses
api.interceptors.response.use(
  response => response,
  async error => {
    if (error.response?.status === 401) {
      // Token expired, logout
      await AsyncStorage.removeItem('authToken');
    }
    return Promise.reject(error);
  },
);

export const authService = {
  async login(login, password) {
    const response = await api.post('/api/login', {login, password});
    if (response.data.token) {
      await AsyncStorage.setItem('authToken', response.data.token);
    }
    return response.data;
  },

  async register(username, email, password, display_name, region) {
    const response = await api.post('/api/register', {
      username,
      email,
      password,
      display_name,
      region,
    });
    if (response.data.token) {
      await AsyncStorage.setItem('authToken', response.data.token);
    }
    return response.data;
  },

  async logout() {
    try {
      await api.post('/api/logout');
    } catch (e) {
      console.log('Logout error:', e);
    }
    await AsyncStorage.removeItem('authToken');
  },

  async getUser() {
    const response = await api.get('/api/user');
    return response.data;
  },

  async updateProfile(data) {
    const response = await api.put('/api/user/profile', data);
    return response.data;
  },

  async updateAvatar(avatarSettings) {
    const response = await api.put('/api/user/avatar', avatarSettings);
    return response.data;
  },

  async updateSettings(settings) {
    const response = await api.put('/api/user/settings', settings);
    return response.data;
  },
};

export const wishlistService = {
  async getWishlist() {
    const response = await api.get('/api/wishlist');
    return response.data;
  },

  async addToWishlist(movie) {
    const response = await api.post('/api/wishlist', {
      movie_id: movie.id,
      movie_data: JSON.stringify(movie),
    });
    return response.data;
  },

  async removeFromWishlist(movieId) {
    const response = await api.delete(`/api/wishlist/${movieId}`);
    return response.data;
  },

  async isInWishlist(movieId) {
    try {
      const response = await api.get(`/api/wishlist/check/${movieId}`);
      return response.data.in_wishlist;
    } catch (e) {
      return false;
    }
  },
};

export const movieService = {
  async rateMovie(movieId, rating) {
    const response = await api.post('/api/movies/rate', {
      movie_id: movieId,
      rating,
    });
    return response.data;
  },

  async getUserRating(movieId) {
    try {
      const response = await api.get(`/api/movies/rating/${movieId}`);
      return response.data.rating;
    } catch (e) {
      return null;
    }
  },

  async markAsWatched(movieId) {
    const response = await api.post('/api/movies/watched', {movie_id: movieId});
    return response.data;
  },

  async trackView(movieId) {
    try {
      await api.post('/api/movies/view', {movie_id: movieId});
    } catch (e) {
      console.log('Track view error:', e);
    }
  },
};

export default api;
