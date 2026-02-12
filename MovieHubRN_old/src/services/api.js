const API_BASE_URL = 'http://localhost:3000/api';

let authToken = null;

export const setAuthToken = (token) => {
  authToken = token;
};

export const clearAuthToken = () => {
  authToken = null;
};

const fetchFromAPI = async (endpoint, options = {}) => {
  try {
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };
    
    if (authToken) {
      headers['Authorization'] = `Bearer ${authToken}`;
    }
    
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'API Error');
    }
    
    return await response.json();
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};

export const apiService = {
  // Auth
  login: (email, password) => 
    fetchFromAPI('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),
  
  register: (name, email, password) => 
    fetchFromAPI('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password }),
    }),
  
  logout: () => {
    clearAuthToken();
    return Promise.resolve();
  },
  
  // Wishlist
  getWishlist: () => 
    fetchFromAPI('/wishlist'),
  
  addToWishlist: (movieId, movieData) => 
    fetchFromAPI('/wishlist', {
      method: 'POST',
      body: JSON.stringify({ movieId, ...movieData }),
    }),
  
  removeFromWishlist: (movieId) => 
    fetchFromAPI(`/wishlist/${movieId}`, {
      method: 'DELETE',
    }),
  
  // Watched
  markAsWatched: (movieId, rating) => 
    fetchFromAPI('/watched', {
      method: 'POST',
      body: JSON.stringify({ movieId, rating }),
    }),
  
  getWatchedMovies: () => 
    fetchFromAPI('/watched'),
  
  // Profile
  getProfile: () => 
    fetchFromAPI('/profile'),
  
  updateProfile: (data) => 
    fetchFromAPI('/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
};

export default apiService;
