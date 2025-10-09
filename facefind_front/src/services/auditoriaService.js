/**
 * Audit Service
 * Handles audit log CRUD operations
 * @module services/auditoriaService
 */

import { supabase } from '../lib/supabase';
import { handleSupabaseError, executeQuery } from '../utils/supabaseHelpers';
import { LOG_TYPE, LOG_STATUS } from '../constants/enums';

/**
 * Create an audit log entry
 * @param {Object} logData - Log data
 * @param {number} logData.usuario_id - User ID
 * @param {string} logData.accion - Action performed
 * @param {number} [logData.alerta_id] - Related alert ID (optional)
 * @param {string} [logData.type] - Log type
 * @param {string} [logData.detalles] - Additional details
 * @param {string} [logData.ip] - User IP address
 * @param {string} [logData.status] - Action status
 * @returns {Promise<Object>} Created log entry
 */
export const createLogEntry = async (logData) => {
  try {
    const { data, error } = await supabase
      .from('LogAuditoria')
      .insert({
        usuario_id: logData.usuario_id,
        accion: logData.accion,
        alerta_id: logData.alerta_id || null,
        type: logData.type || null,
        detalles: logData.detalles || null,
        ip: logData.ip || null,
        status: logData.status || LOG_STATUS.SUCCESS,
      })
      .select()
      .single();

    if (error) throw error;

    return data;
  } catch (error) {
    handleSupabaseError(error, 'Failed to create audit log');
  }
};

/**
 * Get audit logs with optional filters
 * @param {Object} [filters] - Filter options
 * @param {number} [filters.usuario_id] - Filter by user
 * @param {string} [filters.type] - Filter by log type
 * @param {string} [filters.status] - Filter by status
 * @param {number} [filters.alerta_id] - Filter by alert
 * @param {number} [filters.limit=100] - Maximum number of logs
 * @returns {Promise<Object[]>} List of audit logs
 */
export const getLogs = async (filters = {}) => {
  try {
    let query = supabase
      .from('LogAuditoria')
      .select(`
        *,
        Usuario (
          id,
          nombre,
          email
        ),
        Alerta (
          id,
          caso_id
        )
      `)
      .order('timestamp', { ascending: false });

    if (filters.usuario_id) {
      query = query.eq('usuario_id', filters.usuario_id);
    }

    if (filters.type) {
      query = query.eq('type', filters.type);
    }

    if (filters.status) {
      query = query.eq('status', filters.status);
    }

    if (filters.alerta_id) {
      query = query.eq('alerta_id', filters.alerta_id);
    }

    if (filters.limit) {
      query = query.limit(filters.limit);
    }

    const { data, error } = await query;

    if (error) throw error;

    return data;
  } catch (error) {
    handleSupabaseError(error, 'Failed to fetch audit logs');
  }
};

/**
 * Get logs by user ID
 * @param {number} usuarioId - User ID
 * @param {number} [limit=100] - Maximum number of logs
 * @returns {Promise<Object[]>} User's audit logs
 */
export const getLogsByUsuario = async (usuarioId, limit = 100) => {
  return getLogs({ usuario_id: usuarioId, limit });
};

/**
 * Get logs by type
 * @param {string} type - Log type
 * @param {number} [limit=100] - Maximum number of logs
 * @returns {Promise<Object[]>} Filtered logs
 */
export const getLogsByType = async (type, limit = 100) => {
  return getLogs({ type, limit });
};

/**
 * Get logs by status
 * @param {string} status - Log status
 * @param {number} [limit=100] - Maximum number of logs
 * @returns {Promise<Object[]>} Filtered logs
 */
export const getLogsByStatus = async (status, limit = 100) => {
  return getLogs({ status, limit });
};

/**
 * Get recent logs
 * @param {number} [limit=50] - Maximum number of logs
 * @returns {Promise<Object[]>} Recent logs
 */
export const getRecentLogs = async (limit = 50) => {
  return getLogs({ limit });
};

/**
 * Get logs for a specific alert
 * @param {number} alertaId - Alert ID
 * @returns {Promise<Object[]>} Alert's audit logs
 */
export const getLogsByAlerta = async (alertaId) => {
  return getLogs({ alerta_id: alertaId });
};

/**
 * Get logs within a date range
 * @param {Date|string} startDate - Start date
 * @param {Date|string} endDate - End date
 * @param {number} [limit=200] - Maximum number of logs
 * @returns {Promise<Object[]>} Logs in range
 */
export const getLogsByDateRange = async (startDate, endDate, limit = 200) => {
  try {
    const { data, error } = await supabase
      .from('LogAuditoria')
      .select(`
        *,
        Usuario (nombre, email)
      `)
      .gte('timestamp', new Date(startDate).toISOString())
      .lte('timestamp', new Date(endDate).toISOString())
      .order('timestamp', { ascending: false })
      .limit(limit);

    if (error) throw error;

    return data;
  } catch (error) {
    handleSupabaseError(error, 'Failed to fetch logs by date range');
  }
};

/**
 * Search logs by action
 * @param {string} searchTerm - Search term
 * @param {number} [limit=100] - Maximum number of logs
 * @returns {Promise<Object[]>} Matching logs
 */
export const searchLogsByAction = async (searchTerm, limit = 100) => {
  try {
    const { data, error } = await supabase
      .from('LogAuditoria')
      .select(`
        *,
        Usuario (nombre, email)
      `)
      .ilike('accion', `%${searchTerm}%`)
      .order('timestamp', { ascending: false })
      .limit(limit);

    if (error) throw error;

    return data;
  } catch (error) {
    handleSupabaseError(error, 'Failed to search logs');
  }
};

/**
 * Get audit log statistics
 * @returns {Promise<Object>} Log statistics
 */
export const getLogStats = async () => {
  try {
    const { data, error } = await supabase
      .from('LogAuditoria')
      .select('type, status, accion');

    if (error) throw error;

    const stats = {
      total: data.length,
      byType: {},
      byStatus: {},
      topActions: {},
    };

    // Count by type
    Object.values(LOG_TYPE).forEach(type => {
      stats.byType[type] = data.filter(l => l.type === type).length;
    });

    // Count by status
    Object.values(LOG_STATUS).forEach(status => {
      stats.byStatus[status] = data.filter(l => l.status === status).length;
    });

    // Count top actions
    data.forEach(log => {
      if (log.accion) {
        stats.topActions[log.accion] = (stats.topActions[log.accion] || 0) + 1;
      }
    });

    return stats;
  } catch (error) {
    handleSupabaseError(error, 'Failed to fetch log statistics');
  }
};

/**
 * Helper: Log user login
 * @param {number} usuarioId - User ID
 * @param {string} [ip] - User IP address
 * @returns {Promise<Object>} Created log
 */
export const logLogin = async (usuarioId, ip = null) => {
  return createLogEntry({
    usuario_id: usuarioId,
    type: LOG_TYPE.LOGIN,
    accion: 'User logged in',
    ip,
    status: LOG_STATUS.SUCCESS,
  });
};

/**
 * Helper: Log user logout
 * @param {number} usuarioId - User ID
 * @param {string} [ip] - User IP address
 * @returns {Promise<Object>} Created log
 */
export const logLogout = async (usuarioId, ip = null) => {
  return createLogEntry({
    usuario_id: usuarioId,
    type: LOG_TYPE.LOGOUT,
    accion: 'User logged out',
    ip,
    status: LOG_STATUS.SUCCESS,
  });
};

/**
 * Helper: Log case creation
 * @param {number} usuarioId - User ID
 * @param {number} casoId - Created case ID
 * @returns {Promise<Object>} Created log
 */
export const logCaseCreation = async (usuarioId, casoId) => {
  return createLogEntry({
    usuario_id: usuarioId,
    type: LOG_TYPE.CREATE,
    accion: `Created case ID: ${casoId}`,
    detalles: JSON.stringify({ caso_id: casoId }),
    status: LOG_STATUS.SUCCESS,
  });
};

/**
 * Helper: Log case update
 * @param {number} usuarioId - User ID
 * @param {number} casoId - Updated case ID
 * @param {Object} changes - Changes made
 * @returns {Promise<Object>} Created log
 */
export const logCaseUpdate = async (usuarioId, casoId, changes) => {
  return createLogEntry({
    usuario_id: usuarioId,
    type: LOG_TYPE.UPDATE,
    accion: `Updated case ID: ${casoId}`,
    detalles: JSON.stringify({ caso_id: casoId, changes }),
    status: LOG_STATUS.SUCCESS,
  });
};

/**
 * Helper: Log alert review
 * @param {number} usuarioId - User ID
 * @param {number} alertaId - Reviewed alert ID
 * @param {string} newStatus - New alert status
 * @returns {Promise<Object>} Created log
 */
export const logAlertReview = async (usuarioId, alertaId, newStatus) => {
  return createLogEntry({
    usuario_id: usuarioId,
    type: LOG_TYPE.UPDATE,
    accion: `Reviewed alert ID: ${alertaId}`,
    alerta_id: alertaId,
    detalles: JSON.stringify({ new_status: newStatus }),
    status: LOG_STATUS.SUCCESS,
  });
};

/**
 * Helper: Log failed action
 * @param {number} usuarioId - User ID
 * @param {string} accion - Action attempted
 * @param {string} errorMessage - Error message
 * @returns {Promise<Object>} Created log
 */
export const logFailedAction = async (usuarioId, accion, errorMessage) => {
  return createLogEntry({
    usuario_id: usuarioId,
    accion,
    detalles: errorMessage,
    status: LOG_STATUS.FAILED,
  });
};
