import React from 'react';
import '../../styles/common/NotificationCard.css';

const NotificationCard = ({ notification, onMarkAsRead, onClick }) => {
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Ahora mismo';
    if (diffMins < 60) return `Hace ${diffMins} min`;
    if (diffHours < 24) return `Hace ${diffHours}h`;
    if (diffDays < 7) return `Hace ${diffDays}d`;
    
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const getPriorityInfo = (priority) => {
    switch (priority) {
      case 'ALTA':
        return { 
          icon: '🚨', 
          label: 'Alta', 
          class: 'priority-high',
          color: '#dc3545'
        };
      case 'MEDIA':
        return { 
          icon: '⚠️', 
          label: 'Media', 
          class: 'priority-medium',
          color: '#ffc107'
        };
      case 'BAJA':
        return { 
          icon: 'ℹ️', 
          label: 'Baja', 
          class: 'priority-low',
          color: '#17a2b8'
        };
      default:
        return { 
          icon: '🔔', 
          label: 'Normal', 
          class: 'priority-normal',
          color: '#6c757d'
        };
    }
  };

  const getConfidenceBadge = (confidence) => {
    if (!confidence) return null;
    
    const percentage = Math.round(confidence * 100);
    let badgeClass = 'confidence-low';
    
    if (confidence >= 0.9) badgeClass = 'confidence-very-high';
    else if (confidence >= 0.8) badgeClass = 'confidence-high';
    else if (confidence >= 0.7) badgeClass = 'confidence-medium';

    return { percentage, badgeClass };
  };

  const priorityInfo = getPriorityInfo(notification.prioridad);
  const confidence = notification.alerta?.similitud || notification.confidence || 0;
  const confidenceBadge = getConfidenceBadge(confidence);
  const isUnread = !notification.leida_en;
  const imageUrl = notification.alerta?.imagen_url;

  return (
    <div 
      className={`notification-card ${isUnread ? 'unread' : 'read'} ${priorityInfo.class}`}
      onClick={onClick}
    >
      {/* Indicador de no leída */}
      {isUnread && <div className="unread-indicator"></div>}

      {/* Header con prioridad y tiempo */}
      <div className="card-header">
        <div className="priority-info">
          <span className="priority-icon">{priorityInfo.icon}</span>
          <span className="priority-label">{priorityInfo.label}</span>
        </div>
        <span className="time-ago">{formatDate(notification.creada_en)}</span>
      </div>

      {/* Contenido principal */}
      <div className="card-body">
        {/* Imagen preview si existe */}
        {imageUrl && (
          <div className="image-preview">
            <img 
              src={imageUrl} 
              alt="Preview" 
              onError={(e) => {
                e.target.style.display = 'none';
              }}
            />
            <div className="image-overlay">
              <span className="view-icon">🔍</span>
            </div>
          </div>
        )}

        {/* Texto de la notificación */}
        <div className="card-content">
          <h4 className="notification-title">
            {notification.asunto || 'Notificación'}
          </h4>
          <p className="notification-message">
            {notification.contenido?.length > 120 
              ? `${notification.contenido.substring(0, 120)}...` 
              : notification.contenido}
          </p>

          {/* Badges de información */}
          <div className="info-badges">
            {/* Badge de confianza */}
            {confidenceBadge && (
              <span className={`badge confidence-badge ${confidenceBadge.badgeClass}`}>
                <span className="badge-icon">📊</span>
                {confidenceBadge.percentage}%
              </span>
            )}

            {/* Badge de caso */}
            {notification.alerta?.caso?.num_caso && (
              <span className="badge case-badge">
                <span className="badge-icon">📁</span>
                Caso #{notification.alerta.caso.num_caso}
              </span>
            )}

            {/* Badge de cámara */}
            {notification.alerta?.camara?.nombre && (
              <span className="badge camera-badge">
                <span className="badge-icon">📹</span>
                {notification.alerta.camara.nombre}
              </span>
            )}

            {/* Badge de ubicación */}
            {notification.alerta?.ubicacion && (
              <span className="badge location-badge">
                <span className="badge-icon">📍</span>
                {notification.alerta.ubicacion.length > 20 
                  ? `${notification.alerta.ubicacion.substring(0, 20)}...` 
                  : notification.alerta.ubicacion}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Footer con acciones */}
      <div className="card-footer">
        <div className="footer-left">
          <span className="notification-id">ID: #{notification.id}</span>
          {notification.leida_en && (
            <span className="read-badge">✓ Leída</span>
          )}
        </div>
        <div className="footer-actions">
          {isUnread && (
            <button 
              className="btn-mark-read"
              onClick={(e) => {
                e.stopPropagation();
                onMarkAsRead(notification.id);
              }}
              title="Marcar como leída"
            >
              ✓
            </button>
          )}
          <button 
            className="btn-view-details"
            onClick={(e) => {
              e.stopPropagation();
              onClick();
            }}
            title="Ver detalles"
          >
            👁️
          </button>
        </div>
      </div>

      {/* Barra de prioridad visual */}
      <div 
        className="priority-bar" 
        style={{ backgroundColor: priorityInfo.color }}
      ></div>
    </div>
  );
};

export default NotificationCard;
