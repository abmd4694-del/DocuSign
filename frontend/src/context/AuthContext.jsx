import { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const currentUser = authService.getCurrentUser();
    setUser(currentUser);
    setLoading(false);
  }, []);

  const login = async (credentials) => {
    const data = await authService.login(credentials);
    setUser(data.data);
    return data;
  };

  const register = async (userData) => {
    const data = await authService.register(userData);
    // Modified: Register no longer returns a token immediately
    // setUser(data.data); 
    return data;
  };


  const verifyEmail = async (email, code) => {
    const data = await authService.verifyEmail(email, code);
    setUser(data.data);
    return data;
  };

  const resendVerificationCode = async (email) => {
    return await authService.resendVerificationCode(email);
  };

  const logout = () => {
    authService.logout();
    setUser(null);
  };

  const value = {
    user,
    login,
    register,
    logout,
    isAuthenticated: !!user,
    loading,
    verifyEmail,
    resendVerificationCode,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
