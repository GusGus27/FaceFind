/**
 * useNotificaciones Hook
 * Custom hook for notifications management with real-time updates
 * @module hooks/useNotificaciones
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import * as notificacionService from '../services/notificacionService';

/**
 * Notifications hook with real-time updates
 * @param {number} usuarioId - User ID
 * @param {Object} [options] - Hook options
 * @param {boolean} [options.autoLoad=true] - Auto-load notifications on mount
 * @param {boolean} [options.realtime=true] - Enable real-time subscriptions
 * @param {boolean} [options.unreadOnly=false] - Load only unread notifications
 * @returns {Object} Notifications state and functions
 */
export const useNotificaciones = (usuarioId, options = {}) => {
  const { autoLoad = true, realtime = true, unreadOnly = false } = options;

  const [notificaciones, setNotificaciones] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const subscriptionRef = useRef(null);

  /**
   * Fetch notifications
   */
  const fetchNotifications = useCallback(async () => {
    if (!usuarioId) return;

    try {
      setLoading(true);
      setError(null);

      const data = await notificacionService.getNotificacionesByUsuario(usuarioId, {
        unreadOnly,
        limit: 50,
      });

      setNotificaciones(data);

      // Update unread count
      const count = await notificacionService.getUnreadCount(usuarioId);
      setUnreadCount(count);

      return { success: true, data };
    } catch (err) {
      const errorMessage = err.message || 'Failed to fetch notifications';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, [usuarioId, unreadOnly]);

  /**
   * Mark notification as read
   */
  const markAsRead = async (notifId) => {
    try {
      setError(null);

      const updatedNotif = await notificacionService.markAsRead(notifId);

      // Update local state
      setNotificaciones(prev =>
        prev.map(notif => (notif.id === notifId ? updatedNotif : notif))
      );

      // Decrement unread count
      setUnreadCount(prev => Math.max(0, prev - 1));

      return { success: true, data: updatedNotif };
    } catch (err) {
      const errorMessage = err.message || 'Failed to mark as read';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  /**
   * Mark multiple notifications as read
   */
  const markMultipleAsRead = async (notifIds) => {
    try {
      setError(null);

      await notificacionService.markMultipleAsRead(notifIds);

      // Update local state
      setNotificaciones(prev =>
        prev.map(notif =>
          notifIds.includes(notif.id) ? { ...notif, isRead: true } : notif
        )
      );

      // Update unread count
      const count = await notificacionService.getUnreadCount(usuarioId);
      setUnreadCount(count);

      return { success: true };
    } catch (err) {
      const errorMessage = err.message || 'Failed to mark as read';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  /**
   * Mark all notifications as read
   */
  const markAllAsRead = async () => {
    try {
      setError(null);

      await notificacionService.markAllAsRead(usuarioId);

      // Update local state
      setNotificaciones(prev =>
        prev.map(notif => ({ ...notif, isRead: true }))
      );

      setUnreadCount(0);

      return { success: true };
    } catch (err) {
      const errorMessage = err.message || 'Failed to mark all as read';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  /**
   * Delete a notification
   */
  const deleteNotification = async (notifId) => {
    try {
      setError(null);

      await notificacionService.deleteNotificacion(notifId);

      // Remove from local state
      setNotificaciones(prev => {
        const filtered = prev.filter(notif => notif.id !== notifId);
        return filtered;
      });

      // Update unread count if notification was unread
      const deletedNotif = notificaciones.find(n => n.id === notifId);
      if (deletedNotif && !deletedNotif.isRead) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }

      return { success: true };
    } catch (err) {
      const errorMessage = err.message || 'Failed to delete notification';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  /**
   * Delete all read notifications
   */
  const deleteReadNotifications = async () => {
    try {
      setError(null);

      await notificacionService.deleteReadNotifications(usuarioId);

      // Remove read notifications from local state
      setNotificaciones(prev => prev.filter(notif => !notif.isRead));

      return { success: true };
    } catch (err) {
      const errorMessage = err.message || 'Failed to delete read notifications';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  /**
   * Refresh notifications
   */
  const refresh = useCallback(() => {
    return fetchNotifications();
  }, [fetchNotifications]);

  /**
   * Set up real-time subscription
   */
  useEffect(() => {
    if (!realtime || !usuarioId) return;

    // Subscribe to new notifications
    const subscription = notificacionService.subscribeToNotificaciones(
      usuarioId,
      (payload) => {
        const newNotif = payload.new;

        if (newNotif) {
          // Add new notification to the list
          setNotificaciones(prev => [newNotif, ...prev]);

          // Increment unread count
          if (!newNotif.isRead) {
            setUnreadCount(prev => prev + 1);
          }
        }
      }
    );

    subscriptionRef.current = subscription;

    return () => {
      if (subscriptionRef.current) {
        subscriptionRef.current.unsubscribe();
      }
    };
  }, [realtime, usuarioId]);

  /**
   * Auto-load on mount
   */
  useEffect(() => {
    if (autoLoad && usuarioId) {
      fetchNotifications();
    }
  }, [autoLoad, usuarioId, fetchNotifications]);

  return {
    // State
    notificaciones,
    unreadCount,
    loading,
    error,

    // Functions
    fetchNotifications,
    markAsRead,
    markMultipleAsRead,
    markAllAsRead,
    deleteNotification,
    deleteReadNotifications,
    refresh,
  };
};

export default useNotificaciones;
