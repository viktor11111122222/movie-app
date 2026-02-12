export const formatDate = dateString => {
  if (!dateString) return 'N/A';
  
  const date = new Date(dateString);
  const options = {year: 'numeric', month: 'long', day: 'numeric'};
  return date.toLocaleDateString('en-US', options);
};

export const formatYear = dateString => {
  if (!dateString) return 'N/A';
  return dateString.substring(0, 4);
};

export const formatRuntime = minutes => {
  if (!minutes) return 'N/A';
  
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  
  if (hours === 0) return `${mins}m`;
  return `${hours}h ${mins}m`;
};

export const formatCurrency = amount => {
  if (!amount) return 'N/A';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
  }).format(amount);
};

export const truncateText = (text, maxLength) => {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};
