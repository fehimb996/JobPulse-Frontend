import { api } from '@/api/api';

let authInterceptorInitialized = false;

export function initAuthInterceptor() {
  if (authInterceptorInitialized) return;
  
  // Request interceptor - add token to headers
  api.interceptors.request.use(
    (config) => {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => Promise.reject(error)
  );

  // Response interceptor - handle 401 errors
  api.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response?.status === 401) {
        // Clear stored data
        localStorage.removeItem('token');
        localStorage.removeItem('userId');
        localStorage.removeItem('email');
        
        // Trigger custom event for AuthContext to listen
        window.dispatchEvent(new CustomEvent('auth:unauthorized'));
        
        // Only redirect if not already on login page
        if (window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
      }
      return Promise.reject(error);
    }
  );
  
  authInterceptorInitialized = true;
}

export async function loginUser(credentials) {
  try {
    const { data } = await api.post('/api/auth/login', credentials);
    
    // Store auth data
    localStorage.setItem('token', data.accessToken);
    localStorage.setItem('userId', data.id);
    localStorage.setItem('email', data.email);
    
    return data;
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
}

export async function registerUser(payload) {
  try {
    const { data } = await api.post('/api/auth/register', payload);
    return data;
  } catch (error) {
    console.error('Register error:', error);
    throw error;
  }
}

export async function confirmEmail({ userId, token }) {
  try {
    const { data } = await api.post('/api/auth/confirm-email', { userId, token });
    return data;
  } catch (error) {
    console.error('Confirm email error:', error);
    throw error;
  }
}

export function logoutUser() {
  localStorage.removeItem('token');
  localStorage.removeItem('userId');
  localStorage.removeItem('email');
  
  // Trigger logout event
  window.dispatchEvent(new CustomEvent('auth:logout'));
}