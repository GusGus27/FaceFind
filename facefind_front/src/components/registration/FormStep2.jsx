import React from 'react';
import FormInput from '../common/FormInput';
import '../../styles/registration/FormStep.css';

const FormStep2 = ({ formData, setFormData, errors }) => {
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
        <h2>Características Físicas</h2>
        <p>Describe las características físicas de la persona</p>
      </div>

      <div className="form-grid">
        <div className="form-group">
          <label htmlFor="height">
            Estatura (cm) <span className="required">*</span>
          </label>
          <FormInput
            id="height"
            name="height"
            type="number"
            placeholder="Ej: 170"
            min="50"
            max="250"
            value={formData.height || ''}
            onChange={handleChange}
            className={errors.height ? 'error' : ''}
          />
          {errors.height && (
            <span className="error-message">{errors.height}</span>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="weight">
            Peso (kg)
          </label>
          <FormInput
            id="weight"
            name="weight"
            type="number"
            placeholder="Ej: 70"
            min="10"
            max="300"
            value={formData.weight || ''}
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <label htmlFor="skinColor">
            Tono de Piel <span className="required">*</span>
          </label>
          <select
            id="skinColor"
            name="skinColor"
            value={formData.skinColor || ''}
            onChange={handleChange}
            className={`form-input ${errors.skinColor ? 'error' : ''}`}
          >
            <option value="">Selecciona</option>
            <option value="clara">Clara</option>
            <option value="morena">Morena</option>
            <option value="trigueña">Trigueña</option>
            <option value="oscura">Oscura</option>
          </select>
          {errors.skinColor && (
            <span className="error-message">{errors.skinColor}</span>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="hairColor">
            Color de Cabello <span className="required">*</span>
          </label>
          <select
            id="hairColor"
            name="hairColor"
            value={formData.hairColor || ''}
            onChange={handleChange}
            className={`form-input ${errors.hairColor ? 'error' : ''}`}
          >
            <option value="">Selecciona</option>
            <option value="negro">Negro</option>
            <option value="castaño">Castaño</option>
            <option value="rubio">Rubio</option>
            <option value="rojo">Rojo</option>
            <option value="canoso">Canoso</option>
            <option value="teñido">Teñido</option>
          </select>
          {errors.hairColor && (
            <span className="error-message">{errors.hairColor}</span>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="eyeColor">
            Color de Ojos <span className="required">*</span>
          </label>
          <select
            id="eyeColor"
            name="eyeColor"
            value={formData.eyeColor || ''}
            onChange={handleChange}
            className={`form-input ${errors.eyeColor ? 'error' : ''}`}
          >
            <option value="">Selecciona</option>
            <option value="negros">Negros</option>
            <option value="marrones">Marrones</option>
            <option value="verdes">Verdes</option>
            <option value="azules">Azules</option>
            <option value="grises">Grises</option>
          </select>
          {errors.eyeColor && (
            <span className="error-message">{errors.eyeColor}</span>
          )}
        </div>

        <div className="form-group full-width">
          <label htmlFor="distinctiveMarks">
            Señas Particulares
          </label>
          <textarea
            id="distinctiveMarks"
            name="distinctiveMarks"
            placeholder="Tatuajes, cicatrices, lunares, etc."
            rows="3"
            value={formData.distinctiveMarks || ''}
            onChange={handleChange}
            className="form-input"
          />
          <small>Describe cualquier característica que ayude a identificar a la persona</small>
        </div>
      </div>
    </div>
  );
};

export default FormStep2;
