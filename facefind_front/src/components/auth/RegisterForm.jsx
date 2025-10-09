import React, { useState } from 'react';
import FormInput from '../common/FormInput';
import PasswordStrengthIndicator from '../common/PasswordStrengthIndicator';
import { usePasswordStrength } from '../../hooks/usePasswordStrength';

const RegisterForm = ({ onSubmit, error, success }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    dni: '',
    password: '',
    confirmPassword: ''
  });

  const { strength, checkPasswordStrength } = usePasswordStrength();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (onSubmit) {
      onSubmit(formData);
    }
  };

  const handleChange = (e) => {
    const { id, value } = e.target;
    
    // Si es el campo de contraseña, validar fortaleza
    if (id === 'password') {
      checkPasswordStrength(value);
    }
    
    setFormData(prev => ({
      ...prev,
      [id]: value
    }));
  };

  return (
    <div className="auth-form">
      <h2>Crear Cuenta</h2>
      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="name">Nombre</label>
          <FormInput
            id="name"
            type="text"
            placeholder="Tu nombre completo"
            value={formData.name}
            onChange={handleChange}
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="email">Email</label>
          <FormInput
            id="email"
            type="email"
            placeholder="tu@email.com"
            value={formData.email}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="dni">DNI</label>
          <FormInput
            id="dni"
            type="text"
            placeholder="12345678 (8 dígitos)"
            value={formData.dni}
            onChange={handleChange}
            maxLength="8"
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="password">Contraseña</label>
          <FormInput
            id="password"
            type="password"
            placeholder="Mínimo 8 caracteres"
            value={formData.password}
            onChange={handleChange}
            required
          />
          <PasswordStrengthIndicator 
            password={formData.password}
            strength={strength}
          />
          <small className="field-hint">
            Debe contener: 8+ caracteres, mayúscula, minúscula y número
          </small>
        </div>
        
        <div className="form-group">
          <label htmlFor="confirmPassword">Confirmar Contraseña</label>
          <FormInput
            id="confirmPassword"
            type="password"
            placeholder="Confirma tu contraseña"
            value={formData.confirmPassword}
            onChange={handleChange}
            required
          />
        </div>
        
        <button type="submit" className="btn-submit">
          Crear Cuenta
        </button>
      </form>
    </div>
  );
};

export default RegisterForm;
