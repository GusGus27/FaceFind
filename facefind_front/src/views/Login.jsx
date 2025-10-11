import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import AuthLayout from "../components/auth/AuthLayout";
import WelcomePanel from "../components/auth/WelcomePanel";
import LoginForm from "../components/auth/LoginForm";
import { useAuth } from "../context/AuthContext";

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
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
        // Redirigir según el rol o a la página anterior
        const from = location.state?.from?.pathname || '/';
        
        if (response.user.email === "admin@facefind.com" || response.user.app_metadata?.role === "admin") {
          navigate("/admin", { replace: true });
        } else {
          // Si venía de otra página (ej: /registrar_caso), redirigir ahí
          navigate(from, { replace: true });
        }
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
