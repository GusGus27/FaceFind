import React, { useState, useEffect } from 'react';
import { getCasosByUserId } from '../../services/casoService';
import '../../styles/admin/UserCasesModal.css';

/**
 * Modal para mostrar los casos asociados a un usuario específico
 * @param {boolean} isOpen - Controla la visibilidad del modal
 * @param {function} onClose - Función callback para cerrar el modal
 * @param {string} userName - Nombre del usuario propietario de los casos
 * @param {number} userId - ID del usuario para filtrar casos
 */
const UserCasesModal = ({ isOpen, onClose, userName, userId }) => {
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Cargar casos cuando se abre el modal o cambia userId
  useEffect(() => {
    if (isOpen && userId) {
      loadUserCases();
    }
  }, [isOpen, userId]);

  const loadUserCases = async () => {
    try {
      setLoading(true);
      setError(null);
      const casesData = await getCasosByUserId(userId);
      setCases(casesData);
    } catch (err) {
      console.error('Error loading user cases:', err);
      setError('Error al cargar los casos del usuario');
    } finally {
      setLoading(false);
    }
  };

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
    return icons[status?.toLowerCase()] || '📋';
  };

  // Función para obtener la clase CSS según el estado
  const getStatusClass = (status) => {
    return `case-status case-status-${status?.toLowerCase()}`;
  };

  // Formatear fecha
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
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
          <h2>Casos de {userName}</h2>
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
          {loading ? (
            <div className="loading-message">
              <p>Cargando casos...</p>
            </div>
          ) : error ? (
            <div className="error-message">
              <p>{error}</p>
              <button onClick={loadUserCases}>Reintentar</button>
            </div>
          ) : cases.length === 0 ? (
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
                      <h3 className="case-title">
                        {caso.PersonaDesaparecida?.nombre_completo || 'Sin nombre'}
                      </h3>
                    </div>
                    
                    <div className="case-details">
                      <span className={getStatusClass(caso.status)}>
                        {caso.status ? caso.status.charAt(0).toUpperCase() + caso.status.slice(1) : 'N/A'}
                      </span>
                      <span className="case-date">
                        📅 {formatDate(caso.fecha_desaparicion || caso.created_at)}
                      </span>
                      {caso.lugar_desaparicion && (
                        <span className="case-location">
                          📍 {caso.lugar_desaparicion}
                        </span>
                      )}
                      {caso.priority && (
                        <span className={`case-priority priority-${caso.priority}`}>
                          {caso.priority === 'high' ? '🔴 Alta' : caso.priority === 'medium' ? '🟡 Media' : '🟢 Baja'}
                        </span>
                      )}
                    </div>

                    {caso.circumstances && (
                      <p className="case-description">
                        {caso.circumstances}
                      </p>
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
        </div>
      </div>
    </div>
  );
};

export default UserCasesModal;
