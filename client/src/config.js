// In production, we leave the URL empty so it uses the same domain
// In development, we use localhost:5000
export const API_BASE_URL = import.meta.env.PROD 
  ? '' 
  : (import.meta.env.VITE_API_URL || 'http://localhost:5000');
