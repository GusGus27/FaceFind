import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import AuthLayout from "../components/auth/AuthLayout";
import WelcomePanel from "../components/auth/WelcomePanel";
import LoginForm from "../components/auth/LoginForm";
import { useAuth } from "../context/AuthContext";

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [error, setError] = useState("");

  const handleLogin = async (formData) => {
    setError("");
    try {
      // Extraer datos del formulario
      const { username, password } = formData;

      // Llamar al método login del contexto
      const response = await login(username, password);

      if (response?.user) {
        // Redirigir según rol o tipo de usuario
        if (response.user.role === "admin") {
          navigate("/admin");
        } else {
          navigate("/casos");
        }
      } else {
        setError("Credenciales inválidas");
      }
    } catch (err) {
      console.error("❌ Error de login:", err);
      setError(err.message || "Error al iniciar sesión");
    }
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
