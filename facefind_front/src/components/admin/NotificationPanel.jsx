import React, { useState, useEffect } from 'react';
import '../../styles/NotificationPanel.css';

const NotificationPanel = () => {
  const [notifications, setNotifications] = useState([]);
  const [filterType, setFilterType] = useState('all');

  useEffect(() => {
    // Simulación de notificaciones
    setNotifications([
      {
        id: 1,
        type: 'match',
        title: 'Posible coincidencia detectada',
        message: 'El sistema ha detectado una posible coincidencia en el caso #89',
        timestamp: '2025-10-05 14:30',
        isRead: false,
        severity: 'high'
      },
      {
        id: 2,
        type: 'system',
        title: 'Actualización del sistema',
        message: 'Nueva versión del algoritmo de reconocimiento disponible',
        timestamp: '2025-10-05 12:00',
        isRead: false,
        severity: 'medium'
      },
      {
        id: 3,
        type: 'case',
        title: 'Nuevo caso reportado',
        message: 'Se ha reportado un nuevo caso de persona desaparecida',
        timestamp: '2025-10-05 10:15',
        isRead: true,
        severity: 'high'
      },
      {
        id: 4,
        type: 'user',
        title: 'Solicitud de acceso',
        message: 'Un nuevo usuario solicita acceso al sistema',
        timestamp: '2025-10-05 09:30',
        isRead: true,
        severity: 'low'
      },
      {
        id: 5,
        type: 'alert',
        title: 'Alerta de seguridad',
        message: 'Intento de acceso no autorizado detectado',
        timestamp: '2025-10-04 22:45',
        isRead: false,
        severity: 'urgent'
      }
    ]);
  }, []);

  const filteredNotifications = filterType === 'all'
    ? notifications
    : notifications.filter(n => n.type === filterType);

  const handleMarkAsRead = (notificationId) => {
    setNotifications(notifications.map(n =>
      n.id === notificationId ? { ...n, isRead: true } : n
    ));
  };

  const handleMarkAllAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, isRead: true })));
  };

  const handleDeleteNotification = (notificationId) => {
    setNotifications(notifications.filter(n => n.id !== notificationId));
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

  const getSeverityClass = (severity) => {
    return `notification-item ${severity} ${!notifications.find(n => n.id)?.isRead ? 'unread' : ''}`;
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <div className="notification-panel">
      <div className="notification-header">
        <div>
          <h1>Panel de Notificaciones</h1>
          <p>Tienes {unreadCount} notificaciones sin leer</p>
        </div>
        <button className="btn-mark-all" onClick={handleMarkAllAsRead}>
          ✓ Marcar todas como leídas
        </button>
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
        {filteredNotifications.map(notification => (
          <div
            key={notification.id}
            className={`notification-item ${notification.severity} ${!notification.isRead ? 'unread' : ''}`}
          >
            <div className="notification-icon">
              {getNotificationIcon(notification.type)}
            </div>
            <div className="notification-content">
              <h3>{notification.title}</h3>
              <p>{notification.message}</p>
              <span className="notification-time">{notification.timestamp}</span>
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
        ))}
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
