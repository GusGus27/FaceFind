import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import CaseDetailModal from "./CaseDetailModal";
import { getFotosByCaso } from "../../services/fotoService";

export default function UserCaseCards({ cases }) {
  const navigate = useNavigate();
  const [selectedCase, setSelectedCase] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [casesWithPhotos, setCasesWithPhotos] = useState({});

  // Cargar primera foto de cada caso
  useEffect(() => {
    const loadPhotos = async () => {
      console.log('🔍 Cargando fotos para casos:', cases.length);
      const photosMap = {};
      
      for (const caso of cases) {
        try {
          console.log(`📸 Obteniendo fotos del caso ID: ${caso.id}`);
          const fotos = await getFotosByCaso(caso.id);
          console.log(`✅ Fotos recibidas para caso ${caso.id}:`, fotos);
          
          if (fotos && fotos.length > 0) {
            photosMap[caso.id] = fotos[0].url_foto;
            console.log(`✅ Foto asignada a caso ${caso.id}:`, fotos[0].url_foto);
          } else {
            console.log(`⚠️ No hay fotos para caso ${caso.id}`);
          }
        } catch (error) {
          console.error(`❌ Error cargando fotos del caso ${caso.id}:`, error);
        }
      }
      
      console.log('📋 Mapa final de fotos:', photosMap);
      setCasesWithPhotos(photosMap);
    };

    if (cases && cases.length > 0) {
      loadPhotos();
    }
  }, [cases]);

  const handleViewDetails = (caso) => {
    setSelectedCase(caso);
    setShowModal(true);
  };

  const handleEdit = (caso) => {
    navigate(`/casos/${caso.id}/editar`);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedCase(null);
  };

  const handleEditFromModal = () => {
    if (selectedCase) {
      closeModal();
      navigate(`/casos/${selectedCase.id}/editar`);
    }
  };
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
                src={casesWithPhotos[caso.id] || caso.img || caso.foto || "https://static.vecteezy.com/system/resources/previews/011/269/772/non_2x/missing-person-icon-design-free-vector.jpg"} 
                alt={caso.PersonaDesaparecida?.nombre_completo || caso.title}
                className="case-photo-main"
                onError={(e) => {
                  console.error('Error cargando imagen del caso:', caso.id);
                  e.target.src = "https://static.vecteezy.com/system/resources/previews/011/269/772/non_2x/missing-person-icon-design-free-vector.jpg";
                }}
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
                <button 
                  className="btn-case-action btn-view-detail"
                  onClick={() => handleViewDetails(caso)}
                >
                  📄 Ver Detalles
                </button>
                <button 
                  className="btn-case-action btn-edit-case"
                  onClick={() => handleEdit(caso)}
                >
                  ✏️ Actualizar
                </button>
              </div>
            </div>
          </div>
        );
      })}

      {/* Modal de Detalles */}
      {showModal && selectedCase && (
        <CaseDetailModal
          caso={selectedCase}
          onClose={closeModal}
          onEdit={handleEditFromModal}
          showEditButton={true}
          isAdmin={false}
        />
      )}
    </div>
  );
}
