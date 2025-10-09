import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Save, X, Upload, Trash2, AlertCircle, CheckCircle, 
  Clock, Image as ImageIcon, User, MapPin, Calendar,
  FileText, AlertTriangle, ArrowLeft, Shield,
  Archive, RefreshCw
} from 'lucide-react';
import './EditCasePage.css';

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
    nombre: '',
    edad: '',
    fechaNacimiento: '',
    fechaDesaparicion: '',
    caracteristicasFisicas: '',
    ultimaUbicacion: '',
    descripcionCircunstancias: '',
    contacto: '',
    telefonoContacto: '',
    // Campos adicionales para admin
    estado: 'Activo',
    prioridad: 'Media',
    notas: ''
  });

  const [photos, setPhotos] = useState([]);
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
      // Simulación de carga
      await new Promise(resolve => setTimeout(resolve, 500));

      const mockCaseInfo = {
        numCaso: `CASO-2025-${id}`,
        usuario: 'Juan Pérez',
        email: 'juan.perez@example.com',
        fechaRegistro: '2025-09-15T10:00:00'
      };

      const mockData = {
        nombre: 'María González Pérez',
        edad: 25,
        fechaNacimiento: '1999-03-15',
        fechaDesaparicion: '2025-09-10',
        caracteristicasFisicas: 'Estatura media (1.65m), cabello castaño largo, ojos marrones, lunar en mejilla izquierda',
        ultimaUbicacion: 'Lima, Perú - Av. Arequipa 1234',
        descripcionCircunstancias: 'Salió de su casa el día 10 de septiembre a las 8:00 AM hacia su trabajo y no regresó.',
        contacto: 'Juan Pérez',
        telefonoContacto: '+51 999 888 777',
        estado: 'Activo',
        prioridad: 'Alta',
        notas: ''
      };

      const mockPhotos = [
        { id: 1, url: 'https://via.placeholder.com/300', tipo: 'Frontal', fecha: '2025-09-15', procesado: true },
        { id: 2, url: 'https://via.placeholder.com/300', tipo: 'Perfil_Der', fecha: '2025-09-15', procesado: true },
        { id: 3, url: 'https://via.placeholder.com/300', tipo: 'Perfil_Izq', fecha: '2025-09-15', procesado: true }
      ];

      const mockHistory = [
        {
          fecha: '2025-09-15T10:00:00',
          usuario: 'Juan Pérez (Usuario)',
          accion: 'Creación del caso',
          cambios: ['Caso creado inicialmente']
        },
        {
          fecha: '2025-09-20T14:30:00',
          usuario: 'Juan Pérez (Usuario)',
          accion: 'Actualización de información',
          cambios: ['Modificó última ubicación', 'Actualizó circunstancias']
        },
        {
          fecha: '2025-09-25T16:45:00',
          usuario: 'Admin - Carlos Rodríguez',
          accion: 'Validación administrativa',
          cambios: ['Cambió prioridad a Alta', 'Agregó notas internas']
        }
      ];

      setCaseInfo(mockCaseInfo);
      setFormData(mockData);
      setOriginalData(mockData);
      setPhotos(mockPhotos);
      setChangeHistory(mockHistory);
    } catch (error) {
      console.error('Error cargando caso:', error);
    } finally {
      setIsLoading(false);
    }
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

    if (!formData.nombre.trim()) newErrors.nombre = 'El nombre es requerido';
    if (!formData.edad || formData.edad < 0 || formData.edad > 120)
      newErrors.edad = 'La edad debe estar entre 0 y 120 años';
    if (!formData.fechaDesaparicion) newErrors.fechaDesaparicion = 'La fecha de desaparición es requerida';
    if (!formData.caracteristicasFisicas.trim() || formData.caracteristicasFisicas.length < 20)
      newErrors.caracteristicasFisicas = 'Las características físicas deben tener al menos 20 caracteres';
    if (!formData.ultimaUbicacion.trim()) newErrors.ultimaUbicacion = 'La última ubicación es requerida';

    const totalPhotos = photos.length + newPhotos.length - photosToDelete.length;
    if (totalPhotos < 3) newErrors.photos = 'Debe tener al menos 3 fotografías';

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
      await new Promise(resolve => setTimeout(resolve, 1500));
      console.log('Datos a guardar (Admin):', {
        formData,
        newPhotos: newPhotos.map(p => ({ file: p.file, tipo: p.tipo })),
        photosToDelete,
        caseInfo
      });

      setShowSuccess(true);
      setHasChanges(false);
      setOriginalData(formData);
      setNewPhotos([]);
      setPhotosToDelete([]);

      setChangeHistory(prev => [{
        fecha: new Date().toISOString(),
        usuario: 'Admin - Carlos Rodríguez',
        accion: 'Actualización administrativa',
        cambios: getChangeSummary()
      }, ...prev]);

      setTimeout(() => setShowSuccess(false), 5000);
    } catch (error) {
      setErrors({ general: 'Error al guardar los cambios. Intenta nuevamente.' });
      console.error('Error:', error);
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
                    value={formData.estado}
                    onChange={handleInputChange}
                    className="admin-select"
                  >
                    <option value="Activo">Activo</option>
                    <option value="Pendiente">Pendiente</option>
                    <option value="Resuelto">Resuelto</option>
                    <option value="Cancelado">Cancelado</option>
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="prioridad">Prioridad</label>
                  <select
                    id="prioridad"
                    name="prioridad"
                    value={formData.prioridad}
                    onChange={handleInputChange}
                    className="admin-select"
                  >
                    <option value="Baja">Baja</option>
                    <option value="Media">Media</option>
                    <option value="Alta">Alta</option>
                    <option value="Crítica">Crítica</option>
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
                  <label htmlFor="nombre">
                    Nombre Completo <span className="required">*</span>
                  </label>
                  <input
                    type="text"
                    id="nombre"
                    name="nombre"
                    value={formData.nombre}
                    onChange={handleInputChange}
                    className={errors.nombre ? 'error' : ''}
                  />
                  {errors.nombre && <span className="error-message">{errors.nombre}</span>}
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
                  <label htmlFor="fechaNacimiento">Fecha de Nacimiento</label>
                  <input
                    type="date"
                    id="fechaNacimiento"
                    name="fechaNacimiento"
                    value={formData.fechaNacimiento}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="fechaDesaparicion">
                    Fecha de Desaparición <span className="required">*</span>
                  </label>
                  <input
                    type="date"
                    id="fechaDesaparicion"
                    name="fechaDesaparicion"
                    value={formData.fechaDesaparicion}
                    onChange={handleInputChange}
                    max={new Date().toISOString().split('T')[0]}
                    className={errors.fechaDesaparicion ? 'error' : ''}
                  />
                  {errors.fechaDesaparicion && <span className="error-message">{errors.fechaDesaparicion}</span>}
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
                <label htmlFor="caracteristicasFisicas">
                  Descripción Detallada <span className="required">*</span>
                </label>
                <textarea
                  id="caracteristicasFisicas"
                  name="caracteristicasFisicas"
                  value={formData.caracteristicasFisicas}
                  onChange={handleInputChange}
                  rows="4"
                  placeholder="Estatura, complexión, color de cabello, ojos, señas particulares, etc."
                  className={errors.caracteristicasFisicas ? 'error' : ''}
                />
                <div className="textarea-footer">
                  <span className={`char-count ${formData.caracteristicasFisicas.length < 20 ? 'warning' : ''}`}>
                    {formData.caracteristicasFisicas.length} caracteres (mínimo 20)
                  </span>
                </div>
                {errors.caracteristicasFisicas && <span className="error-message">{errors.caracteristicasFisicas}</span>}
              </div>
            </div>

            {/* Ubicación y Circunstancias */}
            <div className="form-section">
              <div className="section-header">
                <MapPin size={20} />
                <h2>Ubicación y Circunstancias</h2>
              </div>

              <div className="form-group">
                <label htmlFor="ultimaUbicacion">
                  Última Ubicación Conocida <span className="required">*</span>
                </label>
                <input
                  type="text"
                  id="ultimaUbicacion"
                  name="ultimaUbicacion"
                  value={formData.ultimaUbicacion}
                  onChange={handleInputChange}
                  placeholder="Dirección, distrito, ciudad"
                  className={errors.ultimaUbicacion ? 'error' : ''}
                />
                {errors.ultimaUbicacion && <span className="error-message">{errors.ultimaUbicacion}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="descripcionCircunstancias">
                  Descripción de las Circunstancias
                </label>
                <textarea
                  id="descripcionCircunstancias"
                  name="descripcionCircunstancias"
                  value={formData.descripcionCircunstancias}
                  onChange={handleInputChange}
                  rows="4"
                  placeholder="Describa las circunstancias de la desaparición"
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
                  <label htmlFor="contacto">Nombre del Contacto</label>
                  <input
                    type="text"
                    id="contacto"
                    name="contacto"
                    value={formData.contacto}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="telefonoContacto">Teléfono de Contacto</label>
                  <input
                    type="tel"
                    id="telefonoContacto"
                    name="telefonoContacto"
                    value={formData.telefonoContacto}
                    onChange={handleInputChange}
                    placeholder="+51 999 888 777"
                  />
                </div>
              </div>
            </div>

            {/* Fotografías */}
            <div className="form-section">
              <div className="section-header">
                <ImageIcon size={20} />
                <h2>Fotografías</h2>
                <span className="photos-count">{allPhotos.length}/10</span>
              </div>

              <div className="photos-info">
                <AlertCircle size={16} />
                <span>Mínimo 3 fotografías requeridas. Las nuevas fotos serán procesadas automáticamente.</span>
              </div>

              <div className="photos-grid">
                {allPhotos.map((photo) => (
                  <div key={photo.id} className={`photo-card ${photo.isNew ? 'new' : ''} ${!photo.procesado ? 'pending' : ''}`}>
                    <img src={photo.url} alt="Foto" />

                    {photo.isNew && <div className="photo-badge new-badge">Nueva</div>}
                    {!photo.procesado && !photo.isNew && <div className="photo-badge pending-badge">Sin procesar</div>}

                    <div className="photo-overlay">
                      <select
                        value={photo.tipo}
                        onChange={(e) => handlePhotoTypeChange(photo.id, e.target.value)}
                        className="photo-type-select"
                        disabled={!photo.isNew}
                      >
                        <option value="Frontal">Frontal</option>
                        <option value="Perfil_Der">Perfil Derecho</option>
                        <option value="Perfil_Izq">Perfil Izquierdo</option>
                      </select>

                      <button
                        type="button"
                        onClick={() => handleDeletePhoto(photo)}
                        className="delete-photo-btn"
                        title="Eliminar foto"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}

                {allPhotos.length < 10 && (
                  <label className="photo-upload-card">
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handlePhotoUpload}
                      style={{ display: 'none' }}
                    />
                    <Upload size={32} />
                    <span>Agregar Fotos</span>
                    <span className="upload-hint">Máx. 5MB por foto</span>
                  </label>
                )}
              </div>

              {errors.photos && (
                <div className="error-message-box">
                  <AlertCircle size={16} />
                  {errors.photos}
                </div>
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
