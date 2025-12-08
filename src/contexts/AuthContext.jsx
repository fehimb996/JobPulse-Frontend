import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';

const AuthContext = createContext();

function parseJwt(token) {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error('Error parsing JWT:', error);
    return null;
  }
}

function isTokenExpired(token) {
  const payload = parseJwt(token);
  if (!payload || !payload.exp) return true;
  
  const now = Date.now() / 1000;
  // Add small buffer (30 seconds) to prevent edge cases
  return payload.exp <= (now + 30);
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize user from localStorage
  const initializeUser = useCallback(() => {
    const token = localStorage.getItem('token');
    const storedEmail = localStorage.getItem('email');
    const storedId = localStorage.getItem('userId');

    if (!token) {
      setUser(null);
      setIsLoading(false);
      return;
    }

    // Check if token is expired
    if (isTokenExpired(token)) {
      console.log('Token expired, clearing localStorage');
      localStorage.removeItem('token');
      localStorage.removeItem('userId');
      localStorage.removeItem('email');
      setUser(null);
      setIsLoading(false);
      return;
    }

    const payload = parseJwt(token);
    if (payload) {
      const userData = {
        id: payload.id || storedId,
        email: payload.email || storedEmail,
        accessToken: token
      };
      setUser(userData);
    } else {
      setUser(null);
    }
    
    setIsLoading(false);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    localStorage.removeItem('email');
    setUser(null);
  }, []);

  // Initialize auth on mount
  useEffect(() => {
    initializeUser();
  }, [initializeUser]);

  // Listen for auth events
  useEffect(() => {
    const handleUnauthorized = () => {
      console.log('Received unauthorized event');
      setUser(null);
    };

    const handleLogout = () => {
      console.log('Received logout event');
      setUser(null);
    };

    window.addEventListener('auth:unauthorized', handleUnauthorized);
    window.addEventListener('auth:logout', handleLogout);

    return () => {
      window.removeEventListener('auth:unauthorized', handleUnauthorized);
      window.removeEventListener('auth:logout', handleLogout);
    };
  }, []);

  const value = {
    user,
    setUser,
    logout,
    isAuthenticated: !!user,
    isLoading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};