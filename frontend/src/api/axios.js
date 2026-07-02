import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'https://jms-vpf1.onrender.com/api',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30 seconds timeout
});

let isCircuitOpen = false;
let circuitOpenTime = 0;
const CIRCUIT_BREAKER_DURATION = 60000; // 60 seconds

// Polling endpoints that should be affected by the circuit breaker
const POLLING_ENDPOINTS = ['/gold-rates', '/live-rates', '/notification'];

const isPollingEndpoint = (url) => {
  if (!url) return false;
  return POLLING_ENDPOINTS.some(endpoint => url.includes(endpoint));
};

// Request interceptor for adding auth token and polling protection
api.interceptors.request.use(
  (config) => {
    // Polling Protection Circuit Breaker
    if (isCircuitOpen && isPollingEndpoint(config.url)) {
      if (Date.now() - circuitOpenTime < CIRCUIT_BREAKER_DURATION) {
        console.warn(`[Axios] Circuit breaker open. Skipping polling request to ${config.url}`);
        return Promise.reject(new Error('Circuit breaker open due to recent 404/5xx errors. Pausing polling.'));
      } else {
        // Reset after duration
        isCircuitOpen = false;
      }
    }

    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for handling common errors and retries
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const config = error.config;

    // Trigger Circuit Breaker for 404s to prevent polling spam (only trip on polling endpoints)
    if (error.response?.status === 404 && isPollingEndpoint(config?.url)) {
      isCircuitOpen = true;
      circuitOpenTime = Date.now();
      console.error(`[API] 404 Not Found: ${config?.url}. Circuit Breaker OPEN for polling endpoints for 60s.`);
    }

    // Handle authentication errors
    if (error.response?.status === 401 && !config?.url?.includes('/auth/login')) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
      return Promise.reject(error);
    }

    // Do not retry if we have reached the max retry limit or if there is no config
    if (!config || (config._retryCount && config._retryCount >= 3)) {
      if (error.code === 'ERR_NETWORK' || error.code === 'ECONNREFUSED') {
        console.warn(`[Axios] Network Error or Connection Refused for ${config?.url}. Falling back.`);
      }
      return Promise.reject(error);
    }

    // Initialize retry count
    config._retryCount = config._retryCount || 0;

    // Retry only on network errors or 5xx server errors
    const shouldRetry = 
      !error.response || 
      error.response.status >= 500 || 
      error.code === 'ECONNREFUSED' || 
      error.code === 'ERR_NETWORK';

    if (shouldRetry) {
      config._retryCount += 1;
      
      // Exponential backoff: 1s, 2s, 4s
      const delay = Math.pow(2, config._retryCount - 1) * 1000;
      
      console.log(`[Axios] Request failed (${error.message}). Retrying ${config._retryCount}/3 in ${delay}ms...`);
      
      await new Promise(resolve => setTimeout(resolve, delay));
      return api(config);
    }

    return Promise.reject(error);
  }
);

export default api;
