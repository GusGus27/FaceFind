/**
 * Camera Service
 * Handles camera CRUD operations
 * @module services/camaraService
 */

import { supabase } from '../lib/supabase';
import { handleSupabaseError, executeQuery, applyFilters } from '../utils/supabaseHelpers';
import { CAMERA_TYPE } from '../constants/enums';

/**
 * Create a new camera
 * @param {Object} camaraData - Camera data
 * @param {string} camaraData.ip - Camera IP address
 * @param {string} camaraData.ubicacion - Camera location
 * @param {string} [camaraData.type] - Camera type (USB or IP)
 * @param {string} [camaraData.resolution] - Camera resolution
 * @param {number} [camaraData.fps] - Frames per second
 * @param {string} [camaraData.url] - Camera stream URL
 * @param {boolean} [camaraData.activa=true] - Camera active status
 * @returns {Promise<Object>} Created camera
 */
export const createCamara = async (camaraData) => {
  try {
    const { data, error } = await supabase
      .from('Camara')
      .insert({
        ip: camaraData.ip,
        ubicacion: camaraData.ubicacion,
        type: camaraData.type || null,
        resolution: camaraData.resolution || null,
        fps: camaraData.fps || null,
        url: camaraData.url || null,
        activa: camaraData.activa !== undefined ? camaraData.activa : true,
      })
      .select()
      .single();

    if (error) throw error;

    return data;
  } catch (error) {
    handleSupabaseError(error, 'Failed to create camera');
  }
};

/**
 * Get all cameras
 * @param {Object} filters - Optional filters
 * @param {boolean} [filters.activa] - Filter by active status
 * @param {string} [filters.type] - Filter by camera type
 * @returns {Promise<Object[]>} List of cameras
 */
export const getCamaras = async (filters = {}) => {
  try {
    let query = supabase
      .from('Camara')
      .select('*')
      .order('created_at', { ascending: false });

    query = applyFilters(query, filters);

    const { data, error } = await query;

    if (error) throw error;

    return data;
  } catch (error) {
    handleSupabaseError(error, 'Failed to fetch cameras');
  }
};

/**
 * Get a single camera by ID
 * @param {number} camaraId - Camera ID
 * @returns {Promise<Object>} Camera data
 */
export const getCamaraById = async (camaraId) => {
  return executeQuery(
    supabase.from('Camara').select('*').eq('id', camaraId).single(),
    'Failed to fetch camera'
  );
};

/**
 * Update a camera
 * @param {number} camaraId - Camera ID
 * @param {Object} updates - Camera updates
 * @returns {Promise<Object>} Updated camera
 */
export const updateCamara = async (camaraId, updates) => {
  try {
    const { data, error } = await supabase
      .from('Camara')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', camaraId)
      .select()
      .single();

    if (error) throw error;

    return data;
  } catch (error) {
    handleSupabaseError(error, 'Failed to update camera');
  }
};

/**
 * Delete a camera
 * @param {number} camaraId - Camera ID
 * @returns {Promise<void>}
 */
export const deleteCamara = async (camaraId) => {
  try {
    const { error } = await supabase.from('Camara').delete().eq('id', camaraId);

    if (error) throw error;
  } catch (error) {
    handleSupabaseError(error, 'Failed to delete camera');
  }
};

/**
 * Get active cameras only
 * @returns {Promise<Object[]>} Active cameras
 */
export const getCamarasActivas = async () => {
  return getCamaras({ activa: true });
};

/**
 * Get inactive cameras only
 * @returns {Promise<Object[]>} Inactive cameras
 */
export const getCamarasInactivas = async () => {
  return getCamaras({ activa: false });
};

/**
 * Filter cameras by type
 * @param {string} type - Camera type (USB or IP)
 * @returns {Promise<Object[]>} Filtered cameras
 */
export const filterByType = async (type) => {
  return getCamaras({ type });
};

/**
 * Activate a camera
 * @param {number} camaraId - Camera ID
 * @returns {Promise<Object>} Updated camera
 */
export const activateCamara = async (camaraId) => {
  return updateCamara(camaraId, { activa: true });
};

/**
 * Deactivate a camera
 * @param {number} camaraId - Camera ID
 * @returns {Promise<Object>} Updated camera
 */
export const deactivateCamara = async (camaraId) => {
  return updateCamara(camaraId, { activa: false });
};

/**
 * Search cameras by location
 * @param {string} searchTerm - Search term
 * @returns {Promise<Object[]>} Matching cameras
 */
export const searchCamarasByLocation = async (searchTerm) => {
  try {
    const { data, error } = await supabase
      .from('Camara')
      .select('*')
      .ilike('ubicacion', `%${searchTerm}%`)
      .order('ubicacion', { ascending: true });

    if (error) throw error;

    return data;
  } catch (error) {
    handleSupabaseError(error, 'Failed to search cameras');
  }
};

/**
 * Get camera by IP address
 * @param {string} ip - IP address
 * @returns {Promise<Object|null>} Camera or null
 */
export const getCamaraByIp = async (ip) => {
  try {
    const { data, error } = await supabase
      .from('Camara')
      .select('*')
      .eq('ip', ip)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      throw error;
    }

    return data;
  } catch (error) {
    handleSupabaseError(error, 'Failed to fetch camera by IP');
  }
};

/**
 * Get camera statistics
 * @returns {Promise<Object>} Camera statistics
 */
export const getCamaraStats = async () => {
  try {
    const { data, error } = await supabase.from('Camara').select('activa, type');

    if (error) throw error;

    const stats = {
      total: data.length,
      active: data.filter(c => c.activa).length,
      inactive: data.filter(c => !c.activa).length,
      byType: {},
    };

    // Count by type
    Object.values(CAMERA_TYPE).forEach(type => {
      stats.byType[type] = data.filter(c => c.type === type).length;
    });

    return stats;
  } catch (error) {
    handleSupabaseError(error, 'Failed to fetch camera statistics');
  }
};

/**
 * Get cameras with alert count
 * @returns {Promise<Object[]>} Cameras with alert counts
 */
export const getCamarasWithAlertCount = async () => {
  try {
    const { data, error } = await supabase
      .from('Camara')
      .select(`
        *,
        Alerta (count)
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return data;
  } catch (error) {
    handleSupabaseError(error, 'Failed to fetch cameras with alert count');
  }
};

/**
 * Bulk activate cameras
 * @param {number[]} camaraIds - Array of camera IDs
 * @returns {Promise<void>}
 */
export const bulkActivateCamaras = async (camaraIds) => {
  try {
    const { error } = await supabase
      .from('Camara')
      .update({ activa: true, updated_at: new Date().toISOString() })
      .in('id', camaraIds);

    if (error) throw error;
  } catch (error) {
    handleSupabaseError(error, 'Failed to bulk activate cameras');
  }
};

/**
 * Bulk deactivate cameras
 * @param {number[]} camaraIds - Array of camera IDs
 * @returns {Promise<void>}
 */
export const bulkDeactivateCamaras = async (camaraIds) => {
  try {
    const { error } = await supabase
      .from('Camara')
      .update({ activa: false, updated_at: new Date().toISOString() })
      .in('id', camaraIds);

    if (error) throw error;
  } catch (error) {
    handleSupabaseError(error, 'Failed to bulk deactivate cameras');
  }
};
