import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import AuthLayout from '../components/auth/AuthLayout';
import WelcomePanel from '../components/auth/WelcomePanel';
import '../styles/views/EmailVerification.css';

const EmailVerification = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [verificationStatus, setVerificationStatus] = useState('verifying'); // verifying | success | error
  const [message, setMessage] = useState('Verificando tu email...');

  useEffect(() => {
    // TODO: Llamar a la API para verificar el token
    // const verifyEmail = async () => {
    //   try {
    //     await api.post('/auth/verify-email', { token });
    //     setVerificationStatus('success');
    //     setMessage('¡Tu email ha sido verificado exitosamente!');
    //   } catch (err) {
    //     setVerificationStatus('error');
    //     setMessage('El link de verificación ha expirado o es inválido');
    //   }
    // };
    // verifyEmail();

    // Simulación
    setTimeout(() => {
      if (token) {
        setVerificationStatus('success');
        setMessage('¡Tu email ha sido verificado exitosamente!');
      } else {
        setVerificationStatus('error');
        setMessage('El link de verificación ha expirado o es inválido');
      }
    }, 2000);
  }, [token]);

  const getIcon = () => {
    if (verificationStatus === 'verifying') {
      return (
        <div className="verification-icon verifying">
          <div className="spinner"></div>
        </div>
      );
    } else if (verificationStatus === 'success') {
      return (
        <div className="verification-icon success">
          <svg width="80" height="80" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="11" stroke="#4caf50" strokeWidth="2" />
            <path d="M7 12l3 3 7-7" stroke="#4caf50" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </div>
      );
    } else {
      return (
        <div className="verification-icon error">
          <svg width="80" height="80" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="11" stroke="#f44336" strokeWidth="2" />
            <path d="M8 8l8 8M16 8l-8 8" stroke="#f44336" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </div>
      );
    }
  };

  return (
    <AuthLayout
      welcomePanel={
        <WelcomePanel
          title="Verificación de Email"
          subtitle="Estamos verificando tu dirección de correo electrónico."
          actionText="¿Ya tienes tu cuenta verificada?"
          actionLink="/login"
          actionLabel="Iniciar Sesión"
        />
      }
    >
      <div className="email-verification">
        {getIcon()}
        
        <h2 className={`verification-title ${verificationStatus}`}>
          {verificationStatus === 'verifying' && 'Verificando Email'}
          {verificationStatus === 'success' && '¡Verificación Exitosa!'}
          {verificationStatus === 'error' && 'Error de Verificación'}
        </h2>

        <p className={`verification-message ${verificationStatus}`}>
          {message}
        </p>

        {verificationStatus === 'success' && (
          <div className="verification-actions">
            <button 
              className="btn-submit"
              onClick={() => navigate('/login')}
            >
              Ir a Iniciar Sesión
            </button>
          </div>
        )}

        {verificationStatus === 'error' && (
          <div className="verification-actions">
            <p className="resend-info">
              Si tu link ha expirado, puedes solicitar uno nuevo desde la página de inicio de sesión.
            </p>
            <Link to="/login" className="btn-link">
              Volver al Inicio de Sesión
            </Link>
          </div>
        )}

        {verificationStatus === 'verifying' && (
          <p className="wait-message">
            Por favor espera mientras verificamos tu email...
          </p>
        )}
      </div>
    </AuthLayout>
  );
};

export default EmailVerification;
