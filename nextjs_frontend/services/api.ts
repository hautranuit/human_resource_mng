import axios from 'axios'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

export const api = axios.create({
  baseURL: `${API_URL}/api`,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Function to get CSRF token from cookies
const getCSRFToken = () => {
  const cookieValue = document.cookie
    .split('; ')
    .find(row => row.startsWith('csrftoken='))
    ?.split('=')[1];
  return cookieValue;
}

// Add request interceptor to include CSRF token
api.interceptors.request.use(
  (config) => {
    const csrfToken = getCSRFToken();
    if (csrfToken) {
      config.headers['X-CSRFToken'] = csrfToken;
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Add response interceptor to handle errors
api.interceptors.response.use(
  (response) => {
    return response
  },
  (error) => {
    if (error.response?.status === 401 || error.response?.status === 403) {
      // Only redirect on 401/403 if we're not already on the login page
      // and if it's not an expected auth check endpoint
      const isAuthEndpoint = error.config?.url?.includes('/employees/current/') || 
                            error.config?.url?.includes('/auth/csrf/') ||
                            error.config?.url?.includes('/auth/status/');
      
      if (!isAuthEndpoint && window.location.pathname !== '/') {
        // Handle unauthorized access by redirecting to login
        window.location.href = '/'
      }
    }
    return Promise.reject(error)
  }
)