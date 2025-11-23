import React, { useState, useEffect } from 'react';
import { supabase } from '../../services/authService';
import './NotificationPanel.css';

const NotificationPanel = () => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [filter, setFilter] = useState('all'); // all, unread, priority

  useEffect(() => {
    loadNotifications();
    subscribeToNotifications();
  }, []);

  const loadNotifications = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/notifications/historial?limite=50', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setNotifications(data.notificaciones || []);
        updateUnreadCount(data.notificaciones || []);
      }
    } catch (error) {
      console.error('Error cargando notificaciones:', error);
    }
  };

  const subscribeToNotifications = () => {
    // Suscripción a Supabase Realtime para nuevas notificaciones
    const subscription = supabase
      .from('notificacion')
      .on('INSERT', (payload) => {
        console.log('Nueva notificación:', payload.new);
        
        // Agregar notificación al inicio
        setNotifications(prev => [payload.new, ...prev]);
        
        // Mostrar notificación toast
        showToast(payload.new);
        
        // Actualizar contador
        setUnreadCount(prev => prev + 1);
        
        // Reproducir sonido (opcional)
        playNotificationSound();
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  };

  const updateUnreadCount = (notifs) => {
    const unread = notifs.filter(n => !n.leida_en).length;
    setUnreadCount(unread);
  };

  const markAsRead = async (notificationId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/notifications/${notificationId}/marcar-leida`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        // Actualizar estado local
        setNotifications(prev =>
          prev.map(n =>
            n.id === notificationId ? { ...n, leida_en: new Date().toISOString() } : n
          )
        );
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error('Error marcando como leída:', error);
    }
  };

  const showToast = (notification) => {
    // Crear toast notification
    const toast = document.createElement('div');
    toast.className = `notification-toast priority-${notification.prioridad?.toLowerCase()}`;
    toast.innerHTML = `
      <div class="toast-header">
        <span class="toast-icon">${getPriorityIcon(notification.prioridad)}</span>
        <span class="toast-title">${notification.asunto || 'Nueva notificación'}</span>
      </div>
      <div class="toast-body">${notification.contenido?.substring(0, 100)}...</div>
    `;
    
    document.body.appendChild(toast);
    
    // Mostrar animación
    setTimeout(() => toast.classList.add('show'), 10);
    
    // Remover después de 5 segundos
    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => document.body.removeChild(toast), 300);
    }, 5000);
  };

  const playNotificationSound = () => {
    // Audio opcional para notificaciones
    const audio = new Audio('/notification-sound.mp3');
    audio.volume = 0.3;
    audio.play().catch(e => console.log('No se pudo reproducir sonido'));
  };

  const getPriorityIcon = (priority) => {
    switch (priority) {
      case 'ALTA': return '🚨';
      case 'MEDIA': return '⚠️';
      case 'BAJA': return 'ℹ️';
      default: return '🔔';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'ALTA': return '#dc3545';
      case 'MEDIA': return '#ffc107';
      case 'BAJA': return '#17a2b8';
      default: return '#6c757d';
    }
  };

  const filteredNotifications = notifications.filter(n => {
    if (filter === 'unread') return !n.leida_en;
    if (filter === 'priority') return n.prioridad === 'ALTA';
    return true;
  });

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Ahora';
    if (minutes < 60) return `Hace ${minutes} min`;
    if (hours < 24) return `Hace ${hours}h`;
    if (days < 7) return `Hace ${days}d`;
    return date.toLocaleDateString();
  };

  return (
    <div className="notification-panel">
      {/* Botón de notificaciones */}
      <button 
        className="notification-bell"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="bell-icon">🔔</span>
        {unreadCount > 0 && (
          <span className="notification-badge">{unreadCount > 99 ? '99+' : unreadCount}</span>
        )}
      </button>

      {/* Panel de notificaciones */}
      {isOpen && (
        <div className="notification-dropdown">
          {/* Header */}
          <div className="notification-header">
            <h3>Notificaciones</h3>
            <button 
              className="close-btn"
              onClick={() => setIsOpen(false)}
            >
              ✕
            </button>
          </div>

          {/* Filtros */}
          <div className="notification-filters">
            <button 
              className={filter === 'all' ? 'active' : ''}
              onClick={() => setFilter('all')}
            >
              Todas ({notifications.length})
            </button>
            <button 
              className={filter === 'unread' ? 'active' : ''}
              onClick={() => setFilter('unread')}
            >
              No leídas ({unreadCount})
            </button>
            <button 
              className={filter === 'priority' ? 'active' : ''}
              onClick={() => setFilter('priority')}
            >
              🚨 Urgentes
            </button>
          </div>

          {/* Lista de notificaciones */}
          <div className="notification-list">
            {filteredNotifications.length === 0 ? (
              <div className="empty-state">
                <span className="empty-icon">📭</span>
                <p>No hay notificaciones</p>
              </div>
            ) : (
              filteredNotifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`notification-item ${!notification.leida_en ? 'unread' : ''}`}
                  onClick={() => {
                    if (!notification.leida_en) {
                      markAsRead(notification.id);
                    }
                  }}
                >
                  <div className="notification-priority">
                    <span 
                      className="priority-indicator"
                      style={{ backgroundColor: getPriorityColor(notification.prioridad) }}
                    >
                      {getPriorityIcon(notification.prioridad)}
                    </span>
                  </div>

                  <div className="notification-content">
                    <div className="notification-title">
                      {notification.asunto}
                    </div>
                    <div className="notification-message">
                      {notification.contenido?.substring(0, 150)}
                      {notification.contenido?.length > 150 && '...'}
                    </div>
                    <div className="notification-meta">
                      <span className="notification-time">
                        {formatDate(notification.created_at)}
                      </span>
                      {notification.alerta_id && (
                        <span className="notification-case">
                          Caso #{notification.alerta_id}
                        </span>
                      )}
                    </div>
                  </div>

                  {!notification.leida_en && (
                    <div className="unread-dot"></div>
                  )}
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="notification-footer">
              <button 
                className="view-all-btn"
                onClick={() => {
                  setIsOpen(false);
                  // Navegar a página de notificaciones completa
                  window.location.href = '/notifications';
                }}
              >
                Ver todas las notificaciones
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationPanel;
