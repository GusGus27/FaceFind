import React from 'react';
import '../../styles/common/NotificationDetailModal.css';

const NotificationDetailModal = ({ notification, onClose }) => {
  if (!notification) return null;

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const getPriorityInfo = (priority) => {
    switch (priority) {
      case 'ALTA':
        return { icon: '🚨', label: 'Alta Prioridad', class: 'priority-high' };
      case 'MEDIA':
        return { icon: '⚠️', label: 'Prioridad Media', class: 'priority-medium' };
      case 'BAJA':
        return { icon: 'ℹ️', label: 'Prioridad Baja', class: 'priority-low' };
      default:
        return { icon: '🔔', label: 'Normal', class: 'priority-normal' };
    }
  };

  const getConfidenceLevel = (confidence) => {
    if (confidence >= 0.9) return { label: 'Muy Alta', class: 'confidence-very-high', percentage: Math.round(confidence * 100) };
    if (confidence >= 0.8) return { label: 'Alta', class: 'confidence-high', percentage: Math.round(confidence * 100) };
    if (confidence >= 0.7) return { label: 'Media', class: 'confidence-medium', percentage: Math.round(confidence * 100) };
    return { label: 'Baja', class: 'confidence-low', percentage: Math.round(confidence * 100) };
  };

  const priorityInfo = getPriorityInfo(notification.prioridad);
  const confidence = notification.alerta?.similitud || notification.confidence || 0;
  const confidenceInfo = getConfidenceLevel(confidence);

  // Extraer información de la alerta relacionada
  const alerta = notification.alerta || {};
  const caso = alerta.caso || {};
  const camara = alerta.camara || {};

  return (
    <div className="notification-modal-overlay" onClick={onClose}>
      <div className="notification-modal-content" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header">
          <div className="header-title">
            <span className="header-icon">{priorityInfo.icon}</span>
            <h2>{notification.asunto || 'Detalle de Notificación'}</h2>
          </div>
          <button className="close-btn" onClick={onClose} aria-label="Cerrar">
            ✕
          </button>
        </div>

        {/* Body */}
        <div className="modal-body">
          {/* Sección de Prioridad y Confianza */}
          <div className="info-badges">
            <div className={`priority-badge ${priorityInfo.class}`}>
              <span className="badge-icon">{priorityInfo.icon}</span>
              <span className="badge-text">{priorityInfo.label}</span>
            </div>
            
            {confidence > 0 && (
              <div className={`confidence-badge ${confidenceInfo.class}`}>
                <div className="confidence-bar-container">
                  <div 
                    className="confidence-bar-fill" 
                    style={{ width: `${confidenceInfo.percentage}%` }}
                  ></div>
                </div>
                <span className="confidence-text">
                  Confianza: {confidenceInfo.percentage}% ({confidenceInfo.label})
                </span>
              </div>
            )}
          </div>

          {/* Imagen Capturada */}
          {alerta.imagen_url && (
            <div className="image-section">
              <h3>📸 Imagen Capturada</h3>
              <div className="image-container">
                <img 
                  src={alerta.imagen_url} 
                  alt="Captura de la detección" 
                  className="captured-image"
                  onError={(e) => {
                    e.target.src = '/placeholder-image.png';
                    e.target.alt = 'Imagen no disponible';
                  }}
                />
                <div className="image-timestamp">
                  {alerta.timestamp && formatDate(alerta.timestamp)}
                </div>
              </div>
            </div>
          )}

          {/* Detalles de la Detección */}
          <div className="details-section">
            <h3>📋 Detalles de la Detección</h3>
            <div className="details-grid">
              {/* Fecha y Hora */}
              <div className="detail-item">
                <span className="detail-icon">🕒</span>
                <div className="detail-content">
                  <span className="detail-label">Fecha y Hora</span>
                  <span className="detail-value">
                    {alerta.timestamp ? formatDate(alerta.timestamp) : formatDate(notification.creada_en)}
                  </span>
                </div>
              </div>

              {/* Ubicación */}
              {(alerta.ubicacion || camara.ubicacion) && (
                <div className="detail-item">
                  <span className="detail-icon">📍</span>
                  <div className="detail-content">
                    <span className="detail-label">Ubicación</span>
                    <span className="detail-value">{alerta.ubicacion || camara.ubicacion}</span>
                  </div>
                </div>
              )}

              {/* Cámara */}
              {camara.nombre && (
                <div className="detail-item">
                  <span className="detail-icon">📹</span>
                  <div className="detail-content">
                    <span className="detail-label">Cámara</span>
                    <span className="detail-value">
                      {camara.nombre}
                      {camara.tipo && ` (${camara.tipo})`}
                    </span>
                  </div>
                </div>
              )}

              {/* Caso Relacionado */}
              {caso.num_caso && (
                <div className="detail-item">
                  <span className="detail-icon">📁</span>
                  <div className="detail-content">
                    <span className="detail-label">Caso</span>
                    <span className="detail-value">
                      #{caso.num_caso}
                      {caso.persona_desaparecida?.nombre && ` - ${caso.persona_desaparecida.nombre}`}
                    </span>
                  </div>
                </div>
              )}

              {/* Estado de la Alerta */}
              {alerta.estado && (
                <div className="detail-item">
                  <span className="detail-icon">🔍</span>
                  <div className="detail-content">
                    <span className="detail-label">Estado</span>
                    <span className={`detail-value status-${alerta.estado.toLowerCase()}`}>
                      {alerta.estado}
                    </span>
                  </div>
                </div>
              )}

              {/* Nivel de Similitud */}
              {confidence > 0 && (
                <div className="detail-item">
                  <span className="detail-icon">📊</span>
                  <div className="detail-content">
                    <span className="detail-label">Similitud</span>
                    <span className="detail-value">{confidenceInfo.percentage}%</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Contenido del Mensaje */}
          <div className="message-section">
            <h3>💬 Mensaje</h3>
            <div className="message-content">
              {notification.contenido}
            </div>
          </div>

          {/* Información de Persona Desaparecida */}
          {caso.persona_desaparecida && (
            <div className="person-section">
              <h3>👤 Información de la Persona</h3>
              <div className="person-details">
                {caso.persona_desaparecida.nombre && (
                  <p><strong>Nombre:</strong> {caso.persona_desaparecida.nombre}</p>
                )}
                {caso.persona_desaparecida.edad && (
                  <p><strong>Edad:</strong> {caso.persona_desaparecida.edad} años</p>
                )}
                {caso.persona_desaparecida.fecha_desaparicion && (
                  <p><strong>Fecha de Desaparición:</strong> {formatDate(caso.persona_desaparecida.fecha_desaparicion)}</p>
                )}
                {caso.persona_desaparecida.ultima_ubicacion && (
                  <p><strong>Última Ubicación Conocida:</strong> {caso.persona_desaparecida.ultima_ubicacion}</p>
                )}
              </div>
            </div>
          )}

          {/* Metadata */}
          <div className="metadata-section">
            <div className="metadata-item">
              <span className="metadata-label">ID Notificación:</span>
              <span className="metadata-value">#{notification.id}</span>
            </div>
            <div className="metadata-item">
              <span className="metadata-label">Creada:</span>
              <span className="metadata-value">{formatDate(notification.creada_en)}</span>
            </div>
            {notification.leida_en && (
              <div className="metadata-item">
                <span className="metadata-label">Leída:</span>
                <span className="metadata-value">{formatDate(notification.leida_en)}</span>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="modal-footer">
          <button className="btn-secondary" onClick={onClose}>
            Cerrar
          </button>
          {alerta.id && (
            <button 
              className="btn-primary"
              onClick={() => {
                // Navegar al detalle de la alerta
                window.location.href = `/alertas/${alerta.id}`;
              }}
            >
              Ver Alerta Completa
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default NotificationDetailModal;
