import React from 'react';
import FormInput from '../common/FormInput';
import '../../styles/registration/FormStep.css';

const FormStep4 = ({ formData, setFormData, errors }) => {
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
      </div>

      <div className="form-grid">
        <div className="form-group full-width">
          <label htmlFor="reporterName">
            Nombre del Reportante <span className="required">*</span>
          </label>
          <FormInput
            id="reporterName"
            name="reporterName"
            type="text"
            placeholder="Tu nombre completo"
            value={formData.reporterName || ''}
            onChange={handleChange}
            className={errors.reporterName ? 'error' : ''}
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
          </label>
          <FormInput
            id="contactEmail"
            name="contactEmail"
            type="email"
            placeholder="tu@email.com"
            value={formData.contactEmail || ''}
            onChange={handleChange}
            className={errors.contactEmail ? 'error' : ''}
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
    </div>
  );
};

export default FormStep4;
