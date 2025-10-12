import React, { useState, useEffect } from 'react';
import { Eye, EyeOff, CheckCircle, XCircle } from 'lucide-react';
import FormInput from '../common/FormInput';
import PasswordStrengthIndicator from '../common/PasswordStrengthIndicator';
import { usePasswordStrength } from '../../hooks/usePasswordStrength';

const RegisterForm = ({ onSubmit, error, success }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    dni: '',
    num_telefono: '',
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordMatch, setPasswordMatch] = useState(null);

  const { strength, checkPasswordStrength } = usePasswordStrength();

  // Verificar si las contraseñas coinciden
  useEffect(() => {
    if (formData.confirmPassword) {
      setPasswordMatch(formData.password === formData.confirmPassword);
    } else {
      setPasswordMatch(null);
    }
  }, [formData.password, formData.confirmPassword]);

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

  const togglePasswordVisibility = (field) => {
    if (field === 'password') {
      setShowPassword(!showPassword);
    } else {
      setShowConfirmPassword(!showConfirmPassword);
    }
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
          <label htmlFor="num_telefono">Número de Teléfono</label>
          <FormInput
            id="num_telefono"
            type="tel"
            placeholder="987654321 (9 dígitos)"
            value={formData.num_telefono}
            onChange={handleChange}
            maxLength="9"
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="password">Contraseña</label>
          <div className="password-field-wrapper">
            <FormInput
              id="password"
              type={showPassword ? 'text' : 'password'}
              placeholder="Mínimo 8 caracteres"
              value={formData.password}
              onChange={handleChange}
              required
            />
            <button
              type="button"
              onClick={() => togglePasswordVisibility('password')}
              className="password-toggle-btn"
              aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
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
          <div className="password-field-wrapper">
            <FormInput
              id="confirmPassword"
              type={showConfirmPassword ? 'text' : 'password'}
              placeholder="Confirma tu contraseña"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
            />
            <button
              type="button"
              onClick={() => togglePasswordVisibility('confirmPassword')}
              className="password-toggle-btn"
              aria-label={showConfirmPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
            >
              {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          
          {passwordMatch === true && (
            <span className="password-match-success">
              <CheckCircle size={14} />
              Las contraseñas coinciden
            </span>
          )}
          
          {passwordMatch === false && (
            <span className="password-match-error">
              <XCircle size={14} />
              Las contraseñas no coinciden
            </span>
          )}
        </div>
        
        <button 
          type="submit" 
          className="btn-submit"
          disabled={passwordMatch === false}
        >
          Crear Cuenta
        </button>
      </form>
    </div>
  );
};

export default RegisterForm;
