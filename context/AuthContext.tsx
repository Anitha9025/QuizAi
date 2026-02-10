
import React, { createContext, useContext, useState, ReactNode } from 'react';
import { User, UserRole, AuthState } from '../types';
import api from '../api/axios';

interface AuthContextType extends AuthState {
  login: (email: string, password: string, role: UserRole) => Promise<void>;
  register: (name: string, email: string, password: string, role: UserRole) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, setState] = useState<AuthState>({
    user: JSON.parse(localStorage.getItem('user') || 'null'),
    token: localStorage.getItem('token'),
    isLoading: false,
    error: null,
  });

  const login = async (email: string, password: string, role: UserRole) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    try {
      const response = await api.post('/auth/login', { email, password });
      const { token, user } = response.data;
      
      if (user.role !== role) {
        throw new Error(`This account is registered as a ${user.role}. Please use the ${user.role} portal.`);
      }

      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      setState({ user, token, isLoading: false, error: null });
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Login failed';
      setState(prev => ({ ...prev, isLoading: false, error: errorMessage }));
      throw err;
    }
  };

  const register = async (name: string, email: string, password: string, role: UserRole) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    try {
      const response = await api.post('/auth/register', { name, email, password, role });
      const { token, user } = response.data;

      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      setState({ user, token, isLoading: false, error: null });
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Registration failed';
      setState(prev => ({ ...prev, isLoading: false, error: errorMessage }));
      throw err;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setState({ user: null, token: null, isLoading: false, error: null });
  };

  return (
    <AuthContext.Provider value={{ ...state, login, register, logout }}>
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
