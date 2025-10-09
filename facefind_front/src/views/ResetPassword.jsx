import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import AuthLayout from '../components/auth/AuthLayout';
import WelcomePanel from '../components/auth/WelcomePanel';
import FormInput from '../components/common/FormInput';
import PasswordStrengthIndicator from '../components/common/PasswordStrengthIndicator';
import { usePasswordStrength } from '../hooks/usePasswordStrength';
import { getPasswordValidationError } from '../utils/passwordValidation';
import '../styles/views/ResetPassword.css';

const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { strength, checkPasswordStrength } = usePasswordStrength();

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [id]: value
    }));

    if (id === 'password') {
      checkPasswordStrength(value);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const { password, confirmPassword } = formData;

    // Validar contraseña usando la utilidad
    const validationError = getPasswordValidationError(password, confirmPassword);
    if (validationError) {
      setError(validationError);
      return;
    }

    setIsSubmitting(true);

    // TODO: Llamar a la API para restablecer contraseña
    // try {
    //   await api.post('/auth/reset-password', { token, password });
    //   setSuccess('Contraseña restablecida exitosamente');
    //   setTimeout(() => navigate('/login'), 2000);
    // } catch (err) {
    //   setError('El link de recuperación ha expirado o es inválido');
    // }

    // Simulación
    setTimeout(() => {
      setSuccess('¡Contraseña restablecida exitosamente! Redirigiendo al inicio de sesión...');
      setTimeout(() => {
        navigate('/login');
      }, 2000);
      setIsSubmitting(false);
    }, 1500);
  };

  return (
    <AuthLayout
      welcomePanel={
        <WelcomePanel
          title="Nueva Contraseña"
          subtitle="Ingresa tu nueva contraseña para restablecer el acceso a tu cuenta."
          actionText="¿Recordaste tu contraseña?"
          actionLink="/login"
          actionLabel="Volver a Iniciar Sesión"
        />
      }
    >
      <div className="reset-password-form">
        <h2>Restablecer Contraseña</h2>
        <p className="form-description">
          Ingresa tu nueva contraseña. Asegúrate de que sea segura y diferente a las anteriores.
        </p>

        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="password">Nueva Contraseña</label>
            <FormInput
              id="password"
              type="password"
              placeholder="Mínimo 8 caracteres"
              value={formData.password}
              onChange={handleChange}
              required
              disabled={isSubmitting || success}
            />
            <span className="field-hint">
              8+ caracteres, mayúscula, minúscula y número
            </span>
            <PasswordStrengthIndicator 
              password={formData.password}
              strength={strength}
            />
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">Confirmar Contraseña</label>
            <FormInput
              id="confirmPassword"
              type="password"
              placeholder="Repite tu contraseña"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              disabled={isSubmitting || success}
            />
          </div>

          <button 
            type="submit" 
            className="btn-submit"
            disabled={isSubmitting || success}
          >
            {isSubmitting ? 'Restableciendo...' : 'Restablecer Contraseña'}
          </button>
        </form>

        <div className="form-footer">
          <Link to="/login" className="back-link">
            ← Volver al inicio de sesión
          </Link>
        </div>
      </div>
    </AuthLayout>
  );
};

export default ResetPassword;
