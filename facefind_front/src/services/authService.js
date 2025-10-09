/**
 * Authentication Service
 * Handles user authentication and profile management
 * @module services/authService
 */

import { supabase } from '../lib/supabase';
import { handleSupabaseError, executeQuery } from '../utils/supabaseHelpers';
import { USER_ROLES, USER_STATUS } from '../constants/enums';

/**
 * Sign up a new user
 * Creates user in Supabase Auth and Usuario table
 * @param {Object} userData - User registration data
 * @param {string} userData.email - User email
 * @param {string} userData.password - User password
 * @param {string} userData.nombre - User full name
 * @param {string} [userData.role='user'] - User role
 * @returns {Promise<{user: Object, profile: Object}>} Created user and profile
 */
export const signUp = async ({ email, password, nombre, role = USER_ROLES.USER }) => {
  try {
    // 1. Create user in Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          nombre,
          role,
        },
      },
    });

    if (authError) throw authError;

    // 2. Create user profile in Usuario table
    const { data: profile, error: profileError } = await supabase
      .from('Usuario')
      .insert({
        id: authData.user.id,
        nombre,
        email,
        password: 'hashed', // In production, hash password properly
        role,
        status: USER_STATUS.ACTIVE,
      })
      .select()
      .single();

    if (profileError) {
      // Rollback: delete auth user if profile creation fails
      await supabase.auth.admin.deleteUser(authData.user.id);
      throw profileError;
    }

    return {
      user: authData.user,
      profile,
    };
  } catch (error) {
    handleSupabaseError(error, 'Failed to sign up');
  }
};

/**
 * Sign in an existing user
 * @param {string} email - User email
 * @param {string} password - User password
 * @returns {Promise<{user: Object, session: Object, profile: Object}>} User session and profile
 */
export const signIn = async (email, password) => {
  try {
    // 1. Sign in with Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) throw authError;

    // 2. Fetch user profile
    const profile = await getUserProfile(authData.user.id);

    // 3. Check if user is active
    if (profile.status !== USER_STATUS.ACTIVE) {
      await supabase.auth.signOut();
      throw new Error('Account is inactive. Please contact support.');
    }

    return {
      user: authData.user,
      session: authData.session,
      profile,
    };
  } catch (error) {
    handleSupabaseError(error, 'Failed to sign in');
  }
};

/**
 * Sign out current user
 * @returns {Promise<void>}
 */
export const signOut = async () => {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  } catch (error) {
    handleSupabaseError(error, 'Failed to sign out');
  }
};

/**
 * Get current authenticated user
 * @returns {Promise<{user: Object|null, profile: Object|null}>} Current user and profile
 */
export const getCurrentUser = async () => {
  try {
    const { data: { user }, error } = await supabase.auth.getUser();

    if (error) throw error;

    if (!user) {
      return { user: null, profile: null };
    }

    const profile = await getUserProfile(user.id);

    return { user, profile };
  } catch (error) {
    console.error('Failed to get current user:', error);
    return { user: null, profile: null };
  }
};

/**
 * Get user profile by ID
 * @param {string} userId - User ID
 * @returns {Promise<Object>} User profile
 */
export const getUserProfile = async (userId) => {
  return executeQuery(
    supabase.from('Usuario').select('*').eq('id', userId).single(),
    'Failed to fetch user profile'
  );
};

/**
 * Update user profile
 * @param {string} userId - User ID
 * @param {Object} updates - Profile updates
 * @param {string} [updates.nombre] - User name
 * @param {string} [updates.role] - User role
 * @param {string} [updates.status] - User status
 * @returns {Promise<Object>} Updated profile
 */
export const updateProfile = async (userId, updates) => {
  try {
    const { data, error } = await supabase
      .from('Usuario')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId)
      .select()
      .single();

    if (error) throw error;

    // Also update auth metadata if nombre is updated
    if (updates.nombre) {
      await supabase.auth.updateUser({
        data: { nombre: updates.nombre },
      });
    }

    return data;
  } catch (error) {
    handleSupabaseError(error, 'Failed to update profile');
  }
};

/**
 * Check if user has a specific role
 * @param {string} userId - User ID
 * @param {string} requiredRole - Required role
 * @returns {Promise<boolean>} True if user has role
 */
export const checkUserRole = async (userId, requiredRole) => {
  try {
    const profile = await getUserProfile(userId);
    return profile.role === requiredRole || profile.role === USER_ROLES.ADMIN;
  } catch (error) {
    console.error('Failed to check user role:', error);
    return false;
  }
};

/**
 * Change user password
 * @param {string} newPassword - New password
 * @returns {Promise<void>}
 */
export const changePassword = async (newPassword) => {
  try {
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (error) throw error;
  } catch (error) {
    handleSupabaseError(error, 'Failed to change password');
  }
};

/**
 * Request password reset email
 * @param {string} email - User email
 * @returns {Promise<void>}
 */
export const resetPassword = async (email) => {
  try {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    if (error) throw error;
  } catch (error) {
    handleSupabaseError(error, 'Failed to send reset password email');
  }
};

/**
 * Update user status (admin only)
 * @param {string} userId - User ID to update
 * @param {string} status - New status
 * @returns {Promise<Object>} Updated profile
 */
export const updateUserStatus = async (userId, status) => {
  return updateProfile(userId, { status });
};

/**
 * Get all users (admin only)
 * @param {Object} filters - Optional filters
 * @param {string} [filters.role] - Filter by role
 * @param {string} [filters.status] - Filter by status
 * @returns {Promise<Object[]>} List of users
 */
export const getAllUsers = async (filters = {}) => {
  try {
    let query = supabase.from('Usuario').select('*').order('created_at', { ascending: false });

    if (filters.role) {
      query = query.eq('role', filters.role);
    }

    if (filters.status) {
      query = query.eq('status', filters.status);
    }

    const { data, error } = await query;

    if (error) throw error;

    return data;
  } catch (error) {
    handleSupabaseError(error, 'Failed to fetch users');
  }
};

/**
 * Listen to auth state changes
 * @param {Function} callback - Callback function with (event, session)
 * @returns {Object} Subscription object
 */
export const onAuthStateChange = (callback) => {
  return supabase.auth.onAuthStateChange(callback);
};
