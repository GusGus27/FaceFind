import React, { useState, useEffect } from 'react';
import { getFotosByCaso } from '../../services/fotoService';
import '../../styles/cases/CaseDetailModal.css';

/**
 * Modal reutilizable para mostrar detalles completos de un caso
 * Puede ser usado por Admin y Usuarios
 * 
 * @param {Object} caso - Objeto del caso con todos sus datos
 * @param {Object} user - Información del usuario que reportó (opcional)
 * @param {Function} onClose - Callback para cerrar el modal
 * @param {Function} onEdit - Callback para editar el caso (opcional)
 * @param {boolean} showEditButton - Mostrar botón de editar (default: true)
 * @param {boolean} isAdmin - Modo administrador (muestra campos adicionales)
 */
const CaseDetailModal = ({ 
  caso, 
  user = null, 
  onClose, 
  onEdit = null,
  showEditButton = true,
  isAdmin = false 
}) => {
  
  const [fotos, setFotos] = useState([]);
  const [loadingFotos, setLoadingFotos] = useState(true);
  
  useEffect(() => {
    if (caso?.id) {
      loadFotos();
    }
  }, [caso?.id]);

  const loadFotos = async () => {
    try {
      setLoadingFotos(true);
      const fotosData = await getFotosByCaso(caso.id);
      setFotos(fotosData);
    } catch (error) {
      console.error('Error cargando fotos:', error);
      setFotos([]);
    } finally {
      setLoadingFotos(false);
    }
  };
  
  if (!caso) return null;

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const getPriorityColor = (priority) => {
    const priorityMap = {
      'alta': '#f44336',
      'high': '#f44336',
      'media': '#ff9800',
      'medium': '#ff9800',
      'baja': '#4caf50',
      'low': '#4caf50'
    };
    return priorityMap[priority?.toLowerCase()] || '#9e9e9e';
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
    return labelMap[priority?.toLowerCase()] || 'Sin definir';
  };

  const getStatusLabel = (status) => {
    const statusMap = {
      'pendiente': 'Pendiente',
      'en_progreso': 'En Progreso',
      'activo': 'Activo',
      'resuelto': 'Resuelto',
      'cerrado': 'Cerrado'
    };
    return statusMap[status] || status?.charAt(0).toUpperCase() + status?.slice(1);
  };

  const persona = caso.PersonaDesaparecida || {};

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container case-detail-modal" onClick={(e) => e.stopPropagation()}>
        
        {/* Header */}
        <div className="modal-header">
          <h2>📋 Detalles del Caso</h2>
          <button className="modal-close" onClick={onClose} aria-label="Cerrar">
            ✕
          </button>
        </div>
        
        {/* Body */}
        <div className="modal-body">
          
          {/* Información General */}
          <section className="detail-section">
            <h3>📝 Información General</h3>
            <div className="detail-grid">
              <div className="detail-item">
                <span className="detail-label">ID del Caso:</span>
                <span className="detail-value">#{caso.id}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Estado:</span>
                <span className={`detail-badge status-${caso.status}`}>
                  {getStatusLabel(caso.status)}
                </span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Prioridad:</span>
                <span 
                  className="detail-badge priority-badge"
                  style={{ 
                    backgroundColor: getPriorityColor(caso.priority), 
                    color: 'white' 
                  }}
                >
                  {getPriorityLabel(caso.priority)}
                </span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Fecha de Desaparición:</span>
                <span className="detail-value">{formatDate(caso.fecha_desaparicion)}</span>
              </div>
            </div>
          </section>

          {/* Información de la Persona Desaparecida */}
          <section className="detail-section">
            <h3>👤 Datos de la Persona Desaparecida</h3>
            <div className="detail-grid">
              <div className="detail-item full-width">
                <span className="detail-label">Nombre Completo:</span>
                <span className="detail-value">{persona.nombre_completo || 'N/A'}</span>
              </div>
              
              {persona.age && (
                <div className="detail-item">
                  <span className="detail-label">Edad:</span>
                  <span className="detail-value">{persona.age} años</span>
                </div>
              )}
              
              {persona.gender && (
                <div className="detail-item">
                  <span className="detail-label">Género:</span>
                  <span className="detail-value">{persona.gender}</span>
                </div>
              )}
              
              {persona.fecha_nacimiento && (
                <div className="detail-item">
                  <span className="detail-label">Fecha de Nacimiento:</span>
                  <span className="detail-value">{formatDate(persona.fecha_nacimiento)}</span>
                </div>
              )}
              
              {persona.altura && (
                <div className="detail-item">
                  <span className="detail-label">Estatura:</span>
                  <span className="detail-value">{persona.altura} m</span>
                </div>
              )}
              
              {persona.peso && (
                <div className="detail-item">
                  <span className="detail-label">Peso:</span>
                  <span className="detail-value">{persona.peso} kg</span>
                </div>
              )}
              
              {persona.skinColor && (
                <div className="detail-item">
                  <span className="detail-label">Color de Piel:</span>
                  <span className="detail-value">{persona.skinColor}</span>
                </div>
              )}
              
              {persona.hairColor && (
                <div className="detail-item">
                  <span className="detail-label">Color de Cabello:</span>
                  <span className="detail-value">{persona.hairColor}</span>
                </div>
              )}
              
              {persona.eyeColor && (
                <div className="detail-item">
                  <span className="detail-label">Color de Ojos:</span>
                  <span className="detail-value">{persona.eyeColor}</span>
                </div>
              )}
            </div>
          </section>

          {/* Información de la Desaparición */}
          <section className="detail-section">
            <h3>📍 Información de la Desaparición</h3>
            <div className="detail-grid">
              <div className="detail-item full-width">
                <span className="detail-label">Lugar de Desaparición:</span>
                <span className="detail-value">{caso.lugar_desaparicion || 'N/A'}</span>
              </div>
              
              {caso.disappearanceTime && (
                <div className="detail-item">
                  <span className="detail-label">Hora:</span>
                  <span className="detail-value">{caso.disappearanceTime}</span>
                </div>
              )}
              
              {caso.lastSeenLocation && (
                <div className="detail-item full-width">
                  <span className="detail-label">Último Lugar Visto:</span>
                  <span className="detail-value">{caso.lastSeenLocation}</span>
                </div>
              )}
              
              {caso.lastSeen && (
                <div className="detail-item full-width">
                  <span className="detail-label">Última vez visto:</span>
                  <span className="detail-value">{caso.lastSeen}</span>
                </div>
              )}
              
              {persona.clothing && (
                <div className="detail-item full-width">
                  <span className="detail-label">Vestimenta:</span>
                  <span className="detail-value">{persona.clothing}</span>
                </div>
              )}
              
              {persona.senas_particulares && (
                <div className="detail-item full-width">
                  <span className="detail-label">Señas Particulares:</span>
                  <span className="detail-value">{persona.senas_particulares}</span>
                </div>
              )}
            </div>
          </section>

          {/* Circunstancias */}
          {caso.circumstances && (
            <section className="detail-section">
              <h3>📄 Circunstancias de la Desaparición</h3>
              <p className="detail-description">{caso.circumstances}</p>
            </section>
          )}

          {/* Descripción adicional */}
          {caso.description && (
            <section className="detail-section">
              <h3>📝 Descripción Adicional</h3>
              <p className="detail-description">{caso.description}</p>
            </section>
          )}

          {/* Información de Contacto */}
          <section className="detail-section">
            <h3>📞 Información de Contacto</h3>
            <div className="detail-grid">
              
              {/* Si se pasó el objeto user */}
              {user && (
                <>
                  <div className="detail-item">
                    <span className="detail-label">Nombre del Usuario:</span>
                    <span className="detail-value">{user.nombre}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Email:</span>
                    <span className="detail-value">{user.email}</span>
                  </div>
                  {user.dni && (
                    <div className="detail-item">
                      <span className="detail-label">DNI:</span>
                      <span className="detail-value">{user.dni}</span>
                    </div>
                  )}
                </>
              )}
              
              {caso.reporterName && (
                <div className="detail-item">
                  <span className="detail-label">Nombre del Contacto:</span>
                  <span className="detail-value">{caso.reporterName}</span>
                </div>
              )}
              
              {caso.relationship && (
                <div className="detail-item">
                  <span className="detail-label">Parentesco:</span>
                  <span className="detail-value">{caso.relationship}</span>
                </div>
              )}
              
              {caso.contactPhone && (
                <div className="detail-item">
                  <span className="detail-label">Teléfono:</span>
                  <span className="detail-value">{caso.contactPhone}</span>
                </div>
              )}
              
              {caso.contactEmail && (
                <div className="detail-item">
                  <span className="detail-label">Email de Contacto:</span>
                  <span className="detail-value">{caso.contactEmail}</span>
                </div>
              )}
              
              {caso.additionalContact && (
                <div className="detail-item full-width">
                  <span className="detail-label">Contacto Adicional:</span>
                  <span className="detail-value">{caso.additionalContact}</span>
                </div>
              )}
            </div>
          </section>

          {/* Observaciones */}
          {caso.observaciones && (
            <section className="detail-section">
              <h3>📝 Observaciones</h3>
              <p className="detail-description">{caso.observaciones}</p>
            </section>
          )}

          {/* Resolución (si está resuelto) */}
          {caso.status === 'resuelto' && (
            <section className="detail-section resolution-section">
              <h3>✅ Resolución del Caso</h3>
              <div className="detail-grid">
                {caso.resolutionDate && (
                  <div className="detail-item">
                    <span className="detail-label">Fecha de Resolución:</span>
                    <span className="detail-value">{formatDate(caso.resolutionDate)}</span>
                  </div>
                )}
                {caso.resolutionNote && (
                  <div className="detail-item full-width">
                    <span className="detail-label">Nota de Resolución:</span>
                    <span className="detail-value">{caso.resolutionNote}</span>
                  </div>
                )}
              </div>
            </section>
          )}

          {/* Timestamps (solo para admin o si se desea mostrar) */}
          {isAdmin && (
            <section className="detail-section timestamps-section">
              <h3>🕒 Registro del Sistema</h3>
              <div className="detail-grid">
                {caso.created_at && (
                  <div className="detail-item">
                    <span className="detail-label">Creado el:</span>
                    <span className="detail-value">{formatDate(caso.created_at)}</span>
                  </div>
                )}
                {caso.updated_at && (
                  <div className="detail-item">
                    <span className="detail-label">Última actualización:</span>
                    <span className="detail-value">{formatDate(caso.updated_at)}</span>
                  </div>
                )}
              </div>
            </section>
          )}

          {/* Fotos de Referencia */}
          <section className="detail-section photos-section">
            <h3>📸 Fotos de Referencia</h3>
            {loadingFotos ? (
              <div className="loading-photos">
                <p>Cargando fotos...</p>
              </div>
            ) : fotos.length > 0 ? (
              <div className="photos-grid">
                {fotos.map((foto, index) => (
                  <div key={foto.id} className="photo-item">
                    <img 
                      src={foto.ruta_archivo} 
                      alt={`Foto ${index + 1}`}
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="200" height="200"%3E%3Crect fill="%23ddd" width="200" height="200"/%3E%3Ctext x="50%25" y="50%25" text-anchor="middle" dy=".3em" fill="%23999"%3EError%3C/text%3E%3C/svg%3E';
                      }}
                    />
                    <span className="photo-label">Foto {index + 1}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="no-photos">
                <p>📷 No hay fotos disponibles para este caso</p>
              </div>
            )}
          </section>
        </div>

        {/* Footer */}
        <div className="modal-footer">
          <button className="btn-secondary" onClick={onClose}>
            Cerrar
          </button>
          {showEditButton && onEdit && (
            <button className="btn-primary" onClick={onEdit}>
              ✏️ Editar Caso
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default CaseDetailModal;
