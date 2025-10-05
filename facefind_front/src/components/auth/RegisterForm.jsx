import React, { useState } from 'react';
import FormInput from '../common/FormInput';

const RegisterForm = ({ onSubmit }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (onSubmit) {
      onSubmit(formData);
    }
  };

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [id]: value
    }));
  };

  return (
    <div className="auth-form">
      <h2>Crear Cuenta</h2>
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
            placeholder="you@domain.com"
            value={formData.email}
            onChange={handleChange}
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="password">Contraseña</label>
          <FormInput
            id="password"
            type="password"
            placeholder="Contraseña"
            value={formData.password}
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
