import { createContext, useContext, useState, useEffect } from 'react';
import { useMutation } from '@tanstack/react-query';
import { authApi, queryClient } from '../api/reactQuery'; // Update with your actual path

// Create context
const AuthContext = createContext(null);

// Auth provider component
export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check if user is already logged in on mount (from localStorage)
  useEffect(() => {
    const checkAuthStatus = () => {
      const token = localStorage.getItem('authToken');
      const userData = localStorage.getItem('userData');

      if (token) {
        setIsAuthenticated(true);
        setUser(userData ? JSON.parse(userData) : null);
      }

      setIsLoading(false);
    };

    checkAuthStatus();
  }, []);

  // Login mutation
  const loginMutation = useMutation({
    mutationFn: (credentials) => authApi.login(credentials),
    onSuccess: (data) => {
      // Assuming the API returns user data and token
      const { user: userData, token } = data;

      // Store in localStorage
      localStorage.setItem('authToken', token);
      localStorage.setItem('userData', JSON.stringify(userData));

      // Update state
      setUser(userData);
      setIsAuthenticated(true);

      // Invalidate any user-related queries
      queryClient.invalidateQueries({ queryKey: ['user'] });

      return true;
    },
  });

  // Logout mutation
  const logoutMutation = useMutation({
    mutationFn: () => authApi.logout(),
    onSettled: () => {
      // Clear local storage, regardless of success/failure
      localStorage.removeItem('authToken');
      localStorage.removeItem('userData');

      // Update state
      setUser(null);
      setIsAuthenticated(false);

      // Clear all cached data
      queryClient.clear();
    },
  });

  // Login function
  const login = async (credentials) => {
    return loginMutation.mutateAsync(credentials);
  };

  // Logout function
  const logout = () => {
    logoutMutation.mutate();
  };

  // Auth context value
  const value = {
    isAuthenticated,
    user,
    isLoading,
    login,
    logout,
    loginIsLoading: loginMutation.isPending,
    logoutIsLoading: logoutMutation.isPending,
  };

  return (
    <AuthContext.Provider value={value}>
      {!isLoading && children}
    </AuthContext.Provider>
  );
};

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
