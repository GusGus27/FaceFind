import React from 'react';
import '../../styles/admin/UserCasesModal.css';

/**
 * Modal para mostrar los casos asociados a un usuario específico
 * @param {boolean} isOpen - Controla la visibilidad del modal
 * @param {function} onClose - Función callback para cerrar el modal
 * @param {string} userName - Nombre del usuario propietario de los casos
 * @param {number} userId - ID del usuario para filtrar casos
 * @param {array} cases - Array de casos del usuario
 */
const UserCasesModal = ({ isOpen, onClose, userName, userId, cases = [] }) => {
  // No renderizar si el modal está cerrado
  if (!isOpen) return null;

  // Función para obtener el icono según el estado del caso de desaparición
  const getStatusIcon = (status) => {
    const icons = {
      activo: '🔴',      // Búsqueda activa
      pendiente: '🟡',    // En revisión
      resuelto: '✅',     // Persona encontrada
      cerrado: '⚫'       // Caso cerrado
    };
    return icons[status] || '📋';
  };

  // Función para obtener la clase CSS según el estado
  const getStatusClass = (status) => {
    return `case-status case-status-${status}`;
  };

  // Formatear fecha
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  // Manejar click en el overlay para cerrar
  const handleOverlayClick = (e) => {
    if (e.target.className === 'user-cases-modal modal-overlay') {
      onClose();
    }
  };

  return (
    <div className="user-cases-modal modal-overlay" onClick={handleOverlayClick}>
      <div className="modal-content">
        {/* Header del modal */}
        <div className="modal-header">
          <h2>Casoss de {userName}</h2>
          <button 
            className="close-btn" 
            onClick={onClose}
            aria-label="Cerrar modal"
          >
            ✕
          </button>
        </div>

        {/* Contenido del modal */}
        <div className="modal-body">
          {cases.length === 0 ? (
            <div className="no-cases">
              <p className="no-cases-icon">📭</p>
              <p className="no-cases-text">Este usuario no tiene casos registrados</p>
            </div>
          ) : (
            <>
              <div className="cases-summary">
                <p>Total de casos: <strong>{cases.length}</strong></p>
              </div>

              <div className="cases-list">
                {cases.map((caso) => (
                  <div key={caso.id} className="case-item">
                    <div className="case-header">
                      <span className="case-icon">{getStatusIcon(caso.status)}</span>
                      <h3 className="case-title">{caso.title}</h3>
                    </div>
                    
                    <div className="case-details">
                      <span className={getStatusClass(caso.status)}>
                        {caso.status.charAt(0).toUpperCase() + caso.status.slice(1)}
                      </span>
                      <span className="case-date">
                        📅 {formatDate(caso.reportDate)}
                      </span>
                      {caso.location && (
                        <span className="case-location">
                          📍 {caso.location}
                        </span>
                      )}
                    </div>

                    {caso.description && (
                      <p className="case-description">{caso.description}</p>
                    )}
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Footer con acción opcional */}
        <div className="modal-footer">
          <button 
            className="btn-secondary" 
            onClick={onClose}
          >
            Cerrar
          </button>
          {cases.length > 0 && (
            <button 
              className="btn-primary"
              onClick={() => {
                // Aquí podrías redirigir a CaseManagement con filtro
                alert('Redirección a vista completa de casos (por implementar)');
              }}
            >
              Ver todos los detalles
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserCasesModal;
