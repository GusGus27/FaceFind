import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import '../../styles/admin/CaseManagement.css';



const CaseManagement = () => {
  const navigate = useNavigate();

  const [cases, setCases] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedCase, setSelectedCase] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  useEffect(() => {
    // Simulación de casos con información detallada
    setCases([
      {
        id: 1,
        title: 'Persona desaparecida - Juan Carlos Méndez',
        status: 'activo',
        priority: 'high',
        reportDate: '2025-10-01',
        location: 'Ciudad de México',
        reporter: 'María López',
        personName: 'Juan Carlos Méndez García',
        age: 28,
        gender: 'Masculino',
        height: '1.75 m',
        weight: '70 kg',
        lastSeen: '2025-09-30, 18:00',
        lastSeenLocation: 'Av. Reforma 123, Col. Centro',
        clothing: 'Camisa azul, pantalón de mezclilla, tenis blancos',
        distinguishingFeatures: 'Tatuaje en el brazo derecho, cicatriz en la ceja izquierda',
        contactPhone: '55-1234-5678',
        contactEmail: 'maria.lopez@example.com',
        description: 'Juan Carlos salió de su trabajo el día 30 de septiembre y no regresó a casa. Su familia está muy preocupada.',
        updates: [
          { date: '2025-10-01', note: 'Caso reportado, se inició la búsqueda' },
          { date: '2025-10-02', note: 'Se revisaron cámaras de seguridad de la zona' },
          { date: '2025-10-03', note: 'Testigo reporta haberlo visto en la zona sur' }
        ]
      },
      {
        id: 2,
        title: 'Menor desaparecida - Ana Pérez Ramírez',
        status: 'activo',
        priority: 'urgent',
        reportDate: '2025-10-03',
        location: 'Guadalajara',
        reporter: 'Pedro Sánchez',
        personName: 'Ana Pérez Ramírez',
        age: 15,
        gender: 'Femenino',
        height: '1.60 m',
        weight: '55 kg',
        lastSeen: '2025-10-03, 07:30',
        lastSeenLocation: 'Cerca de su escuela, Calle Juárez 45',
        clothing: 'Uniforme escolar azul marino, mochila rosa',
        distinguishingFeatures: 'Cabello largo castaño, lentes',
        contactPhone: '33-9876-5432',
        contactEmail: 'pedro.sanchez@example.com',
        description: 'Ana salió de casa rumbo a la escuela y nunca llegó. Sus compañeros no la vieron ese día.',
        updates: [
          { date: '2025-10-03', note: 'Alerta Amber activada inmediatamente' },
          { date: '2025-10-04', note: 'Se entrevistó a compañeros de escuela' }
        ]
      },
      {
        id: 3,
        title: 'Adulto mayor - José Martínez López',
        status: 'resuelto',
        priority: 'medium',
        reportDate: '2025-09-25',
        location: 'Monterrey',
        reporter: 'Laura García',
        personName: 'José Martínez López',
        age: 72,
        gender: 'Masculino',
        height: '1.68 m',
        weight: '65 kg',
        lastSeen: '2025-09-25, 10:00',
        lastSeenLocation: 'Plaza Principal de Monterrey',
        clothing: 'Camisa blanca, pantalón café, sombrero',
        distinguishingFeatures: 'Padece Alzheimer, usa bastón',
        contactPhone: '81-5555-1234',
        contactEmail: 'laura.garcia@example.com',
        description: 'Don José salió a caminar por la plaza y se desorientó. Tiene problemas de memoria.',
        updates: [
          { date: '2025-09-25', note: 'Caso reportado, búsqueda iniciada' },
          { date: '2025-09-26', note: 'Encontrado en un parque cercano, está bien de salud' },
          { date: '2025-09-26', note: 'Reunido con su familia, caso cerrado exitosamente' }
        ],
        resolutionDate: '2025-09-26',
        resolutionNote: 'Encontrado sano y salvo, reunido con su familia'
      },
      {
        id: 4,
        title: 'Caso de extravío - Carmen Ruiz Flores',
        status: 'pendiente',
        priority: 'low',
        reportDate: '2025-09-30',
        location: 'Puebla',
        reporter: 'Roberto Torres',
        personName: 'Carmen Ruiz Flores',
        age: 35,
        gender: 'Femenino',
        height: '1.65 m',
        weight: '60 kg',
        lastSeen: '2025-09-29, 22:00',
        lastSeenLocation: 'Saliendo de una reunión laboral en Hotel Colonial',
        clothing: 'Traje negro, zapatillas, bolso marrón',
        distinguishingFeatures: 'Cabello corto negro, piercing en la nariz',
        contactPhone: '22-4444-9999',
        contactEmail: 'roberto.torres@example.com',
        description: 'Carmen no ha contestado llamadas desde hace dos días. Es inusual en ella.',
        updates: [
          { date: '2025-09-30', note: 'Caso reportado, pendiente de investigación' },
          { date: '2025-10-01', note: 'Se está verificando información con su trabajo' }
        ]
      }
    ]);
  }, []);

  const filteredCases = cases.filter(caseItem => {
    const matchesSearch = caseItem.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         caseItem.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || caseItem.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const handleStatusChange = (caseId, newStatus) => {
    setCases(cases.map(caseItem =>
      caseItem.id === caseId ? { ...caseItem, status: newStatus } : caseItem
    ));
  };

  const handlePriorityChange = (caseId, newPriority) => {
    setCases(cases.map(caseItem =>
      caseItem.id === caseId ? { ...caseItem, priority: newPriority } : caseItem
    ));
  };

  const handleDeleteCase = (caseId) => {
    if (window.confirm('¿Está seguro de eliminar este caso?')) {
      setCases(cases.filter(caseItem => caseItem.id !== caseId));
    }
  };

  const handleViewDetails = (caseItem) => {
    setSelectedCase(caseItem);
    setShowDetailsModal(true);
  };

  const closeDetailsModal = () => {
    setShowDetailsModal(false);
    setSelectedCase(null);
  };
  
  const handleEdit = () => {
  closeDetailsModal();
  navigate('/admin/casos/1/editar');
  };
  

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'urgent': return '#f44336';
      case 'high': return '#ff9800';
      case 'medium': return '#ffc107';
      case 'low': return '#4caf50';
      default: return '#9e9e9e';
    }
  };

  const getPriorityLabel = (priority) => {
    switch (priority) {
      case 'urgent': return 'Urgente';
      case 'high': return 'Alta';
      case 'medium': return 'Media';
      case 'low': return 'Baja';
      default: return 'Sin definir';
    }
  };

  return (
    <div className="case-management">
      <div className="management-header">
        <h1>Gestión de Casos</h1>
        <button className="btn-primary">+ Nuevo Caso</button>
      </div>

      <div className="management-filters">
        <input
          type="text"
          placeholder="Buscar por título o ubicación..."
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
          <option value="activo">Activo</option>
          <option value="pendiente">Pendiente</option>
          <option value="resuelto">Resuelto</option>
        </select>
      </div>

      <div className="cases-grid">
        {filteredCases.map(caseItem => (
          <div key={caseItem.id} className="case-card-admin">
            <div className="case-card-header">
              <h3>{caseItem.title}</h3>
              <div
                className="priority-indicator"
                style={{ backgroundColor: getPriorityColor(caseItem.priority) }}
              >
                {getPriorityLabel(caseItem.priority)}
              </div>
            </div>
            <div className="case-card-body">
              <div className="case-info">
                <p><strong>📍 Ubicación:</strong> {caseItem.location}</p>
                <p><strong>📅 Fecha:</strong> {caseItem.reportDate}</p>
                <p><strong>👤 Reportado por:</strong> {caseItem.reporter}</p>
              </div>
              <div className="case-controls">
                <label>Estado:</label>
                <select
                  value={caseItem.status}
                  onChange={(e) => handleStatusChange(caseItem.id, e.target.value)}
                  className="status-select"
                >
                  <option value="activo">Activo</option>
                  <option value="pendiente">Pendiente</option>
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
                  <option value="urgent">Urgente</option>
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
        ))}
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
                      {selectedCase.status.charAt(0).toUpperCase() + selectedCase.status.slice(1)}
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
                    <span className="detail-label">Fecha de Reporte:</span>
                    <span className="detail-value">{selectedCase.reportDate}</span>
                  </div>
                </div>
              </section>

              {/* Información de la Persona */}
              <section className="detail-section">
                <h3>👤 Datos de la Persona Desaparecida</h3>
                <div className="detail-grid">
                  <div className="detail-item full-width">
                    <span className="detail-label">Nombre Completo:</span>
                    <span className="detail-value">{selectedCase.personName}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Edad:</span>
                    <span className="detail-value">{selectedCase.age} años</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Género:</span>
                    <span className="detail-value">{selectedCase.gender}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Estatura:</span>
                    <span className="detail-value">{selectedCase.height}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Peso:</span>
                    <span className="detail-value">{selectedCase.weight}</span>
                  </div>
                </div>
              </section>

              {/* Información de Desaparición */}
              <section className="detail-section">
                <h3>📍 Información de la Desaparición</h3>
                <div className="detail-grid">
                  <div className="detail-item full-width">
                    <span className="detail-label">Última Vez Visto:</span>
                    <span className="detail-value">{selectedCase.lastSeen}</span>
                  </div>
                  <div className="detail-item full-width">
                    <span className="detail-label">Ubicación:</span>
                    <span className="detail-value">{selectedCase.lastSeenLocation}</span>
                  </div>
                  <div className="detail-item full-width">
                    <span className="detail-label">Vestimenta:</span>
                    <span className="detail-value">{selectedCase.clothing}</span>
                  </div>
                  <div className="detail-item full-width">
                    <span className="detail-label">Señas Particulares:</span>
                    <span className="detail-value">{selectedCase.distinguishingFeatures}</span>
                  </div>
                </div>
              </section>

              {/* Descripción */}
              <section className="detail-section">
                <h3>📄 Descripción del Caso</h3>
                <p className="detail-description">{selectedCase.description}</p>
              </section>

              {/* Información de Contacto */}
              <section className="detail-section">
                <h3>📞 Contacto del Reportante</h3>
                <div className="detail-grid">
                  <div className="detail-item">
                    <span className="detail-label">Nombre:</span>
                    <span className="detail-value">{selectedCase.reporter}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Teléfono:</span>
                    <span className="detail-value">{selectedCase.contactPhone}</span>
                  </div>
                  <div className="detail-item full-width">
                    <span className="detail-label">Email:</span>
                    <span className="detail-value">{selectedCase.contactEmail}</span>
                  </div>
                </div>
              </section>

              {/* Actualizaciones */}
              <section className="detail-section">
                <h3>🔄 Actualizaciones del Caso</h3>
                <div className="updates-timeline">
                  {selectedCase.updates.map((update, index) => (
                    <div key={index} className="timeline-item">
                      <div className="timeline-date">{update.date}</div>
                      <div className="timeline-content">{update.note}</div>
                    </div>
                  ))}
                </div>
              </section>

              {/* Si está resuelto, mostrar información de resolución */}
              {selectedCase.status === 'resuelto' && selectedCase.resolutionDate && (
                <section className="detail-section resolution-section">
                  <h3>✅ Resolución del Caso</h3>
                  <div className="detail-grid">
                    <div className="detail-item">
                      <span className="detail-label">Fecha de Resolución:</span>
                      <span className="detail-value">{selectedCase.resolutionDate}</span>
                    </div>
                    <div className="detail-item full-width">
                      <span className="detail-label">Nota:</span>
                      <span className="detail-value">{selectedCase.resolutionNote}</span>
                    </div>
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
