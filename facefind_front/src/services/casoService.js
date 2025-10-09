/**
 * Case Service
 * Handles CRUD operations for missing persons cases
 * @module services/casoService
 */

import { supabase } from '../lib/supabase';
import { handleSupabaseError, executeQuery, applyFilters, formatDateForDB } from '../utils/supabaseHelpers';
import { CASO_STATUS, CASO_PRIORITY } from '../constants/enums';

/**
 * Create a new case
 * @param {Object} casoData - Case data
 * @returns {Promise<Object>} Created case
 */
export const createCaso = async (casoData) => {
  try {
    const { data, error } = await supabase
      .from('Caso')
      .insert({
        ...casoData,
        fecha_nacimiento: formatDateForDB(casoData.fecha_nacimiento),
        fecha_desaparicion: formatDateForDB(casoData.fecha_desaparicion),
        resolutionDate: casoData.resolutionDate ? formatDateForDB(casoData.resolutionDate) : null,
        status: casoData.status || CASO_STATUS.PENDIENTE,
        priority: casoData.priority || CASO_PRIORITY.MEDIUM,
      })
      .select()
      .single();

    if (error) throw error;

    return data;
  } catch (error) {
    handleSupabaseError(error, 'Failed to create case');
  }
};

/**
 * Get all cases with optional filters
 * @param {Object} filters - Filter options
 * @param {string} [filters.status] - Filter by status
 * @param {string} [filters.priority] - Filter by priority
 * @param {string} [filters.usuario_id] - Filter by user ID
 * @returns {Promise<Object[]>} List of cases
 */
export const getCasos = async (filters = {}) => {
  try {
    let query = supabase
      .from('Caso')
      .select('*')
      .order('created_at', { ascending: false });

    query = applyFilters(query, filters);

    const { data, error } = await query;

    if (error) throw error;

    return data;
  } catch (error) {
    handleSupabaseError(error, 'Failed to fetch cases');
  }
};

/**
 * Get a single case by ID
 * @param {number} casoId - Case ID
 * @returns {Promise<Object>} Case data
 */
export const getCasoById = async (casoId) => {
  return executeQuery(
    supabase.from('Caso').select('*').eq('id', casoId).single(),
    'Failed to fetch case'
  );
};

/**
 * Get cases with their photos (JOIN with FotoReferencia)
 * @param {Object} filters - Optional filters
 * @returns {Promise<Object[]>} Cases with photos
 */
export const getCasosConFotos = async (filters = {}) => {
  try {
    let query = supabase
      .from('Caso')
      .select(`
        *,
        FotoReferencia (
          id,
          ruta_archivo,
          angulo,
          metadata,
          created_at
        )
      `)
      .order('created_at', { ascending: false });

    query = applyFilters(query, filters);

    const { data, error } = await query;

    if (error) throw error;

    return data;
  } catch (error) {
    handleSupabaseError(error, 'Failed to fetch cases with photos');
  }
};

/**
 * Get a single case with photos
 * @param {number} casoId - Case ID
 * @returns {Promise<Object>} Case with photos
 */
export const getCasoConFotosById = async (casoId) => {
  return executeQuery(
    supabase
      .from('Caso')
      .select(`
        *,
        FotoReferencia (
          id,
          ruta_archivo,
          angulo,
          metadata,
          created_at
        )
      `)
      .eq('id', casoId)
      .single(),
    'Failed to fetch case with photos'
  );
};

/**
 * Update a case
 * @param {number} casoId - Case ID
 * @param {Object} updates - Case updates
 * @returns {Promise<Object>} Updated case
 */
export const updateCaso = async (casoId, updates) => {
  try {
    // Format date fields if present
    const formattedUpdates = { ...updates };

    if (updates.fecha_nacimiento) {
      formattedUpdates.fecha_nacimiento = formatDateForDB(updates.fecha_nacimiento);
    }

    if (updates.fecha_desaparicion) {
      formattedUpdates.fecha_desaparicion = formatDateForDB(updates.fecha_desaparicion);
    }

    if (updates.resolutionDate) {
      formattedUpdates.resolutionDate = formatDateForDB(updates.resolutionDate);
    }

    const { data, error } = await supabase
      .from('Caso')
      .update({
        ...formattedUpdates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', casoId)
      .select()
      .single();

    if (error) throw error;

    return data;
  } catch (error) {
    handleSupabaseError(error, 'Failed to update case');
  }
};

/**
 * Delete a case
 * @param {number} casoId - Case ID
 * @returns {Promise<void>}
 */
export const deleteCaso = async (casoId) => {
  try {
    const { error } = await supabase.from('Caso').delete().eq('id', casoId);

    if (error) throw error;
  } catch (error) {
    handleSupabaseError(error, 'Failed to delete case');
  }
};

/**
 * Filter cases by status
 * @param {string} status - Case status
 * @returns {Promise<Object[]>} Filtered cases
 */
export const filterByStatus = async (status) => {
  return getCasos({ status });
};

/**
 * Filter cases by priority
 * @param {string} priority - Case priority
 * @returns {Promise<Object[]>} Filtered cases
 */
export const filterByPriority = async (priority) => {
  return getCasos({ priority });
};

/**
 * Get cases by user ID
 * @param {string} usuarioId - User ID
 * @returns {Promise<Object[]>} User's cases
 */
export const getCasosByUsuario = async (usuarioId) => {
  return getCasos({ usuario_id: usuarioId });
};

/**
 * Update case status
 * @param {number} casoId - Case ID
 * @param {string} status - New status
 * @param {Object} [additionalData] - Additional data (e.g., resolutionNote for resolved cases)
 * @returns {Promise<Object>} Updated case
 */
export const updateCasoStatus = async (casoId, status, additionalData = {}) => {
  const updates = {
    status,
    ...additionalData,
  };

  // If status is resolved, add resolution date
  if (status === CASO_STATUS.RESUELTO) {
    updates.resolutionDate = formatDateForDB(new Date());
  }

  return updateCaso(casoId, updates);
};

/**
 * Update case priority
 * @param {number} casoId - Case ID
 * @param {string} priority - New priority
 * @returns {Promise<Object>} Updated case
 */
export const updateCasoPriority = async (casoId, priority) => {
  return updateCaso(casoId, { priority });
};

/**
 * Search cases by name
 * @param {string} searchTerm - Search term
 * @returns {Promise<Object[]>} Matching cases
 */
export const searchCasosByName = async (searchTerm) => {
  try {
    const { data, error } = await supabase
      .from('Caso')
      .select('*')
      .ilike('nombre_completo', `%${searchTerm}%`)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return data;
  } catch (error) {
    handleSupabaseError(error, 'Failed to search cases');
  }
};

/**
 * Get active cases (not resolved)
 * @returns {Promise<Object[]>} Active cases
 */
export const getActiveCasos = async () => {
  try {
    const { data, error } = await supabase
      .from('Caso')
      .select('*')
      .neq('status', CASO_STATUS.RESUELTO)
      .order('priority', { ascending: true })
      .order('fecha_desaparicion', { ascending: true });

    if (error) throw error;

    return data;
  } catch (error) {
    handleSupabaseError(error, 'Failed to fetch active cases');
  }
};

/**
 * Get case statistics
 * @returns {Promise<Object>} Case statistics
 */
export const getCasoStats = async () => {
  try {
    const { data, error } = await supabase
      .from('Caso')
      .select('status, priority');

    if (error) throw error;

    const stats = {
      total: data.length,
      byStatus: {},
      byPriority: {},
    };

    // Count by status
    Object.values(CASO_STATUS).forEach(status => {
      stats.byStatus[status] = data.filter(c => c.status === status).length;
    });

    // Count by priority
    Object.values(CASO_PRIORITY).forEach(priority => {
      stats.byPriority[priority] = data.filter(c => c.priority === priority).length;
    });

    return stats;
  } catch (error) {
    handleSupabaseError(error, 'Failed to fetch case statistics');
  }
};

/**
 * Add case update/note
 * @param {number} casoId - Case ID
 * @param {string} note - Update note
 * @returns {Promise<Object>} Created case update
 */
export const addCasoUpdate = async (casoId, note) => {
  try {
    const { data, error } = await supabase
      .from('CasoActualizacion')
      .insert({
        caso_id: casoId,
        date: formatDateForDB(new Date()),
        note,
      })
      .select()
      .single();

    if (error) throw error;

    return data;
  } catch (error) {
    handleSupabaseError(error, 'Failed to add case update');
  }
};

/**
 * Get case updates/history
 * @param {number} casoId - Case ID
 * @returns {Promise<Object[]>} Case updates
 */
export const getCasoUpdates = async (casoId) => {
  return executeQuery(
    supabase
      .from('CasoActualizacion')
      .select('*')
      .eq('caso_id', casoId)
      .order('date', { ascending: false }),
    'Failed to fetch case updates'
  );
};
