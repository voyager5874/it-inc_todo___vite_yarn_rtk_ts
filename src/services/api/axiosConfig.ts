import axios from 'axios';

export const baseApiInstance = axios.create({
  baseURL: import.meta.env.VITE_BASE_URL,
  withCredentials: true,
  headers: {
    'API-KEY': import.meta.env.VITE_API_KEY,
  },
});

export const extrasApiInstance = axios.create({
  baseURL: import.meta.env.VITE_SOCIAL_NETWORK_BASE_URL,
  withCredentials: true,
  headers: {
    'API-KEY': import.meta.env.VITE_API_KEY,
  },
});
