/**
 * NotificationService - Servicio para gestión de notificaciones
 * Comunicación con API de notificaciones del sistema
 */

const API_URL = 'http://localhost:5000/notifications';

/**
 * Obtiene notificaciones del sistema
 * @param {Object} params - Parámetros de filtrado
 * @param {number} params.usuario_id - ID del usuario (opcional)
 * @param {boolean} params.solo_no_leidas - Solo notificaciones no leídas
 * @param {number} params.limit - Límite de notificaciones
 * @returns {Promise<Array>} Lista de notificaciones
 */
export const getNotifications = async ({ usuario_id = null, solo_no_leidas = false, limit = 50 } = {}) => {
  try {
    const params = new URLSearchParams();
    if (usuario_id) params.append('usuario_id', usuario_id);
    if (solo_no_leidas) params.append('solo_no_leidas', 'true');
    params.append('limit', limit);

    const response = await fetch(`${API_URL}?${params.toString()}`);
    
    if (!response.ok) {
      throw new Error('Error al obtener notificaciones');
    }

    const result = await response.json();
    return result.data || [];
  } catch (error) {
    console.error('Error en getNotifications:', error);
    throw error;
  }
};

/**
 * Obtiene el conteo de notificaciones no leídas
 * @param {number} usuario_id - ID del usuario (opcional)
 * @returns {Promise<number>} Cantidad de notificaciones no leídas
 */
export const getUnreadCount = async (usuario_id = null) => {
  try {
    const params = new URLSearchParams();
    if (usuario_id) params.append('usuario_id', usuario_id);

    const response = await fetch(`${API_URL}/unread-count?${params.toString()}`);
    
    if (!response.ok) {
      throw new Error('Error al obtener conteo de no leídas');
    }

    const result = await response.json();
    return result.count || 0;
  } catch (error) {
    console.error('Error en getUnreadCount:', error);
    return 0;
  }
};

/**
 * Marca una notificación como leída
 * @param {number} notificacionId - ID de la notificación
 * @returns {Promise<boolean>} true si se marcó exitosamente
 */
export const markAsRead = async (notificacionId) => {
  try {
    const response = await fetch(`${API_URL}/${notificacionId}/mark-read`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error('Error al marcar notificación como leída');
    }

    const result = await response.json();
    return result.success;
  } catch (error) {
    console.error('Error en markAsRead:', error);
    throw error;
  }
};

/**
 * Marca todas las notificaciones como leídas
 * @param {number} usuario_id - ID del usuario (opcional)
 * @returns {Promise<boolean>} true si se marcaron exitosamente
 */
export const markAllAsRead = async (usuario_id = null) => {
  try {
    const params = new URLSearchParams();
    if (usuario_id) params.append('usuario_id', usuario_id);

    const response = await fetch(`${API_URL}/mark-all-read?${params.toString()}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error('Error al marcar todas como leídas');
    }

    const result = await response.json();
    return result.success;
  } catch (error) {
    console.error('Error en markAllAsRead:', error);
    throw error;
  }
};

/**
 * Elimina una notificación
 * @param {number} notificacionId - ID de la notificación
 * @returns {Promise<boolean>} true si se eliminó exitosamente
 */
export const deleteNotification = async (notificacionId) => {
  try {
    const response = await fetch(`${API_URL}/${notificacionId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error('Error al eliminar notificación');
    }

    const result = await response.json();
    return result.success;
  } catch (error) {
    console.error('Error en deleteNotification:', error);
    throw error;
  }
};

/**
 * Obtiene historial de notificaciones con filtros
 * @param {Object} filters - Filtros de búsqueda
 * @param {string} filters.fecha_inicio - Fecha de inicio (ISO)
 * @param {string} filters.fecha_fin - Fecha de fin (ISO)
 * @param {string} filters.severity - Nivel de severidad
 * @returns {Promise<Array>} Lista de notificaciones del historial
 */
export const getHistorial = async ({ fecha_inicio = null, fecha_fin = null, severity = null } = {}) => {
  try {
    const params = new URLSearchParams();
    if (fecha_inicio) params.append('fecha_inicio', fecha_inicio);
    if (fecha_fin) params.append('fecha_fin', fecha_fin);
    if (severity) params.append('severity', severity);

    const response = await fetch(`${API_URL}/historial?${params.toString()}`);
    
    if (!response.ok) {
      throw new Error('Error al obtener historial');
    }

    const result = await response.json();
    return result.data || [];
  } catch (error) {
    console.error('Error en getHistorial:', error);
    throw error;
  }
};

/**
 * Crea una nueva notificación (solo admin)
 * @param {Object} notification - Datos de la notificación
 * @param {string} notification.title - Título
 * @param {string} notification.message - Mensaje
 * @param {string} notification.severity - Severidad (low, medium, high, urgent)
 * @param {number} notification.usuario_id - ID usuario destino (opcional)
 * @returns {Promise<Object>} Notificación creada
 */
export const createNotification = async ({ title, message, severity = 'medium', usuario_id = null }) => {
  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        title,
        message,
        severity,
        usuario_id
      })
    });

    if (!response.ok) {
      throw new Error('Error al crear notificación');
    }

    const result = await response.json();
    return result.data;
  } catch (error) {
    console.error('Error en createNotification:', error);
    throw error;
  }
};

export default {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  getHistorial,
  createNotification
};
