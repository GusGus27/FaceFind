import React from 'react';
import AuthLayout from '../components/auth/AuthLayout';
import WelcomePanel from '../components/auth/WelcomePanel';
import RegisterForm from '../components/auth/RegisterForm';

const Register = () => {
  const handleRegister = (formData) => {
    console.log('Register submitted:', formData);
    // Aquí iría la lógica de registro
  };

  return (
    <AuthLayout
      welcomePanel={
        <WelcomePanel
          title="Únete a FACEFIND"
          subtitle="Crea una cuenta para ayudar a reunir familias a través de la tecnología."
          actionText="¿Ya tienes una cuenta?"
          actionLink="/login"
          actionLabel="Inicia Sesión"
        />
      }
    >
      <RegisterForm onSubmit={handleRegister} />
    </AuthLayout>
  );
};

export default Register;

