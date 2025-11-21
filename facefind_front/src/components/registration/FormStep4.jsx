import React, { useEffect, useState } from 'react';
import FormInput from '../common/FormInput';
import { useAuth } from '../../context/AuthContext';
import { getUserProfile } from '../../services/userService';
import '../../styles/registration/FormStep.css';

const FormStep4 = ({ formData, setFormData, errors }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [autoFilled, setAutoFilled] = useState(false);

  // 🔹 Cargar datos del usuario automáticamente al montar el componente
  useEffect(() => {
    const loadUserProfile = async () => {
      if (!user?.id) {
        setLoading(false);
        return;
      }

      try {
        console.log('📥 Cargando perfil del usuario:', user.id);
        const profile = await getUserProfile(user.id);
        
        // Solo autocompletar si los campos están vacíos
        if (!formData.reporterName && !formData.contactEmail) {
          setFormData(prev => ({
            ...prev,
            reporterName: profile.nombre || '',
            contactEmail: profile.email || '',
            // contactPhone no se carga porque no está en la tabla Usuario
          }));
          setAutoFilled(true);
          console.log('✅ Datos del usuario cargados automáticamente');
        }
      } catch (error) {
        console.error('❌ Error al cargar perfil del usuario:', error);
      } finally {
        setLoading(false);
      }
    };

    loadUserProfile();
  }, [user]); // Solo se ejecuta una vez al montar

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div className="form-step">
      <div className="step-header">
        <h2>Contacto de Emergencia</h2>
        <p>Información de la persona que reporta el caso</p>
        {autoFilled && (
          <div className="info-message" style={{
            marginTop: '10px',
            padding: '10px',
            backgroundColor: '#e3f2fd',
            borderLeft: '4px solid #2196f3',
            borderRadius: '4px',
            fontSize: '0.9rem',
            color: '#1976d2'
          }}>
            ℹ️ Los datos se han completado automáticamente con tu información de perfil y no pueden ser modificados.
          </div>
        )}
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '20px', color: '#666' }}>
          Cargando información...
        </div>
      ) : (
        <>
          <div className="form-grid">
            <div className="form-group full-width">
              <label htmlFor="reporterName">
                Nombre del Reportante <span className="required">*</span>
                {autoFilled && <span style={{ marginLeft: '8px', fontSize: '0.85rem', color: '#2196f3' }}>🔒 Auto-completado</span>}
              </label>
              <FormInput
                id="reporterName"
                name="reporterName"
                type="text"
                placeholder="Tu nombre completo"
                value={formData.reporterName || ''}
                onChange={handleChange}
                className={errors.reporterName ? 'error' : ''}
                readOnly={autoFilled}
                disabled={autoFilled}
                style={autoFilled ? { 
                  backgroundColor: '#f5f5f5', 
                  cursor: 'not-allowed',
                  color: '#666'
                } : {}}
              />
              {errors.reporterName && (
                <span className="error-message">{errors.reporterName}</span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="relationship">
                Relación con la Persona <span className="required">*</span>
              </label>
              <select
                id="relationship"
                name="relationship"
                value={formData.relationship || ''}
                onChange={handleChange}
                className={`form-input ${errors.relationship ? 'error' : ''}`}
              >
                <option value="">Selecciona</option>
                <option value="padre-madre">Padre/Madre</option>
                <option value="hijo-hija">Hijo/Hija</option>
                <option value="hermano-hermana">Hermano/Hermana</option>
                <option value="esposo-esposa">Esposo/Esposa</option>
                <option value="abuelo-abuela">Abuelo/Abuela</option>
                <option value="tio-tia">Tío/Tía</option>
                <option value="primo-prima">Primo/Prima</option>
                <option value="amigo-amiga">Amigo/Amiga</option>
                <option value="otro">Otro</option>
              </select>
              {errors.relationship && (
                <span className="error-message">{errors.relationship}</span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="contactPhone">
                Teléfono de Contacto <span className="required">*</span>
              </label>
              <FormInput
                id="contactPhone"
                name="contactPhone"
                type="tel"
                placeholder="999 999 999"
                value={formData.contactPhone || ''}
                onChange={handleChange}
                className={errors.contactPhone ? 'error' : ''}
              />
              {errors.contactPhone && (
                <span className="error-message">{errors.contactPhone}</span>
              )}
            </div>

            <div className="form-group full-width">
              <label htmlFor="contactEmail">
                Email de Contacto <span className="required">*</span>
                {autoFilled && <span style={{ marginLeft: '8px', fontSize: '0.85rem', color: '#2196f3' }}>🔒 Auto-completado</span>}
              </label>
              <FormInput
                id="contactEmail"
                name="contactEmail"
                type="email"
                placeholder="tu@email.com"
                value={formData.contactEmail || ''}
                onChange={handleChange}
                className={errors.contactEmail ? 'error' : ''}
                readOnly={autoFilled}
                disabled={autoFilled}
                style={autoFilled ? { 
                  backgroundColor: '#f5f5f5', 
                  cursor: 'not-allowed',
                  color: '#666'
                } : {}}
              />
              {errors.contactEmail && (
                <span className="error-message">{errors.contactEmail}</span>
              )}
            </div>

            <div className="form-group full-width">
              <label htmlFor="additionalContact">
                Contacto Alternativo (Opcional)
              </label>
              <FormInput
                id="additionalContact"
                name="additionalContact"
                type="text"
                placeholder="Nombre y teléfono de otra persona de contacto"
                value={formData.additionalContact || ''}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="form-note privacy-note">
            <p>
              <strong>🔒 Confidencialidad:</strong> Toda la información proporcionada será tratada 
              con estricta confidencialidad y solo será utilizada para la búsqueda de la persona desaparecida.
            </p>
          </div>
        </>
      )}
    </div>
  );
};export default FormStep4;
