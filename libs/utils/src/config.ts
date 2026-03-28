import axios from 'axios';

export const API_BASE_URL = typeof window !== 'undefined' ? (
  process.env.NEXT_PUBLIC_API_BASE_URL || (
    ['localhost', '127.0.0.1'].includes(window.location.hostname)
      ? 'http://localhost:3000' // Default to Next.js dev port
      : 'https://puzzle-api-z48f.onrender.com'
  )
) : '';

axios.defaults.withCredentials = true;
