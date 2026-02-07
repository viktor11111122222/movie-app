// API Configuration - TMDb API (besplatan i stabilan)
const TMDB_API_KEY = '8265bd1679663a7ea12ac168da84d2e8';
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const TMDB_IMAGE_BASE = 'https://image.tmdb.org/t/p/w500'; // w500 umesto original — 5x brže učitavanje
const TMDB_IMAGE_HERO = 'https://image.tmdb.org/t/p/original'; // original samo za hero pozadinu

// ==================== AUTH SYSTEM ====================
let authToken = localStorage.getItem('authToken');
let currentUser = null;

// API helper - automatski dodaje auth token
async function apiCall(url, options = {}) {
  const headers = { 'Content-Type': 'application/json', ...options.headers };
  if (authToken) {
    headers['Authorization'] = `Bearer ${authToken}`;
  }
  const response = await fetch(url, { ...options, headers });
  return response;
}

// Check auth state on load
async function checkAuth() {
  if (!authToken) {
    showAuthScreen();
    return false;
  }

  try {
    const res = await apiCall('/api/user');
    if (!res.ok) {
      localStorage.removeItem('authToken');
      authToken = null;
      showAuthScreen();
      return false;
    }

    const data = await res.json();
    currentUser = data.user;

    // Sync server data to localStorage for existing functions
    syncUserDataToLocal(data);

    hideAuthScreen();
    return true;
  } catch (error) {
    console.error('Auth check failed:', error);
    showAuthScreen();
    return false;
  }
}

function syncUserDataToLocal(data) {
  // Sync profile
  const profile = {
    name: data.user.display_name,
    email: data.user.email,
    bio: data.user.bio
  };
  localStorage.setItem('userProfile', JSON.stringify(profile));

  // Sync avatar
  const avatarSettings = {
    type: data.user.avatar_type || 'color',
    color: data.user.avatar_color || '#ffffff',
    imageData: data.user.avatar_image || ''
  };
  localStorage.setItem('avatarSettings', JSON.stringify(avatarSettings));

  // Sync settings
  if (data.settings) {
    const appSettings = {
      autoplayTrailers: data.settings.autoplay_trailers,
      autoplay: data.settings.autoplay_trailers,
      videoQuality: data.settings.video_quality,
      theme: 'dark',
      showRatings: true,
      language: data.settings.language,
      region: data.settings.region,
      trackHistory: data.settings.track_history
    };
    localStorage.setItem('appSettings', JSON.stringify(appSettings));
  }

  // Sync watchlist
  if (data.watchlist) {
    wishlist = data.watchlist;
    localStorage.setItem('movieWishlist', JSON.stringify(wishlist));
  }
}

function showAuthScreen() {
  const authScreen = document.getElementById('authScreen');
  if (authScreen) {
    authScreen.style.display = 'flex';
    authScreen.classList.remove('hidden');
  }
  document.body.style.overflow = 'hidden';
}

function hideAuthScreen() {
  const authScreen = document.getElementById('authScreen');
  if (authScreen) {
    authScreen.classList.add('hidden');
    setTimeout(() => {
      authScreen.style.display = 'none';
      document.body.style.overflow = '';
    }, 500);
  }
}

function switchAuthForm(formType) {
  const loginForm = document.getElementById('loginForm');
  const registerForm = document.getElementById('registerForm');
  const subtitle = document.getElementById('authSubtitle');

  // Clear errors
  document.getElementById('loginError').textContent = '';
  document.getElementById('loginError').classList.remove('show');
  document.getElementById('registerError').textContent = '';
  document.getElementById('registerError').classList.remove('show');

  if (formType === 'register') {
    loginForm.style.display = 'none';
    registerForm.style.display = 'flex';
    if (subtitle) subtitle.textContent = 'Креирај налог да откријеш филмове';
  } else {
    loginForm.style.display = 'flex';
    registerForm.style.display = 'none';
    if (subtitle) subtitle.textContent = 'Пријави се да откријеш филмове';
  }
}

function togglePasswordVisibility(inputId, btn) {
  const input = document.getElementById(inputId);
  if (input.type === 'password') {
    input.type = 'text';
    btn.innerHTML = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
      <line x1="1" y1="1" x2="23" y2="23"></line>
    </svg>`;
  } else {
    input.type = 'password';
    btn.innerHTML = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
      <circle cx="12" cy="12" r="3"></circle>
    </svg>`;
  }
}

function showAuthError(formType, message) {
  const errorEl = document.getElementById(formType === 'login' ? 'loginError' : 'registerError');
  errorEl.textContent = message;
  errorEl.classList.add('show');
}

async function handleLogin(event) {
  event.preventDefault();
  const btn = document.getElementById('loginBtn');
  const spinner = btn.querySelector('.auth-spinner');
  const btnText = btn.querySelector('span');

  // Disable button, show spinner
  btn.disabled = true;
  spinner.style.display = 'block';
  btnText.textContent = 'Пријављивање...';

  const login = document.getElementById('loginUsername').value.trim();
  const password = document.getElementById('loginPassword').value;

  try {
    const res = await fetch('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ login, password })
    });

    const data = await res.json();

    if (!res.ok) {
      showAuthError('login', data.error || 'Грешка при пријављивању');
      btn.disabled = false;
      spinner.style.display = 'none';
      btnText.textContent = 'Пријави се';
      return;
    }

    // Save token
    authToken = data.token;
    localStorage.setItem('authToken', data.token);
    currentUser = data.user;

    // Sync data
    syncUserDataToLocal(data);

    // Hide auth screen and initialize app
    hideAuthScreen();
    initializeApp();

  } catch (error) {
    console.error('Login error:', error);
    showAuthError('login', 'Грешка при повезивању са сервером');
    btn.disabled = false;
    spinner.style.display = 'none';
    btnText.textContent = 'Пријави се';
  }
}

async function handleRegister(event) {
  event.preventDefault();
  const btn = document.getElementById('registerBtn');
  const spinner = btn.querySelector('.auth-spinner');
  const btnText = btn.querySelector('span');

  const username = document.getElementById('registerUsername').value.trim();
  const display_name = document.getElementById('registerDisplayName').value.trim();
  const email = document.getElementById('registerEmail').value.trim();
  const password = document.getElementById('registerPassword').value;
  const passwordConfirm = document.getElementById('registerPasswordConfirm').value;

  // Validate passwords match
  if (password !== passwordConfirm) {
    showAuthError('register', 'Лозинке се не поклапају');
    return;
  }

  // Disable button, show spinner
  btn.disabled = true;
  spinner.style.display = 'block';
  btnText.textContent = 'Креирање налога...';

  try {
    const res = await fetch('/api/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, email, password, display_name })
    });

    const data = await res.json();

    if (!res.ok) {
      showAuthError('register', data.error || 'Грешка при регистрацији');
      btn.disabled = false;
      spinner.style.display = 'none';
      btnText.textContent = 'Креирај налог';
      return;
    }

    // Save token
    authToken = data.token;
    localStorage.setItem('authToken', data.token);
    currentUser = data.user;

    // Sync data
    syncUserDataToLocal(data);

    // Hide auth screen and initialize app
    hideAuthScreen();
    initializeApp();

    showNotification('Добродошао, ' + (data.user.display_name || data.user.username) + '! 🎬');

  } catch (error) {
    console.error('Register error:', error);
    showAuthError('register', 'Грешка при повезивању са сервером');
    btn.disabled = false;
    spinner.style.display = 'none';
    btnText.textContent = 'Креирај налог';
  }
}

async function handleLogout() {
  try {
    await apiCall('/api/logout', { method: 'POST' });
  } catch (e) {
    // ignore
  }

  // Clear local data
  authToken = null;
  currentUser = null;
  localStorage.removeItem('authToken');

  // Show auth screen
  showAuthScreen();

  // Close profile dropdown
  const dropdown = document.getElementById('profileDropdown');
  if (dropdown) dropdown.classList.remove('active');

  showNotification('Успешно сте се одјавили');
}

// Save profile field to server
async function saveFieldToServer(fieldId, value) {
  if (!authToken) return;
  const body = {};
  if (fieldId === 'profileName') body.display_name = value;
  else if (fieldId === 'profileEmail') body.email = value;
  else if (fieldId === 'profileBio') body.bio = value;

  try {
    await apiCall('/api/user/profile', {
      method: 'PUT',
      body: JSON.stringify(body)
    });
  } catch (e) {
    console.error('Failed to save profile to server:', e);
  }
}

// Save settings to server
async function saveSettingsToServer() {
  if (!authToken) return;
  const settings = JSON.parse(localStorage.getItem('appSettings') || '{}');
  try {
    await apiCall('/api/user/settings', {
      method: 'PUT',
      body: JSON.stringify({
        autoplay_trailers: settings.autoplayTrailers !== false,
        video_quality: settings.videoQuality || 'auto',
        language: settings.language || 'en',
        region: settings.region || 'US',
        track_history: settings.trackHistory !== false
      })
    });
  } catch (e) {
    console.error('Failed to save settings to server:', e);
  }
}

// Save watchlist to server
async function syncWatchlistToServer(movieData, action) {
  if (!authToken) return;
  try {
    if (action === 'add') {
      await apiCall('/api/watchlist', {
        method: 'POST',
        body: JSON.stringify({ movie_id: movieData.id, movie_data: movieData })
      });
    } else if (action === 'remove') {
      await apiCall(`/api/watchlist/${movieData.id}`, { method: 'DELETE' });
    }
  } catch (e) {
    console.error('Failed to sync watchlist to server:', e);
  }
}

// Save avatar to server
async function saveAvatarToServer(avatarSettings) {
  if (!authToken) return;
  try {
    await apiCall('/api/user/avatar', {
      method: 'PUT',
      body: JSON.stringify({
        avatar_type: avatarSettings.type,
        avatar_color: avatarSettings.color || null,
        avatar_image: avatarSettings.imageData || null
      })
    });
  } catch (e) {
    console.error('Failed to save avatar to server:', e);
  }
}

// Track to server
async function trackToServer(type, movieId) {
  if (!authToken) return;
  try {
    await apiCall(`/api/track/${type}`, {
      method: 'POST',
      body: JSON.stringify({ movie_id: movieId })
    });
  } catch (e) {
    // ignore tracking errors
  }
}

// ==================== END AUTH SYSTEM ====================

// Helper function to get video quality parameter
function getVideoQualityParam() {
  const settings = JSON.parse(localStorage.getItem('appSettings')) || { videoQuality: 'auto' };
  const quality = settings.videoQuality || 'auto';
  
  // YouTube quality parameters: hd1080, hd720, large (480p)
  const qualityMap = {
    '1080p': 'hd1080',
    '720p': 'hd720',
    '480p': 'large',
    'auto': 'default'
  };
  
  const ytQuality = qualityMap[quality] || 'default';
  return ytQuality !== 'default' ? `&vq=${ytQuality}` : '';
}

// Wishlist
let wishlist = JSON.parse(localStorage.getItem('movieWishlist')) || [];

// Search debounce timer
let searchTimeout;

// Globalne promenljive za žanrove i filmove
let allGenres = {};
let allTopRatedMovies = [];
let currentGenreFilter = null;

// Tracking za svaki carousel
let carouselState = {
  recommended: { currentPage: 0, maxPage: 100, shownMovies: [] },
  trending: { currentPage: 0, maxPage: 50, shownMovies: [] },
  topRated: { currentPage: 0, maxPage: 100, shownMovies: [] },
  newReleases: { currentPage: 0, maxPage: 50, shownMovies: [] },
  popular: { currentPage: 0, maxPage: 100, shownMovies: [] },
  upcoming: { currentPage: 0, maxPage: 50, shownMovies: [] },
  highestRated: { currentPage: 0, maxPage: 50, shownMovies: [] },
  classics: { currentPage: 0, maxPage: 50, shownMovies: [] },
  action: { currentPage: 0, maxPage: 80, shownMovies: [] },
  comedy: { currentPage: 0, maxPage: 80, shownMovies: [] },
  horror: { currentPage: 0, maxPage: 80, shownMovies: [] },
  scifi: { currentPage: 0, maxPage: 80, shownMovies: [] },
  drama: { currentPage: 0, maxPage: 80, shownMovies: [] },
  documentary: { currentPage: 0, maxPage: 50, shownMovies: [] },
  animation: { currentPage: 0, maxPage: 80, shownMovies: [] },
  genre: { currentPage: 0, maxPage: 50, shownMovies: [] }
};

// Učitaj najbolji film za hero sekciju
async function loadHeroMovie() {
  console.log('🎬 Loading hero movie...');
  try {
    // Uzmi top rated filmove sa TMDb
    const response = await fetch(`${TMDB_BASE_URL}/movie/top_rated?api_key=${TMDB_API_KEY}&language=en-US&page=1`);
    const data = await response.json();
    
    if (data.results && data.results.length > 0) {
      // Nasumično izaberi jedan od top 10 filmova
      const randomIndex = Math.floor(Math.random() * Math.min(10, data.results.length));
      const moviePreview = data.results[randomIndex];
      
      console.log('📡 Fetching full movie details for:', moviePreview.title);
      
      // Uzmi detalje filma
      const detailsResponse = await fetch(`${TMDB_BASE_URL}/movie/${moviePreview.id}?api_key=${TMDB_API_KEY}&language=en-US`);
      const movie = await detailsResponse.json();
      
      // Uzmi videos (trailers)
      const videosResponse = await fetch(`${TMDB_BASE_URL}/movie/${movie.id}/videos?api_key=${TMDB_API_KEY}&language=en-US`);
      const videosData = await videosResponse.json();
      
      movie.trailers = videosData.results || [];
      
      console.log('📦 Movie data:', movie);
      console.log('✅ Movie loaded successfully:', movie.title);
      
      updateHeroSection(movie);
    } else {
      console.error('❌ No movies found');
      alert('No movies found');
    }
  } catch (error) {
    console.error('❌ Error loading hero movie:', error);
    alert('Failed to load movie. Check console for details.');
  }
}

// Ažuriraj hero sekciju sa podacima filma
function updateHeroSection(movie) {
  console.log('🎨 Updating hero section with:', movie.title);
  
  // Sačuvaj trenutni film za kasnije
  window.currentHeroMovie = movie;
  
  const heroSection = document.querySelector('.hero');
  const heroTitle = document.querySelector('.hero-title');
  const heroDescription = document.querySelector('.hero-description');
  const heroRating = document.querySelector('.hero-rating');
  const watchTrailerBtn = document.querySelector('.btn-primary');
  const addToWishlistBtn = document.querySelector('.btn-secondary');
  
  // Postavi backdrop sliku za pozadinu
  if (movie.backdrop_path) {
    const backdropUrl = `${TMDB_IMAGE_HERO}${movie.backdrop_path}`;
    heroSection.style.backgroundImage = `
      linear-gradient(to bottom, rgba(20, 20, 20, 0.3), rgba(20, 20, 20, 0.9)),
      url('${backdropUrl}')
    `;
    heroSection.style.backgroundSize = 'cover';
    heroSection.style.backgroundPosition = 'center';
  }
  
  // Postavi podatke
  heroTitle.textContent = movie.title.toUpperCase();
  heroDescription.textContent = movie.overview;
  heroRating.innerHTML = `⭐ ${movie.vote_average.toFixed(1)}`;
  
  console.log('✏️ Text updated');
  
  // Pronađi YouTube trailer
  const youtubeTrailer = movie.trailers.find(v => v.site === 'YouTube' && v.type === 'Trailer');
  
  // Proveri da li je autoplay uključen u settings
  const settings = JSON.parse(localStorage.getItem('appSettings')) || { autoplay: true };
  const shouldAutoplay = settings.autoplay !== false; // Default je true
  
  // Nakon 3 sekunde zameni sliku sa video trailerom (samo ako je autoplay uključen)
  if (youtubeTrailer && shouldAutoplay) {
    setTimeout(() => {
      console.log('🎥 Starting background trailer...');
      
      // Ukloni postojeću pozadinu
      heroSection.style.backgroundImage = 'none';
      
      // Kreiraj video element za pozadinu (muted) - koristi youtube-nocookie.com za manje ograničenja
      const videoContainer = document.createElement('div');
      videoContainer.className = 'hero-video-background';
      videoContainer.id = 'heroVideoContainer';
      const qualityParam = getVideoQualityParam();
      videoContainer.innerHTML = `
        <iframe 
          id="heroTrailerIframe"
          src="https://www.youtube-nocookie.com/embed/${youtubeTrailer.key}?autoplay=1&mute=1&loop=1&playlist=${youtubeTrailer.key}&controls=0&showinfo=0&rel=0&modestbranding=1&playsinline=1&disablekb=1&fs=0&iv_load_policy=3${qualityParam}"
          frameborder="0"
          allow="autoplay; encrypted-media"
          allowfullscreen
        ></iframe>
      `;
      
      // Dodaj video kao prvi element u hero sekciji
      heroSection.insertBefore(videoContainer, heroSection.firstChild);
      console.log('✅ Background trailer started (using youtube-nocookie)');
    }, 3000);
    
    // Sačuvaj trailer key za kasnije
    window.currentTrailerKey = youtubeTrailer.key;
  }
  
  // Watch Trailer dugme - uvecaj postojeci video
  watchTrailerBtn.onclick = (e) => {
    e.preventDefault();
    console.log('🎬 Zooming trailer');
    
    if (youtubeTrailer) {
      // Track that user watched this movie
      trackMovieWatched(movie.id);
      openTrailerModal();
    } else {
      // Fallback
      window.open(`https://www.themoviedb.org/movie/${movie.id}`, '_blank');
    }
  };
  
  // Add to Wishlist dugme
  updateWishlistButton(addToWishlistBtn, movie);
  addToWishlistBtn.onclick = (e) => {
    e.preventDefault();
    toggleWishlist(movie, addToWishlistBtn);
  };
  
  console.log('✅ Hero section updated successfully!');
}

// Otvori trailer modal (uvecaj postojeci video)
let cursorTimeout;

function openTrailerModal() {
  const modal = document.getElementById('trailerModal');
  const videoContainer = document.getElementById('heroVideoContainer');
  const heroContent = document.querySelector('.hero-content');
  const closeBtn = document.querySelector('.trailer-modal-close');
  
  if (!window.currentTrailerKey) {
    console.error('No trailer key found');
    return;
  }
  
  console.log('🎬 Opening fullscreen trailer');
  
  // Prikaži modal overlay
  modal.classList.add('active');
  
  // Sakrij background video
  if (videoContainer) {
    videoContainer.style.opacity = '0';
  }
  
  // Sakrij hero content
  if (heroContent) heroContent.style.opacity = '0';
  
  // Kreiraj novi fullscreen iframe sa zvukom
  const fullscreenVideo = document.createElement('div');
  fullscreenVideo.className = 'fullscreen-trailer-container';
  fullscreenVideo.id = 'fullscreenTrailer';
  const qualityParam = getVideoQualityParam();
  fullscreenVideo.innerHTML = `
    <iframe
      src="https://www.youtube-nocookie.com/embed/${window.currentTrailerKey}?autoplay=1&mute=0&controls=1&showinfo=0&rel=0&modestbranding=1&playsinline=1&iv_load_policy=3${qualityParam}"
      frameborder="0"
      allow="autoplay; encrypted-media"
      allowfullscreen
    ></iframe>
  `;
  
  document.body.appendChild(fullscreenVideo);
  
  // Animiraj pojavu
  setTimeout(() => {
    fullscreenVideo.classList.add('active');
  }, 10);
  
  document.body.style.overflow = 'hidden';
  
  // Dodaj event listener za pomeranje miša
  document.addEventListener('mousemove', handleCursorMove);
  
  console.log('✅ Fullscreen trailer opened');
}

function handleCursorMove() {
  const closeBtn = document.querySelector('.trailer-modal-close');
  
  if (closeBtn) {
    // Prikaži X dugme
    closeBtn.style.opacity = '1';
    closeBtn.style.pointerEvents = 'all';
    
    // Resetuj timer
    clearTimeout(cursorTimeout);
    
    // Postavi novi timer za skrivanje nakon 2 sekunde
    cursorTimeout = setTimeout(() => {
      closeBtn.style.opacity = '0';
      closeBtn.style.pointerEvents = 'none';
    }, 2000);
  }
}

// Zatvori trailer modal (vrati video na normalnu velicinu)
function closeTrailerModal() {
  const modal = document.getElementById('trailerModal');
  const videoContainer = document.getElementById('heroVideoContainer');
  const heroContent = document.querySelector('.hero-content');
  const closeBtn = document.querySelector('.trailer-modal-close');
  const fullscreenTrailer = document.getElementById('fullscreenTrailer');
  
  modal.classList.remove('active');
  
  // Ukloni fullscreen video
  if (fullscreenTrailer) {
    fullscreenTrailer.classList.remove('active');
    setTimeout(() => {
      fullscreenTrailer.remove();
    }, 300);
  }
  
  // Vrati background video
  if (videoContainer) {
    videoContainer.style.opacity = '1';
  }
  
  if (heroContent) heroContent.style.opacity = '1';
  
  // Vrati X dugme na vidljivo
  if (closeBtn) {
    closeBtn.style.opacity = '0';
    closeBtn.style.pointerEvents = 'none';
  }
  
  // Ukloni event listener
  document.removeEventListener('mousemove', handleCursorMove);
  
  // Očisti timeout
  clearTimeout(cursorTimeout);
  
  document.body.style.overflow = 'auto';
  
  console.log('❌ Trailer zoom closed');
}

// Zatvori modal sa ESC tastom
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    closeTrailerModal();
  }
});

// Proveri da li je film već u wishlist-u
function isInWishlist(movieId) {
  return wishlist.some(movie => movie.id === movieId);
}

// Ažuriraj tekst i izgled wishlist dugmeta
function updateWishlistButton(button, movie) {
  if (isInWishlist(movie.id)) {
    button.innerHTML = '✓ In Watchlist';
    button.style.background = 'rgba(34, 197, 94, 0.3)';
    button.style.borderColor = 'rgba(34, 197, 94, 0.6)';
  } else {
    button.innerHTML = '+ Add to Watchlist';
    button.style.background = 'rgba(255, 255, 255, 0.2)';
    button.style.borderColor = 'rgba(255, 255, 255, 0.4)';
  }
}

// Dodaj ili ukloni film iz wishlist-a
function toggleWishlist(movie, button) {
  const movieData = {
    id: movie.id,
    title: movie.title,
    poster_path: movie.poster_path,
    backdrop_path: movie.backdrop_path,
    vote_average: movie.vote_average,
    release_date: movie.release_date
  };
  
  if (isInWishlist(movie.id)) {
    // Ukloni iz wishlist-a
    wishlist = wishlist.filter(m => m.id !== movie.id);
    showNotification('Removed from watchlist');
    console.log('➖ Removed from wishlist');
    syncWatchlistToServer(movieData, 'remove');
  } else {
    // Dodaj u wishlist
    wishlist.push(movieData);
    showNotification('Added to watchlist!');
    console.log('➕ Added to wishlist');
    syncWatchlistToServer(movieData, 'add');
  }
  
  // Sačuvaj u localStorage
  localStorage.setItem('movieWishlist', JSON.stringify(wishlist));
  
  // Ažuriraj dugme
  updateWishlistButton(button, movie);
  
  // Ažuriraj count u header-u
  updateWishlistCount();
}

// Prikaži notifikaciju
function showNotification(message) {
  // Kreiraj notifikaciju
  const notification = document.createElement('div');
  notification.className = 'notification';
  notification.textContent = message;
  document.body.appendChild(notification);
  
  // Prikaži
  setTimeout(() => {
    notification.classList.add('show');
  }, 10);
  
  // Ukloni nakon 3 sekunde
  setTimeout(() => {
    notification.classList.remove('show');
    setTimeout(() => {
      notification.remove();
    }, 300);
  }, 3000);
}

// Učitaj sve kad se stranica učita
window.addEventListener('DOMContentLoaded', async () => {
  console.log('🚀 Page loaded, checking auth...');
  
  const isAuthenticated = await checkAuth();
  
  if (isAuthenticated) {
    initializeApp();
  }
});

// Initialize the main app after auth
function initializeApp() {
  console.log('🎬 Initializing app for user:', currentUser?.display_name || currentUser?.username);
  loadGenres();
  loadHeroMovie();
  updateWishlistCount();
  loadMoviesForCarousels();
  loadProfile();
  loadSettings();
  translatePage();
  console.log('📋 Current wishlist:', wishlist);
}

// Učitaj žanrove sa TMDb API-ja
async function loadGenres() {
  try {
    const response = await fetch(`${TMDB_BASE_URL}/genre/movie/list?api_key=${TMDB_API_KEY}&language=en-US`);
    const data = await response.json();
    
    if (data.genres) {
      // Sačuvaj žanrove u objekat za brzi pristup
      data.genres.forEach(genre => {
        allGenres[genre.id] = genre.name;
      });
      
      console.log('✅ Loaded genres:', allGenres);
      
      // Renderuj žanr tabove
      renderGenreTabs(data.genres);
    }
  } catch (error) {
    console.error('❌ Error loading genres:', error);
  }
}

// Renderuj žanr tabove
function renderGenreTabs(genres) {
  const genreTabs = document.querySelector('.genre-tabs');
  if (!genreTabs) return;
  
  let tabsHTML = '<button class="genre-tab active" data-genre="all" onclick="filterByGenre(null)">All</button>';
  
  genres.forEach(genre => {
    tabsHTML += `<button class="genre-tab" data-genre="${genre.id}" onclick="filterByGenre(${genre.id})">${genre.name}</button>`;
  });
  
  genreTabs.innerHTML = tabsHTML;
}

// Dodaj i load event kao backup
window.addEventListener('load', () => {
  console.log('🔄 Backup load event triggered');
});

// Wishlist Modal funkcije
function openWishlistModal() {
  const modal = document.getElementById('wishlistModal');
  modal.classList.add('active');
  renderWishlistItems();
  document.body.style.overflow = 'hidden';
  console.log('📋 Wishlist opened');
}

function closeWishlistModal() {
  const modal = document.getElementById('wishlistModal');
  modal.classList.remove('active');
  document.body.style.overflow = 'auto';
  console.log('✕ Wishlist closed');
}

function updateWishlistCount() {
  const countElement = document.getElementById('wishlistCount');
  if (countElement) {
    countElement.textContent = wishlist.length;
    countElement.style.display = wishlist.length > 0 ? 'flex' : 'none';
  }
}

function renderWishlistItems() {
  const container = document.getElementById('wishlistItems');
  
  if (wishlist.length === 0) {
    container.innerHTML = `
      <div class="wishlist-empty">
        <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1">
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
        </svg>
        <h3>Your watchlist is empty</h3>
        <p>Add movies you want to watch later</p>
      </div>
    `;
    return;
  }
  
  container.innerHTML = wishlist.map(movie => `
    <div class="wishlist-item" data-movie-id="${movie.id}">
      <div class="wishlist-item-poster">
        ${movie.poster_path ? 
          `<img src="${TMDB_IMAGE_BASE}${movie.poster_path}" alt="${movie.title}">` : 
          `<div class="no-poster">No Image</div>`
        }
      </div>
      <div class="wishlist-item-info">
        <h3>${movie.title}</h3>
        <div class="wishlist-item-meta">
          <span class="rating">⭐ ${movie.vote_average ? movie.vote_average.toFixed(1) : 'N/A'}</span>
          ${movie.release_date ? `<span class="year">${movie.release_date.split('-')[0]}</span>` : ''}
        </div>
      </div>
      <button class="wishlist-item-remove" onclick="removeFromWishlist(${movie.id})" title="Remove from watchlist">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="18" y1="6" x2="6" y2="18"></line>
          <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
      </button>
    </div>
  `).join('');
}

function removeFromWishlist(movieId) {
  wishlist = wishlist.filter(m => m.id !== movieId);
  localStorage.setItem('movieWishlist', JSON.stringify(wishlist));
  syncWatchlistToServer({ id: movieId }, 'remove');
  renderWishlistItems();
  updateWishlistCount();
  showNotification('Removed from watchlist');
  console.log('➖ Movie removed from wishlist');
}

// Zatvori wishlist modal sa ESC tastom
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    closeWishlistModal();
  }
});

// Učitaj filmove za sve carousel sekcije
async function loadMoviesForCarousels() {
  console.log('🎬 Loading movies for carousels...');
  
  try {
    // Helper: fetch multiple pages in parallel
    async function fetchPages(url, pageCount) {
      const promises = Array.from({length: pageCount}, (_, i) =>
        fetch(`${url}&page=${i + 1}`).then(r => r.json()).catch(() => ({ results: [] }))
      );
      const pages = await Promise.all(promises);
      return pages.flatMap(p => p.results || []);
    }
    
    // Korak 1: Učitaj SVE karusele PARALELNO — 3-5 stranica po karuselu
    const [topRatedMovies, trendingMovies, newReleases, popularMovies, upcomingMovies, highestRated, classics,
           actionMovies, comedyMovies, horrorMovies, scifiMovies, dramaMovies, documentaries, animatedMovies] = await Promise.all([
      fetchPages(`${TMDB_BASE_URL}/movie/top_rated?api_key=${TMDB_API_KEY}&language=en-US`, 3),
      fetchPages(`${TMDB_BASE_URL}/trending/movie/week?api_key=${TMDB_API_KEY}&language=en-US`, 3),
      fetchPages(`${TMDB_BASE_URL}/movie/now_playing?api_key=${TMDB_API_KEY}&language=en-US`, 3),
      fetchPages(`${TMDB_BASE_URL}/movie/popular?api_key=${TMDB_API_KEY}&language=en-US`, 5),
      fetchPages(`${TMDB_BASE_URL}/movie/upcoming?api_key=${TMDB_API_KEY}&language=en-US`, 3),
      fetchPages(`${TMDB_BASE_URL}/discover/movie?api_key=${TMDB_API_KEY}&sort_by=vote_average.desc&vote_count.gte=1000&language=en-US`, 3),
      fetchPages(`${TMDB_BASE_URL}/discover/movie?api_key=${TMDB_API_KEY}&primary_release_date.gte=1950-01-01&primary_release_date.lte=1999-12-31&sort_by=vote_average.desc&vote_count.gte=500&language=en-US`, 3),
      // Action & Adventure (28=Action, 12=Adventure)
      fetchPages(`${TMDB_BASE_URL}/discover/movie?api_key=${TMDB_API_KEY}&with_genres=28,12&sort_by=popularity.desc&vote_count.gte=500&language=en-US`, 4),
      // Comedy (35=Comedy)
      fetchPages(`${TMDB_BASE_URL}/discover/movie?api_key=${TMDB_API_KEY}&with_genres=35&sort_by=popularity.desc&vote_count.gte=300&language=en-US`, 4),
      // Horror & Thriller (27=Horror, 53=Thriller)
      fetchPages(`${TMDB_BASE_URL}/discover/movie?api_key=${TMDB_API_KEY}&with_genres=27,53&sort_by=popularity.desc&vote_count.gte=300&language=en-US`, 4),
      // Sci-Fi & Fantasy (878=Science Fiction, 14=Fantasy)
      fetchPages(`${TMDB_BASE_URL}/discover/movie?api_key=${TMDB_API_KEY}&with_genres=878,14&sort_by=popularity.desc&vote_count.gte=400&language=en-US`, 4),
      // Drama & Romance (18=Drama, 10749=Romance)
      fetchPages(`${TMDB_BASE_URL}/discover/movie?api_key=${TMDB_API_KEY}&with_genres=18,10749&sort_by=popularity.desc&vote_count.gte=300&language=en-US`, 4),
      // Documentaries (99=Documentary)
      fetchPages(`${TMDB_BASE_URL}/discover/movie?api_key=${TMDB_API_KEY}&with_genres=99&sort_by=vote_average.desc&vote_count.gte=100&language=en-US`, 3),
      // Animation (16=Animation)
      fetchPages(`${TMDB_BASE_URL}/discover/movie?api_key=${TMDB_API_KEY}&with_genres=16&sort_by=popularity.desc&vote_count.gte=300&language=en-US`, 4)
    ]);
    
    console.log(`✅ Loaded all carousels in parallel`);
    
    // Sačuvaj globalno za filtriranje
    allTopRatedMovies = topRatedMovies;
    
    // Korak 2: Renderuj sve karusele
    const carouselSections = document.querySelectorAll('.carousel-section .carousel');
    const movieSets = [topRatedMovies, trendingMovies, topRatedMovies, newReleases, popularMovies, upcomingMovies, highestRated, classics,
                       actionMovies, comedyMovies, horrorMovies, scifiMovies, dramaMovies, documentaries, animatedMovies];
    const isTrendingFlags = [false, true, false, false, false, false, false, false, false, false, false, false, false, false, false];
    
    carouselSections.forEach((carousel, i) => {
      if (movieSets[i] && movieSets[i].length > 0) {
        // Za treći karusel (Top Rated) koristi offset da ne budu isti filmovi kao Recommended
        const movies = i === 2 ? movieSets[i].slice(20) : movieSets[i];
        renderMovieCards(carousel, movies.slice(0, 20), isTrendingFlags[i]);
      }
    });
    
    console.log('✅ All carousels rendered');
    
  } catch (error) {
    console.error('❌ Error loading movies:', error);
  }
}

// Renderuj movie kartice
function renderMovieCards(container, movies, isTrending = false) {
  container.innerHTML = '';
  const fragment = document.createDocumentFragment();
  
  movies.forEach((movie, index) => {
    const card = document.createElement('div');
    card.className = `movie-card ${isTrending ? 'trending' : ''}`;
    
    // Koristi <img> sa lazy loading umesto background-image
    if (movie.poster_path) {
      const img = document.createElement('img');
      img.src = `${TMDB_IMAGE_BASE}${movie.poster_path}`;
      img.alt = movie.title;
      img.loading = 'lazy';
      img.decoding = 'async';
      img.className = 'movie-card-poster';
      card.appendChild(img);
    }
    
    card.style.animationDelay = `${Math.min(index, 10) * 0.03}s`; // Brža animacija, max 10 kartica
    
    // Napravi string žanrova
    const genreNames = movie.genre_ids 
      ? movie.genre_ids.slice(0, 2).map(id => allGenres[id]).filter(Boolean).join(', ')
      : '';
    
    const overlay = document.createElement('div');
    overlay.className = 'movie-card-overlay';
    overlay.innerHTML = `
      <div class="movie-card-info">
        ${genreNames ? `<div class="movie-card-genres">${genreNames}</div>` : ''}
        <h4 class="movie-card-title">${movie.title}</h4>
        <div class="movie-card-rating">⭐ ${movie.vote_average ? movie.vote_average.toFixed(1) : 'N/A'}</div>
      </div>
    `;
    card.appendChild(overlay);
    
    card.onclick = () => openMovieModal(movie);
    fragment.appendChild(card);
    
    // Trigger animation
    requestAnimationFrame(() => card.classList.add('fade-in'));
  });
  
  container.appendChild(fragment);
}

// Refresh carousel sa novim filmovima
async function refreshCarousel(carouselType) {
  console.log('🔄 Refreshing carousel:', carouselType);
  
  const state = carouselState[carouselType];
  if (!state) return;
  
  let carousel, movies;
  
  try {
    switch (carouselType) {
      case 'recommended':
        carousel = document.querySelector('.carousel-section:nth-of-type(1) .carousel');
        carousel.innerHTML = '<p style="color: rgba(255,255,255,0.5); padding: 20px;">Loading...</p>';
        
        // Učitaj sledeću grupu stranica (ciklično)
        let startPage = state.currentPage + 1;
        if (startPage > state.maxPage) startPage = 1; // Reset na početak
        
        const endPage = Math.min(startPage + 1, state.maxPage);
        movies = [];
        
        for (let page = startPage; page <= endPage; page++) {
          const response = await fetch(`${TMDB_BASE_URL}/movie/top_rated?api_key=${TMDB_API_KEY}&language=en-US&page=${page}`);
          const data = await response.json();
          if (data.results) movies.push(...data.results);
        }
        
        // Ako smo na kraju, dodaj i prvu stranicu
        if (endPage >= state.maxPage) {
          const response = await fetch(`${TMDB_BASE_URL}/movie/top_rated?api_key=${TMDB_API_KEY}&language=en-US&page=1`);
          const data = await response.json();
          if (data.results) movies.push(...data.results);
          state.currentPage = 1;
        } else {
          state.currentPage = endPage;
        }
        
        renderMovieCards(carousel, movies.slice(0, 50));
        break;
        
      case 'trending':
        carousel = document.querySelector('.carousel-section:nth-of-type(2) .carousel');
        carousel.innerHTML = '<p style="color: rgba(255,255,255,0.5); padding: 20px;">Loading...</p>';
        
        // Ciklično menjanje stranica
        state.currentPage = (state.currentPage % state.maxPage) + 1;
        const trendingResponse = await fetch(`${TMDB_BASE_URL}/trending/movie/week?api_key=${TMDB_API_KEY}&language=en-US&page=${state.currentPage}`);
        const trendingData = await trendingResponse.json();
        
        if (trendingData.results && trendingData.results.length > 0) {
          renderMovieCards(carousel, trendingData.results, true);
        } else {
          // Ako nema rezultata, resetuj na stranicu 1
          state.currentPage = 1;
          const retryResponse = await fetch(`${TMDB_BASE_URL}/trending/movie/week?api_key=${TMDB_API_KEY}&language=en-US&page=1`);
          const retryData = await retryResponse.json();
          if (retryData.results) {
            renderMovieCards(carousel, retryData.results, true);
          }
        }
        break;
        
      case 'topRated':
        carousel = document.querySelector('.carousel-section:nth-of-type(3) .carousel');
        
        if (currentGenreFilter) {
          // Refresh za specifični žanr
          carousel.innerHTML = '<p style="color: rgba(255,255,255,0.5); padding: 20px;">Loading...</p>';
          
          // Ciklično menjanje stranica
          carouselState.genre.currentPage = (carouselState.genre.currentPage % carouselState.genre.maxPage) + 1;
          const genreResponse = await fetch(
            `${TMDB_BASE_URL}/discover/movie?api_key=${TMDB_API_KEY}&with_genres=${currentGenreFilter}&sort_by=popularity.desc&vote_count.gte=100&language=en-US&page=${carouselState.genre.currentPage}`
          );
          const genreData = await genreResponse.json();
          
          if (genreData.results && genreData.results.length > 0) {
            renderMovieCards(carousel, genreData.results);
          } else {
            // Resetuj na stranicu 1
            carouselState.genre.currentPage = 1;
            const retryResponse = await fetch(
              `${TMDB_BASE_URL}/discover/movie?api_key=${TMDB_API_KEY}&with_genres=${currentGenreFilter}&sort_by=popularity.desc&vote_count.gte=100&language=en-US&page=1`
            );
            const retryData = await retryResponse.json();
            if (retryData.results) {
              renderMovieCards(carousel, retryData.results);
            }
          }
        } else {
          // Refresh za sve filmove
          carousel.innerHTML = '<p style="color: rgba(255,255,255,0.5); padding: 20px;">Loading...</p>';
          
          let topStartPage = state.currentPage + 1;
          if (topStartPage > state.maxPage) topStartPage = 1; // Reset
          
          const topEndPage = Math.min(topStartPage + 1, state.maxPage);
          movies = [];
          
          for (let page = topStartPage; page <= topEndPage; page++) {
            const response = await fetch(`${TMDB_BASE_URL}/movie/top_rated?api_key=${TMDB_API_KEY}&language=en-US&page=${page}`);
            const data = await response.json();
            if (data.results) movies.push(...data.results);
          }
          
          // Ako smo na kraju, dodaj i prvu stranicu
          if (topEndPage >= state.maxPage) {
            const response = await fetch(`${TMDB_BASE_URL}/movie/top_rated?api_key=${TMDB_API_KEY}&language=en-US&page=1`);
            const data = await response.json();
            if (data.results) movies.push(...data.results);
            state.currentPage = 1;
          } else {
            state.currentPage = topEndPage;
          }
          
          renderMovieCards(carousel, movies.slice(0, 50));
        }
        break;
        
      case 'newReleases':
        carousel = document.querySelector('.carousel-section:nth-of-type(4) .carousel');
        carousel.innerHTML = '<p style="color: rgba(255,255,255,0.5); padding: 20px;">Loading...</p>';
        
        // Ciklično menjanje stranica
        state.currentPage = (state.currentPage % state.maxPage) + 1;
        const releaseResponse = await fetch(`${TMDB_BASE_URL}/movie/now_playing?api_key=${TMDB_API_KEY}&language=en-US&page=${state.currentPage}`);
        const releaseData = await releaseResponse.json();
        
        if (releaseData.results && releaseData.results.length > 0) {
          renderMovieCards(carousel, releaseData.results);
        } else {
          // Resetuj na stranicu 1
          state.currentPage = 1;
          const retryResponse = await fetch(`${TMDB_BASE_URL}/movie/now_playing?api_key=${TMDB_API_KEY}&language=en-US&page=1`);
          const retryData = await retryResponse.json();
          if (retryData.results) {
            renderMovieCards(carousel, retryData.results);
          }
        }
        break;
        
      case 'popular':
        carousel = document.querySelector('.carousel-section:nth-of-type(5) .carousel');
        carousel.innerHTML = '<p style="color: rgba(255,255,255,0.5); padding: 20px;">Loading...</p>';
        
        state.currentPage = (state.currentPage % state.maxPage) + 1;
        const popularResponse = await fetch(`${TMDB_BASE_URL}/movie/popular?api_key=${TMDB_API_KEY}&language=en-US&page=${state.currentPage}`);
        const popularData = await popularResponse.json();
        
        if (popularData.results && popularData.results.length > 0) {
          renderMovieCards(carousel, popularData.results);
        } else {
          state.currentPage = 1;
          const retryResponse = await fetch(`${TMDB_BASE_URL}/movie/popular?api_key=${TMDB_API_KEY}&language=en-US&page=1`);
          const retryData = await retryResponse.json();
          if (retryData.results) {
            renderMovieCards(carousel, retryData.results);
          }
        }
        break;
        
      case 'upcoming':
        carousel = document.querySelector('.carousel-section:nth-of-type(6) .carousel');
        carousel.innerHTML = '<p style="color: rgba(255,255,255,0.5); padding: 20px;">Loading...</p>';
        
        state.currentPage = (state.currentPage % state.maxPage) + 1;
        const upcomingResponse = await fetch(`${TMDB_BASE_URL}/movie/upcoming?api_key=${TMDB_API_KEY}&language=en-US&page=${state.currentPage}`);
        const upcomingData = await upcomingResponse.json();
        
        if (upcomingData.results && upcomingData.results.length > 0) {
          renderMovieCards(carousel, upcomingData.results);
        } else {
          state.currentPage = 1;
          const retryResponse = await fetch(`${TMDB_BASE_URL}/movie/upcoming?api_key=${TMDB_API_KEY}&language=en-US&page=1`);
          const retryData = await retryResponse.json();
          if (retryData.results) {
            renderMovieCards(carousel, retryData.results);
          }
        }
        break;
        
      case 'highestRated':
        carousel = document.querySelector('.carousel-section:nth-of-type(7) .carousel');
        carousel.innerHTML = '<p style="color: rgba(255,255,255,0.5); padding: 20px;">Loading...</p>';
        
        state.currentPage = (state.currentPage % state.maxPage) + 1;
        const highestResponse = await fetch(
          `${TMDB_BASE_URL}/discover/movie?api_key=${TMDB_API_KEY}&sort_by=vote_average.desc&vote_count.gte=1000&language=en-US&page=${state.currentPage}`
        );
        const highestData = await highestResponse.json();
        
        if (highestData.results && highestData.results.length > 0) {
          renderMovieCards(carousel, highestData.results);
        } else {
          state.currentPage = 1;
          const retryResponse = await fetch(
            `${TMDB_BASE_URL}/discover/movie?api_key=${TMDB_API_KEY}&sort_by=vote_average.desc&vote_count.gte=1000&language=en-US&page=1`
          );
          const retryData = await retryResponse.json();
          if (retryData.results) {
            renderMovieCards(carousel, retryData.results);
          }
        }
        break;
        
      case 'classics':
        carousel = document.querySelector('.carousel-section:nth-of-type(8) .carousel');
        carousel.innerHTML = '<p style="color: rgba(255,255,255,0.5); padding: 20px;">Loading...</p>';
        
        state.currentPage = (state.currentPage % state.maxPage) + 1;
        const classicsResponse = await fetch(
          `${TMDB_BASE_URL}/discover/movie?api_key=${TMDB_API_KEY}&primary_release_date.gte=1950-01-01&primary_release_date.lte=1999-12-31&sort_by=vote_average.desc&vote_count.gte=500&language=en-US&page=${state.currentPage}`
        );
        const classicsData = await classicsResponse.json();
        
        if (classicsData.results && classicsData.results.length > 0) {
          renderMovieCards(carousel, classicsData.results);
        } else {
          state.currentPage = 1;
          const retryResponse = await fetch(
            `${TMDB_BASE_URL}/discover/movie?api_key=${TMDB_API_KEY}&primary_release_date.gte=1950-01-01&primary_release_date.lte=1999-12-31&sort_by=vote_average.desc&vote_count.gte=500&language=en-US&page=1`
          );
          const retryData = await retryResponse.json();
          if (retryData.results) {
            renderMovieCards(carousel, retryData.results);
          }
        }
        break;
        
      case 'action':
        carousel = document.querySelector('.carousel-section:nth-of-type(9) .carousel');
        carousel.innerHTML = '<p style="color: rgba(255,255,255,0.5); padding: 20px;">Loading...</p>';
        
        state.currentPage = (state.currentPage % state.maxPage) + 1;
        const actionResponse = await fetch(
          `${TMDB_BASE_URL}/discover/movie?api_key=${TMDB_API_KEY}&with_genres=28,12&sort_by=popularity.desc&vote_count.gte=500&language=en-US&page=${state.currentPage}`
        );
        const actionData = await actionResponse.json();
        if (actionData.results) renderMovieCards(carousel, actionData.results);
        break;
        
      case 'comedy':
        carousel = document.querySelector('.carousel-section:nth-of-type(10) .carousel');
        carousel.innerHTML = '<p style="color: rgba(255,255,255,0.5); padding: 20px;">Loading...</p>';
        
        state.currentPage = (state.currentPage % state.maxPage) + 1;
        const comedyResponse = await fetch(
          `${TMDB_BASE_URL}/discover/movie?api_key=${TMDB_API_KEY}&with_genres=35&sort_by=popularity.desc&vote_count.gte=300&language=en-US&page=${state.currentPage}`
        );
        const comedyData = await comedyResponse.json();
        if (comedyData.results) renderMovieCards(carousel, comedyData.results);
        break;
        
      case 'horror':
        carousel = document.querySelector('.carousel-section:nth-of-type(11) .carousel');
        carousel.innerHTML = '<p style="color: rgba(255,255,255,0.5); padding: 20px;">Loading...</p>';
        
        state.currentPage = (state.currentPage % state.maxPage) + 1;
        const horrorResponse = await fetch(
          `${TMDB_BASE_URL}/discover/movie?api_key=${TMDB_API_KEY}&with_genres=27,53&sort_by=popularity.desc&vote_count.gte=300&language=en-US&page=${state.currentPage}`
        );
        const horrorData = await horrorResponse.json();
        if (horrorData.results) renderMovieCards(carousel, horrorData.results);
        break;
        
      case 'scifi':
        carousel = document.querySelector('.carousel-section:nth-of-type(12) .carousel');
        carousel.innerHTML = '<p style="color: rgba(255,255,255,0.5); padding: 20px;">Loading...</p>';
        
        state.currentPage = (state.currentPage % state.maxPage) + 1;
        const scifiResponse = await fetch(
          `${TMDB_BASE_URL}/discover/movie?api_key=${TMDB_API_KEY}&with_genres=878,14&sort_by=popularity.desc&vote_count.gte=400&language=en-US&page=${state.currentPage}`
        );
        const scifiData = await scifiResponse.json();
        if (scifiData.results) renderMovieCards(carousel, scifiData.results);
        break;
        
      case 'drama':
        carousel = document.querySelector('.carousel-section:nth-of-type(13) .carousel');
        carousel.innerHTML = '<p style="color: rgba(255,255,255,0.5); padding: 20px;">Loading...</p>';
        
        state.currentPage = (state.currentPage % state.maxPage) + 1;
        const dramaResponse = await fetch(
          `${TMDB_BASE_URL}/discover/movie?api_key=${TMDB_API_KEY}&with_genres=18,10749&sort_by=popularity.desc&vote_count.gte=300&language=en-US&page=${state.currentPage}`
        );
        const dramaData = await dramaResponse.json();
        if (dramaData.results) renderMovieCards(carousel, dramaData.results);
        break;
        
      case 'documentary':
        carousel = document.querySelector('.carousel-section:nth-of-type(14) .carousel');
        carousel.innerHTML = '<p style="color: rgba(255,255,255,0.5); padding: 20px;">Loading...</p>';
        
        state.currentPage = (state.currentPage % state.maxPage) + 1;
        const docResponse = await fetch(
          `${TMDB_BASE_URL}/discover/movie?api_key=${TMDB_API_KEY}&with_genres=99&sort_by=vote_average.desc&vote_count.gte=100&language=en-US&page=${state.currentPage}`
        );
        const docData = await docResponse.json();
        if (docData.results) renderMovieCards(carousel, docData.results);
        break;
        
      case 'animation':
        carousel = document.querySelector('.carousel-section:nth-of-type(15) .carousel');
        carousel.innerHTML = '<p style="color: rgba(255,255,255,0.5); padding: 20px;">Loading...</p>';
        
        state.currentPage = (state.currentPage % state.maxPage) + 1;
        const animResponse = await fetch(
          `${TMDB_BASE_URL}/discover/movie?api_key=${TMDB_API_KEY}&with_genres=16&sort_by=popularity.desc&vote_count.gte=300&language=en-US&page=${state.currentPage}`
        );
        const animData = await animResponse.json();
        if (animData.results) renderMovieCards(carousel, animData.results);
        break;
    }
    
    showNotification('✅ New movies loaded!');
    console.log('✅ Carousel refreshed with new movies');
    
  } catch (error) {
    console.error('❌ Error refreshing carousel:', error);
    showNotification('Error loading movies');
  }
}

// Filtriraj filmove po žanru
async function filterByGenre(genreId) {
  console.log('🎭 Filtering by genre:', genreId || 'All');
  
  currentGenreFilter = genreId;
  
  // Ažuriraj aktivni tab
  document.querySelectorAll('.genre-tab').forEach(tab => {
    tab.classList.remove('active');
  });
  
  const activeTab = genreId 
    ? document.querySelector(`[data-genre="${genreId}"]`)
    : document.querySelector('[data-genre="all"]');
  
  if (activeTab) {
    activeTab.classList.add('active');
  }
  
  if (!genreId) {
    // Vrati sve na default stanje - reload sve carousel-e
    showLoadingOverlay('Loading all movies...');
    await loadMoviesForCarousels();
    hideLoadingOverlay();
    return;
  }
  
  // Prikaži loading overlay
  showLoadingOverlay(`Loading ${allGenres[genreId]} movies...`);
  
  // Filtriraj SVE carousel-e po žanru (osim Classic Movies)
  try {
    // Učitaj sve paralelno sa manje stranica za brzinu
    const [recommendedMovies, trendingMovies, topRatedMovies, newReleasesMovies, 
           popularMovies, upcomingMovies, highestRatedMovies] = await Promise.all([
      loadGenreMovies(genreId, 'vote_average.desc', 10),
      loadGenreMovies(genreId, 'popularity.desc', 8),
      loadGenreMovies(genreId, 'vote_average.desc', 10),
      loadGenreMoviesWithDateFilter(genreId, 'primary_release_date.desc', 8),
      loadGenreMovies(genreId, 'popularity.desc', 10),
      loadGenreMoviesUpcoming(genreId, 8),
      loadGenreMovies(genreId, 'vote_average.desc', 8, 1000)
    ]);
    
    // Renderuj sve carousel-e
    const recommendedCarousel = document.querySelector('.carousel-section:nth-of-type(1) .carousel');
    if (recommendedCarousel) {
      renderMovieCards(recommendedCarousel, recommendedMovies.slice(0, 150));
    }
    
    const trendingCarousel = document.querySelector('.carousel-section:nth-of-type(2) .carousel');
    if (trendingCarousel) {
      renderMovieCards(trendingCarousel, trendingMovies.slice(0, 150), true);
    }
    
    const topRatedCarousel = document.querySelector('.carousel-section:nth-of-type(3) .carousel');
    if (topRatedCarousel) {
      renderMovieCards(topRatedCarousel, topRatedMovies.slice(0, 150));
    }
    
    const newReleasesCarousel = document.querySelector('.carousel-section:nth-of-type(4) .carousel');
    if (newReleasesCarousel) {
      renderMovieCards(newReleasesCarousel, newReleasesMovies.slice(0, 150));
    }
    
    const popularCarousel = document.querySelector('.carousel-section:nth-of-type(5) .carousel');
    if (popularCarousel) {
      renderMovieCards(popularCarousel, popularMovies.slice(0, 150));
    }
    
    const upcomingCarousel = document.querySelector('.carousel-section:nth-of-type(6) .carousel');
    if (upcomingCarousel) {
      renderMovieCards(upcomingCarousel, upcomingMovies.slice(0, 150));
    }
    
    const highestRatedCarousel = document.querySelector('.carousel-section:nth-of-type(7) .carousel');
    if (highestRatedCarousel) {
      renderMovieCards(highestRatedCarousel, highestRatedMovies.slice(0, 150));
    }
    
    // Classic Movies ostaje isto
    
    hideLoadingOverlay();
    showNotification(`✅ Filtered by ${allGenres[genreId]}`);
    
  } catch (error) {
    console.error('❌ Error filtering by genre:', error);
    hideLoadingOverlay();
    showNotification('Error filtering movies');
  }
}

// Show/hide loading overlay
function showLoadingOverlay(message = 'Loading...') {
  const overlay = document.getElementById('loadingOverlay');
  if (overlay) {
    const text = overlay.querySelector('p');
    if (text) text.textContent = message;
    overlay.classList.add('active');
  }
}

function hideLoadingOverlay() {
  const overlay = document.getElementById('loadingOverlay');
  if (overlay) {
    overlay.classList.remove('active');
  }
}

// Helper funkcija za učitavanje filmova po žanru
async function loadGenreMovies(genreId, sortBy, pages, minVotes = 100) {
  const allMovies = [];
  const pageNumbers = Array.from({length: pages}, (_, i) => i + 1);
  
  for (const page of pageNumbers) {
    const response = await fetch(
      `${TMDB_BASE_URL}/discover/movie?api_key=${TMDB_API_KEY}&with_genres=${genreId}&sort_by=${sortBy}&vote_count.gte=${minVotes}&language=en-US&page=${page}`
    );
    const data = await response.json();
    if (data.results) {
      allMovies.push(...data.results);
    }
  }
  
  return allMovies;
}

// Helper za new releases sa date filterom
async function loadGenreMoviesWithDateFilter(genreId, sortBy, pages) {
  const allMovies = [];
  const pageNumbers = Array.from({length: pages}, (_, i) => i + 1);
  const currentDate = new Date();
  const oneYearAgo = new Date(currentDate.setFullYear(currentDate.getFullYear() - 1));
  const dateString = oneYearAgo.toISOString().split('T')[0];
  
  for (const page of pageNumbers) {
    const response = await fetch(
      `${TMDB_BASE_URL}/discover/movie?api_key=${TMDB_API_KEY}&with_genres=${genreId}&primary_release_date.gte=${dateString}&sort_by=${sortBy}&vote_count.gte=10&language=en-US&page=${page}`
    );
    const data = await response.json();
    if (data.results) {
      allMovies.push(...data.results);
    }
  }
  
  return allMovies;
}

// Helper za upcoming sa future date
async function loadGenreMoviesUpcoming(genreId, pages) {
  const allMovies = [];
  const pageNumbers = Array.from({length: pages}, (_, i) => i + 1);
  const currentDate = new Date().toISOString().split('T')[0];
  
  for (const page of pageNumbers) {
    const response = await fetch(
      `${TMDB_BASE_URL}/discover/movie?api_key=${TMDB_API_KEY}&with_genres=${genreId}&primary_release_date.gte=${currentDate}&sort_by=popularity.desc&language=en-US&page=${page}`
    );
    const data = await response.json();
    if (data.results) {
      allMovies.push(...data.results);
    }
  }
  
  return allMovies;
}

// Otvori movie detail modal
async function openMovieModal(movie) {
  console.log('🎬 Opening movie details for:', movie.title);
  
  // Track movie view
  trackMovieView(movie.id);
  
  const modal = document.getElementById('movieModal');
  if (!modal) {
    createMovieModal();
  }
  
  // Prikaži modal
  document.getElementById('movieModal').classList.add('active');
  document.body.style.overflow = 'hidden';
  
  // Postavi osnovne podatke
  document.getElementById('movieModalPoster').src = movie.poster_path 
    ? `${TMDB_IMAGE_BASE}${movie.poster_path}`
    : '';
  document.getElementById('movieModalTitle').textContent = movie.title;
  document.getElementById('movieModalOverview').textContent = movie.overview || 'No description available.';
  document.getElementById('movieModalRating').textContent = movie.vote_average ? movie.vote_average.toFixed(1) : 'N/A';
  document.getElementById('movieModalYear').textContent = movie.release_date ? movie.release_date.split('-')[0] : 'N/A';
  
  // Setup wishlist button
  const wishlistBtn = document.getElementById('movieModalWishlistBtn');
  if (wishlistBtn) {
    updateWishlistButtonForModal(wishlistBtn, movie);
    wishlistBtn.onclick = (e) => {
      e.preventDefault();
      toggleWishlistForModal(movie, wishlistBtn);
    };
  }
  
  // Učitaj trailer info
  try {
    const videosResponse = await fetch(`${TMDB_BASE_URL}/movie/${movie.id}/videos?api_key=${TMDB_API_KEY}&language=en-US`);
    const videosData = await videosResponse.json();
    
    const youtubeTrailer = videosData.results?.find(v => v.site === 'YouTube' && v.type === 'Trailer');
    const trailerBtn = document.getElementById('movieModalTrailerBtn');
    
    if (youtubeTrailer && trailerBtn) {
      trailerBtn.style.display = 'inline-flex';
      trailerBtn.onclick = () => {
        // Track that user watched this movie
        trackMovieWatched(movie.id);
        openFullscreenTrailerForMovie(youtubeTrailer.key);
      };
    } else if (trailerBtn) {
      trailerBtn.style.display = 'none';
    }
  } catch (error) {
    console.error('Error loading trailer:', error);
  }
  
  // Učitaj streaming providere
  try {
    const response = await fetch(`${TMDB_BASE_URL}/movie/${movie.id}/watch/providers?api_key=${TMDB_API_KEY}`);
    const data = await response.json();
    
    console.log('🔍 Provider data for', movie.title, ':', data);
    
    // Pokušaj više regiona (US, GB, CA, AU, DE, FR, IT, ES)
    const regions = ['US', 'GB', 'CA', 'AU', 'DE', 'FR', 'IT', 'ES', 'RS', 'HR', 'BA'];
    let providersFound = null;
    let selectedRegion = null;
    
    for (const region of regions) {
      const regionData = data.results?.[region];
      if (regionData && (regionData.flatrate || regionData.buy || regionData.rent)) {
        providersFound = regionData;
        selectedRegion = region;
        break;
      }
    }
    
    const providersContainer = document.getElementById('movieModalProviders');
    
    if (providersFound) {
      const streamingServices = providersFound.flatrate || [];
      const buyServices = providersFound.buy || [];
      const rentServices = providersFound.rent || [];
      
      console.log('✅ Found providers in region:', selectedRegion);
      console.log('Streaming:', streamingServices.map(p => p.provider_name));
      console.log('Buy:', buyServices.map(p => p.provider_name));
      
      let providersHTML = `<p class="region-info">Available in: ${selectedRegion}</p>`;
      
      if (streamingServices.length > 0) {
        providersHTML += '<h4>Stream</h4><div class="providers-list">';
        streamingServices.forEach(provider => {
          providersHTML += `
            <div class="provider-item" title="${provider.provider_name}">
              <img src="https://image.tmdb.org/t/p/original${provider.logo_path}" alt="${provider.provider_name}">
              <span>${provider.provider_name}</span>
            </div>
          `;
        });
        providersHTML += '</div>';
      }
      
      if (buyServices.length > 0) {
        providersHTML += '<h4>Buy</h4><div class="providers-list">';
        buyServices.slice(0, 8).forEach(provider => {
          providersHTML += `
            <div class="provider-item" title="${provider.provider_name}">
              <img src="https://image.tmdb.org/t/p/original${provider.logo_path}" alt="${provider.provider_name}">
              <span>${provider.provider_name}</span>
            </div>
          `;
        });
        providersHTML += '</div>';
      }
      
      if (rentServices.length > 0) {
        providersHTML += '<h4>Rent</h4><div class="providers-list">';
        rentServices.slice(0, 8).forEach(provider => {
          providersHTML += `
            <div class="provider-item" title="${provider.provider_name}">
              <img src="https://image.tmdb.org/t/p/original${provider.logo_path}" alt="${provider.provider_name}">
              <span>${provider.provider_name}</span>
            </div>
          `;
        });
        providersHTML += '</div>';
      }
      
      providersContainer.innerHTML = providersHTML;
    } else {
      providersContainer.innerHTML = '<p class="no-providers">Streaming info not available in your region</p>';
    }
    
  } catch (error) {
    console.error('Error loading providers:', error);
    document.getElementById('movieModalProviders').innerHTML = '<p class="no-providers">Error loading streaming info</p>';
  }
}

// Kreiraj movie modal HTML
function createMovieModal() {
  const modalHTML = `
    <div class="movie-modal" id="movieModal">
      <div class="movie-modal-overlay" onclick="closeMovieModal()"></div>
      <div class="movie-modal-content">
        <button class="movie-modal-close" onclick="closeMovieModal()">✕</button>
        <div class="movie-modal-poster">
          <img id="movieModalPoster" src="" alt="Movie Poster">
        </div>
        <div class="movie-modal-details">
          <h2 id="movieModalTitle"></h2>
          <div class="movie-modal-meta">
            <span class="modal-rating">⭐ <span id="movieModalRating"></span></span>
            <span class="modal-year" id="movieModalYear"></span>
          </div>
          <div class="movie-modal-actions">
            <button class="movie-modal-trailer-btn" id="movieModalTrailerBtn" style="display: none;">
              ▶ Watch Trailer
            </button>
            <button class="movie-modal-wishlist-btn" id="movieModalWishlistBtn">
              + Add to Watchlist
            </button>
          </div>
          <p class="movie-modal-overview" id="movieModalOverview"></p>
          <div class="movie-modal-providers">
            <h3>Where to Watch</h3>
            <div id="movieModalProviders">
              <p>Loading...</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
  
  document.body.insertAdjacentHTML('beforeend', modalHTML);
}

// Zatvori movie modal
function closeMovieModal() {
  const modal = document.getElementById('movieModal');
  if (modal) {
    modal.classList.remove('active');
    document.body.style.overflow = 'auto';
  }
  console.log('✕ Movie modal closed');
}

// Ažuriraj wishlist dugme u movie modal-u
function updateWishlistButtonForModal(button, movie) {
  if (isInWishlist(movie.id)) {
    button.innerHTML = '✓ In Watchlist';
    button.style.background = 'rgba(34, 197, 94, 0.3)';
    button.style.borderColor = 'rgba(34, 197, 94, 0.6)';
  } else {
    button.innerHTML = '+ Add to Watchlist';
    button.style.background = 'rgba(255, 255, 255, 0.1)';
    button.style.borderColor = 'rgba(255, 255, 255, 0.3)';
  }
}

// Toggle wishlist za movie modal
function toggleWishlistForModal(movie, button) {
  const movieData = {
    id: movie.id,
    title: movie.title,
    poster_path: movie.poster_path,
    backdrop_path: movie.backdrop_path,
    vote_average: movie.vote_average,
    release_date: movie.release_date
  };
  
  if (isInWishlist(movie.id)) {
    wishlist = wishlist.filter(m => m.id !== movie.id);
    showNotification('Removed from watchlist');
    console.log('➖ Removed from watchlist');
    syncWatchlistToServer(movieData, 'remove');
  } else {
    wishlist.push(movieData);
    showNotification('Added to watchlist!');
    console.log('➕ Added to watchlist');
    syncWatchlistToServer(movieData, 'add');
  }
  
  localStorage.setItem('movieWishlist', JSON.stringify(wishlist));
  updateWishlistButtonForModal(button, movie);
  updateWishlistCount();
}

// Otvori fullscreen trailer za film iz movie modal-a
function openFullscreenTrailerForMovie(trailerKey) {
  console.log('🎬 Opening trailer from movie modal');
  
  // Prvo zatvori movie modal
  closeMovieModal();
  
  // Sačekaj malo da se zatvori movie modal, pa otvori trailer
  setTimeout(() => {
    const modal = document.getElementById('trailerModal');
    
    // Kreiraj novi fullscreen iframe sa zvukom
    const fullscreenVideo = document.createElement('div');
    fullscreenVideo.className = 'fullscreen-trailer-container';
    fullscreenVideo.id = 'fullscreenTrailer';
    const qualityParam = getVideoQualityParam();
    fullscreenVideo.innerHTML = `
      <iframe
        src="https://www.youtube-nocookie.com/embed/${trailerKey}?autoplay=1&mute=0&controls=1&showinfo=0&rel=0&modestbranding=1&playsinline=1&iv_load_policy=3${qualityParam}"
        frameborder="0"
        allow="autoplay; encrypted-media"
        allowfullscreen
      ></iframe>
    `;
    
    document.body.appendChild(fullscreenVideo);
    
    // Prikaži modal overlay
    modal.classList.add('active');
    
    // Animiraj pojavu
    setTimeout(() => {
      fullscreenVideo.classList.add('active');
    }, 10);
    
    document.body.style.overflow = 'hidden';
    
    // Dodaj event listener za pomeranje miša
    document.addEventListener('mousemove', handleCursorMove);
    
    console.log('✅ Trailer opened');
  }, 300);
}

// Export za korišćenje u drugim delovima aplikacije
window.movieApp = {
  wishlist,
  isInWishlist,
  toggleWishlist
};

// Search functionality
const searchInput = document.getElementById('searchInput');
const searchButton = document.getElementById('searchButton');
const searchDropdown = document.getElementById('searchDropdown');
const searchModal = document.getElementById('searchModal');
const searchResults = document.getElementById('searchResults');

if (searchInput) {
  // Dropdown search while typing
  searchInput.addEventListener('input', (e) => {
    const query = e.target.value.trim();
    
    clearTimeout(searchTimeout);
    
    if (query.length < 2) {
      closeSearchDropdown();
      return;
    }
    
    searchTimeout = setTimeout(() => {
      searchMoviesDropdown(query);
    }, 300);
  });
  
  // Full search on Enter
  searchInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      const query = searchInput.value.trim();
      if (query.length >= 2) {
        searchMoviesFull(query);
        closeSearchDropdown();
      }
    } else if (e.key === 'Escape') {
      closeSearchDropdown();
      searchInput.blur();
    }
  });
  
  // Close dropdown when clicking outside
  document.addEventListener('click', (e) => {
    if (!searchInput.contains(e.target) && !searchDropdown.contains(e.target)) {
      closeSearchDropdown();
    }
  });
}

// Search icon click - open full search modal
if (searchButton) {
  searchButton.addEventListener('click', () => {
    const query = searchInput.value.trim();
    if (query.length >= 2) {
      searchMoviesFull(query);
      closeSearchDropdown();
    }
  });
}

// Dropdown search (autocomplete)
async function searchMoviesDropdown(query) {
  console.log('🔍 Dropdown search:', query);
  
  try {
    const response = await fetch(`${TMDB_BASE_URL}/search/movie?api_key=${TMDB_API_KEY}&language=en-US&query=${encodeURIComponent(query)}&page=1&include_adult=false`);
    const data = await response.json();
    
    if (data.results && data.results.length > 0) {
      displaySearchDropdown(data.results.slice(0, 5)); // Show only first 5
    } else {
      displayNoResultsDropdown();
    }
  } catch (error) {
    console.error('❌ Search error:', error);
  }
}

function displaySearchDropdown(movies) {
  searchDropdown.innerHTML = movies.map(movie => {
    const posterUrl = movie.poster_path 
      ? `${TMDB_IMAGE_BASE}${movie.poster_path}`
      : 'https://via.placeholder.com/40x60/333/fff?text=No+Poster';
    
    const releaseYear = movie.release_date ? new Date(movie.release_date).getFullYear() : 'N/A';
    const rating = movie.vote_average ? movie.vote_average.toFixed(1) : 'N/A';
    
    return `
      <div class="search-dropdown-item" onclick="openMovieModalFromSearch(${movie.id})">
        <img src="${posterUrl}" alt="${movie.title}" class="search-dropdown-poster">
        <div class="search-dropdown-info">
          <h4 class="search-dropdown-title">${movie.title}</h4>
          <div class="search-dropdown-meta">
            <span>${releaseYear}</span>
            <span class="search-dropdown-rating">⭐ ${rating}</span>
          </div>
        </div>
      </div>
    `;
  }).join('');
  
  searchDropdown.classList.add('active');
}

function displayNoResultsDropdown() {
  searchDropdown.innerHTML = '<p style="padding: 15px; color: rgba(255,255,255,0.6); text-align: center; margin: 0;">No movies found</p>';
  searchDropdown.classList.add('active');
}

function closeSearchDropdown() {
  searchDropdown.classList.remove('active');
}

// Full search modal
async function searchMoviesFull(query) {
  console.log('🔍 Full search:', query);
  
  try {
    const response = await fetch(`${TMDB_BASE_URL}/search/movie?api_key=${TMDB_API_KEY}&language=en-US&query=${encodeURIComponent(query)}&page=1&include_adult=false`);
    const data = await response.json();
    
    if (data.results && data.results.length > 0) {
      displaySearchResults(data.results);
    } else {
      displayNoResults();
    }
  } catch (error) {
    console.error('❌ Search error:', error);
    displaySearchError();
  }
}

function displaySearchResults(movies) {
  searchModal.classList.add('active');
  
  searchResults.innerHTML = movies.map(movie => {
    const posterUrl = movie.poster_path 
      ? `${TMDB_IMAGE_BASE}${movie.poster_path}`
      : 'https://via.placeholder.com/200x300/333/fff?text=No+Poster';
    
    const releaseYear = movie.release_date ? new Date(movie.release_date).getFullYear() : 'N/A';
    const rating = movie.vote_average ? movie.vote_average.toFixed(1) : 'N/A';
    
    return `
      <div class="search-result-item" onclick="openMovieModalFromSearch(${movie.id})">
        <img src="${posterUrl}" alt="${movie.title}" class="search-result-poster">
        <div class="search-result-info">
          <h3 class="search-result-title">${movie.title}</h3>
          <div class="search-result-meta">
            <span class="search-result-year">${releaseYear}</span>
            <span class="search-result-rating">⭐ ${rating}</span>
          </div>
          <p class="search-result-overview">${movie.overview || 'No description available.'}</p>
        </div>
      </div>
    `;
  }).join('');
}

function displayNoResults() {
  searchModal.classList.add('active');
  searchResults.innerHTML = '<p style="text-align: center; color: rgba(255,255,255,0.6); padding: 40px;">No movies found. Try a different search term.</p>';
}

function displaySearchError() {
  searchModal.classList.add('active');
  searchResults.innerHTML = '<p style="text-align: center; color: rgba(255,100,100,0.8); padding: 40px;">Error loading search results. Please try again.</p>';
}

async function openMovieModalFromSearch(movieId) {
  try {
    const response = await fetch(`${TMDB_BASE_URL}/movie/${movieId}?api_key=${TMDB_API_KEY}&language=en-US`);
    const movie = await response.json();
    
    // Get genres
    movie.genre_ids = movie.genres ? movie.genres.map(g => g.id) : [];
    
    openMovieModal(movie);
    closeSearchModal();
    closeSearchDropdown();
    searchInput.value = ''; // Clear search input
  } catch (error) {
    console.error('❌ Error loading movie:', error);
    showNotification('Error loading movie details');
  }
}

function closeSearchModal() {
  searchModal.classList.remove('active');
}

// Profile Dropdown
function toggleProfileDropdown() {
  const dropdown = document.querySelector('.profile-dropdown');
  dropdown.classList.toggle('active');
}

// Close dropdown when clicking outside
document.addEventListener('click', function(event) {
  const profileBtn = document.querySelector('.profile-btn');
  const dropdown = document.querySelector('.profile-dropdown');
  
  if (!profileBtn.contains(event.target)) {
    dropdown.classList.remove('active');
  }
});

// Profile Modal
function openProfileModal() {
  const profileModal = document.getElementById('profileModal');
  profileModal.classList.add('active');
  
  // Update all stats
  updateProfileStats();
  
  // Close profile dropdown
  document.querySelector('.profile-dropdown').classList.remove('active');
}

function closeProfileModal() {
  const profileModal = document.getElementById('profileModal');
  profileModal.classList.remove('active');
  
  // Reset all fields to readonly
  document.querySelectorAll('#profileModal input, #profileModal textarea').forEach(field => {
    field.setAttribute('readonly', 'true');
  });
  document.querySelectorAll('.edit-field-btn').forEach(btn => {
    btn.textContent = 'Edit';
    btn.classList.remove('save-mode');
  });
}

function toggleEditField(fieldId) {
  const field = document.getElementById(fieldId);
  const button = field.parentElement.querySelector('.edit-field-btn');
  const lang = getCurrentLanguage();
  const t = translations[lang] || translations.en;
  
  if (field.hasAttribute('readonly')) {
    // Enable editing
    field.dataset.originalValue = field.value; // Store original value
    field.removeAttribute('readonly');
    field.focus();
    button.textContent = t.save;
    button.classList.add('save-mode');
  } else {
    // Check if value changed
    const hasChanged = field.value !== field.dataset.originalValue;
    
    if (hasChanged) {
      // Save the field
      saveField(fieldId);
    } else {
      // No changes, just cancel
      field.setAttribute('readonly', 'true');
      button.textContent = t.edit;
      button.classList.remove('save-mode');
    }
  }
}

function saveField(fieldId) {
  const field = document.getElementById(fieldId);
  const button = field.parentElement.querySelector('.edit-field-btn');
  const lang = getCurrentLanguage();
  const t = translations[lang] || translations.en;
  
  // Get current profile or create new one
  const savedProfile = localStorage.getItem('userProfile');
  const profile = savedProfile ? JSON.parse(savedProfile) : {
    name: 'Movie Lover',
    email: 'user@moviehub.com',
    bio: 'Movie enthusiast and avid cinema lover. Always looking for the next great film to watch!'
  };
  
  // Update the specific field
  if (fieldId === 'profileName') {
    profile.name = field.value;
    document.querySelector('.profile-name').textContent = field.value;
  } else if (fieldId === 'profileEmail') {
    profile.email = field.value;
    document.querySelector('.profile-email').textContent = field.value;
  } else if (fieldId === 'profileBio') {
    profile.bio = field.value;
  }
  
  // Save to localStorage
  localStorage.setItem('userProfile', JSON.stringify(profile));
  
  // Save to server database
  saveFieldToServer(fieldId, field.value);
  
  // Make field readonly again
  field.setAttribute('readonly', 'true');
  button.textContent = t.edit;
  button.classList.remove('save-mode');
  
  showNotification('Profile field updated successfully!');
}

// Load profile from localStorage on page load
function loadProfile() {
  const savedProfile = localStorage.getItem('userProfile');
  if (savedProfile) {
    const profile = JSON.parse(savedProfile);
    document.getElementById('profileName').value = profile.name;
    document.getElementById('profileEmail').value = profile.email;
    document.getElementById('profileBio').value = profile.bio;
    
    // Update profile dropdown
    document.querySelector('.profile-name').textContent = profile.name;
    document.querySelector('.profile-email').textContent = profile.email;
  }
  
  // Load avatar settings
  loadAvatar();
}

// Change password dialog
async function openChangePasswordDialog() {
  const currentPass = prompt('Унеси тренутну лозинку:');
  if (!currentPass) return;
  
  const newPass = prompt('Унеси нову лозинку (мин. 6 карактера):');
  if (!newPass) return;
  
  if (newPass.length < 6) {
    showNotification('Лозинка мора имати бар 6 карактера');
    return;
  }
  
  const confirmPass = prompt('Понови нову лозинку:');
  if (newPass !== confirmPass) {
    showNotification('Лозинке се не поклапају');
    return;
  }
  
  try {
    const res = await apiCall('/api/user/password', {
      method: 'PUT',
      body: JSON.stringify({ current_password: currentPass, new_password: newPass })
    });
    
    const data = await res.json();
    
    if (!res.ok) {
      showNotification(data.error || 'Грешка при промени лозинке');
      return;
    }
    
    showNotification('Лозинка успешно промењена! ✅');
  } catch (e) {
    showNotification('Грешка при повезивању са сервером');
  }
}

// Avatar Modal
function openAvatarModal() {
  const modal = document.getElementById('avatarModal');
  modal.classList.add('active');
  
  // Highlight current color
  const avatarSettings = JSON.parse(localStorage.getItem('avatarSettings')) || { type: 'color', color: '#ffffff' };
  if (avatarSettings.type === 'color') {
    document.querySelectorAll('.avatar-color-option').forEach(option => {
      if (option.dataset.color === avatarSettings.color) {
        option.classList.add('selected');
      } else {
        option.classList.remove('selected');
      }
    });
  }
}

function closeAvatarModal() {
  const modal = document.getElementById('avatarModal');
  modal.classList.remove('active');
}

function selectAvatarColor(color) {
  // Save color preference
  const avatarSettings = {
    type: 'color',
    color: color
  };
  localStorage.setItem('avatarSettings', JSON.stringify(avatarSettings));
  saveAvatarToServer(avatarSettings);
  
  // Update UI
  document.querySelectorAll('.avatar-color-option').forEach(option => {
    if (option.dataset.color === color) {
      option.classList.add('selected');
    } else {
      option.classList.remove('selected');
    }
  });
  
  // Apply avatar
  applyAvatar(avatarSettings);
  
  showNotification('Avatar color updated!');
  
  // Close modal after short delay
  setTimeout(() => closeAvatarModal(), 500);
}

function handleAvatarUpload(event) {
  const file = event.target.files[0];
  if (!file) return;
  
  // Check file size (max 5MB)
  if (file.size > 5 * 1024 * 1024) {
    showNotification('Image too large! Max 5MB');
    return;
  }
  
  // Check file type
  if (!file.type.startsWith('image/')) {
    showNotification('Please upload an image file');
    return;
  }
  
  const reader = new FileReader();
  reader.onload = (e) => {
    const imageData = e.target.result;
    
    // Save image preference
    const avatarSettings = {
      type: 'image',
      imageData: imageData
    };
    localStorage.setItem('avatarSettings', JSON.stringify(avatarSettings));
    saveAvatarToServer(avatarSettings);
    
    // Apply avatar
    applyAvatar(avatarSettings);
    
    showNotification('Avatar updated!');
    
    // Close modal after short delay
    setTimeout(() => closeAvatarModal(), 500);
  };
  
  reader.readAsDataURL(file);
}

function applyAvatar(avatarSettings) {
  const headerAvatar = document.querySelector('.profile-avatar-btn');
  const dropdownAvatar = document.querySelector('.profile-avatar');
  const modalAvatar = document.querySelector('.profile-avatar-large');
  
  if (avatarSettings.type === 'color') {
    // Apply color to SVG
    [headerAvatar, dropdownAvatar, modalAvatar].forEach(avatar => {
      if (avatar) {
        avatar.classList.remove('has-image');
        const svg = avatar.querySelector('svg');
        const img = avatar.querySelector('img');
        
        if (svg) svg.style.display = 'block';
        if (img) img.remove();
        
        if (svg) {
          svg.setAttribute('stroke', avatarSettings.color);
        }
      }
    });
  } else if (avatarSettings.type === 'image') {
    // Apply custom image
    [headerAvatar, dropdownAvatar, modalAvatar].forEach(avatar => {
      if (avatar) {
        avatar.classList.add('has-image');
        let img = avatar.querySelector('img');
        
        if (!img) {
          img = document.createElement('img');
          avatar.appendChild(img);
        }
        
        img.src = avatarSettings.imageData;
        img.alt = 'Profile Avatar';
        
        const svg = avatar.querySelector('svg');
        if (svg) svg.style.display = 'none';
      }
    });
  }
}

function loadAvatar() {
  const avatarSettings = JSON.parse(localStorage.getItem('avatarSettings')) || { type: 'color', color: '#ffffff' };
  applyAvatar(avatarSettings);
}

// Settings Modal
function openSettingsModal() {
  const modal = document.getElementById('settingsModal');
  modal.classList.add('active');
  
  // Load saved settings
  loadSettings();
  
  // Close profile dropdown
  document.querySelector('.profile-dropdown').classList.remove('active');
}

function closeSettingsModal() {
  const modal = document.getElementById('settingsModal');
  modal.classList.remove('active');
}

// Language translations
const translations = {
  en: {
    moviehub: 'MovieHub',
    search: 'Search movies...',
    watchTrailer: 'Watch Trailer',
    addToWatchlist: 'Add to Watchlist',
    removeFromWatchlist: 'Remove from Watchlist',
    myProfile: 'My Profile',
    myWatchlist: 'My Watchlist',
    settings: 'Settings',
    helpCenter: 'Help Center',
    logout: 'Logout',
    recommended: 'Recommended for You',
    trending: 'Trending This Week',
    topRated: 'Top Rated Movies',
    newReleases: 'New Releases',
    popular: 'Popular Movies',
    upcoming: 'Upcoming Movies',
    highestRated: 'Highest Rated',
    classics: 'Classic Movies',
    loadMore: 'Load More',
    whereToWatch: 'Where to Watch',
    stream: 'Stream',
    buy: 'Buy',
    rent: 'Rent',
    noProviders: 'Streaming info not available in your region',
    watchlist: 'Watchlist',
    moviesWatched: 'Movies Watched',
    movieViews: 'Movie Views',
    name: 'Name',
    email: 'Email',
    bio: 'Bio',
    edit: 'Edit',
    save: 'Save',
    changePassword: 'Change Password',
    changeAvatar: 'Change Avatar',
    chooseYourAvatar: 'Choose Your Avatar',
    avatarColors: 'Avatar Colors',
    avatarColorsDesc: 'Choose a color for your profile icon',
    uploadCustomImage: 'Upload Custom Image',
    uploadCustomImageDesc: 'Upload your own profile picture',
    chooseImage: 'Choose Image',
    imageHint: 'PNG, JPG up to 5MB',
    playback: 'Playback',
    autoplayTrailers: 'Autoplay Trailers',
    autoplayTrailersDesc: 'Automatically play trailers in background',
    videoQuality: 'Video Quality',
    videoQualityDesc: 'Preferred video quality for trailers',
    appearance: 'Appearance',
    theme: 'Theme',
    themeDesc: 'Choose your preferred theme',
    showMovieRatings: 'Show Movie Ratings',
    showMovieRatingsDesc: 'Display IMDb ratings on movie cards',
    languageRegion: 'Language & Region',
    language: 'Language',
    languageDesc: 'App display language',
    region: 'Region',
    regionDesc: 'Preferred region for content',
    privacy: 'Privacy',
    watchHistory: 'Watch History',
    watchHistoryDesc: 'Track movies you\'ve watched',
    clearData: 'Clear Data',
    clearDataDesc: 'Reset all app data and preferences',
    clearAllData: 'Clear All Data',
    searchResults: 'Search Results',
    close: 'Close',
    allGenres: 'All Genres',
    footer: '© 2024 MovieHub',
    // Auth
    authSubtitleLogin: 'Sign in to discover movies',
    authSubtitleRegister: 'Create an account to discover movies',
    authUsername: 'Username or email',
    authPassword: 'Password',
    authLogin: 'Sign In',
    authRegister: 'Create Account',
    authNoAccount: "Don't have an account?",
    authHasAccount: 'Already have an account?',
    authSignUp: 'Sign Up',
    authSignIn: 'Sign In',
    authRegUsername: 'Username',
    authRegDisplayName: 'Display Name',
    authRegEmail: 'Email address',
    authRegPassword: 'Password',
    authRegPasswordConfirm: 'Confirm Password',
    authLoggingIn: 'Signing in...',
    authCreating: 'Creating account...'
  },
  sr: {
    moviehub: 'MovieHub',
    search: 'Претражи филмове...',
    watchTrailer: 'Гледај трејлер',
    addToWatchlist: 'Додај у листу',
    removeFromWatchlist: 'Уклони из листе',
    myProfile: 'Мој профил',
    myWatchlist: 'Моја листа',
    settings: 'Подешавања',
    helpCenter: 'Помоћ',
    logout: 'Одјави се',
    recommended: 'Препоручено за тебе',
    trending: 'У тренду ове недеље',
    topRated: 'Најбоље оцењени',
    newReleases: 'Нови филмови',
    popular: 'Популарни филмови',
    upcoming: 'Ускоро',
    highestRated: 'Највише оцењени',
    classics: 'Класични филмови',
    loadMore: 'Учитај више',
    whereToWatch: 'Где гледати',
    stream: 'Стримовање',
    buy: 'Купи',
    rent: 'Изнајми',
    noProviders: 'Информације о стримовању нису доступне у вашем региону',
    watchlist: 'Листа',
    moviesWatched: 'Одгледаних филмова',
    movieViews: 'Прегледа филмова',
    name: 'Име',
    email: 'Имејл',
    bio: 'Биографија',
    edit: 'Измени',
    save: 'Сачувај',
    changePassword: 'Промени лозинку',
    changeAvatar: 'Промени аватар',
    chooseYourAvatar: 'Изабери свој аватар',
    avatarColors: 'Боје аватара',
    avatarColorsDesc: 'Изабери боју за своју профилну иконицу',
    uploadCustomImage: 'Постави своју слику',
    uploadCustomImageDesc: 'Поставите своју слику за профил',
    chooseImage: 'Изабери слику',
    imageHint: 'PNG, JPG до 5MB',
    playback: 'Репродукција',
    autoplayTrailers: 'Аутоматско пуштање трејлера',
    autoplayTrailersDesc: 'Аутоматски пусти трејлере у позадини',
    videoQuality: 'Квалитет видеа',
    videoQualityDesc: 'Жељени квалитет видеа за трејлере',
    appearance: 'Изглед',
    theme: 'Тема',
    themeDesc: 'Изаберите жељену тему',
    showMovieRatings: 'Прикажи оцене филмова',
    showMovieRatingsDesc: 'Прикажи IMDb оцене на картицама филмова',
    languageRegion: 'Језик и регион',
    language: 'Језик',
    languageDesc: 'Језик апликације',
    region: 'Регион',
    regionDesc: 'Жељени регион за садржај',
    privacy: 'Приватност',
    watchHistory: 'Историја гледања',
    watchHistoryDesc: 'Прати филмове које си одгледао',
    clearData: 'Обриши податке',
    clearDataDesc: 'Ресетуј све податке и подешавања',
    clearAllData: 'Обриши све податке',
    searchResults: 'Резултати претраге',
    close: 'Затвори',
    allGenres: 'Сви жанрови',
    footer: '© 2024 MovieHub',
    // Auth
    authSubtitleLogin: 'Пријави се да откријеш филмове',
    authSubtitleRegister: 'Креирај налог да откријеш филмове',
    authUsername: 'Корисничко име или имејл',
    authPassword: 'Лозинка',
    authLogin: 'Пријави се',
    authRegister: 'Креирај налог',
    authNoAccount: 'Немаш налог?',
    authHasAccount: 'Имаш налог?',
    authSignUp: 'Региструј се',
    authSignIn: 'Пријави се',
    authRegUsername: 'Корисничко име',
    authRegDisplayName: 'Име за приказ',
    authRegEmail: 'Имејл адреса',
    authRegPassword: 'Лозинка',
    authRegPasswordConfirm: 'Потврди лозинку',
    authLoggingIn: 'Пријављивање...',
    authCreating: 'Креирање налога...'
  }
};

function getCurrentLanguage() {
  const settings = JSON.parse(localStorage.getItem('appSettings')) || { language: 'en' };
  return settings.language || 'en';
}

function translatePage() {
  const lang = getCurrentLanguage();
  const t = translations[lang] || translations.en;
  
  // Header
  const searchInput = document.getElementById('searchInput');
  if (searchInput) searchInput.placeholder = t.search;
  
  // Hero section buttons
  const watchTrailerBtn = document.querySelector('.btn-primary');
  if (watchTrailerBtn && (watchTrailerBtn.textContent.includes('Watch') || watchTrailerBtn.textContent.includes('Гледај'))) {
    watchTrailerBtn.innerHTML = `<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>${t.watchTrailer}`;
  }
  
  const addToWatchlistBtn = document.querySelector('.btn-secondary');
  if (addToWatchlistBtn) {
    const isInWishlist = addToWatchlistBtn.textContent.includes('Remove') || addToWatchlistBtn.textContent.includes('Уклони');
    addToWatchlistBtn.innerHTML = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" ${isInWishlist ? 'fill="currentColor"' : ''}/></svg>${isInWishlist ? t.removeFromWatchlist : t.addToWatchlist}`;
  }
  
  // Section titles
  const sectionTitles = document.querySelectorAll('.section-title');
  const titleMap = [t.recommended, t.trending, t.topRated, t.newReleases, t.popular, t.upcoming, t.highestRated, t.classics];
  sectionTitles.forEach((title, index) => {
    if (titleMap[index]) title.textContent = titleMap[index];
  });
  
  // Load More buttons: ensure only a single text node with translated label
  document.querySelectorAll('.refresh-btn').forEach(btn => {
    // remove any existing text nodes (whitespace or duplicate labels)
    Array.from(btn.childNodes).forEach(node => {
      if (node.nodeType === 3) node.remove();
    });
    // append single translated text node
    btn.appendChild(document.createTextNode(' ' + t.loadMore));
  });
  
  // Profile dropdown
  const dropdownItems = document.querySelectorAll('.profile-dropdown-item');
  if (dropdownItems[0]) dropdownItems[0].childNodes[2].textContent = ` ${t.myProfile}`;
  if (dropdownItems[1]) dropdownItems[1].childNodes[2].textContent = ` ${t.myWatchlist}`;
  if (dropdownItems[2]) dropdownItems[2].childNodes[2].textContent = ` ${t.settings}`;
  if (dropdownItems[3]) dropdownItems[3].childNodes[2].textContent = ` ${t.helpCenter}`;
  if (dropdownItems[4]) dropdownItems[4].childNodes[2].textContent = ` ${t.logout}`;
  
  // Genre tabs - First tab is "All Genres"
  const genreTabs = document.querySelectorAll('.genre-tab');
  if (genreTabs[0]) genreTabs[0].textContent = t.allGenres;
  
  // Profile Modal
  const profileModalTitle = document.querySelector('#profileModal .profile-modal-header h2');
  if (profileModalTitle) profileModalTitle.textContent = t.myProfile;
  
  const changeAvatarBtn = document.querySelector('.change-avatar-btn');
  if (changeAvatarBtn) changeAvatarBtn.textContent = t.changeAvatar;
  
  const profileNameLabel = document.querySelector('label[for="profileName"]');
  if (profileNameLabel) profileNameLabel.textContent = t.name;
  
  const profileEmailLabel = document.querySelector('label[for="profileEmail"]');
  if (profileEmailLabel) profileEmailLabel.textContent = t.email;
  
  const profileBioLabel = document.querySelector('label[for="profileBio"]');
  if (profileBioLabel) profileBioLabel.textContent = t.bio;
  
  const profileStatLabels = document.querySelectorAll('.stat-label');
  if (profileStatLabels[0]) profileStatLabels[0].textContent = t.watchlist;
  if (profileStatLabels[1]) profileStatLabels[1].textContent = t.moviesWatched;
  if (profileStatLabels[2]) profileStatLabels[2].textContent = t.movieViews;
  
  const changePasswordBtn = document.querySelector('.change-password-btn');
  if (changePasswordBtn) changePasswordBtn.textContent = t.changePassword;
  
  // Edit/Save buttons in profile modal
  document.querySelectorAll('.edit-field-btn').forEach(btn => {
    if (btn.textContent === 'Edit' || btn.textContent === 'Измени') {
      btn.textContent = t.edit;
    } else if (btn.textContent === 'Save' || btn.textContent === 'Сачувај') {
      btn.textContent = t.save;
    }
  });
  
  // Avatar Modal
  const avatarModalTitle = document.querySelector('#avatarModal .avatar-modal-header h2');
  if (avatarModalTitle) avatarModalTitle.textContent = t.chooseYourAvatar;
  
  const avatarSections = document.querySelectorAll('#avatarModal .avatar-section h3');
  if (avatarSections[0]) avatarSections[0].textContent = t.avatarColors;
  if (avatarSections[1]) avatarSections[1].textContent = t.uploadCustomImage;
  
  const avatarSectionDescs = document.querySelectorAll('#avatarModal .avatar-section-desc');
  if (avatarSectionDescs[0]) avatarSectionDescs[0].textContent = t.avatarColorsDesc;
  if (avatarSectionDescs[1]) avatarSectionDescs[1].textContent = t.uploadCustomImageDesc;
  
  const avatarUploadBtn = document.querySelector('.avatar-upload-btn');
  if (avatarUploadBtn) {
    const textNode = Array.from(avatarUploadBtn.childNodes).find(node => node.nodeType === 3);
    if (textNode) textNode.textContent = ` ${t.chooseImage}`;
  }
  
  const avatarUploadHint = document.querySelector('.avatar-upload-hint');
  if (avatarUploadHint) avatarUploadHint.textContent = t.imageHint;
  
  // Settings Modal
  const settingsModalTitle = document.querySelector('#settingsModal .settings-modal-header h2');
  if (settingsModalTitle) settingsModalTitle.textContent = t.settings;
  
  const settingsSectionTitles = document.querySelectorAll('#settingsModal .settings-section h3');
  if (settingsSectionTitles[0]) settingsSectionTitles[0].textContent = t.playback;
  if (settingsSectionTitles[1]) settingsSectionTitles[1].textContent = t.languageRegion;
  if (settingsSectionTitles[2]) settingsSectionTitles[2].textContent = t.privacy;
  
  const settingsLabels = document.querySelectorAll('#settingsModal .settings-item-info label');
  const settingsDescs = document.querySelectorAll('#settingsModal .settings-item-info p');
  
  if (settingsLabels[0]) settingsLabels[0].textContent = t.autoplayTrailers;
  if (settingsDescs[0]) settingsDescs[0].textContent = t.autoplayTrailersDesc;
  
  if (settingsLabels[1]) settingsLabels[1].textContent = t.videoQuality;
  if (settingsDescs[1]) settingsDescs[1].textContent = t.videoQualityDesc;
  
  if (settingsLabels[2]) settingsLabels[2].textContent = t.language;
  if (settingsDescs[2]) settingsDescs[2].textContent = t.languageDesc;
  
  if (settingsLabels[3]) settingsLabels[3].textContent = t.region;
  if (settingsDescs[3]) settingsDescs[3].textContent = t.regionDesc;
  
  if (settingsLabels[4]) settingsLabels[4].textContent = t.watchHistory;
  if (settingsDescs[4]) settingsDescs[4].textContent = t.watchHistoryDesc;
  
  if (settingsLabels[5]) settingsLabels[5].textContent = t.clearData;
  if (settingsDescs[5]) settingsDescs[5].textContent = t.clearDataDesc;
  
  const clearDataBtn = document.querySelector('.settings-danger-btn');
  if (clearDataBtn) clearDataBtn.textContent = t.clearAllData;
  
  // Wishlist Modal
  const wishlistModalTitle = document.querySelector('#wishlistModal .wishlist-header h2');
  if (wishlistModalTitle) wishlistModalTitle.textContent = t.myWatchlist;
  
  // Search Modal
  const searchModalTitle = document.querySelector('#searchModal .search-modal-header h2');
  if (searchModalTitle) searchModalTitle.textContent = t.searchResults;
  
  // Footer
  const footerText = document.querySelector('.footer-content p');
  if (footerText) footerText.textContent = t.footer;
}

function loadSettings() {
  const settings = JSON.parse(localStorage.getItem('appSettings')) || {
    autoplayTrailers: true,
    videoQuality: 'auto',
    theme: 'dark',
    showRatings: true,
    language: 'en',
    region: 'US',
    trackHistory: true
  };
  
  // Apply theme on load
  if (settings.theme === 'light') {
    document.body.classList.add('light-theme');
  } else {
    document.body.classList.remove('light-theme');
  }
  
  document.getElementById('autoplayTrailers').checked = settings.autoplayTrailers;
  document.getElementById('videoQuality').value = settings.videoQuality;
  const themeEl = document.getElementById('themeSelect');
  if (themeEl) themeEl.value = settings.theme;
  const showRatingsEl = document.getElementById('showRatings');
  if (showRatingsEl) showRatingsEl.checked = settings.showRatings;
  const languageEl = document.getElementById('languageSelect');
  if (languageEl) languageEl.value = settings.language;
  const regionEl = document.getElementById('regionSelect');
  if (regionEl) regionEl.value = settings.region;
  const trackHistoryEl = document.getElementById('trackHistory');
  if (trackHistoryEl) trackHistoryEl.checked = settings.trackHistory;
}

function saveSettings() {
  // Read elements safely — some controls (like themeSelect) may have been removed
  const autoplayEl = document.getElementById('autoplayTrailers');
  const videoQualityEl = document.getElementById('videoQuality');
  const themeEl = document.getElementById('themeSelect');
  const showRatingsEl = document.getElementById('showRatings');
  const languageEl = document.getElementById('languageSelect');
  const regionEl = document.getElementById('regionSelect');
  const trackHistoryEl = document.getElementById('trackHistory');

  const settings = {
    autoplayTrailers: autoplayEl ? !!autoplayEl.checked : true,
    videoQuality: videoQualityEl ? videoQualityEl.value : 'auto',
    // theme may be removed from the UI; preserve existing stored value if present
    theme: (function() {
      const stored = JSON.parse(localStorage.getItem('appSettings') || '{}');
      if (themeEl && themeEl.value) return themeEl.value;
      return stored.theme || 'dark';
    })(),
    showRatings: showRatingsEl ? !!showRatingsEl.checked : true,
    language: languageEl ? languageEl.value : (JSON.parse(localStorage.getItem('appSettings') || '{}').language || 'en'),
    region: regionEl ? regionEl.value : (JSON.parse(localStorage.getItem('appSettings') || '{}').region || 'US'),
    trackHistory: trackHistoryEl ? !!trackHistoryEl.checked : true
  };

  localStorage.setItem('appSettings', JSON.stringify(settings));
  
  // Sync to server
  saveSettingsToServer();
}

function toggleAutoplay(checkbox) {
  saveSettings();
  showNotification(checkbox.checked ? 'Autoplay enabled' : 'Autoplay disabled');
  
  // Ako je isključen autoplay, ukloni background trailer ako postoji
  if (!checkbox.checked) {
    const videoContainer = document.getElementById('heroVideoContainer');
    if (videoContainer) {
      videoContainer.remove();
      // Vrati original backdrop image
      const heroSection = document.querySelector('.hero');
      const currentMovie = window.currentHeroMovie;
      if (currentMovie && currentMovie.backdrop_path) {
        const backdropUrl = `${TMDB_IMAGE_HERO}${currentMovie.backdrop_path}`;
        heroSection.style.backgroundImage = `
          linear-gradient(to bottom, rgba(20, 20, 20, 0.3), rgba(20, 20, 20, 0.9)),
          url('${backdropUrl}')
        `;
      }
    }
  } else {
    // Ako je uključen, ponovo prikaži trailer
    const currentMovie = window.currentHeroMovie;
    if (currentMovie && currentMovie.trailers) {
      const youtubeTrailer = currentMovie.trailers.find(v => v.site === 'YouTube' && v.type === 'Trailer');
      if (youtubeTrailer) {
        const heroSection = document.querySelector('.hero');
        heroSection.style.backgroundImage = 'none';
        
        const qualityParam = getVideoQualityParam();
        const videoContainer = document.createElement('div');
        videoContainer.className = 'hero-video-background';
        videoContainer.id = 'heroVideoContainer';
        videoContainer.innerHTML = `
          <iframe 
            id="heroTrailerIframe"
            src="https://www.youtube-nocookie.com/embed/${youtubeTrailer.key}?autoplay=1&mute=1&loop=1&playlist=${youtubeTrailer.key}&controls=0&showinfo=0&rel=0&modestbranding=1&playsinline=1&disablekb=1&fs=0&iv_load_policy=3${qualityParam}"
            frameborder="0"
            allow="autoplay; encrypted-media"
            allowfullscreen
          ></iframe>
        `;
        heroSection.insertBefore(videoContainer, heroSection.firstChild);
      }
    }
  }
}

function saveVideoQuality(select) {
  saveSettings();
  showNotification(`Video quality set to ${select.value}`);
}

function changeTheme(select) {
  const theme = select.value;
  
  if (theme === 'light') {
    document.body.classList.add('light-theme');
  } else {
    document.body.classList.remove('light-theme');
  }
  
  saveSettings();
  showNotification(`${theme.charAt(0).toUpperCase() + theme.slice(1)} theme activated`);
}

function toggleRatings(checkbox) {
  saveSettings();
  showNotification(checkbox.checked ? 'Ratings will be shown' : 'Ratings hidden');
}

function changeLanguage(select) {
  const lang = select.value;
  if (lang !== 'en' && lang !== 'sr') {
    showNotification('More languages coming soon!');
    select.value = getCurrentLanguage();
    return;
  }
  saveSettings();
  translatePage();
  showNotification(lang === 'sr' ? 'Језик промењен на српски' : 'Language changed to English');
}

function changeRegion(select) {
  saveSettings();
  showNotification(`Region changed to ${select.options[select.selectedIndex].text}`);
}

function toggleHistory(checkbox) {
  saveSettings();
  showNotification(checkbox.checked ? 'Watch history enabled' : 'Watch history disabled');
}

function clearAllData() {
  if (confirm('Are you sure you want to clear all data? This will reset your profile, watchlist, and preferences.')) {
    // Clear all localStorage except keep some basics
    const confirmAgain = confirm('This action cannot be undone. Continue?');
    if (confirmAgain) {
      // Logout from server
      handleLogout();
      localStorage.clear();
      showNotification('All data cleared! Refreshing page...');
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    }
  }
}

// Track movies watched (when user clicks Watch Trailer)
function trackMovieWatched(movieId) {
  let watchedMovies = JSON.parse(localStorage.getItem('watchedMovies')) || [];
  
  if (!watchedMovies.includes(movieId)) {
    watchedMovies.push(movieId);
    localStorage.setItem('watchedMovies', JSON.stringify(watchedMovies));
    trackToServer('watched', movieId);
  }
}

// Track movie views (every time user opens a movie modal)
function trackMovieView(movieId) {
  let movieViews = parseInt(localStorage.getItem('movieViews')) || 0;
  movieViews++;
  localStorage.setItem('movieViews', movieViews.toString());
  trackToServer('view', movieId || 0);
}

// Update profile statistics
function updateProfileStats() {
  // Watchlist count
  document.getElementById('watchlistCount').textContent = wishlist.length;
  
  // Movies watched count
  const watchedMovies = JSON.parse(localStorage.getItem('watchedMovies')) || [];
  document.getElementById('moviesWatchedCount').textContent = watchedMovies.length;
  
  // Movie views count
  const movieViews = parseInt(localStorage.getItem('movieViews')) || 0;
  document.getElementById('movieViewsCount').textContent = movieViews;
}