import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthLayout from '../components/auth/AuthLayout';
import WelcomePanel from '../components/auth/WelcomePanel';
import LoginForm from '../components/auth/LoginForm';
import { useAuth } from '../context/AuthContext';
import { isValidEmail } from '../utils/formValidation';

const Login = () => {
  const navigate = useNavigate();
  const { loginAsAdmin, loginAsUser } = useAuth();
  const [error, setError] = useState('');

  const handleLogin = (formData) => {
    setError(''); // Limpiar errores previos

    const { email, password } = formData;

    // Validar formato de email
    if (!isValidEmail(email)) {
      setError('Por favor ingresa un email válido');
      return;
    }

    // TODO: Verificar que el email esté verificado
    // Esta validación se hará con el backend
    // if (!isEmailVerified(email)) {
    //   setError('Por favor verifica tu email antes de iniciar sesión');
    //   return;
    // }

    // TODO: Verificar que el usuario no esté baneado
    // Esta validación se hará con el backend
    // if (isUserBanned(email)) {
    //   setError('Tu cuenta ha sido suspendida. Contacta al administrador');
    //   return;
    // }

    // Validar credenciales de administrador (simulado)
    if (email === 'admin@facefind.com' && password === 'Admin1234') {
      // TODO: Aquí se validará con JWT token desde el backend
      loginAsAdmin();
      navigate('/admin');
      return;
    }

    // Validar credenciales de usuario normal (simulado)
    if (email === 'usuario@facefind.com' && password === 'User1234') {
      // TODO: Aquí se validará con JWT token desde el backend
      loginAsUser();
      navigate('/cases');
      return;
    }

    // Credenciales inválidas
    setError('Email o contraseña incorrectos');
  };

  return (
    <AuthLayout
      welcomePanel={
        <WelcomePanel
          title="Bienvenido a FaceFind"
          subtitle="Por favor, inicia sesión para continuar."
          actionText="¿No tienes una cuenta?"
          actionLink="/register"
          actionLabel="Regístrate aquí"
        />
      }
    >
      <LoginForm onSubmit={handleLogin} error={error} />
    </AuthLayout>
  );
};

export default Login;