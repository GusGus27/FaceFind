import React from 'react';
import FormInput from '../common/FormInput';
import '../../styles/registration/FormStep.css';

const FormStep3 = ({ formData, setFormData, errors }) => {
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
        <h2>Información de Desaparición</h2>
        <p>Proporciona detalles sobre la desaparición</p>
      </div>

      <div className="form-grid">
        <div className="form-group">
          <label htmlFor="disappearanceDate">
            Fecha de Desaparición <span className="required">*</span>
          </label>
          <input
            type="date"
            id="disappearanceDate"
            name="disappearanceDate"
            value={formData.disappearanceDate || ''}
            onChange={handleChange}
            max={new Date().toISOString().split('T')[0]}
            className={`form-input ${errors.disappearanceDate ? 'error' : ''}`}
          />
          {errors.disappearanceDate && (
            <span className="error-message">{errors.disappearanceDate}</span>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="disappearanceTime">
            Hora Aproximada
          </label>
          <input
            type="time"
            id="disappearanceTime"
            name="disappearanceTime"
            value={formData.disappearanceTime || ''}
            onChange={handleChange}
            className="form-input"
          />
        </div>

        <div className="form-group full-width">
          <label htmlFor="lastKnownLocation">
            Última Ubicación Conocida <span className="required">*</span>
          </label>
          <FormInput
            id="lastKnownLocation"
            name="lastKnownLocation"
            type="text"
            placeholder="Dirección, distrito, referencia"
            value={formData.lastKnownLocation || ''}
            onChange={handleChange}
            className={errors.lastKnownLocation ? 'error' : ''}
          />
          {errors.lastKnownLocation && (
            <span className="error-message">{errors.lastKnownLocation}</span>
          )}
        </div>

        <div className="form-group full-width">
          <label htmlFor="circumstances">
            Circunstancias de la Desaparición <span className="required">*</span>
          </label>
          <textarea
            id="circumstances"
            name="circumstances"
            placeholder="Describe qué pasó el día de la desaparición..."
            rows="4"
            value={formData.circumstances || ''}
            onChange={handleChange}
            className={`form-input ${errors.circumstances ? 'error' : ''}`}
          />
          {errors.circumstances && (
            <span className="error-message">{errors.circumstances}</span>
          )}
          <small>Proporciona todos los detalles que recuerdes sobre el momento de la desaparición</small>
        </div>

        <div className="form-group full-width">
          <label htmlFor="clothing">
            Vestimenta al Momento de la Desaparición
          </label>
          <textarea
            id="clothing"
            name="clothing"
            placeholder="Describe la ropa que llevaba puesta..."
            rows="3"
            value={formData.clothing || ''}
            onChange={handleChange}
            className="form-input"
          />
          <small>Color, tipo de prenda, accesorios, etc.</small>
        </div>
      </div>
    </div>
  );
};

export default FormStep3;
