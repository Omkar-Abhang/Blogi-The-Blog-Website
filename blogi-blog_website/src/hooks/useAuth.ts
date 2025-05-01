'use client';

import { useState, useEffect, useCallback } from 'react';
import { isAuthenticated as checkIsAuthenticated, getAuthToken, removeAuthToken } from '@/lib/auth';
import { logoutUser } from '@/services/auth-api';

export function useAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true); // Start loading until checked

  const checkAuthStatus = useCallback(() => {
    setIsLoading(true);
    const authenticated = checkIsAuthenticated();
    setIsAuthenticated(authenticated);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    checkAuthStatus();
    // Optional: Add event listener for storage changes to sync across tabs
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === 'blogilite_token') {
        checkAuthStatus();
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [checkAuthStatus]);

  const logout = async () => {
    try {
      // Optional: Call backend logout endpoint if necessary
      await logoutUser();
    } catch (error) {
      console.error('Logout API call failed:', error);
      // Proceed with frontend logout even if API fails
    } finally {
       removeAuthToken();
       setIsAuthenticated(false);
       // Force a reload or redirect to ensure state consistency
       window.location.href = '/login'; // Redirect to login page
    }
  };

  return { isAuthenticated, isLoading, checkAuthStatus, logout };
}
