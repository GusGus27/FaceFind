import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import FormInput from '../common/FormInput';

const LoginForm = ({ onSubmit }) => {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    rememberMe: false
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (onSubmit) {
      onSubmit(formData);
    }
  };

  const handleChange = (e) => {
    const { id, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [id]: type === 'checkbox' ? checked : value
    }));
  };

  return (
    <div className="auth-form">
      <h2>Iniciar Sesión</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="username">Usuario</label>
          <FormInput
            id="username"
            type="text"
            placeholder="Ingresa tu usuario"
            value={formData.username}
            onChange={handleChange}
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="password">Contraseña</label>
          <FormInput
            id="password"
            type="password"
            placeholder="Ingresa tu contraseña"
            value={formData.password}
            onChange={handleChange}
            required
          />
        </div>
        
        <div className="form-options">
          <div className="remember-me">
            <input
              type="checkbox"
              id="rememberMe"
              checked={formData.rememberMe}
              onChange={handleChange}
            />
            <label htmlFor="rememberMe">Recuérdame</label>
          </div>
          <Link to="/forgot-password" className="forgot-password">
            ¿Olvidaste tu contraseña?
          </Link>
        </div>
        
        <button type="submit" className="btn-submit">
          Iniciar Sesión
        </button>
      </form>
    </div>
  );
};

export default LoginForm;
