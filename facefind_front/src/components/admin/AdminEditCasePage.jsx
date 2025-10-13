import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Save, X, Upload, Trash2, AlertCircle, CheckCircle, 
  Clock, Image as ImageIcon, User, MapPin, Calendar,
  FileText, AlertTriangle, ArrowLeft, Shield,
  Archive, RefreshCw
} from 'lucide-react';
import { getCasoById, updateCaso } from '../../services/casoService';
import { getFotosByCaso } from '../../services/fotoService';
import PhotoManager from '../fotos/PhotoManager';
import '../../styles/cases/EditCasePage.css';

/**
 * Componente de edición de casos para ADMINISTRADORES
 * Sin selector de casos: carga directo por caseId (ruta)
 */
const AdminEditCasePage = () => {
  const { caseId } = useParams();
  const navigate = useNavigate();

  // Estados principales
  const [caseInfo, setCaseInfo] = useState(null);

  // Estados del formulario
  const [formData, setFormData] = useState({
    // Información de la persona
    nombre_completo: '',
    edad: '',
    fecha_nacimiento: '',
    gender: '',
    altura: '',
    peso: '',
    skinColor: '',
    hairColor: '',
    eyeColor: '',
    senas_particulares: '',
    clothing: '',
    
    // Información del caso
    fecha_desaparicion: '',
    lugar_desaparicion: '',
    disappearanceTime: '',
    lastSeenLocation: '',
    lastSeen: '',
    circumstances: '',
    description: '',
    
    // Contacto
    reporterName: '',
    relationship: '',
    contactPhone: '',
    contactEmail: '',
    additionalContact: '',
    
    // Campos adicionales para admin
    estado: 'pendiente',
    prioridad: 'medium',
    observaciones: ''
  });

  const [photos, setPhotos] = useState([]);
  const [photosLoading, setPhotosLoading] = useState(false);
  const [newPhotos, setNewPhotos] = useState([]);
  const [photosToDelete, setPhotosToDelete] = useState([]);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [originalData, setOriginalData] = useState(null);
  const [changeHistory, setChangeHistory] = useState([]);

  // Estado para re-procesamiento
  const [isReprocessing, setIsReprocessing] = useState(false);

  // Cargar datos del caso al montar / cambiar caseId
  useEffect(() => {
    if (!caseId) return;
    loadCaseData(caseId);
  }, [caseId]);

  // Detectar cambios
  useEffect(() => {
    if (originalData) {
      const changed =
        JSON.stringify(formData) !== JSON.stringify(originalData) ||
        newPhotos.length > 0 ||
        photosToDelete.length > 0;
      setHasChanges(changed);
    }
  }, [formData, newPhotos, photosToDelete, originalData]);

  const loadCaseData = async (id) => {
    setIsLoading(true);
    try {
      const caso = await getCasoById(id);
      
      if (!caso) {
        setErrors({ general: 'Caso no encontrado' });
        setTimeout(() => navigate('/admin'), 2000);
        return;
      }

      const persona = caso.PersonaDesaparecida || {};
      
      // Información del caso
      setCaseInfo({
        numCaso: `CASO-2025-${id}`,
        usuario: caso.reporterName || 'N/A',
        email: caso.contactEmail || 'N/A',
        fechaRegistro: caso.created_at || new Date().toISOString()
      });

      // Mapear TODOS los datos del backend al formulario
      const mappedData = {
        // Información de la persona
        nombre_completo: persona.nombre_completo || '',
        edad: persona.age || '',
        fecha_nacimiento: persona.fecha_nacimiento || '',
        gender: persona.gender || '',
        altura: persona.altura || '',
        peso: persona.peso || '',
        skinColor: persona.skinColor || '',
        hairColor: persona.hairColor || '',
        eyeColor: persona.eyeColor || '',
        senas_particulares: persona.senas_particulares || '',
        clothing: persona.clothing || '',
        
        // Información del caso
        fecha_desaparicion: caso.fecha_desaparicion || '',
        lugar_desaparicion: caso.lugar_desaparicion || '',
        disappearanceTime: caso.disappearanceTime || '',
        lastSeenLocation: caso.lastSeenLocation || '',
        lastSeen: caso.lastSeen || '',
        circumstances: caso.circumstances || '',
        description: caso.description || '',
        
        // Contacto
        reporterName: caso.reporterName || '',
        relationship: caso.relationship || '',
        contactPhone: caso.contactPhone || '',
        contactEmail: caso.contactEmail || '',
        additionalContact: caso.additionalContact || '',
        
        // Admin fields
        estado: caso.status || 'pendiente',
        prioridad: caso.priority || 'medium',
        observaciones: caso.observaciones || ''
      };

      setFormData(mappedData);
      setOriginalData(mappedData);
      
      // Cargar fotos del caso
      await loadPhotos(id);
      
      console.log('✅ Caso cargado (Admin):', caso);
      console.log('✅ FormData mapeado:', mappedData);
    } catch (error) {
      console.error('❌ Error cargando caso:', error);
      setErrors({ general: 'Error al cargar el caso' });
    } finally {
      setIsLoading(false);
    }
  };

  const loadPhotos = async (id) => {
    console.log('📸 loadPhotos iniciado para caso (Admin):', id);
    setPhotosLoading(true);
    try {
      const fotosData = await getFotosByCaso(id);
      console.log('✅ Fotos cargadas (Admin):', fotosData);
      console.log('📊 Número de fotos:', fotosData?.length);
      setPhotos(fotosData);
    } catch (error) {
      console.error('❌ Error cargando fotos:', error);
      setErrors(prev => ({
        ...prev,
        photos: 'Error al cargar las fotos'
      }));
    } finally {
      setPhotosLoading(false);
    }
  };

  const handlePhotoUpdated = () => {
    // Recargar fotos después de actualizar/eliminar
    console.log('🔄 Recargando fotos...');
    loadPhotos(caseId);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handlePhotoUpload = (e) => {
    const files = Array.from(e.target.files);
    const totalPhotos = photos.length + newPhotos.length - photosToDelete.length + files.length;

    if (totalPhotos > 10) {
      setErrors(prev => ({ ...prev, photos: 'Máximo 10 fotografías permitidas' }));
      return;
    }

    const validFiles = files.filter(file => file.type.startsWith('image/') && file.size <= 5 * 1024 * 1024);
    if (validFiles.length !== files.length) {
      setErrors(prev => ({ ...prev, photos: 'Solo se permiten imágenes menores a 5MB' }));
    }

    const newPhotoObjects = validFiles.map((file, index) => ({
      id: `new-${Date.now()}-${index}`,
      file,
      url: URL.createObjectURL(file),
      tipo: 'Frontal',
      isNew: true,
      procesado: false
    }));

    setNewPhotos(prev => [...prev, ...newPhotoObjects]);
    setErrors(prev => ({ ...prev, photos: '' }));
  };

  const handleDeletePhoto = (photo) => {
    const remainingPhotos = photos.length + newPhotos.length - photosToDelete.length - 1;

    if (remainingPhotos < 3) {
      setErrors(prev => ({ ...prev, photos: 'Debe mantener al menos 3 fotografías' }));
      return;
    }

    if (photo.isNew) {
      setNewPhotos(prev => prev.filter(p => p.id !== photo.id));
      URL.revokeObjectURL(photo.url);
    } else {
      setPhotosToDelete(prev => [...prev, photo.id]);
    }
    setErrors(prev => ({ ...prev, photos: '' }));
  };

  const handlePhotoTypeChange = (photoId, newType) => {
    if (newPhotos.find(p => p.id === photoId)) {
      setNewPhotos(prev => prev.map(p => (p.id === photoId ? { ...p, tipo: newType } : p)));
    }
  };

  const handleReprocessEmbeddings = async () => {
    if (!window.confirm('¿Deseas re-procesar todos los embeddings de este caso? Esto puede tomar algunos minutos.')) {
      return;
    }
    setIsReprocessing(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 3000));
      setPhotos(prev => prev.map(p => ({ ...p, procesado: true })));
      alert('Embeddings re-procesados exitosamente');
    } catch (error) {
      console.error('Error re-procesando:', error);
      alert('Error al re-procesar embeddings');
    } finally {
      setIsReprocessing(false);
    }
  };

  const handleChangeStatus = (newStatus) => {
    if (window.confirm(`¿Cambiar estado del caso a "${newStatus}"?`)) {
      setFormData(prev => ({ ...prev, estado: newStatus }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.nombre_completo?.trim()) {
      newErrors.nombre_completo = 'El nombre es requerido';
    }
    
    if (!formData.edad || formData.edad < 0 || formData.edad > 120) {
      newErrors.edad = 'La edad debe estar entre 0 y 120 años';
    }
    
    if (!formData.fecha_desaparicion) {
      newErrors.fecha_desaparicion = 'La fecha de desaparición es requerida';
    }
    
    if (!formData.lugar_desaparicion?.trim()) {
      newErrors.lugar_desaparicion = 'La última ubicación es requerida';
    }

    // Validación de fotos deshabilitada temporalmente
    // const totalPhotos = photos.length + newPhotos.length - photosToDelete.length;
    // if (totalPhotos < 3) newErrors.photos = 'Debe tener al menos 3 fotografías';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    if (!hasChanges) {
      setErrors({ general: 'No hay cambios para guardar' });
      return;
    }

    setIsSaving(true);
    try {
      // Obtener solo los campos que cambiaron
      const updates = {};
      Object.keys(formData).forEach(key => {
        if (originalData[key] !== formData[key]) {
          updates[key] = formData[key];
        }
      });

      // Llamar API para actualizar
      await updateCaso(caseId, updates);

      setShowSuccess(true);
      setHasChanges(false);
      setOriginalData(formData);
      setNewPhotos([]);
      setPhotosToDelete([]);

      setTimeout(() => {
        setShowSuccess(false);
        navigate('/admin');
      }, 2000);
    } catch (error) {
      setErrors({ general: error.message || 'Error al guardar los cambios' });
      console.error('❌ Error al guardar:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const getChangeSummary = () => {
    const changes = [];
    Object.keys(formData).forEach(key => {
      if (originalData[key] !== formData[key]) {
        changes.push(`Modificó ${key}`);
      }
    });
    if (newPhotos.length > 0) changes.push(`Agregó ${newPhotos.length} fotografía(s)`);
    if (photosToDelete.length > 0) changes.push(`Eliminó ${photosToDelete.length} fotografía(s)`);
    return changes;
  };

  const handleCancel = () => {
    if (hasChanges) {
      if (window.confirm('Tienes cambios sin guardar. ¿Deseas salir?')) {
        navigate(-1);
      }
    } else {
      navigate(-1);
    }
  };

  if (isLoading) {
    return (
      <div className="loading-container">
        <div className="spinner-large"></div>
        <p>Cargando información del caso...</p>
      </div>
    );
  }

  const currentPhotos = photos.filter(p => !photosToDelete.includes(p.id));
  const allPhotos = [...currentPhotos, ...newPhotos];

  return (
    <div className="edit-case-page admin-mode">
      <div className="edit-case-container">
        {/* Header Admin */}
        <div className="edit-header admin-header">
          <button onClick={() => navigate(-1)} className="back-button">
            <ArrowLeft size={20} />
            Volver
          </button>

          <div className="header-title">
            <div className="admin-badge">
              <Shield size={16} />
              Administrador
            </div>
            <h1>Editar Caso</h1>
            <span className="case-number">{caseInfo?.numCaso}</span>
          </div>

          <div className="header-actions">
            <button
              onClick={handleReprocessEmbeddings}
              className="reprocess-button"
              disabled={isReprocessing}
              title="Re-procesar embeddings"
            >
              <RefreshCw size={18} className={isReprocessing ? 'spinning' : ''} />
              {isReprocessing ? 'Procesando...' : 'Re-procesar'}
            </button>

            <button
              onClick={() => setShowHistory(!showHistory)}
              className="history-button"
            >
              <Clock size={18} />
              Historial
            </button>
          </div>
        </div>

        {/* Info del caso y usuario */}
        {caseInfo && (
          <div className="case-info-banner">
            <div className="info-item">
              <User size={16} />
              <span>Usuario: <strong>{caseInfo.usuario}</strong></span>
            </div>
            <div className="info-item">
              <Calendar size={16} />
              <span>Registrado: {new Date(caseInfo.fechaRegistro).toLocaleDateString('es-PE')}</span>
            </div>
            <div className="info-item">
              <span>Email: {caseInfo.email}</span>
            </div>
          </div>
        )}

        {/* Notificaciones */}
        {showSuccess && (
          <div className="alert alert-success">
            <CheckCircle size={20} />
            <span>Los cambios se guardaron exitosamente. Los embeddings serán re-procesados automáticamente.</span>
            <button onClick={() => setShowSuccess(false)}>
              <X size={16} />
            </button>
          </div>
        )}

        {errors.general && (
          <div className="alert alert-error">
            <AlertCircle size={20} />
            <span>{errors.general}</span>
            <button onClick={() => setErrors({})}>
              <X size={16} />
            </button>
          </div>
        )}

        {hasChanges && (
          <div className="alert alert-warning">
            <AlertTriangle size={20} />
            <span>Tienes cambios sin guardar</span>
          </div>
        )}

        <div className="edit-content">
          <form onSubmit={handleSubmit} className="edit-form">
            {/* Panel de Control Administrativo */}
            <div className="form-section admin-section">
              <div className="section-header">
                <Shield size={20} />
                <h2>Control Administrativo</h2>
              </div>

              <div className="admin-controls">
                <div className="form-group">
                  <label htmlFor="estado">Estado del Caso</label>
                  <select
                    id="estado"
                    name="estado"
                    value={formData.estado || ''}
                    onChange={handleInputChange}
                    className="admin-select"
                  >
                    <option value="pendiente">Pendiente</option>
                    <option value="activo">Activo</option>
                    <option value="resuelto">Resuelto</option>
                    <option value="cancelado">Cancelado</option>
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="prioridad">Prioridad</label>
                  <select
                    id="prioridad"
                    name="prioridad"
                    value={formData.prioridad || ''}
                    onChange={handleInputChange}
                    className="admin-select"
                  >
                    <option value="low">Baja</option>
                    <option value="medium">Media</option>
                    <option value="high">Alta</option>
                    <option value="urgent">Urgente</option>
                  </select>
                </div>

                <div className="quick-actions">
                  <button
                    type="button"
                    onClick={() => handleChangeStatus('Resuelto')}
                    className="quick-btn success"
                  >
                    <CheckCircle size={16} />
                    Marcar Resuelto
                  </button>

                  <button
                    type="button"
                    onClick={() => handleChangeStatus('Cancelado')}
                    className="quick-btn danger"
                  >
                    <Archive size={16} />
                    Cancelar Caso
                  </button>
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="notas">Notas Administrativas</label>
                <textarea
                  id="notas"
                  name="notas"
                  value={formData.notas}
                  onChange={handleInputChange}
                  rows="3"
                  placeholder="Notas internas visibles solo para administradores..."
                  className="admin-textarea"
                />
              </div>
            </div>

            {/* Información Personal */}
            <div className="form-section">
              <div className="section-header">
                <User size={20} />
                <h2>Información Personal</h2>
              </div>

              <div className="form-grid">
                <div className="form-group">
                  <label htmlFor="nombre_completo">
                    Nombre Completo <span className="required">*</span>
                  </label>
                  <input
                    type="text"
                    id="nombre_completo"
                    name="nombre_completo"
                    value={formData.nombre_completo || ''}
                    onChange={handleInputChange}
                    className={errors.nombre_completo ? 'error' : ''}
                  />
                  {errors.nombre_completo && <span className="error-message">{errors.nombre_completo}</span>}
                </div>

                <div className="form-group">
                  <label htmlFor="edad">
                    Edad <span className="required">*</span>
                  </label>
                  <input
                    type="number"
                    id="edad"
                    name="edad"
                    value={formData.edad}
                    onChange={handleInputChange}
                    min="0"
                    max="120"
                    className={errors.edad ? 'error' : ''}
                  />
                  {errors.edad && <span className="error-message">{errors.edad}</span>}
                </div>

                <div className="form-group">
                  <label htmlFor="fecha_nacimiento">Fecha de Nacimiento</label>
                  <input
                    type="date"
                    id="fecha_nacimiento"
                    name="fecha_nacimiento"
                    value={formData.fecha_nacimiento || ''}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="fecha_desaparicion">
                    Fecha de Desaparición <span className="required">*</span>
                  </label>
                  <input
                    type="date"
                    id="fecha_desaparicion"
                    name="fecha_desaparicion"
                    value={formData.fecha_desaparicion || ''}
                    onChange={handleInputChange}
                    max={new Date().toISOString().split('T')[0]}
                    className={errors.fecha_desaparicion ? 'error' : ''}
                  />
                  {errors.fecha_desaparicion && <span className="error-message">{errors.fecha_desaparicion}</span>}
                </div>
              </div>
            </div>

            {/* Características Físicas */}
            <div className="form-section">
              <div className="section-header">
                <FileText size={20} />
                <h2>Características Físicas</h2>
              </div>

              <div className="form-group">
                <label htmlFor="senas_particulares">
                  Descripción Detallada
                </label>
                <textarea
                  id="senas_particulares"
                  name="senas_particulares"
                  value={formData.senas_particulares || ''}
                  onChange={handleInputChange}
                  rows="4"
                  placeholder="Estatura, complexión, color de cabello, ojos, señas particulares, etc."
                  className={errors.senas_particulares ? 'error' : ''}
                />
                {errors.senas_particulares && <span className="error-message">{errors.senas_particulares}</span>}
              </div>
            </div>

            {/* Ubicación y Circunstancias */}
            <div className="form-section">
              <div className="section-header">
                <MapPin size={20} />
                <h2>Ubicación y Circunstancias</h2>
              </div>

              <div className="form-group">
                <label htmlFor="lugar_desaparicion">
                  Última Ubicación Conocida <span className="required">*</span>
                </label>
                <input
                  type="text"
                  id="lugar_desaparicion"
                  name="lugar_desaparicion"
                  value={formData.lugar_desaparicion || ''}
                  onChange={handleInputChange}
                  placeholder="Dirección, distrito, ciudad"
                  className={errors.lugar_desaparicion ? 'error' : ''}
                />
                {errors.lugar_desaparicion && <span className="error-message">{errors.lugar_desaparicion}</span>}
              </div>

              <div className="form-grid">
                <div className="form-group">
                  <label htmlFor="disappearanceTime">Hora de Desaparición</label>
                  <input
                    type="time"
                    id="disappearanceTime"
                    name="disappearanceTime"
                    value={formData.disappearanceTime || ''}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="lastSeenLocation">Último Lugar Visto</label>
                  <input
                    type="text"
                    id="lastSeenLocation"
                    name="lastSeenLocation"
                    value={formData.lastSeenLocation || ''}
                    onChange={handleInputChange}
                    placeholder="Ubicación específica"
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="lastSeen">Última vez visto/a</label>
                <textarea
                  id="lastSeen"
                  name="lastSeen"
                  value={formData.lastSeen || ''}
                  onChange={handleInputChange}
                  rows="2"
                  placeholder="Descripción de la última vez que se le vio"
                />
              </div>

              <div className="form-group">
                <label htmlFor="circumstances">
                  Descripción de las Circunstancias
                </label>
                <textarea
                  id="circumstances"
                  name="circumstances"
                  value={formData.circumstances || ''}
                  onChange={handleInputChange}
                  rows="4"
                  placeholder="Describa las circunstancias de la desaparición"
                />
              </div>

              <div className="form-group">
                <label htmlFor="description">Descripción Adicional</label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description || ''}
                  onChange={handleInputChange}
                  rows="3"
                  placeholder="Cualquier información adicional relevante"
                />
              </div>
            </div>

            {/* Información de Contacto */}
            <div className="form-section">
              <div className="section-header">
                <User size={20} />
                <h2>Información de Contacto</h2>
              </div>

              <div className="form-grid">
                <div className="form-group">
                  <label htmlFor="reporterName">Nombre del Reportante</label>
                  <input
                    type="text"
                    id="reporterName"
                    name="reporterName"
                    value={formData.reporterName || ''}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="relationship">Parentesco</label>
                  <input
                    type="text"
                    id="relationship"
                    name="relationship"
                    value={formData.relationship || ''}
                    onChange={handleInputChange}
                    placeholder="Ej: Madre, Hermano, Amigo"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="contactPhone">Teléfono de Contacto</label>
                  <input
                    type="tel"
                    id="contactPhone"
                    name="contactPhone"
                    value={formData.contactPhone || ''}
                    onChange={handleInputChange}
                    placeholder="+51 999 888 777"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="contactEmail">Email de Contacto</label>
                  <input
                    type="email"
                    id="contactEmail"
                    name="contactEmail"
                    value={formData.contactEmail || ''}
                    onChange={handleInputChange}
                    placeholder="email@ejemplo.com"
                  />
                </div>

                <div className="form-group full-width">
                  <label htmlFor="additionalContact">Contacto Adicional</label>
                  <textarea
                    id="additionalContact"
                    name="additionalContact"
                    value={formData.additionalContact || ''}
                    onChange={handleInputChange}
                    rows="2"
                    placeholder="Otros números telefónicos o formas de contacto"
                  />
                </div>
              </div>
            </div>

            {/* Fotografías */}
            <div className="form-section">
              <div className="section-header">
                <ImageIcon size={20} />
                <h2>Fotografías de Referencia</h2>
                <span className="photos-count">
                  {photos.length} foto{photos.length !== 1 ? 's' : ''}
                </span>
              </div>

              {photosLoading ? (
                <div className="photos-loading">
                  <div className="spinner"></div>
                  <p>Cargando fotografías...</p>
                </div>
              ) : (
                <PhotoManager 
                  fotos={photos} 
                  casoId={caseId}
                  onPhotoUpdated={handlePhotoUpdated}
                />
              )}
            </div>

            {/* Botones */}
            <div className="form-actions">
              <button
                type="button"
                onClick={handleCancel}
                className="btn btn-secondary"
                disabled={isSaving}
              >
                <X size={18} />
                Cancelar
              </button>

              <button
                type="submit"
                className="btn btn-primary"
                disabled={isSaving || !hasChanges}
              >
                {isSaving ? (
                  <>
                    <div className="spinner-small"></div>
                    Guardando...
                  </>
                ) : (
                  <>
                    <Save size={18} />
                    Guardar Cambios
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Historial */}
          {showHistory && (
            <div className="history-panel">
              <div className="history-header">
                <h3>Historial de Cambios</h3>
                <button onClick={() => setShowHistory(false)}>
                  <X size={18} />
                </button>
              </div>

              <div className="history-list">
                {changeHistory.map((entry, index) => (
                  <div key={index} className="history-entry">
                    <div className="history-date">
                      <Calendar size={16} />
                      {new Date(entry.fecha).toLocaleString('es-PE')}
                    </div>
                    <div className="history-user">
                      <User size={16} />
                      {entry.usuario}
                    </div>
                    <div className="history-action">{entry.accion}</div>
                    <ul className="history-changes">
                      {entry.cambios.map((cambio, i) => (
                        <li key={i}>{cambio}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminEditCasePage;
