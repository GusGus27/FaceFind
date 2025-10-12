/**
 * Caso Service
 * Handles case-related API calls
 */

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

/**
 * Get all cases
 * @returns {Promise<Array>} List of cases
 */
export const getAllCasos = async () => {
  try {
    const response = await fetch(`${API_URL}/casos`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch cases');
    }
    
    const result = await response.json();
    return result.data || [];
  } catch (error) {
    console.error('Error fetching cases:', error);
    throw error;
  }
};

/**
 * Get cases by user ID
 * @param {number} userId - User ID
 * @returns {Promise<Array>} List of cases
 */
export const getCasosByUserId = async (userId) => {
  try {
    const response = await fetch(`${API_URL}/casos/user/${userId}`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch user cases');
    }
    
    const result = await response.json();
    return result.data || [];
  } catch (error) {
    console.error('Error fetching user cases:', error);
    throw error;
  }
};

/**
 * Get case by ID
 * @param {number} casoId - Case ID
 * @returns {Promise<Object>} Case data
 */
export const getCasoById = async (casoId) => {
  try {
    const response = await fetch(`${API_URL}/casos/${casoId}`);
    
    if (!response.ok) {
      throw new Error('Case not found');
    }
    
    const result = await response.json();
    return result.data;
  } catch (error) {
    console.error('Error fetching case:', error);
    throw error;
  }
};

/**
 * Create a new case
 * @param {Object} casoData - Case data
 * @returns {Promise<Object>} Created case
 */
export const createCaso = async (casoData) => {
  try {
    const response = await fetch(`${API_URL}/casos/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(casoData),
    });
    
    const result = await response.json();
    
    if (!response.ok) {
      throw new Error(result.error || 'Failed to create case');
    }
    
    return result;
  } catch (error) {
    console.error('Error creating case:', error);
    throw error;
  }
};

/**
 * Update a case
 * @param {number} casoId - Case ID
 * @param {Object} updates - Fields to update
 * @returns {Promise<Object>} Updated case
 */
export const updateCaso = async (casoId, updates) => {
  try {
    const response = await fetch(`${API_URL}/casos/${casoId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updates),
    });
    
    const result = await response.json();
    
    if (!response.ok) {
      throw new Error(result.error || 'Failed to update case');
    }
    
    return result.data;
  } catch (error) {
    console.error('Error updating case:', error);
    throw error;
  }
};

/**
 * Delete a case
 * @param {number} casoId - Case ID
 * @returns {Promise<boolean>} Success status
 */
export const deleteCaso = async (casoId) => {
  try {
    const response = await fetch(`${API_URL}/casos/${casoId}`, {
      method: 'DELETE',
    });
    
    const result = await response.json();
    
    if (!response.ok) {
      throw new Error(result.error || 'Failed to delete case');
    }
    
    return true;
  } catch (error) {
    console.error('Error deleting case:', error);
    throw error;
  }
};

/**
 * Update case status
 * @param {number} casoId - Case ID
 * @param {string} status - New status
 * @returns {Promise<Object>} Updated case
 */
export const updateCasoStatus = async (casoId, status) => {
  try {
    const response = await fetch(`${API_URL}/casos/${casoId}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ status }),
    });
    
    const result = await response.json();
    
    if (!response.ok) {
      throw new Error(result.error || 'Failed to update case status');
    }
    
    return result.data;
  } catch (error) {
    console.error('Error updating case status:', error);
    throw error;
  }
};

/**
 * Get case statistics
 * @returns {Promise<Object>} Case stats
 */
export const getCasoStats = async () => {
  try {
    const response = await fetch(`${API_URL}/casos/stats`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch case stats');
    }
    
    const result = await response.json();
    return result.data;
  } catch (error) {
    console.error('Error fetching case stats:', error);
    throw error;
  }
};
