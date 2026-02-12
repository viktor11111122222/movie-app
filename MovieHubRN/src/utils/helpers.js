export const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
};

export const formatRuntime = (minutes) => {
  if (!minutes) return 'N/A';
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours}h ${mins}m`;
};

export const formatRating = (rating) => {
  if (!rating) return 'N/A';
  return rating.toFixed(1);
};

export const formatCurrency = (amount) => {
  if (!amount) return 'N/A';
  if (amount >= 1e9) {
    return '$' + (amount / 1e9).toFixed(1) + 'B';
  } else if (amount >= 1e6) {
    return '$' + (amount / 1e6).toFixed(1) + 'M';
  } else if (amount >= 1e3) {
    return '$' + (amount / 1e3).toFixed(1) + 'K';
  }
  return '$' + amount.toLocaleString();
};

export const truncateText = (text, maxLength = 100) => {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};

export const getImageUrl = (path, size = 'w500') => {
  if (!path) return null;
  return `https://image.tmdb.org/t/p/${size}${path}`;
};

export const debounce = (func, delay = 300) => {
  let timeoutId;
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
};

export const validateEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

export const validatePassword = (password) => {
  return password && password.length >= 6;
};

export const generateRandomId = () => {
  return Math.random().toString(36).substring(2, 15);
};
