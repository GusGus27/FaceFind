import React from "react";

export default function UserCaseCards({ cases }) {
  if (!cases || cases.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-state-icon">💙</div>
        <div className="empty-state-text">No tienes casos registrados</div>
        <div className="empty-state-subtext">
          Los casos de personas que reportes aparecerán aquí.<br />
          Podrás hacer seguimiento de cada uno de ellos.
        </div>
      </div>
    );
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const getDaysSince = (dateString) => {
    const date = new Date(dateString);
    const today = new Date();
    const diffTime = Math.abs(today - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getPriorityClass = (priority) => {
    const priorityMap = {
      'alta': 'high',
      'high': 'high',
      'media': 'medium',
      'medium': 'medium',
      'baja': 'low',
      'low': 'low'
    };
    return priorityMap[priority?.toLowerCase()] || 'medium';
  };

  const getPriorityLabel = (priority) => {
    const labelMap = {
      'alta': 'Prioridad Alta',
      'high': 'Prioridad Alta',
      'media': 'Prioridad Media',
      'medium': 'Prioridad Media',
      'baja': 'Prioridad Baja',
      'low': 'Prioridad Baja'
    };
    return labelMap[priority?.toLowerCase()] || 'Prioridad Media';
  };

  return (
    <div className="cases-cards-container">
      {cases.map((caso) => {
        const daysSince = getDaysSince(caso.fecha_desaparicion || caso.lastUpdate);
        
        return (
          <div key={caso.id} className="case-card-item">
            {/* Foto */}
            <div className="case-photo-wrapper">
              <img 
                src={caso.img || caso.foto || "https://via.placeholder.com/120"} 
                alt={caso.PersonaDesaparecida?.nombre_completo || caso.title}
                className="case-photo-main"
              />
            </div>

            {/* Contenido Principal */}
            <div className="case-content">
              <div className="case-header-row">
                <h3 className="case-name-large">
                  {caso.PersonaDesaparecida?.nombre_completo || caso.title || "Sin nombre"}
                </h3>
                <span className={`case-status-badge ${caso.status || 'pendiente'}`}>
                  {caso.status === 'activo' ? 'En búsqueda' : 
                   caso.status === 'pendiente' ? 'Pendiente' : 
                   caso.status === 'resuelto' ? 'Encontrado' : 'Pendiente'}
                </span>
              </div>

              <p className="case-description-text">
                {caso.description || caso.title || "Sin descripción disponible"}
              </p>

              <div className="case-info-row">
                <div className="case-info-item">
                  <span className="case-info-icon">📅</span>
                  <span className="case-info-label">Reportado:</span>
                  <span className="case-info-value">
                    {formatDate(caso.fecha_desaparicion || caso.lastUpdate)}
                  </span>
                </div>

                <div className="case-info-item">
                  <span className="case-info-icon">⏱️</span>
                  <span className="case-info-label">Hace:</span>
                  <span className="case-info-value">
                    {daysSince} {daysSince === 1 ? 'día' : 'días'}
                  </span>
                </div>

                <div className="case-info-item">
                  <span className="case-info-icon">📍</span>
                  <span className="case-info-label">Ubicación:</span>
                  <span className="case-info-value">
                    {caso.lugar_desaparicion || caso.location || "No especificada"}
                  </span>
                </div>
              </div>
            </div>

            {/* Sección de Acciones */}
            <div className="case-actions-section">
              <span className={`case-priority-badge ${getPriorityClass(caso.priority)}`}>
                {getPriorityLabel(caso.priority)}
              </span>

              <div className="case-action-buttons">
                <button className="btn-case-action btn-view-detail">
                  📄 Ver Detalles
                </button>
                <button className="btn-case-action btn-edit-case">
                  ✏️ Actualizar
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

