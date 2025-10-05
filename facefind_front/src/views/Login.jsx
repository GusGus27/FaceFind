import React from 'react';
import AuthLayout from '../components/auth/AuthLayout';
import WelcomePanel from '../components/auth/WelcomePanel';
import LoginForm from '../components/auth/LoginForm';

const Login = () => {
  const handleLogin = (formData) => {
    console.log('Login submitted:', formData);
    // Aquí iría la lógica de autenticación
  };

  return (
    <AuthLayout
      welcomePanel={
        <WelcomePanel
          title="Bienvenido a FACEFIND"
          subtitle="Por favor, inicia sesión para continuar."
          actionText="¿No tienes una cuenta?"
          actionLink="/register"
          actionLabel="Regístrate aquí"
        />
      }
    >
      <LoginForm onSubmit={handleLogin} />
    </AuthLayout>
  );
};

export default Login;