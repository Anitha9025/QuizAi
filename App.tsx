
import React from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navigation from './components/Layout/Navigation';
import LoginForm from './components/Auth/LoginForm';
import RegisterForm from './components/Auth/RegisterForm';
import HomePage from './pages/HomePage';

const App: React.FC = () => {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-slate-50 flex flex-col">
          <Navigation />
          <main className="flex-grow container mx-auto px-4 py-8">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/login" element={<LoginForm />} />
              <Route path="/register" element={<RegisterForm />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
          <footer className="bg-white border-t py-6 text-center text-slate-500 text-sm">
            &copy; {new Date().getFullYear()} AI-Powered Quiz Platform. All rights reserved.
          </footer>
        </div>
      </Router>
    </AuthProvider>
  );
};

export default App;
