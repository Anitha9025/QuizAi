
import React, { createContext, useContext, useState, ReactNode } from 'react';
import { User, UserRole, AuthState } from '../types.ts';
import api from '../api/axios.ts';

interface AuthContextType extends AuthState {
  login: (email: string, password: string, role: UserRole) => Promise<void>;
  register: (name: string, email: string, password: string, role: UserRole) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const getMockDB = (): User[] => JSON.parse(localStorage.getItem('mock_db') || '[]');
const saveToMockDB = (user: User) => {
  const db = getMockDB();
  const exists = db.find(u => u.email.toLowerCase() === user.email.toLowerCase());
  if (!exists) {
    db.push(user);
    localStorage.setItem('mock_db', JSON.stringify(db));
  }
};

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
      await new Promise(resolve => setTimeout(resolve, 800)); 
      const db = getMockDB();
      const existingUser = db.find(u => u.email.toLowerCase() === email.toLowerCase());
      
      if (!existingUser) {
        throw new Error('No account found with this email. Please register first.');
      }

      if (existingUser.role !== role) {
        throw new Error(`This account is registered as a ${existingUser.role}. Please use the ${existingUser.role} portal.`);
      }

      const mockToken = 'mock-jwt-token-' + Date.now();
      localStorage.setItem('token', mockToken);
      localStorage.setItem('user', JSON.stringify(existingUser));
      
      setState({ user: existingUser, token: mockToken, isLoading: false, error: null });
    } catch (err: any) {
      const errorMessage = err.message || 'Login failed';
      setState(prev => ({ ...prev, isLoading: false, error: errorMessage }));
      throw err;
    }
  };

  const register = async (name: string, email: string, password: string, role: UserRole) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      const db = getMockDB();
      const exists = db.find(u => u.email.toLowerCase() === email.toLowerCase());
      if (exists) {
        throw new Error('An account with this email already exists.');
      }

      const mockUser: User = {
        id: Math.random().toString(36).substr(2, 9),
        name,
        email,
        role
      };

      saveToMockDB(mockUser);
      const mockToken = 'mock-jwt-token-' + Date.now();
      localStorage.setItem('token', mockToken);
      localStorage.setItem('user', JSON.stringify(mockUser));
      setState({ user: mockUser, token: mockToken, isLoading: false, error: null });
    } catch (err: any) {
      const errorMessage = err.message || 'Registration failed';
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
