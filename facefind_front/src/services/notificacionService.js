/**
 * Notification Service
 * Handles notification CRUD operations and real-time subscriptions
 * @module services/notificacionService
 */

import { supabase } from '../lib/supabase';
import { handleSupabaseError, executeQuery, subscribeToTable } from '../utils/supabaseHelpers';
import { NOTIF_TYPE, NOTIF_SEVERITY } from '../constants/enums';

/**
 * Create a new notification
 * @param {Object} notifData - Notification data
 * @param {string} notifData.type - Notification type
 * @param {string} notifData.title - Notification title
 * @param {string} notifData.message - Notification message
 * @param {string} notifData.severity - Notification severity
 * @param {number} [notifData.usuario_id] - User ID (null for broadcast)
 * @returns {Promise<Object>} Created notification
 */
export const createNotificacion = async (notifData) => {
  try {
    const { data, error } = await supabase
      .from('Notificacion')
      .insert({
        type: notifData.type,
        title: notifData.title,
        message: notifData.message,
        severity: notifData.severity,
        usuario_id: notifData.usuario_id || null,
        isRead: false,
      })
      .select()
      .single();

    if (error) throw error;

    return data;
  } catch (error) {
    handleSupabaseError(error, 'Failed to create notification');
  }
};

/**
 * Get notifications by user ID
 * @param {number} usuarioId - User ID
 * @param {Object} [options] - Query options
 * @param {boolean} [options.unreadOnly=false] - Get only unread notifications
 * @param {number} [options.limit=50] - Maximum number of notifications
 * @returns {Promise<Object[]>} List of notifications
 */
export const getNotificacionesByUsuario = async (usuarioId, options = {}) => {
  try {
    let query = supabase
      .from('Notificacion')
      .select('*')
      .eq('usuario_id', usuarioId)
      .order('timestamp', { ascending: false });

    if (options.unreadOnly) {
      query = query.eq('isRead', false);
    }

    if (options.limit) {
      query = query.limit(options.limit);
    }

    const { data, error } = await query;

    if (error) throw error;

    return data;
  } catch (error) {
    handleSupabaseError(error, 'Failed to fetch notifications');
  }
};

/**
 * Get a single notification by ID
 * @param {number} notifId - Notification ID
 * @returns {Promise<Object>} Notification data
 */
export const getNotificacionById = async (notifId) => {
  return executeQuery(
    supabase.from('Notificacion').select('*').eq('id', notifId).single(),
    'Failed to fetch notification'
  );
};

/**
 * Mark notification as read
 * @param {number} notifId - Notification ID
 * @returns {Promise<Object>} Updated notification
 */
export const markAsRead = async (notifId) => {
  try {
    const { data, error } = await supabase
      .from('Notificacion')
      .update({ isRead: true })
      .eq('id', notifId)
      .select()
      .single();

    if (error) throw error;

    return data;
  } catch (error) {
    handleSupabaseError(error, 'Failed to mark notification as read');
  }
};

/**
 * Mark multiple notifications as read
 * @param {number[]} notifIds - Array of notification IDs
 * @returns {Promise<void>}
 */
export const markMultipleAsRead = async (notifIds) => {
  try {
    const { error } = await supabase
      .from('Notificacion')
      .update({ isRead: true })
      .in('id', notifIds);

    if (error) throw error;
  } catch (error) {
    handleSupabaseError(error, 'Failed to mark notifications as read');
  }
};

/**
 * Mark all notifications as read for a user
 * @param {number} usuarioId - User ID
 * @returns {Promise<void>}
 */
export const markAllAsRead = async (usuarioId) => {
  try {
    const { error } = await supabase
      .from('Notificacion')
      .update({ isRead: true })
      .eq('usuario_id', usuarioId)
      .eq('isRead', false);

    if (error) throw error;
  } catch (error) {
    handleSupabaseError(error, 'Failed to mark all notifications as read');
  }
};

/**
 * Get unread notification count for a user
 * @param {number} usuarioId - User ID
 * @returns {Promise<number>} Unread count
 */
export const getUnreadCount = async (usuarioId) => {
  try {
    const { count, error } = await supabase
      .from('Notificacion')
      .select('*', { count: 'exact', head: true })
      .eq('usuario_id', usuarioId)
      .eq('isRead', false);

    if (error) throw error;

    return count || 0;
  } catch (error) {
    handleSupabaseError(error, 'Failed to get unread count');
  }
};

/**
 * Delete a notification
 * @param {number} notifId - Notification ID
 * @returns {Promise<void>}
 */
export const deleteNotificacion = async (notifId) => {
  try {
    const { error } = await supabase.from('Notificacion').delete().eq('id', notifId);

    if (error) throw error;
  } catch (error) {
    handleSupabaseError(error, 'Failed to delete notification');
  }
};

/**
 * Delete all read notifications for a user
 * @param {number} usuarioId - User ID
 * @returns {Promise<void>}
 */
export const deleteReadNotifications = async (usuarioId) => {
  try {
    const { error } = await supabase
      .from('Notificacion')
      .delete()
      .eq('usuario_id', usuarioId)
      .eq('isRead', true);

    if (error) throw error;
  } catch (error) {
    handleSupabaseError(error, 'Failed to delete read notifications');
  }
};

/**
 * Subscribe to real-time notifications for a user
 * @param {number} usuarioId - User ID
 * @param {Function} callback - Callback function for new notifications
 * @returns {Object} Subscription object with unsubscribe method
 */
export const subscribeToNotificaciones = (usuarioId, callback) => {
  return subscribeToTable('Notificacion', callback, 'INSERT', `usuario_id=eq.${usuarioId}`);
};

/**
 * Get notifications by type
 * @param {number} usuarioId - User ID
 * @param {string} type - Notification type
 * @returns {Promise<Object[]>} Filtered notifications
 */
export const getNotificacionesByType = async (usuarioId, type) => {
  try {
    const { data, error } = await supabase
      .from('Notificacion')
      .select('*')
      .eq('usuario_id', usuarioId)
      .eq('type', type)
      .order('timestamp', { ascending: false });

    if (error) throw error;

    return data;
  } catch (error) {
    handleSupabaseError(error, 'Failed to fetch notifications by type');
  }
};

/**
 * Get notifications by severity
 * @param {number} usuarioId - User ID
 * @param {string} severity - Notification severity
 * @returns {Promise<Object[]>} Filtered notifications
 */
export const getNotificacionesBySeverity = async (usuarioId, severity) => {
  try {
    const { data, error } = await supabase
      .from('Notificacion')
      .select('*')
      .eq('usuario_id', usuarioId)
      .eq('severity', severity)
      .order('timestamp', { ascending: false });

    if (error) throw error;

    return data;
  } catch (error) {
    handleSupabaseError(error, 'Failed to fetch notifications by severity');
  }
};

/**
 * Create alert notification
 * Helper to create notification for a new alert
 * @param {number} usuarioId - User ID
 * @param {string} caseName - Case name
 * @param {string} location - Camera location
 * @returns {Promise<Object>} Created notification
 */
export const createAlertNotification = async (usuarioId, caseName, location) => {
  return createNotificacion({
    type: NOTIF_TYPE.ALERT,
    title: 'Nueva Alerta Detectada',
    message: `Se detectó una posible coincidencia para ${caseName} en ${location}`,
    severity: NOTIF_SEVERITY.HIGH,
    usuario_id: usuarioId,
  });
};

/**
 * Create match notification
 * @param {number} usuarioId - User ID
 * @param {string} caseName - Case name
 * @returns {Promise<Object>} Created notification
 */
export const createMatchNotification = async (usuarioId, caseName) => {
  return createNotificacion({
    type: NOTIF_TYPE.MATCH,
    title: 'Coincidencia Confirmada',
    message: `Se confirmó una coincidencia para el caso: ${caseName}`,
    severity: NOTIF_SEVERITY.URGENT,
    usuario_id: usuarioId,
  });
};

/**
 * Create system notification
 * @param {number} [usuarioId] - User ID (null for broadcast)
 * @param {string} title - Notification title
 * @param {string} message - Notification message
 * @returns {Promise<Object>} Created notification
 */
export const createSystemNotification = async (usuarioId, title, message) => {
  return createNotificacion({
    type: NOTIF_TYPE.SYSTEM,
    title,
    message,
    severity: NOTIF_SEVERITY.MEDIUM,
    usuario_id: usuarioId,
  });
};
