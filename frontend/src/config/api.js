// API configuration
// In production (Heroku), VITE_API_BASE will be empty and we'll use relative URLs
// In development, it defaults to localhost:4000
export const API_BASE = import.meta.env.VITE_API_BASE || (import.meta.env.MODE === 'production' ? '' : 'http://localhost:4000')

export default API_BASE
