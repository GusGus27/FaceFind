import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import AuthLayout from '../components/auth/AuthLayout';
import WelcomePanel from '../components/auth/WelcomePanel';
import FormInput from '../components/common/FormInput';
import { isValidEmail } from '../utils/formValidation';
import '../styles/views/ForgotPassword.css';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Validar formato de email
    if (!isValidEmail(email)) {
      setError('Por favor ingresa un email válido');
      return;
    }

    setIsSubmitting(true);

    // TODO: Llamar a la API para enviar email de recuperación
    // try {
    //   await api.post('/auth/forgot-password', { email });
    //   setSuccess('Se ha enviado un link de recuperación a tu email');
    // } catch (err) {
    //   setError('No se encontró una cuenta con ese email');
    // }

    // Simulación
    setTimeout(() => {
      setSuccess('Se ha enviado un link de recuperación a tu email. Por favor revisa tu bandeja de entrada.');
      setIsSubmitting(false);
    }, 1500);
  };

  return (
    <AuthLayout
      welcomePanel={
        <WelcomePanel
          title="Recuperar Contraseña"
          subtitle="Ingresa tu email y te enviaremos un link para restablecer tu contraseña."
          actionText="¿Recordaste tu contraseña?"
          actionLink="/login"
          actionLabel="Volver a Iniciar Sesión"
        />
      }
    >
      <div className="forgot-password-form">
        <h2>Recuperar Contraseña</h2>
        <p className="form-description">
          Ingresa tu email y te enviaremos instrucciones para restablecer tu contraseña.
        </p>

        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <FormInput
              id="email"
              type="email"
              placeholder="ejemplo@correo.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={isSubmitting || success}
            />
          </div>

          <button 
            type="submit" 
            className="btn-submit"
            disabled={isSubmitting || success}
          >
            {isSubmitting ? 'Enviando...' : 'Enviar Link de Recuperación'}
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

export default ForgotPassword;
