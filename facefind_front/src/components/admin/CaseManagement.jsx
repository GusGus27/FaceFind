import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  getAllCasos, 
  updateCaso, 
  updateCasoStatus, 
  deleteCaso 
} from '../../services/casoService';
import { getUserById } from '../../services/userService';
import '../../styles/admin/CaseManagement.css';

const CaseManagement = () => {
  const navigate = useNavigate();

  const [cases, setCases] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');
  const [selectedCase, setSelectedCase] = useState(null);
  const [selectedCaseUser, setSelectedCaseUser] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadCases();
  }, []);

  const loadCases = async () => {
    try {
      setLoading(true);
      setError(null);
      const casesData = await getAllCasos();
      setCases(casesData);
    } catch (err) {
      console.error('Error loading cases:', err);
      setError('Error al cargar los casos. Intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  const filteredCases = cases.filter(caseItem => {
    const matchesSearch = 
      caseItem.PersonaDesaparecida?.nombre_completo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      caseItem.lugar_desaparicion?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === 'all' || caseItem.status === filterStatus;
    const matchesPriority = filterPriority === 'all' || caseItem.priority === filterPriority;
    
    return matchesSearch && matchesStatus && matchesPriority;
  });

  const handleStatusChange = async (caseId, newStatus) => {
    try {
      await updateCasoStatus(caseId, newStatus);
      setCases(cases.map(caseItem =>
        caseItem.id === caseId ? { ...caseItem, status: newStatus } : caseItem
      ));
    } catch (err) {
      console.error('Error updating status:', err);
      alert('Error al actualizar el estado');
    }
  };

  const handlePriorityChange = async (caseId, newPriority) => {
    try {
      await updateCaso(caseId, { priority: newPriority });
      setCases(cases.map(caseItem =>
        caseItem.id === caseId ? { ...caseItem, priority: newPriority } : caseItem
      ));
    } catch (err) {
      console.error('Error updating priority:', err);
      alert('Error al actualizar la prioridad');
    }
  };

  const handleDeleteCase = async (caseId) => {
    if (window.confirm('¿Está seguro de eliminar este caso?')) {
      try {
        await deleteCaso(caseId);
        setCases(cases.filter(caseItem => caseItem.id !== caseId));
        alert('Caso eliminado exitosamente');
      } catch (err) {
        console.error('Error deleting case:', err);
        alert('Error al eliminar el caso');
      }
    }
  };

  const handleViewDetails = async (caseItem) => {
    setSelectedCase(caseItem);
    setShowDetailsModal(true);
    
    // Cargar datos del usuario (reportante)
    if (caseItem.usuario_id) {
      try {
        const user = await getUserById(caseItem.usuario_id);
        setSelectedCaseUser(user);
      } catch (err) {
        console.error('Error loading user:', err);
        setSelectedCaseUser(null);
      }
    }
  };

  const closeDetailsModal = () => {
    setShowDetailsModal(false);
    setSelectedCase(null);
    setSelectedCaseUser(null);
  };
  
  const handleEdit = () => {
    if (selectedCase) {
      closeDetailsModal();
      navigate(`/admin/casos/${selectedCase.id}/editar`);
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return '#f44336';
      case 'medium': return '#ff9800';
      case 'low': return '#4caf50';
      default: return '#9e9e9e';
    }
  };

  const getPriorityLabel = (priority) => {
    switch (priority) {
      case 'high': return 'Alta';
      case 'medium': return 'Media';
      case 'low': return 'Baja';
      default: return 'Sin definir';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  if (loading) {
    return (
      <div className="case-management loading">
        <p>Cargando casos...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="case-management error">
        <p>{error}</p>
        <button onClick={loadCases}>Reintentar</button>
      </div>
    );
  }

  return (
    <div className="case-management">
      <div className="management-header">
        <h1>Gestión de Casos</h1>
        <button className="btn-primary" onClick={() => navigate('/admin/casos/nuevo')}>
          + Nuevo Caso
        </button>
      </div>

      <div className="management-filters">
        <input
          type="text"
          placeholder="Buscar por nombre o ubicación..."
          className="search-input"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <select
          className="filter-select"
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
        >
          <option value="all">Todos los estados</option>
          <option value="pendiente">Pendiente</option>
          <option value="activo">Activo</option>
          <option value="resuelto">Resuelto</option>
        </select>
        <select
          className="filter-select"
          value={filterPriority}
          onChange={(e) => setFilterPriority(e.target.value)}
        >
          <option value="all">Todas las prioridades</option>
          <option value="high">Alta</option>
          <option value="medium">Media</option>
          <option value="low">Baja</option>
        </select>
      </div>

      <div className="cases-grid">
        {filteredCases.length === 0 ? (
          <div className="no-cases">
            <p>No se encontraron casos</p>
          </div>
        ) : (
          filteredCases.map(caseItem => (
            <div key={caseItem.id} className="case-card-admin">
              <div className="case-card-header">
                <h3>{caseItem.PersonaDesaparecida?.nombre_completo || 'Sin nombre'}</h3>
                <div
                  className="priority-indicator"
                  style={{ backgroundColor: getPriorityColor(caseItem.priority) }}
                >
                  {getPriorityLabel(caseItem.priority)}
                </div>
              </div>
              <div className="case-card-body">
                <div className="case-info">
                  <p><strong>📍 Ubicación:</strong> {caseItem.lugar_desaparicion || 'N/A'}</p>
                  <p><strong>📅 Desaparición:</strong> {formatDate(caseItem.fecha_desaparicion)}</p>
                  <p><strong>👤 Reportante:</strong> {caseItem.reporterName || 'N/A'}</p>
                </div>
                <div className="case-controls">
                  <label>Estado:</label>
                  <select
                    value={caseItem.status}
                    onChange={(e) => handleStatusChange(caseItem.id, e.target.value)}
                    className="status-select"
                  >
                    <option value="pendiente">Pendiente</option>
                    <option value="activo">Activo</option>
                    <option value="resuelto">Resuelto</option>
                  </select>
                </div>
                <div className="case-controls">
                  <label>Prioridad:</label>
                  <select
                    value={caseItem.priority}
                    onChange={(e) => handlePriorityChange(caseItem.id, e.target.value)}
                    className="priority-select"
                  >
                    <option value="high">Alta</option>
                    <option value="medium">Media</option>
                    <option value="low">Baja</option>
                  </select>
                </div>
              </div>
              <div className="case-card-footer">
                <button 
                  className="btn-view"
                  onClick={() => handleViewDetails(caseItem)}
                >
                  👁️ Ver Detalles
                </button>
                <button
                  className="btn-delete"
                  onClick={() => handleDeleteCase(caseItem.id)}
                >
                  🗑️ Eliminar
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="cases-summary">
        <p>Total de casos: <strong>{filteredCases.length}</strong></p>
      </div>

      {/* Modal de Detalles del Caso */}
      {showDetailsModal && selectedCase && (
        <div className="modal-overlay" onClick={closeDetailsModal}>
          <div className="modal-container" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>📋 Detalles del Caso</h2>
              <button className="modal-close" onClick={closeDetailsModal}>✕</button>
            </div>
            
            <div className="modal-body">
              {/* Información Principal */}
              <section className="detail-section">
                <h3>📝 Información General</h3>
                <div className="detail-grid">
                  <div className="detail-item">
                    <span className="detail-label">ID del Caso:</span>
                    <span className="detail-value">#{selectedCase.id}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Estado:</span>
                    <span className={`detail-badge status-${selectedCase.status}`}>
                      {selectedCase.status?.charAt(0).toUpperCase() + selectedCase.status?.slice(1)}
                    </span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Prioridad:</span>
                    <span 
                      className="detail-badge"
                      style={{ backgroundColor: getPriorityColor(selectedCase.priority), color: 'white' }}
                    >
                      {getPriorityLabel(selectedCase.priority)}
                    </span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Fecha de Desaparición:</span>
                    <span className="detail-value">{formatDate(selectedCase.fecha_desaparicion)}</span>
                  </div>
                </div>
              </section>

              {/* Información de la Persona */}
              <section className="detail-section">
                <h3>👤 Datos de la Persona Desaparecida</h3>
                <div className="detail-grid">
                  <div className="detail-item full-width">
                    <span className="detail-label">Nombre Completo:</span>
                    <span className="detail-value">{selectedCase.PersonaDesaparecida?.nombre_completo || 'N/A'}</span>
                  </div>
                  {selectedCase.PersonaDesaparecida?.age && (
                    <div className="detail-item">
                      <span className="detail-label">Edad:</span>
                      <span className="detail-value">{selectedCase.PersonaDesaparecida.age} años</span>
                    </div>
                  )}
                  {selectedCase.PersonaDesaparecida?.gender && (
                    <div className="detail-item">
                      <span className="detail-label">Género:</span>
                      <span className="detail-value">{selectedCase.PersonaDesaparecida.gender}</span>
                    </div>
                  )}
                  {selectedCase.PersonaDesaparecida?.altura && (
                    <div className="detail-item">
                      <span className="detail-label">Estatura:</span>
                      <span className="detail-value">{selectedCase.PersonaDesaparecida.altura} m</span>
                    </div>
                  )}
                  {selectedCase.PersonaDesaparecida?.peso && (
                    <div className="detail-item">
                      <span className="detail-label">Peso:</span>
                      <span className="detail-value">{selectedCase.PersonaDesaparecida.peso} kg</span>
                    </div>
                  )}
                  {selectedCase.PersonaDesaparecida?.skinColor && (
                    <div className="detail-item">
                      <span className="detail-label">Color de Piel:</span>
                      <span className="detail-value">{selectedCase.PersonaDesaparecida.skinColor}</span>
                    </div>
                  )}
                  {selectedCase.PersonaDesaparecida?.hairColor && (
                    <div className="detail-item">
                      <span className="detail-label">Color de Cabello:</span>
                      <span className="detail-value">{selectedCase.PersonaDesaparecida.hairColor}</span>
                    </div>
                  )}
                  {selectedCase.PersonaDesaparecida?.eyeColor && (
                    <div className="detail-item">
                      <span className="detail-label">Color de Ojos:</span>
                      <span className="detail-value">{selectedCase.PersonaDesaparecida.eyeColor}</span>
                    </div>
                  )}
                </div>
              </section>

              {/* Información de Desaparición */}
              <section className="detail-section">
                <h3>📍 Información de la Desaparición</h3>
                <div className="detail-grid">
                  <div className="detail-item full-width">
                    <span className="detail-label">Lugar de Desaparición:</span>
                    <span className="detail-value">{selectedCase.lugar_desaparicion || 'N/A'}</span>
                  </div>
                  {selectedCase.disappearanceTime && (
                    <div className="detail-item">
                      <span className="detail-label">Hora:</span>
                      <span className="detail-value">{selectedCase.disappearanceTime}</span>
                    </div>
                  )}
                  {selectedCase.lastSeenLocation && (
                    <div className="detail-item full-width">
                      <span className="detail-label">Último Lugar Visto:</span>
                      <span className="detail-value">{selectedCase.lastSeenLocation}</span>
                    </div>
                  )}
                  {selectedCase.PersonaDesaparecida?.clothing && (
                    <div className="detail-item full-width">
                      <span className="detail-label">Vestimenta:</span>
                      <span className="detail-value">{selectedCase.PersonaDesaparecida.clothing}</span>
                    </div>
                  )}
                  {selectedCase.PersonaDesaparecida?.senas_particulares && (
                    <div className="detail-item full-width">
                      <span className="detail-label">Señas Particulares:</span>
                      <span className="detail-value">{selectedCase.PersonaDesaparecida.senas_particulares}</span>
                    </div>
                  )}
                </div>
              </section>

              {/* Circunstancias */}
              {selectedCase.circumstances && (
                <section className="detail-section">
                  <h3>📄 Circunstancias de la Desaparición</h3>
                  <p className="detail-description">{selectedCase.circumstances}</p>
                </section>
              )}

              {/* Información de Contacto */}
              <section className="detail-section">
                <h3>📞 Usuario que Reportó el Caso</h3>
                <div className="detail-grid">
                  {selectedCaseUser ? (
                    <>
                      <div className="detail-item">
                        <span className="detail-label">Nombre:</span>
                        <span className="detail-value">{selectedCaseUser.nombre}</span>
                      </div>
                      <div className="detail-item">
                        <span className="detail-label">Email:</span>
                        <span className="detail-value">{selectedCaseUser.email}</span>
                      </div>
                      {selectedCaseUser.dni && (
                        <div className="detail-item">
                          <span className="detail-label">DNI:</span>
                          <span className="detail-value">{selectedCaseUser.dni}</span>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="detail-item full-width">
                      <span className="detail-label">Usuario:</span>
                      <span className="detail-value">Cargando...</span>
                    </div>
                  )}
                  {selectedCase.reporterName && (
                    <div className="detail-item">
                      <span className="detail-label">Nombre del Contacto:</span>
                      <span className="detail-value">{selectedCase.reporterName}</span>
                    </div>
                  )}
                  {selectedCase.relationship && (
                    <div className="detail-item">
                      <span className="detail-label">Parentesco:</span>
                      <span className="detail-value">{selectedCase.relationship}</span>
                    </div>
                  )}
                  {selectedCase.contactPhone && (
                    <div className="detail-item">
                      <span className="detail-label">Teléfono:</span>
                      <span className="detail-value">{selectedCase.contactPhone}</span>
                    </div>
                  )}
                  {selectedCase.contactEmail && (
                    <div className="detail-item">
                      <span className="detail-label">Email de Contacto:</span>
                      <span className="detail-value">{selectedCase.contactEmail}</span>
                    </div>
                  )}
                </div>
              </section>

              {/* Observaciones */}
              {selectedCase.observaciones && (
                <section className="detail-section">
                  <h3>📝 Observaciones</h3>
                  <p className="detail-description">{selectedCase.observaciones}</p>
                </section>
              )}

              {/* Si está resuelto, mostrar información de resolución */}
              {selectedCase.status === 'resuelto' && (
                <section className="detail-section resolution-section">
                  <h3>✅ Resolución del Caso</h3>
                  <div className="detail-grid">
                    {selectedCase.resolutionDate && (
                      <div className="detail-item">
                        <span className="detail-label">Fecha de Resolución:</span>
                        <span className="detail-value">{formatDate(selectedCase.resolutionDate)}</span>
                      </div>
                    )}
                    {selectedCase.resolutionNote && (
                      <div className="detail-item full-width">
                        <span className="detail-label">Nota:</span>
                        <span className="detail-value">{selectedCase.resolutionNote}</span>
                      </div>
                    )}
                  </div>
                </section>
              )}
            </div>

            <div className="modal-footer">
              <button className="btn-secondary" onClick={closeDetailsModal}>Cerrar</button>
              <button className="btn-primary" onClick={handleEdit}>✏️ Editar Caso</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CaseManagement;
