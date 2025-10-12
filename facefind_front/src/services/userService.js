/**
 * User Service
 * Handles all user-related API calls
 */

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

/**
 * Get all users with optional filters
 * @param {Object} filters - Optional filters {status, role, search}
 * @returns {Promise<Array>} List of users
 */
export const getAllUsers = async (filters = {}) => {
  try {
    const queryParams = new URLSearchParams();
    
    if (filters.status) queryParams.append('status', filters.status);
    if (filters.role) queryParams.append('role', filters.role);
    if (filters.search) queryParams.append('search', filters.search);
    
    const url = `${API_URL}/users?${queryParams.toString()}`;
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error('Failed to fetch users');
    }
    
    const result = await response.json();
    return result.data || [];
  } catch (error) {
    console.error('Error fetching users:', error);
    throw error;
  }
};

/**
 * Get all users with their cases count
 * @returns {Promise<Array>} List of users with cases count
 */
export const getUsersWithCases = async () => {
  try {
    const response = await fetch(`${API_URL}/users/with-cases`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch users with cases');
    }
    
    const result = await response.json();
    return result.data || [];
  } catch (error) {
    console.error('Error fetching users with cases:', error);
    throw error;
  }
};

/**
 * Get user by ID
 * @param {number} userId - User ID
 * @returns {Promise<Object>} User data
 */
export const getUserById = async (userId) => {
  try {
    const response = await fetch(`${API_URL}/users/${userId}`);
    
    if (!response.ok) {
      throw new Error('User not found');
    }
    
    const result = await response.json();
    return result.data;
  } catch (error) {
    console.error('Error fetching user:', error);
    throw error;
  }
};

/**
 * Get user profile with contact information
 * @param {number} userId - User ID
 * @returns {Promise<Object>} User profile data
 */
export const getUserProfile = async (userId) => {
  try {
    const response = await fetch(`${API_URL}/users/profile/${userId}`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch user profile');
    }
    
    const result = await response.json();
    return result.data;
  } catch (error) {
    console.error('Error fetching user profile:', error);
    throw error;
  }
};

/**
 * Create a new user
 * @param {Object} userData - User data {nombre, email, password, role, dni}
 * @returns {Promise<Object>} Created user
 */
export const createUser = async (userData) => {
  try {
    const response = await fetch(`${API_URL}/users`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });
    
    const result = await response.json();
    
    if (!response.ok) {
      throw new Error(result.error || 'Failed to create user');
    }
    
    return result.data;
  } catch (error) {
    console.error('Error creating user:', error);
    throw error;
  }
};

/**
 * Update user information
 * @param {number} userId - User ID
 * @param {Object} updates - Fields to update
 * @returns {Promise<Object>} Updated user
 */
export const updateUser = async (userId, updates) => {
  try {
    const response = await fetch(`${API_URL}/users/${userId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updates),
    });
    
    const result = await response.json();
    
    if (!response.ok) {
      throw new Error(result.error || 'Failed to update user');
    }
    
    return result.data;
  } catch (error) {
    console.error('Error updating user:', error);
    throw error;
  }
};

/**
 * Activate a user
 * @param {number} userId - User ID
 * @returns {Promise<Object>} Updated user
 */
export const activateUser = async (userId) => {
  try {
    const response = await fetch(`${API_URL}/users/${userId}/activate`, {
      method: 'PUT',
    });
    
    const result = await response.json();
    
    if (!response.ok) {
      throw new Error(result.error || 'Failed to activate user');
    }
    
    return result.data;
  } catch (error) {
    console.error('Error activating user:', error);
    throw error;
  }
};

/**
 * Deactivate a user (add to blacklist)
 * @param {number} userId - User ID
 * @returns {Promise<Object>} Updated user
 */
export const deactivateUser = async (userId) => {
  try {
    const response = await fetch(`${API_URL}/users/${userId}/deactivate`, {
      method: 'PUT',
    });
    
    const result = await response.json();
    
    if (!response.ok) {
      throw new Error(result.error || 'Failed to deactivate user');
    }
    
    return result.data;
  } catch (error) {
    console.error('Error deactivating user:', error);
    throw error;
  }
};

/**
 * Delete a user (soft delete - deactivates)
 * @param {number} userId - User ID
 * @returns {Promise<boolean>} Success status
 */
export const deleteUser = async (userId) => {
  try {
    const response = await fetch(`${API_URL}/users/${userId}`, {
      method: 'DELETE',
    });
    
    const result = await response.json();
    
    if (!response.ok) {
      throw new Error(result.error || 'Failed to delete user');
    }
    
    return true;
  } catch (error) {
    console.error('Error deleting user:', error);
    throw error;
  }
};

/**
 * Get user statistics
 * @returns {Promise<Object>} User stats
 */
export const getUserStats = async () => {
  try {
    const response = await fetch(`${API_URL}/users/stats`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch user stats');
    }
    
    const result = await response.json();
    return result.data;
  } catch (error) {
    console.error('Error fetching user stats:', error);
    throw error;
  }
};

/**
 * Get blacklisted users (inactive users)
 * @returns {Promise<Array>} List of blacklisted users
 */
export const getBlacklist = async () => {
  try {
    const response = await fetch(`${API_URL}/users/blacklist`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch blacklist');
    }
    
    const result = await response.json();
    return result.data || [];
  } catch (error) {
    console.error('Error fetching blacklist:', error);
    throw error;
  }
};

/**
 * Check if email or DNI is blacklisted
 * @param {Object} data - {email, dni}
 * @returns {Promise<Object>} {is_blacklisted, reason}
 */
export const checkBlacklist = async (data) => {
  try {
    const response = await fetch(`${API_URL}/users/check-blacklist`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      throw new Error('Failed to check blacklist');
    }
    
    const result = await response.json();
    return result.data;
  } catch (error) {
    console.error('Error checking blacklist:', error);
    throw error;
  }
};
