import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiClient } from '../../services/api';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'student' | 'admin';
  avatar?: string;
  bio?: string;
  institution?: string;
  createdAt?: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string, role: 'student' | 'admin') => Promise<void>;
  loginWithGoogle: (redirectPath?: string) => Promise<void>;
  signup: (name: string, email: string, password: string, role: 'student' | 'admin') => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isStudent: boolean;
  loading: boolean;
  error: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const fallbackAuthContext: AuthContextType = {
  user: null,
  login: async () => {
    throw new Error('Auth system not initialized yet');
  },
  loginWithGoogle: async () => {
    throw new Error('Auth system not initialized yet');
  },
  signup: async () => {
    throw new Error('Auth system not initialized yet');
  },
  logout: () => {},
  isAuthenticated: false,
  isAdmin: false,
  isStudent: false,
  loading: true,
  error: 'Auth system not initialized',
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    console.error('useAuth used outside AuthProvider; returning fallback context');
    return fallbackAuthContext;
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const bootstrapAuth = async () => {
      try {
        // Support OAuth redirect flow: /login/student?token=...
        const url = new URL(window.location.href);
        const oauthToken = url.searchParams.get('token');

        if (oauthToken) {
          apiClient.setToken(oauthToken);
          localStorage.setItem('quizpulse_token', oauthToken);
          url.searchParams.delete('token');
          window.history.replaceState({}, '', url.toString());

          const profileResponse = await apiClient.getProfile();
          if (profileResponse?.data?.user) {
            const userData = {
              ...profileResponse.data.user,
              id: profileResponse.data.user.id || profileResponse.data.user._id,
            };
            setUser(userData);
            localStorage.setItem('quizpulse_user', JSON.stringify(userData));
          }
          return;
        }

        // Standard persisted auth flow
        const storedUser = localStorage.getItem('quizpulse_user');
        const token = localStorage.getItem('quizpulse_token');

        if (storedUser && token) {
          setUser(JSON.parse(storedUser));
          apiClient.setToken(token);
        }
      } finally {
        setLoading(false);
      }
    };

    bootstrapAuth();
  }, []);

  const login = async (email: string, password: string, role: 'student' | 'admin') => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await apiClient.login({ email, password });
      
      if (response.success && response.data) {
        const userData = {
          ...response.data.user,
          id: response.data.user.id || response.data.user._id,
        };
        
        setUser(userData);
        localStorage.setItem('quizpulse_user', JSON.stringify(userData));
        
        if (response.data.token) {
          apiClient.setToken(response.data.token);
        }
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Login failed';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const loginWithGoogle = async (redirectPath = '/dashboard') => {
    try {
      setLoading(true);
      setError(null);
      const apiBase = (import.meta.env.VITE_API_URL || 'https://quizpulseai-backend.onrender.com/api').replace('/api', '');
      const safeRedirect = redirectPath.startsWith('/') && !redirectPath.startsWith('//') ? redirectPath : '/dashboard';
      const oauthUrl = new URL(`${apiBase}/api/auth/google`);
      oauthUrl.searchParams.set('redirect', safeRedirect);
      window.location.href = oauthUrl.toString();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Google login failed';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const signup = async (name: string, email: string, password: string, role: 'student' | 'admin') => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await apiClient.signup({ name, email, password, role });
      
      if (response.success && response.data) {
        const userData = {
          ...response.data.user,
          id: response.data.user.id || response.data.user._id,
        };
        
        setUser(userData);
        localStorage.setItem('quizpulse_user', JSON.stringify(userData));
        
        if (response.data.token) {
          apiClient.setToken(response.data.token);
        }
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Signup failed';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('quizpulse_user');
    localStorage.removeItem('quizpulse_token');
  };

  const value = {
    user,
    login,
    loginWithGoogle,
    signup,
    logout,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'admin',
    isStudent: user?.role === 'student',
    loading,
    error,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
