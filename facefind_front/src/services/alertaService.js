/**
 * Alert Service
 * Handles alert CRUD operations and real-time subscriptions
 * @module services/alertaService
 */

import { supabase } from '../lib/supabase';
import { handleSupabaseError, executeQuery, applyFilters, subscribeToTable } from '../utils/supabaseHelpers';
import { ALERTA_ESTADO, ALERTA_PRIORIDAD } from '../constants/enums';

/**
 * Create a new alert
 * @param {Object} alertaData - Alert data
 * @param {number} alertaData.caso_id - Case ID
 * @param {number} alertaData.camara_id - Camera ID
 * @param {number} alertaData.similitud - Similarity score (0-1)
 * @param {string} alertaData.prioridad - Alert priority
 * @param {Blob} [alertaData.imagen] - Captured image (optional)
 * @returns {Promise<Object>} Created alert
 */
export const createAlerta = async (alertaData) => {
  try {
    const { data, error } = await supabase
      .from('Alerta')
      .insert({
        caso_id: alertaData.caso_id,
        camara_id: alertaData.camara_id,
        similitud: alertaData.similitud,
        prioridad: alertaData.prioridad,
        imagen: alertaData.imagen || null,
        estado: ALERTA_ESTADO.PENDIENTE,
      })
      .select()
      .single();

    if (error) throw error;

    return data;
  } catch (error) {
    handleSupabaseError(error, 'Failed to create alert');
  }
};

/**
 * Get all alerts with optional filters
 * @param {Object} filters - Filter options
 * @param {string} [filters.estado] - Filter by state
 * @param {string} [filters.prioridad] - Filter by priority
 * @param {number} [filters.caso_id] - Filter by case
 * @param {number} [filters.camara_id] - Filter by camera
 * @returns {Promise<Object[]>} List of alerts
 */
export const getAlertas = async (filters = {}) => {
  try {
    let query = supabase
      .from('Alerta')
      .select(`
        *,
        Caso (
          id,
          nombre_completo,
          status,
          priority
        ),
        Camara (
          id,
          ubicacion,
          ip
        )
      `)
      .order('timestamp', { ascending: false });

    query = applyFilters(query, filters);

    const { data, error } = await query;

    if (error) throw error;

    return data;
  } catch (error) {
    handleSupabaseError(error, 'Failed to fetch alerts');
  }
};

/**
 * Get a single alert by ID
 * @param {number} alertaId - Alert ID
 * @returns {Promise<Object>} Alert data
 */
export const getAlertaById = async (alertaId) => {
  return executeQuery(
    supabase
      .from('Alerta')
      .select(`
        *,
        Caso (
          id,
          nombre_completo,
          status,
          priority,
          fecha_desaparicion
        ),
        Camara (
          id,
          ubicacion,
          ip,
          type
        )
      `)
      .eq('id', alertaId)
      .single(),
    'Failed to fetch alert'
  );
};

/**
 * Update alert status
 * @param {number} alertaId - Alert ID
 * @param {string} estado - New state
 * @returns {Promise<Object>} Updated alert
 */
export const updateEstadoAlerta = async (alertaId, estado) => {
  try {
    const { data, error } = await supabase
      .from('Alerta')
      .update({ estado })
      .eq('id', alertaId)
      .select()
      .single();

    if (error) throw error;

    return data;
  } catch (error) {
    handleSupabaseError(error, 'Failed to update alert status');
  }
};

/**
 * Get alerts by case ID
 * @param {number} casoId - Case ID
 * @returns {Promise<Object[]>} Case alerts
 */
export const getAlertasByCaso = async (casoId) => {
  return getAlertas({ caso_id: casoId });
};

/**
 * Get alerts by camera ID
 * @param {number} camaraId - Camera ID
 * @returns {Promise<Object[]>} Camera alerts
 */
export const getAlertasByCamara = async (camaraId) => {
  return getAlertas({ camara_id: camaraId });
};

/**
 * Get pending alerts
 * @returns {Promise<Object[]>} Pending alerts
 */
export const getPendingAlertas = async () => {
  return getAlertas({ estado: ALERTA_ESTADO.PENDIENTE });
};

/**
 * Subscribe to real-time alert changes
 * @param {Function} callback - Callback function called on new/updated alerts
 * @param {Object} [filters] - Optional filters
 * @returns {Object} Subscription object with unsubscribe method
 */
export const subscribeToAlertas = (callback, filters = {}) => {
  let filter = '';

  // Build filter string for Supabase realtime
  if (filters.caso_id) {
    filter = `caso_id=eq.${filters.caso_id}`;
  } else if (filters.camara_id) {
    filter = `camara_id=eq.${filters.camara_id}`;
  } else if (filters.estado) {
    filter = `estado=eq.${filters.estado}`;
  }

  return subscribeToTable('Alerta', callback, '*', filter);
};

/**
 * Subscribe to new pending alerts
 * @param {Function} callback - Callback function
 * @returns {Object} Subscription object
 */
export const subscribeToNewAlertas = (callback) => {
  return subscribeToTable('Alerta', callback, 'INSERT', `estado=eq.${ALERTA_ESTADO.PENDIENTE}`);
};

/**
 * Mark alert as reviewed
 * @param {number} alertaId - Alert ID
 * @returns {Promise<Object>} Updated alert
 */
export const markAsReviewed = async (alertaId) => {
  return updateEstadoAlerta(alertaId, ALERTA_ESTADO.REVISADA);
};

/**
 * Mark alert as false positive
 * @param {number} alertaId - Alert ID
 * @returns {Promise<Object>} Updated alert
 */
export const markAsFalsePositive = async (alertaId) => {
  return updateEstadoAlerta(alertaId, ALERTA_ESTADO.FALSO_POSITIVO);
};

/**
 * Get alert statistics
 * @param {Object} filters - Optional filters (e.g., date range)
 * @returns {Promise<Object>} Alert statistics
 */
export const getAlertaStats = async (filters = {}) => {
  try {
    const { data, error } = await supabase
      .from('Alerta')
      .select('estado, prioridad');

    if (error) throw error;

    const stats = {
      total: data.length,
      byEstado: {},
      byPrioridad: {},
    };

    // Count by estado
    Object.values(ALERTA_ESTADO).forEach(estado => {
      stats.byEstado[estado] = data.filter(a => a.estado === estado).length;
    });

    // Count by prioridad
    Object.values(ALERTA_PRIORIDAD).forEach(prioridad => {
      stats.byPrioridad[prioridad] = data.filter(a => a.prioridad === prioridad).length;
    });

    return stats;
  } catch (error) {
    handleSupabaseError(error, 'Failed to fetch alert statistics');
  }
};

/**
 * Get recent alerts (last 24 hours)
 * @param {number} [limit=50] - Maximum number of alerts to return
 * @returns {Promise<Object[]>} Recent alerts
 */
export const getRecentAlertas = async (limit = 50) => {
  try {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    const { data, error } = await supabase
      .from('Alerta')
      .select(`
        *,
        Caso (nombre_completo),
        Camara (ubicacion)
      `)
      .gte('timestamp', yesterday.toISOString())
      .order('timestamp', { ascending: false })
      .limit(limit);

    if (error) throw error;

    return data;
  } catch (error) {
    handleSupabaseError(error, 'Failed to fetch recent alerts');
  }
};

/**
 * Get high priority alerts
 * @returns {Promise<Object[]>} High priority alerts
 */
export const getHighPriorityAlertas = async () => {
  return getAlertas({ prioridad: ALERTA_PRIORIDAD.ALTA });
};

/**
 * Delete an alert
 * @param {number} alertaId - Alert ID
 * @returns {Promise<void>}
 */
export const deleteAlerta = async (alertaId) => {
  try {
    const { error } = await supabase.from('Alerta').delete().eq('id', alertaId);

    if (error) throw error;
  } catch (error) {
    handleSupabaseError(error, 'Failed to delete alert');
  }
};

/**
 * Get alerts within a date range
 * @param {Date} startDate - Start date
 * @param {Date} endDate - End date
 * @returns {Promise<Object[]>} Alerts in range
 */
export const getAlertasByDateRange = async (startDate, endDate) => {
  try {
    const { data, error } = await supabase
      .from('Alerta')
      .select(`
        *,
        Caso (nombre_completo),
        Camara (ubicacion)
      `)
      .gte('timestamp', startDate.toISOString())
      .lte('timestamp', endDate.toISOString())
      .order('timestamp', { ascending: false });

    if (error) throw error;

    return data;
  } catch (error) {
    handleSupabaseError(error, 'Failed to fetch alerts by date range');
  }
};

/**
 * Get alert count by case
 * @param {number} casoId - Case ID
 * @returns {Promise<number>} Number of alerts
 */
export const getAlertaCountByCaso = async (casoId) => {
  try {
    const { count, error } = await supabase
      .from('Alerta')
      .select('*', { count: 'exact', head: true })
      .eq('caso_id', casoId);

    if (error) throw error;

    return count || 0;
  } catch (error) {
    handleSupabaseError(error, 'Failed to get alert count');
  }
};
