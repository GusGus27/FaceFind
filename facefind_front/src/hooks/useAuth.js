/**
 * useAuth Hook
 * Custom hook for authentication management
 * @module hooks/useAuth
 */

import { useState, useEffect } from 'react';
import * as authService from '../services/authService';

/**
 * Authentication hook
 * @returns {Object} Auth state and functions
 */
export const useAuth = () => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  /**
   * Check and load current user on mount
   */
  useEffect(() => {
    const loadUser = async () => {
      try {
        setLoading(true);
        const { user: currentUser, profile: currentProfile } = await authService.getCurrentUser();

        if (currentUser && currentProfile) {
          setUser(currentUser);
          setProfile(currentProfile);
          setIsAuthenticated(true);
        } else {
          setUser(null);
          setProfile(null);
          setIsAuthenticated(false);
        }
      } catch (err) {
        console.error('Failed to load user:', err);
        setError(err.message);
        setIsAuthenticated(false);
      } finally {
        setLoading(false);
      }
    };

    loadUser();

    // Subscribe to auth changes
    const { data: { subscription } } = authService.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session) {
        const { user: currentUser, profile: currentProfile } = await authService.getCurrentUser();
        setUser(currentUser);
        setProfile(currentProfile);
        setIsAuthenticated(true);
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        setProfile(null);
        setIsAuthenticated(false);
      }
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  /**
   * Login user
   * @param {string} email - User email
   * @param {string} password - User password
   */
  const login = async (email, password) => {
    try {
      setLoading(true);
      setError(null);

      const { user: authUser, profile: authProfile } = await authService.signIn(email, password);

      setUser(authUser);
      setProfile(authProfile);
      setIsAuthenticated(true);

      return { success: true };
    } catch (err) {
      const errorMessage = err.message || 'Failed to login';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  /**
   * Register new user
   * @param {Object} userData - User registration data
   */
  const register = async (userData) => {
    try {
      setLoading(true);
      setError(null);

      const { user: newUser, profile: newProfile } = await authService.signUp(userData);

      setUser(newUser);
      setProfile(newProfile);
      setIsAuthenticated(true);

      return { success: true };
    } catch (err) {
      const errorMessage = err.message || 'Failed to register';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  /**
   * Logout user
   */
  const logout = async () => {
    try {
      setLoading(true);
      setError(null);

      await authService.signOut();

      setUser(null);
      setProfile(null);
      setIsAuthenticated(false);

      return { success: true };
    } catch (err) {
      const errorMessage = err.message || 'Failed to logout';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  /**
   * Update user profile
   * @param {Object} updates - Profile updates
   */
  const updateProfile = async (updates) => {
    try {
      setLoading(true);
      setError(null);

      const updatedProfile = await authService.updateProfile(user.id, updates);
      setProfile(updatedProfile);

      return { success: true, profile: updatedProfile };
    } catch (err) {
      const errorMessage = err.message || 'Failed to update profile';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  /**
   * Change password
   * @param {string} newPassword - New password
   */
  const changePassword = async (newPassword) => {
    try {
      setLoading(true);
      setError(null);

      await authService.changePassword(newPassword);

      return { success: true };
    } catch (err) {
      const errorMessage = err.message || 'Failed to change password';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  /**
   * Request password reset
   * @param {string} email - User email
   */
  const resetPassword = async (email) => {
    try {
      setLoading(true);
      setError(null);

      await authService.resetPassword(email);

      return { success: true };
    } catch (err) {
      const errorMessage = err.message || 'Failed to send reset email';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  return {
    // State
    user,
    profile,
    loading,
    error,
    isAuthenticated,

    // Functions
    login,
    logout,
    register,
    updateProfile,
    changePassword,
    resetPassword,
  };
};

export default useAuth;
