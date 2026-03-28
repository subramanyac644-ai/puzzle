import axios from 'axios';

export const API_BASE_URL = typeof window !== 'undefined' ? (
  process.env.NEXT_PUBLIC_API_BASE_URL || ''
) : '';

axios.defaults.withCredentials = true;
