import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthLayout from '../components/auth/AuthLayout';
import WelcomePanel from '../components/auth/WelcomePanel';
import RegisterForm from '../components/auth/RegisterForm';
import { useAuth } from '../context/AuthContext';
import { getPasswordValidationError } from '../utils/passwordValidation';
import { isValidEmail, isValidDNI, isValidName } from '../utils/formValidation';

const Register = () => {
  const navigate = useNavigate();
  const { loginAsUser } = useAuth();
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleRegister = (formData) => {
    setError('');
    setSuccess('');

    const { name, email, dni, password, confirmPassword } = formData;

    // Validar nombre
    if (!isValidName(name)) {
      setError('El nombre debe tener al menos 3 caracteres');
      return;
    }

    // Validar formato de email
    if (!isValidEmail(email)) {
      setError('Por favor ingresa un email válido');
      return;
    }

    // TODO: Validar que el email no esté registrado
    // Esta validación se hará con el backend
    // if (emailExists(email)) {
    //   setError('Este email ya está registrado');
    //   return;
    // }

    // Validar DNI (8 dígitos numéricos)
    if (!isValidDNI(dni)) {
      setError('El DNI debe tener exactamente 8 dígitos');
      return;
    }

    // TODO: Validar que el DNI no esté registrado o baneado
    // Esta validación se hará con el backend
    // if (dniExists(dni) || dniBanned(dni)) {
    //   setError('Este DNI ya está registrado o no puede ser usado');
    //   return;
    // }

    // Validar contraseña usando la utilidad
    const validationError = getPasswordValidationError(password, confirmPassword);
    if (validationError) {
      setError(validationError);
      return;
    }

    // TODO: Enviar email de confirmación
    // Esta funcionalidad se implementará con el backend
    // sendVerificationEmail(email);

    // Simular registro exitoso
    setSuccess('¡Cuenta creada exitosamente! Se ha enviado un email de verificación. Redirigiendo...');
    
    // Registrar como usuario normal y redirigir después de 2 segundos
    setTimeout(() => {
      loginAsUser();
      navigate('/casos');
    }, 2000);
  };

  return (
    <AuthLayout
      welcomePanel={
        <WelcomePanel
          title="Únete a FaceFind"
          subtitle="Crea una cuenta para ayudar a reunir familias a través de la tecnología."
          actionText="¿Ya tienes una cuenta?"
          actionLink="/login"
          actionLabel="Inicia Sesión"
        />
      }
    >
      <RegisterForm onSubmit={handleRegister} error={error} success={success} />
    </AuthLayout>
  );
};

export default Register;

