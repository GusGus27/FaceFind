import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthLayout from '../components/auth/AuthLayout';
import WelcomePanel from '../components/auth/WelcomePanel';
import RegisterForm from '../components/auth/RegisterForm';
import { useAuth } from '../context/AuthContext';

const Register = () => {
  const navigate = useNavigate();
  const { loginAsUser } = useAuth();
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleRegister = (formData) => {
    setError('');
    setSuccess('');

    const { name, email, password, confirmPassword } = formData;

    // Validar que las contraseñas coincidan
    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }

    // Validar longitud mínima de contraseña
    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Por favor ingresa un email válido');
      return;
    }

    // Validar que el nombre no esté vacío
    if (name.trim().length < 3) {
      setError('El nombre debe tener al menos 3 caracteres');
      return;
    }

    // Simular registro exitoso
    setSuccess('¡Cuenta creada exitosamente! Redirigiendo...');
    
    // Registrar como usuario normal y redirigir después de 1.5 segundos
    setTimeout(() => {
      loginAsUser();
      navigate('/casos');
    }, 1500);
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

