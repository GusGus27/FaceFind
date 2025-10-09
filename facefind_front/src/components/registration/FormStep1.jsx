import React from 'react';
import FormInput from '../common/FormInput';
import '../../styles/registration/FormStep.css';

const FormStep1 = ({ formData, setFormData, errors }) => {
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
        <h2>Información Personal</h2>
        <p>Proporciona los datos básicos de la persona desaparecida</p>
      </div>

      <div className="form-grid">
        <div className="form-group full-width">
          <label htmlFor="fullName">
            Nombre Completo <span className="required">*</span>
          </label>
          <FormInput
            id="fullName"
            name="fullName"
            type="text"
            placeholder="Nombre completo de la persona"
            value={formData.fullName || ''}
            onChange={handleChange}
            className={errors.fullName ? 'error' : ''}
          />
          {errors.fullName && (
            <span className="error-message">{errors.fullName}</span>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="birthDate">
            Fecha de Nacimiento <span className="required">*</span>
          </label>
          <input
            type="date"
            id="birthDate"
            name="birthDate"
            value={formData.birthDate || ''}
            onChange={handleChange}
            className={`form-input ${errors.birthDate ? 'error' : ''}`}
          />
          {errors.birthDate && (
            <span className="error-message">{errors.birthDate}</span>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="age">
            Edad Aproximada <span className="required">*</span>
          </label>
          <FormInput
            id="age"
            name="age"
            type="number"
            placeholder="Años"
            min="0"
            max="120"
            value={formData.age || ''}
            onChange={handleChange}
            className={errors.age ? 'error' : ''}
          />
          {errors.age && (
            <span className="error-message">{errors.age}</span>
          )}
        </div>

        <div className="form-group full-width">
          <label htmlFor="gender">
            Género <span className="required">*</span>
          </label>
          <select
            id="gender"
            name="gender"
            value={formData.gender || ''}
            onChange={handleChange}
            className={`form-input ${errors.gender ? 'error' : ''}`}
          >
            <option value="">Selecciona una opción</option>
            <option value="masculino">Masculino</option>
            <option value="femenino">Femenino</option>
            <option value="otro">Otro</option>
            <option value="prefiero-no-decir">Prefiero no decir</option>
          </select>
          {errors.gender && (
            <span className="error-message">{errors.gender}</span>
          )}
        </div>
      </div>

      <div className="form-note">
        <p>
          <strong>Nota:</strong> Todos los campos marcados con <span className="required">*</span> son obligatorios.
        </p>
      </div>
    </div>
  );
};

export default FormStep1;
