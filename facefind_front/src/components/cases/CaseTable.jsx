import React from "react";

export default function CaseTable({ cases }) {
  if (!cases || cases.length === 0) {
    return (
      <div className="cases-table-wrapper">
        <div className="empty-state">
          <div className="empty-state-icon">📋</div>
          <div className="empty-state-text">No hay casos registrados</div>
          <div className="empty-state-subtext">
            Los casos que registres aparecerán aquí
          </div>
        </div>
      </div>
    );
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
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
      'alta': 'Alta',
      'high': 'Alta',
      'media': 'Media',
      'medium': 'Media',
      'baja': 'Baja',
      'low': 'Baja'
    };
    return labelMap[priority?.toLowerCase()] || 'Media';
  };

  return (
    <div className="cases-table-wrapper">
      <table className="cases-table">
        <thead>
          <tr>
            <th>Foto</th>
            <th>Información</th>
            <th>Estado</th>
            <th>Prioridad</th>
            <th>Fecha Desaparición</th>
            <th>Ubicación</th>
            <th>Última Actualización</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {cases.map((caso) => (
            <tr key={caso.id}>
              {/* Foto */}
              <td className="case-photo">
                <img 
                  src={caso.img || caso.foto || "https://via.placeholder.com/60"} 
                  alt={caso.nombre_completo || caso.title}
                />
              </td>

              {/* Información */}
              <td className="case-info">
                <span className="case-name">
                  {caso.nombre_completo || caso.title || "Sin nombre"}
                </span>
                <span className="case-subtitle">
                  {caso.title || caso.description || "Sin descripción"}
                </span>
              </td>

              {/* Estado */}
              <td>
                <span className={`case-status ${caso.status || 'pendiente'}`}>
                  {caso.status || 'Pendiente'}
                </span>
              </td>

              {/* Prioridad */}
              <td>
                <span className={`case-priority ${getPriorityClass(caso.priority)}`}>
                  {getPriorityLabel(caso.priority)}
                </span>
              </td>

              {/* Fecha Desaparición */}
              <td className="case-date">
                <span className="case-date-highlight">
                  {caso.fecha_desaparicion 
                    ? formatDate(caso.fecha_desaparicion) 
                    : formatDate(caso.lastUpdate || new Date())}
                </span>
              </td>

              {/* Ubicación */}
              <td>
                <span className="case-location" title={caso.lugar_desaparicion || caso.location}>
                  {caso.lugar_desaparicion || caso.location || "No especificada"}
                </span>
              </td>

              {/* Última Actualización */}
              <td className="case-update">
                {formatDate(caso.updated_at || caso.lastUpdate || caso.created_at || new Date())}
              </td>

              {/* Acciones */}
              <td>
                <div className="case-actions">
                  <button className="btn-action btn-view">
                    Ver Detalle
                  </button>
                  <button className="btn-action btn-edit">
                    Editar
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

