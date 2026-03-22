import axios from 'axios';

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || (
  window.location.hostname === 'localhost' 
    ? 'http://localhost:3333' 
    : 'https://puzzle-api-z48f.onrender.com'
);

axios.defaults.withCredentials = true;
