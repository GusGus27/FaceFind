import React, { useState, useEffect } from 'react';
import { 
  getNotifications, 
  markAsRead, 
  markAllAsRead, 
  deleteNotification 
} from '../../services/notificationService';
import '../../styles/admin/NotificationPanel.css';

const NotificationPanel = () => {
  const [notifications, setNotifications] = useState([]);
  const [filterType, setFilterType] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadNotifications();
    // Auto-refresh cada 30 segundos
    const interval = setInterval(loadNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadNotifications = async () => {
    try {
      setError(null);
      const data = await getNotifications({ limit: 50 });
      setNotifications(data);
    } catch (err) {
      console.error('Error loading notifications:', err);
      setError('Error al cargar notificaciones');
    } finally {
      setLoading(false);
    }
  };

  // Mapear tipo de notificación desde el campo 'type' o inferirlo del mensaje
  const getNotificationType = (notification) => {
    // Si tiene el campo type directamente, usarlo
    if (notification.type) {
      const typeMap = {
        'detection': 'match',
        'alert': 'alert',
        'warning': 'alert'
      };
      return typeMap[notification.type] || 'system';
    }
    
    // Fallback: inferir del contenido
    if (notification.title.includes('coincidencia') || notification.title.includes('Coincidencia')) {
      return 'match';
    } else if (notification.title.includes('caso') || notification.title.includes('Caso')) {
      return 'case';
    } else if (notification.title.includes('sistema') || notification.title.includes('Sistema')) {
      return 'system';
    } else if (notification.title.includes('alerta') || notification.title.includes('Alerta')) {
      return 'alert';
    }
    return 'match';  // Por defecto, es una detección
  };

  const filteredNotifications = filterType === 'all'
    ? notifications
    : notifications.filter(n => getNotificationType(n) === filterType);

  const handleMarkAsRead = async (notificationId) => {
    try {
      await markAsRead(notificationId);
      setNotifications(notifications.map(n =>
        n.id === notificationId ? { ...n, isRead: true } : n
      ));
    } catch (err) {
      console.error('Error marking as read:', err);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsRead();
      setNotifications(notifications.map(n => ({ ...n, isRead: true })));
    } catch (err) {
      console.error('Error marking all as read:', err);
    }
  };

  const handleDeleteNotification = async (notificationId) => {
    try {
      await deleteNotification(notificationId);
      setNotifications(notifications.filter(n => n.id !== notificationId));
    } catch (err) {
      console.error('Error deleting notification:', err);
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'match': return '🎯';
      case 'system': return '⚙️';
      case 'case': return '📁';
      case 'user': return '👤';
      case 'alert': return '⚠️';
      default: return '🔔';
    }
  };

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleString('es-ES', { 
      year: 'numeric', 
      month: '2-digit', 
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  if (loading) {
    return (
      <div className="notification-panel">
        <div className="notification-header">
          <h1>Panel de Notificaciones</h1>
          <p>Cargando notificaciones...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="notification-panel">
        <div className="notification-header">
          <h1>Panel de Notificaciones</h1>
          <p className="error-message">{error}</p>
        </div>
        <button onClick={loadNotifications} className="btn-reload">
          🔄 Reintentar
        </button>
      </div>
    );
  }

  return (
    <div className="notification-panel">
      <div className="notification-header">
        <div>
          <h1>Panel de Notificaciones</h1>
          <p>Tienes {unreadCount} notificaciones sin leer</p>
        </div>
        <div className="notification-header-actions">
          <button className="btn-refresh" onClick={loadNotifications} title="Recargar notificaciones">
            🔄 Actualizar
          </button>
          <button className="btn-mark-all" onClick={handleMarkAllAsRead}>
            ✓ Marcar todas como leídas
          </button>
        </div>
      </div>

      <div className="notification-filters">
        <button
          className={`filter-btn ${filterType === 'all' ? 'active' : ''}`}
          onClick={() => setFilterType('all')}
        >
          Todas
        </button>
        <button
          className={`filter-btn ${filterType === 'match' ? 'active' : ''}`}
          onClick={() => setFilterType('match')}
        >
          Coincidencias
        </button>
        <button
          className={`filter-btn ${filterType === 'case' ? 'active' : ''}`}
          onClick={() => setFilterType('case')}
        >
          Casos
        </button>
        <button
          className={`filter-btn ${filterType === 'system' ? 'active' : ''}`}
          onClick={() => setFilterType('system')}
        >
          Sistema
        </button>
        <button
          className={`filter-btn ${filterType === 'alert' ? 'active' : ''}`}
          onClick={() => setFilterType('alert')}
        >
          Alertas
        </button>
      </div>

      <div className="notifications-list">
        {filteredNotifications.map(notification => {
          const notifType = getNotificationType(notification);
          return (
            <div
              key={notification.id}
              className={`notification-item ${notification.severity} ${!notification.isRead ? 'unread' : ''}`}
            >
              <div className="notification-icon">
                {getNotificationIcon(notifType)}
              </div>
              <div className="notification-content">
                <h3>{notification.title}</h3>
                <p>{notification.message}</p>
                <div className="notification-meta">
                  <span className="notification-time">{formatTimestamp(notification.timestamp)}</span>
                  <span className={`notification-badge severity-${notification.severity}`}>
                    Severity: {notification.severity}
                  </span>
                  <span className={`notification-badge type-${notification.type || notifType}`}>
                    Type: {notification.type || notifType}
                  </span>
                </div>
              </div>
              <div className="notification-actions">
                {!notification.isRead && (
                  <button
                    className="btn-read"
                    onClick={() => handleMarkAsRead(notification.id)}
                    title="Marcar como leída"
                  >
                    ✓
                  </button>
                )}
                <button
                  className="btn-delete-notification"
                  onClick={() => handleDeleteNotification(notification.id)}
                  title="Eliminar"
                >
                  ✕
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {filteredNotifications.length === 0 && (
        <div className="no-notifications">
          <p>No hay notificaciones para mostrar</p>
        </div>
      )}
    </div>
  );
};

export default NotificationPanel;
