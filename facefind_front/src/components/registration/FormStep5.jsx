import React, { useState } from 'react';
import '../../styles/registration/FormStep.css';

const FormStep5 = ({ formData, setFormData, errors }) => {
  const [previews, setPreviews] = useState({
    frontal: null,
    profile1: null,
    profile2: null,
    additional: [] // Array para fotos adicionales (máximo 7)
  });

  const MAX_PHOTOS = 10; // 3 obligatorias + 7 opcionales
  const REQUIRED_PHOTOS = 3;

  const validateImage = async (file) => {
    // Validar tipo de archivo
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png'];
    if (!validTypes.includes(file.type)) {
      return { valid: false, error: 'Solo se aceptan archivos JPG y PNG' };
    }

    // Validar tamaño (5MB máximo)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      return { valid: false, error: 'El archivo no debe superar los 5MB' };
    }

    // Validar resolución mínima
    return new Promise((resolve) => {
      const img = new Image();
      const objectUrl = URL.createObjectURL(file);
      
      img.onload = () => {
        URL.revokeObjectURL(objectUrl);
        const minWidth = 300;
        const minHeight = 300;
        
        if (img.width < minWidth || img.height < minHeight) {
          resolve({ 
            valid: false, 
            error: `La imagen debe tener al menos ${minWidth}x${minHeight} píxeles` 
          });
        } else {
          resolve({ valid: true, width: img.width, height: img.height });
        }
      };
      
      img.onerror = () => {
        URL.revokeObjectURL(objectUrl);
        resolve({ valid: false, error: 'Error al cargar la imagen' });
      };
      
      img.src = objectUrl;
    });
  };

  const handleImageChange = async (e, imageType, isAdditional = false, index = null) => {
    const file = e.target.files[0];
    if (!file) return;

    const validation = await validateImage(file);
    
    if (!validation.valid) {
      alert(validation.error);
      e.target.value = '';
      return;
    }

    // Crear preview
    const reader = new FileReader();
    reader.onloadend = () => {
      if (isAdditional) {
        // Manejar fotos adicionales
        setPreviews(prev => {
          const newAdditional = [...prev.additional];
          newAdditional[index] = reader.result;
          return { ...prev, additional: newAdditional };
        });
      } else {
        // Manejar fotos obligatorias
        setPreviews(prev => ({
          ...prev,
          [imageType]: reader.result
        }));
      }
    };
    reader.readAsDataURL(file);

    // Guardar archivo en formData
    if (isAdditional) {
      setFormData(prev => {
        const currentPhotos = prev.photos || {};
        const additionalPhotos = currentPhotos.additional || [];
        const newAdditional = [...additionalPhotos];
        newAdditional[index] = file;
        
        return {
          ...prev,
          photos: {
            ...currentPhotos,
            additional: newAdditional
          }
        };
      });
    } else {
      setFormData(prev => ({
        ...prev,
        photos: {
          ...prev.photos,
          [imageType]: file
        }
      }));
    }
  };

  const removeImage = (imageType, isAdditional = false, index = null) => {
    if (isAdditional) {
      // Remover foto adicional
      setPreviews(prev => {
        const newAdditional = prev.additional.filter((_, i) => i !== index);
        return { ...prev, additional: newAdditional };
      });
      
      setFormData(prev => {
        const currentPhotos = prev.photos || {};
        const additionalPhotos = currentPhotos.additional || [];
        const newAdditional = additionalPhotos.filter((_, i) => i !== index);
        
        return {
          ...prev,
          photos: {
            ...currentPhotos,
            additional: newAdditional
          }
        };
      });
    } else {
      // Remover foto obligatoria
      setPreviews(prev => ({
        ...prev,
        [imageType]: null
      }));
      
      setFormData(prev => ({
        ...prev,
        photos: {
          ...prev.photos,
          [imageType]: null
        }
      }));

      // Limpiar input
      const input = document.getElementById(`photo-${imageType}`);
      if (input) input.value = '';
    }
  };

  const addAdditionalPhoto = () => {
    const currentCount = getTotalPhotosCount();
    if (currentCount >= MAX_PHOTOS) {
      alert(`Has alcanzado el máximo de ${MAX_PHOTOS} fotos`);
      return;
    }
    
    // Trigger file input
    const input = document.getElementById(`photo-additional-${previews.additional.length}`);
    if (input) input.click();
  };

  const getTotalPhotosCount = () => {
    let count = 0;
    if (previews.frontal) count++;
    if (previews.profile1) count++;
    if (previews.profile2) count++;
    count += previews.additional.filter(p => p !== null && p !== undefined).length;
    return count;
  };

  const canAddMore = () => {
    return getTotalPhotosCount() < MAX_PHOTOS;
  };

  return (
    <div className="form-step">
      <div className="step-header">
        <h2>Fotografías</h2>
        <p>Sube al menos 3 fotografías claras de la persona desaparecida (máximo 10)</p>
        <div className="photo-counter">
          <span className={getTotalPhotosCount() >= REQUIRED_PHOTOS ? 'counter-valid' : 'counter-invalid'}>
            📷 {getTotalPhotosCount()} / {MAX_PHOTOS} fotos
            {getTotalPhotosCount() < REQUIRED_PHOTOS && (
              <span className="counter-warning"> (Mínimo {REQUIRED_PHOTOS} requeridas)</span>
            )}
          </span>
        </div>
      </div>

      <div className="upload-guidelines">
        <h3>📸 Requisitos de las fotografías:</h3>
        <ul>
          <li>✓ Formato: JPG o PNG</li>
          <li>✓ Tamaño máximo: 5MB por imagen</li>
          <li>✓ Resolución mínima: 300x300 píxeles</li>
          <li>✓ Buena iluminación y enfoque</li>
          <li>✓ Rostro claramente visible</li>
          <li>✓ <strong>Mínimo 3 fotos obligatorias, máximo 10 fotos</strong></li>
        </ul>
      </div>

      {/* Sección: Fotos Obligatorias */}
      <div className="photos-section">
        <h3 className="section-title">Fotos Obligatorias (3)</h3>
        <div className="photos-grid">
          {/* Foto Frontal - Obligatoria */}
          <div className="photo-upload-container">
            <label className="photo-label">
              Foto Frontal <span className="required">*</span>
            </label>
            <div className={`photo-upload-box ${errors.photos?.frontal ? 'error' : ''}`}>
              {previews.frontal ? (
                <div className="photo-preview">
                  <img src={previews.frontal} alt="Vista previa foto frontal" />
                  <button 
                    type="button"
                    className="remove-photo-btn"
                    onClick={() => removeImage('frontal')}
                    title="Eliminar foto"
                  >
                    ✕
                  </button>
                </div>
              ) : (
                <label htmlFor="photo-frontal" className="upload-label">
                  <div className="upload-icon">📷</div>
                  <span>Haz clic para subir</span>
                  <small>Foto de frente</small>
                </label>
              )}
              <input
                type="file"
                id="photo-frontal"
                accept="image/jpeg,image/jpg,image/png"
                onChange={(e) => handleImageChange(e, 'frontal')}
                style={{ display: 'none' }}
              />
            </div>
            {errors.photos?.frontal && (
              <span className="error-message">{errors.photos.frontal}</span>
            )}
          </div>

          {/* Foto Perfil 1 - Obligatoria */}
          <div className="photo-upload-container">
            <label className="photo-label">
              Foto Perfil 1 <span className="required">*</span>
            </label>
            <div className={`photo-upload-box ${errors.photos?.profile1 ? 'error' : ''}`}>
              {previews.profile1 ? (
                <div className="photo-preview">
                  <img src={previews.profile1} alt="Vista previa perfil 1" />
                  <button 
                    type="button"
                    className="remove-photo-btn"
                    onClick={() => removeImage('profile1')}
                    title="Eliminar foto"
                  >
                    ✕
                  </button>
                </div>
              ) : (
                <label htmlFor="photo-profile1" className="upload-label">
                  <div className="upload-icon">📷</div>
                  <span>Haz clic para subir</span>
                  <small>Primera foto de perfil</small>
                </label>
              )}
              <input
                type="file"
                id="photo-profile1"
                accept="image/jpeg,image/jpg,image/png"
                onChange={(e) => handleImageChange(e, 'profile1')}
                style={{ display: 'none' }}
              />
            </div>
            {errors.photos?.profile1 && (
              <span className="error-message">{errors.photos.profile1}</span>
            )}
          </div>

          {/* Foto Perfil 2 - Obligatoria */}
          <div className="photo-upload-container">
            <label className="photo-label">
              Foto Perfil 2 <span className="required">*</span>
            </label>
            <div className={`photo-upload-box ${errors.photos?.profile2 ? 'error' : ''}`}>
              {previews.profile2 ? (
                <div className="photo-preview">
                  <img src={previews.profile2} alt="Vista previa perfil 2" />
                  <button 
                    type="button"
                    className="remove-photo-btn"
                    onClick={() => removeImage('profile2')}
                    title="Eliminar foto"
                  >
                    ✕
                  </button>
                </div>
              ) : (
                <label htmlFor="photo-profile2" className="upload-label">
                  <div className="upload-icon">📷</div>
                  <span>Haz clic para subir</span>
                  <small>Segunda foto de perfil</small>
                </label>
              )}
              <input
                type="file"
                id="photo-profile2"
                accept="image/jpeg,image/jpg,image/png"
                onChange={(e) => handleImageChange(e, 'profile2')}
                style={{ display: 'none' }}
              />
            </div>
            {errors.photos?.profile2 && (
              <span className="error-message">{errors.photos.profile2}</span>
            )}
          </div>
        </div>
      </div>

      {/* Sección: Fotos Opcionales Adicionales */}
      {canAddMore() && (
        <div className="photos-section additional-section">
          <h3 className="section-title">
            Fotos Adicionales (Opcional)
            <span className="optional-badge">hasta {MAX_PHOTOS - REQUIRED_PHOTOS} más</span>
          </h3>
          
          <div className="photos-grid">
            {/* Mostrar fotos adicionales ya agregadas */}
            {previews.additional.map((preview, index) => (
              <div key={`additional-${index}`} className="photo-upload-container">
                <label className="photo-label">
                  Foto Adicional {index + 1}
                </label>
                <div className="photo-upload-box">
                  <div className="photo-preview">
                    <img src={preview} alt={`Foto adicional ${index + 1}`} />
                    <button 
                      type="button"
                      className="remove-photo-btn"
                      onClick={() => removeImage(null, true, index)}
                      title="Eliminar foto"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              </div>
            ))}

            {/* Botón para agregar más fotos */}
            {canAddMore() && (
              <div className="photo-upload-container">
                <label className="photo-label">
                  Agregar otra foto
                </label>
                <div className="photo-upload-box add-more-box">
                  <label 
                    htmlFor={`photo-additional-${previews.additional.length}`} 
                    className="upload-label add-more-label"
                  >
                    <div className="upload-icon">➕</div>
                    <span>Agregar foto</span>
                    <small>Opcional</small>
                  </label>
                  <input
                    type="file"
                    id={`photo-additional-${previews.additional.length}`}
                    accept="image/jpeg,image/jpg,image/png"
                    onChange={(e) => handleImageChange(e, null, true, previews.additional.length)}
                    style={{ display: 'none' }}
                  />
                </div>
              </div>
            )}
          </div>

          <div className="additional-photos-info">
            <p>💡 Agregar más fotos puede mejorar la precisión del reconocimiento facial</p>
          </div>
        </div>
      )}

      {/* Indicador de fotos máximas alcanzadas */}
      {getTotalPhotosCount() >= MAX_PHOTOS && (
        <div className="max-photos-notice">
          ✅ Has alcanzado el máximo de {MAX_PHOTOS} fotos
        </div>
      )}

      <div className="photo-tips">
        <h4>💡 Consejos para mejores resultados:</h4>
        <ul>
          <li>Usa fotos recientes de buena calidad</li>
          <li>Asegúrate de que el rostro esté bien iluminado</li>
          <li>Evita fotos borrosas o con filtros</li>
          <li>El rostro debe ocupar la mayor parte de la imagen</li>
          <li>Prefiere fondos simples sin distracciones</li>
          <li><strong>Más fotos = Mejor reconocimiento facial</strong></li>
        </ul>
      </div>
    </div>
  );
};

export default FormStep5;
