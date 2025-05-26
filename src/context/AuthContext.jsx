// src/context/AuthContext.jsx
import React, { createContext, useState, useEffect, useCallback } from 'react';

// Create the authentication context
export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Check if user is already logged in on component mount
  useEffect(() => {
    const checkLoggedInUser = () => {
      try {
        const storedUser = localStorage.getItem('careRemindUser');
        if (storedUser) {
          setCurrentUser(JSON.parse(storedUser));
        }
      } catch (error) {
        console.error('Error checking authentication:', error);
      } finally {
        setLoading(false);
      }
    };

    checkLoggedInUser();
  }, []);

  // Login function
  const login = useCallback(async (email, password, isDemo = false) => {
    setLoading(true);
    setError(null);

    try {
      // In a real app, this would make an API call to a backend service
      // For demo purposes, we'll simulate authentication
      
      if (isDemo) {
        // Demo user for testing
        const demoUser = {
          id: 'demo-user-id',
          name: 'Demo User',
          email: 'demo@careremind.com',
          role: 'admin',
        };
        
        setCurrentUser(demoUser);
        localStorage.setItem('careRemindUser', JSON.stringify(demoUser));
        return demoUser;
      }
      
      // For a real implementation, this would validate credentials with an API
      // Simulating authentication delay for demo
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Mock validation - in a real app this would check against a database
      if (email === 'user@example.com' && password === 'password123') {
        const user = {
          id: 'user-123',
          name: 'Test User',
          email,
          role: 'user',
        };
        
        setCurrentUser(user);
        localStorage.setItem('careRemindUser', JSON.stringify(user));
        return user;
      } else {
        throw new Error('Invalid credentials');
      }
    } catch (error) {
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  // Logout function
  const logout = useCallback(() => {
    setCurrentUser(null);
    localStorage.removeItem('careRemindUser');
  }, []);

  // Register function for new users
  const register = useCallback(async (userData) => {
    setLoading(true);
    setError(null);

    try {
      // In a real app, this would make an API call to create a new user
      // For demo purposes, we'll simulate registration
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const newUser = {
        id: `user-${Date.now()}`,
        name: userData.name,
        email: userData.email,
        role: 'user',
      };
      
      setCurrentUser(newUser);
      localStorage.setItem('careRemindUser', JSON.stringify(newUser));
      return newUser;
    } catch (error) {
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  // Context value
  const value = {
    currentUser,
    loading,
    error,
    login,
    logout,
    register,
    isAuthenticated: !!currentUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use the auth context
export const useAuth = () => {
  const context = React.useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};