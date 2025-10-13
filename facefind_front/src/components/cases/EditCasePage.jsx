import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Save, X, Upload, Trash2, AlertCircle, CheckCircle, 
  Clock, Image as ImageIcon, User, MapPin, Calendar,
  FileText, AlertTriangle, ArrowLeft
} from 'lucide-react';
import { getCasoById, updateCaso } from '../../services/casoService';
import { getFotosByCaso } from '../../services/fotoService';
import { useAuth } from '../../context/AuthContext';
import PhotoManager from '../fotos/PhotoManager';
import '../../styles/cases/EditCasePage.css';

/**
 * Componente de edición de casos para USUARIOS REGISTRADOS
 * Solo pueden editar sus propios casos
 */
const EditCasePage = () => {
  const { caseId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  // Estados del formulario
  const [formData, setFormData] = useState({
    // Información de la persona
    nombre_completo: '',
    age: '',
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
    observaciones: ''
  });

  // Estados de las fotografías
  const [photos, setPhotos] = useState([]);
  const [photosLoading, setPhotosLoading] = useState(false);
  const [newPhotos, setNewPhotos] = useState([]);
  const [photosToDelete, setPhotosToDelete] = useState([]);

  // Estados de validación y UI
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [originalData, setOriginalData] = useState(null);

  // Historial de cambios (mock)
  const [changeHistory, setChangeHistory] = useState([]);

  // Cargar datos del caso
  useEffect(() => {
    loadCaseData();
  }, [caseId]);

  // Detectar cambios
  useEffect(() => {
    if (originalData) {
      // Comparar campo por campo
      const hasDataChanges = Object.keys(formData).some(key => {
        const currentValue = formData[key] || '';
        const originalValue = originalData[key] || '';
        return currentValue !== originalValue;
      });
      
      const changed = hasDataChanges || newPhotos.length > 0 || photosToDelete.length > 0;
      setHasChanges(changed);
    }
  }, [formData, newPhotos, photosToDelete, originalData]);

  const loadCaseData = async () => {
    setIsLoading(true);
    try {
      // Cargar caso desde la API
      const caso = await getCasoById(caseId);
      
      if (!caso) {
        setErrors({ general: 'Caso no encontrado' });
        setTimeout(() => navigate('/casos'), 2000);
        return;
      }

      // Verificar que el usuario tenga permisos (solo puede editar sus propios casos)
      // TODO: Agregar validación de usuario_id cuando esté disponible
      
      const persona = caso.PersonaDesaparecida || {};
      
      // Mapear datos del caso al formulario
      const mappedData = {
        // Información de la persona
        nombre_completo: persona.nombre_completo || '',
        age: persona.age || '',
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
        observaciones: caso.observaciones || ''
      };

      setFormData(mappedData);
      setOriginalData(mappedData);
      
      // Cargar fotos del caso
      await loadPhotos();
      
      console.log('✅ Caso cargado:', caso);
    } catch (error) {
      console.error('❌ Error cargando caso:', error);
      setErrors({ general: 'Error al cargar el caso. Intenta nuevamente.' });
    } finally {
      setIsLoading(false);
    }
  };

  const loadPhotos = async () => {
    console.log('📸 loadPhotos iniciado para caso:', caseId);
    setPhotosLoading(true);
    try {
      const fotosData = await getFotosByCaso(caseId);
      console.log('✅ Fotos cargadas:', fotosData);
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
    loadPhotos();
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Limpiar error del campo
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  /* ============================================
     FUNCIONES DE FOTOS (DESHABILITADAS)
     TODO: Implementar cuando el backend soporte actualización de fotos
     ============================================ */

  /*
  const handlePhotoUpload = (e) => {
    const files = Array.from(e.target.files);
    const totalPhotos = photos.length + newPhotos.length - photosToDelete.length + files.length;

    if (totalPhotos > 10) {
      setErrors(prev => ({
        ...prev,
        photos: 'Máximo 10 fotografías permitidas'
      }));
      return;
    }

    const validFiles = files.filter(file => {
      const isValid = file.type.startsWith('image/');
      const isValidSize = file.size <= 5 * 1024 * 1024; // 5MB
      return isValid && isValidSize;
    });

    if (validFiles.length !== files.length) {
      setErrors(prev => ({
        ...prev,
        photos: 'Solo se permiten imágenes menores a 5MB'
      }));
    }

    const newPhotoObjects = validFiles.map((file, index) => ({
      id: `new-${Date.now()}-${index}`,
      file: file,
      url: URL.createObjectURL(file),
      tipo: 'Frontal',
      isNew: true
    }));

    setNewPhotos(prev => [...prev, ...newPhotoObjects]);
    setErrors(prev => ({ ...prev, photos: '' }));
  };

  const handleDeletePhoto = (photo) => {
    const remainingPhotos = photos.length + newPhotos.length - photosToDelete.length - 1;

    if (remainingPhotos < 3) {
      setErrors(prev => ({
        ...prev,
        photos: 'Debe mantener al menos 3 fotografías'
      }));
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
      setNewPhotos(prev => prev.map(p =>
        p.id === photoId ? { ...p, tipo: newType } : p
      ));
    }
  };
  */

  const validateForm = () => {
    const newErrors = {};

    if (!formData.nombre_completo?.trim()) {
      newErrors.nombre_completo = 'El nombre es requerido';
    }

    if (!formData.age || formData.age < 0 || formData.age > 120) {
      newErrors.age = 'La edad debe estar entre 0 y 120 años';
    }

    if (!formData.fecha_desaparicion) {
      newErrors.fecha_desaparicion = 'La fecha de desaparición es requerida';
    }

    if (!formData.lugar_desaparicion?.trim()) {
      newErrors.lugar_desaparicion = 'El lugar de desaparición es requerido';
    }

    // Validación de fotos (comentado por ahora hasta tener manejo de fotos)
    // const totalPhotos = photos.length + newPhotos.length - photosToDelete.length;
    // if (totalPhotos < 3) {
    //   newErrors.photos = 'Debe tener al menos 3 fotografías';
    // }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    if (!hasChanges) {
      setErrors({ general: 'No hay cambios para guardar' });
      return;
    }

    setIsSaving(true);
    setErrors({});

    try {
      // Preparar datos para actualizar
      const updates = {};
      
      // Solo enviar campos que cambiaron
      Object.keys(formData).forEach(key => {
        if (formData[key] !== originalData[key]) {
          updates[key] = formData[key];
        }
      });

      console.log('📤 Enviando actualizaciones:', updates);

      // Actualizar caso en la API
      const updatedCaso = await updateCaso(caseId, updates);

      console.log('✅ Caso actualizado:', updatedCaso);

      // Mostrar mensaje de éxito
      setShowSuccess(true);
      setHasChanges(false);
      setOriginalData(formData);
      
      // TODO: Manejar nuevas fotos cuando esté implementado
      // setNewPhotos([]);
      // setPhotosToDelete([]);

      // Ocultar mensaje después de 5 segundos
      setTimeout(() => {
        setShowSuccess(false);
      }, 5000);

      // Opcional: Redirigir después de guardar
      // setTimeout(() => {
      //   navigate('/casos');
      // }, 2000);

    } catch (error) {
      console.error('❌ Error al guardar:', error);
      setErrors({ 
        general: error.message || 'Error al guardar los cambios. Intenta nuevamente.' 
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    if (hasChanges) {
      if (window.confirm('Tienes cambios sin guardar. ¿Deseas salir?')) {
        navigate('/casos');
      }
    } else {
      navigate('/casos');
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

  // const currentPhotos = photos.filter(p => !photosToDelete.includes(p.id));
  // const allPhotos = [...currentPhotos, ...newPhotos];

  return (
    <div className="edit-case-page">
      <div className="edit-case-container">
        {/* Header */}
        <div className="edit-header">
          <button onClick={handleCancel} className="back-button">
            <ArrowLeft size={20} />
            Volver
          </button>

          <div className="header-title">
            <h1>Editar Caso</h1>
            <span className="case-number">Caso #{caseId}</span>
          </div>

          <div className="header-actions">
            {/* <button
              onClick={() => setShowHistory(!showHistory)}
              className="history-button"
            >
              <Clock size={18} />
              Historial
            </button> */}
          </div>
        </div>

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
          {/* Formulario principal */}
          <form onSubmit={handleSubmit} className="edit-form">
            {/* Sección: Información Personal */}
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
                  {errors.nombre_completo && (
                    <span className="error-message">{errors.nombre_completo}</span>
                  )}
                </div>

                <div className="form-group">
                  <label htmlFor="age">
                    Edad <span className="required">*</span>
                  </label>
                  <input
                    type="number"
                    id="age"
                    name="age"
                    value={formData.age || ''}
                    onChange={handleInputChange}
                    min="0"
                    max="120"
                    className={errors.age ? 'error' : ''}
                  />
                  {errors.age && (
                    <span className="error-message">{errors.age}</span>
                  )}
                </div>

                <div className="form-group">
                  <label htmlFor="fecha_nacimiento">
                    Fecha de Nacimiento
                  </label>
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
                  {errors.fecha_desaparicion && (
                    <span className="error-message">{errors.fecha_desaparicion}</span>
                  )}
                </div>

                {/* Campos adicionales */}
                <div className="form-group">
                  <label htmlFor="gender">Género</label>
                  <select
                    id="gender"
                    name="gender"
                    value={formData.gender || ''}
                    onChange={handleInputChange}
                  >
                    <option value="">Selecciona una opción</option>
                    <option value="masculino">Masculino</option>
                    <option value="femenino">Femenino</option>
                    <option value="otro">Otro</option>
                    <option value="prefiero-no-decir">Prefiero no decir</option>
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="altura">Altura (cm)</label>
                  <input
                    type="number"
                    id="altura"
                    name="altura"
                    value={formData.altura || ''}
                    onChange={handleInputChange}
                    min="50"
                    max="250"
                    placeholder="Ej: 170"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="peso">Peso (kg)</label>
                  <input
                    type="number"
                    id="peso"
                    name="peso"
                    value={formData.peso || ''}
                    onChange={handleInputChange}
                    min="10"
                    max="300"
                    placeholder="Ej: 70"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="skinColor">Tono de Piel</label>
                  <select
                    id="skinColor"
                    name="skinColor"
                    value={formData.skinColor || ''}
                    onChange={handleInputChange}
                  >
                    <option value="">Selecciona</option>
                    <option value="clara">Clara</option>
                    <option value="morena">Morena</option>
                    <option value="trigueña">Trigueña</option>
                    <option value="oscura">Oscura</option>
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="hairColor">Color de Cabello</label>
                  <select
                    id="hairColor"
                    name="hairColor"
                    value={formData.hairColor || ''}
                    onChange={handleInputChange}
                  >
                    <option value="">Selecciona</option>
                    <option value="negro">Negro</option>
                    <option value="castaño">Castaño</option>
                    <option value="rubio">Rubio</option>
                    <option value="rojo">Rojo</option>
                    <option value="canoso">Canoso</option>
                    <option value="teñido">Teñido</option>
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="eyeColor">Color de Ojos</label>
                  <select
                    id="eyeColor"
                    name="eyeColor"
                    value={formData.eyeColor || ''}
                    onChange={handleInputChange}
                  >
                    <option value="">Selecciona</option>
                    <option value="marrones">Marrones</option>
                    <option value="negros">Negros</option>
                    <option value="verdes">Verdes</option>
                    <option value="azules">Azules</option>
                    <option value="grises">Grises</option>
                    <option value="avellana">Avellana</option>
                  </select>
                </div>

                <div className="form-group full-width">
                  <label htmlFor="senas_particulares">Señas Particulares</label>
                  <textarea
                    id="senas_particulares"
                    name="senas_particulares"
                    value={formData.senas_particulares || ''}
                    onChange={handleInputChange}
                    rows="3"
                    placeholder="Cicatrices, tatuajes, lunares, etc."
                  />
                </div>

                <div className="form-group full-width">
                  <label htmlFor="clothing">Ropa que Vestía</label>
                  <textarea
                    id="clothing"
                    name="clothing"
                    value={formData.clothing || ''}
                    onChange={handleInputChange}
                    rows="2"
                    placeholder="Descripción de la ropa"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="eyeColor">Color de Ojos</label>
                  <input
                    type="text"
                    id="eyeColor"
                    name="eyeColor"
                    value={formData.eyeColor || ''}
                    onChange={handleInputChange}
                    placeholder="Ej: Marrones, Verdes, Azules"
                  />
                </div>
              </div>
            </div>

            {/* Sección: Características Físicas y Señas Particulares */}
            <div className="form-section">
              <div className="section-header">
                <FileText size={20} />
                <h2>Señas Particulares</h2>
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
                  rows="3"
                  placeholder="Cicatrices, tatuajes, lunares, etc."
                />
              </div>

              <div className="form-group">
                <label htmlFor="clothing">
                  Vestimenta (última vez visto)
                </label>
                <textarea
                  id="clothing"
                  name="clothing"
                  value={formData.clothing || ''}
                  onChange={handleInputChange}
                  rows="2"
                  placeholder="Descripción de la ropa que llevaba puesta"
                />
              </div>
            </div>

            {/* Sección: Ubicación y Circunstancias */}
            <div className="form-section">
              <div className="section-header">
                <MapPin size={20} />
                <h2>Ubicación y Circunstancias</h2>
              </div>

              <div className="form-group">
                <label htmlFor="lugar_desaparicion">
                  Lugar de Desaparición <span className="required">*</span>
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
                {errors.lugar_desaparicion && (
                  <span className="error-message">{errors.lugar_desaparicion}</span>
                )}
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
                <label htmlFor="lastSeen">
                  Última vez visto/a
                </label>
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
                  Circunstancias de la Desaparición
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
                <label htmlFor="description">
                  Descripción Adicional
                </label>
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

            {/* Sección: Contacto */}
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

            {/* Sección: Observaciones */}
            <div className="form-section">
              <div className="section-header">
                <FileText size={20} />
                <h2>Observaciones</h2>
              </div>

              <div className="form-group">
                <label htmlFor="observaciones">
                  Notas u Observaciones Adicionales
                </label>
                <textarea
                  id="observaciones"
                  name="observaciones"
                  value={formData.observaciones || ''}
                  onChange={handleInputChange}
                  rows="4"
                  placeholder="Cualquier información adicional que considere relevante"
                />
              </div>
            </div>

            {/* Sección: Fotografías */}
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

            {/* Botones de acción */}
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

          {/* Panel de Historial - Deshabilitado temporalmente */}
          {/* {showHistory && (
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
          )} */}
        </div>
      </div>
    </div>
  );
};

export default EditCasePage;