import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '../types';
import { getCurrentUser, logout as authLogout, fetchCurrentUser } from '../services/authService';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  setUser: (user: User | null) => void;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = () => {
      const currentUser = getCurrentUser();
      if (currentUser) setUser(currentUser);
      setLoading(false);
    };
    initAuth();
  }, []);

  const logout = () => {
    authLogout();
    setUser(null);
  };

  const refreshUser = async () => {
      try {
          const updated = await fetchCurrentUser();
          setUser(updated);
      } catch (e) {
          // If fetch fails (e.g. 401), maybe logout?
          // For now, fail silently or log
          console.error(e);
      }
  };

  return (
    <AuthContext.Provider value={{ user, setUser, loading, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
