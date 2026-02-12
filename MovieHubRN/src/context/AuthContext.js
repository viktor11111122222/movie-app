import React, {createContext, useState, useContext, useEffect} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {authService} from '../services/api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({children}) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const token = await AsyncStorage.getItem('authToken');
      if (token) {
        const data = await authService.getUser();
        setUser(data.user);
        setIsAuthenticated(true);
      }
    } catch (error) {
      console.log('Auth check failed:', error);
      await AsyncStorage.removeItem('authToken');
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (loginValue, password) => {
    try {
      const data = await authService.login(loginValue, password);
      setUser(data.user);
      setIsAuthenticated(true);
      return {success: true};
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Login failed',
      };
    }
  };

  const register = async (username, email, password, display_name, region) => {
    try {
      const data = await authService.register(
        username,
        email,
        password,
        display_name,
        region,
      );
      setUser(data.user);
      setIsAuthenticated(true);
      return {success: true};
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Registration failed',
      };
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
    } catch (error) {
      console.log('Logout error:', error);
    }
    setUser(null);
    setIsAuthenticated(false);
  };

  const updateUserProfile = async profileData => {
    try {
      const data = await authService.updateProfile(profileData);
      setUser(data.user);
      return {success: true};
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Update failed',
      };
    }
  };

  const updateUserAvatar = async avatarSettings => {
    try {
      const data = await authService.updateAvatar(avatarSettings);
      setUser(data.user);
      return {success: true};
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Avatar update failed',
      };
    }
  };

  const value = {
    user,
    isLoading,
    isAuthenticated,
    login,
    register,
    logout,
    updateUserProfile,
    updateUserAvatar,
    checkAuthStatus,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
