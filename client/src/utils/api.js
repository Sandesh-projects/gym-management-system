// client/src/utils/api.js
import axios from 'axios';

// Create an Axios instance
const api = axios.create({
  // Correct baseURL: only backend domain and port
  baseURL: 'http://localhost:5000', // Make sure this matches your backend server address
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to include JWT token in headers for authenticated requests
api.interceptors.request.use(
  config => {
    // Get token from localStorage (where we stored the user object during login/signup)
    const user = localStorage.getItem('user');
    const token = user ? JSON.parse(user).token : null; // Assuming user object includes a token

    // If a token exists, add it to the Authorization header
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }

    return config;
  },
  error => {
    // Do something with request error
    return Promise.reject(error);
  }
);

// Add response interceptor for handling errors (e.g., 401 Unauthorized)
api.interceptors.response.use(
  response => {
    // If the response is successful (2xx), just return it
    return response;
  },
  error => {
    // Handle errors
    console.error('API Response Error:', error.response?.status, error.response?.data);

    // If a 401 Unauthorized response is received, it means the token is invalid or expired
    if (error.response && error.response.status === 401) {
      // TODO: Implement client-side logout logic or redirect to login page
      console.log('401 Unauthorized received. Logging out user...');
      // You might dispatch a logout action here or trigger the logout function from AuthContext
      // Example: window.location.href = '/signin'; // Simple redirect
      // A better way is to handle this in AuthContext or a global error handler

      // If AuthContext is available globally or passed down, you could call logout()
      // This requires careful implementation to avoid circular dependencies

      // For now, let's re-throw the error to be handled by the component that made the call
      return Promise.reject(error);
    }

    // For other errors, just re-throw them
    return Promise.reject(error);
  }
);


export default api;