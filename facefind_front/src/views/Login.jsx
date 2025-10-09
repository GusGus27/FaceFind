import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthLayout from '../components/auth/AuthLayout';
import WelcomePanel from '../components/auth/WelcomePanel';
import LoginForm from '../components/auth/LoginForm';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const navigate = useNavigate();
  const { loginAsAdmin, loginAsUser } = useAuth();
  const [error, setError] = useState('');

  const handleLogin = (formData) => {
    setError(''); // Limpiar errores previos

    const { username, password } = formData;

    // Validar credenciales de administrador
    if (username === 'admin' && password === 'admin1234') {
      loginAsAdmin();
      navigate('/admin');
      return;
    }

    // Validar credenciales de usuario normal
    if (username === 'usuario' && password === 'user1234') {
      loginAsUser();
      navigate('/casos');
      return;
    }

    // Credenciales inválidas
    setError('Usuario o contraseña incorrectos');
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