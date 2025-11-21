import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthLayout from '../components/auth/AuthLayout';
import WelcomePanel from '../components/auth/WelcomePanel';
import RegisterForm from '../components/auth/RegisterForm';
import { useAuth } from '../context/AuthContext';
import { getPasswordValidationError } from '../utils/passwordValidation';
import { isValidEmail, isValidDNI, isValidName, isValidPhone } from '../utils/formValidation';

const Register = () => {
  const navigate = useNavigate();
  const { register } = useAuth(); // 🔹 usamos la función real de registro del contexto
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleRegister = async (formData) => {
    setError('');
    setSuccess('');

    const { name, email, dni, num_telefono, password, confirmPassword } = formData;

    // ✅ Validaciones de formulario (como ya tenías)
    if (!isValidName(name)) {
      setError('El nombre debe tener al menos 3 caracteres');
      return;
    }

    if (!isValidEmail(email)) {
      setError('Por favor ingresa un email válido');
      return;
    }

    if (!isValidDNI(dni)) {
      setError('El DNI debe tener exactamente 8 dígitos');
      return;
    }

    if (!isValidPhone(num_telefono)) {
      setError('El número de teléfono debe tener exactamente 9 dígitos');
      return;
    }

    const validationError = getPasswordValidationError(password, confirmPassword);
    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      // 🔹 Llamar al servicio de registro del contexto
      const response = await register({
        nombre: name,
        email,
        password,
        dni,
        num_telefono,
      });

      if (response?.error) {
        setError(response.error.message || 'Error al registrarse');
        return;
      }

      setSuccess('¡Cuenta creada exitosamente! Redirigiendo...');
      
      // 🔹 Redirigir tras unos segundos
      setTimeout(() => {
        navigate('/casos');
      }, 2000);
    } catch (err) {
      console.error('❌ Error en registro:', err);
      setError('Hubo un problema al crear la cuenta. Inténtalo de nuevo.');
    }
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
