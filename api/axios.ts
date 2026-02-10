
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000/api',
  timeout: 10000, // 10 second timeout
});

// Automatically add token to requests if it exists
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Error interceptor for better error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.code === 'ECONNREFUSED' || error.message.includes('Network Error') || error.code === 'ERR_NETWORK') {
      console.error('❌ Backend server is not running. Please start the server with: cd server && npm start');
      error.message = 'Cannot connect to server. Make sure the backend server is running on port 5000.';
    } else if (error.response?.status === 404) {
      console.error('❌ API endpoint not found. Make sure the backend server is running and the route exists.');
    }
    return Promise.reject(error);
  }
);

export default api;
