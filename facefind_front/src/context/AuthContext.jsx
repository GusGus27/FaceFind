import React, { createContext, useState, useContext, useEffect } from "react";
import * as authService from "../services/authService";

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth debe ser usado dentro de un AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // Inicialmente true mientras carga

  // 🔹 Cargar usuario desde localStorage al iniciar
  useEffect(() => {
    const loadUserFromStorage = () => {
      try {
        const storedUser = localStorage.getItem("facefind_user");
        const storedSession = localStorage.getItem("facefind_session");
        
        if (storedUser && storedSession) {
          const userData = JSON.parse(storedUser);
          const sessionData = JSON.parse(storedSession);
          
          // Verificar si la sesión no ha expirado
          if (sessionData.expires_at && new Date(sessionData.expires_at * 1000) > new Date()) {
            setUser(userData);
            console.log("✅ Sesión restaurada desde localStorage");
          } else {
            // Sesión expirada, limpiar
            localStorage.removeItem("facefind_user");
            localStorage.removeItem("facefind_session");
            console.log("⚠️ Sesión expirada");
          }
        }
      } catch (error) {
        console.error("❌ Error al cargar usuario desde localStorage:", error);
        localStorage.removeItem("facefind_user");
        localStorage.removeItem("facefind_session");
      } finally {
        setLoading(false);
      }
    };

    loadUserFromStorage();
  }, []);

  // 🔹 Registro
  const register = async ({ nombre, email, password, dni }) => {
    setLoading(true);
    try {
      const response = await authService.signUp({ nombre, email, password, dni });
      // Supabase devuelve algo como { message, data }
      if (response?.data) {
        setUser(response.data);
        // Guardar en localStorage
        localStorage.setItem("facefind_user", JSON.stringify(response.data));
        if (response.session) {
          localStorage.setItem("facefind_session", JSON.stringify(response.session));
        }
      }
      return response;
    } catch (error) {
      console.error("❌ Error en registro:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // 🔹 Iniciar sesión
  const login = async (email, password) => {
    setLoading(true);
    try {
      const response = await authService.signIn(email, password);

      if (response?.user) {
        // Guardar el user con sus metadatos
        setUser(response.user);
        // Persistir en localStorage
        localStorage.setItem("facefind_user", JSON.stringify(response.user));
        if (response.session) {
          localStorage.setItem("facefind_session", JSON.stringify(response.session));
        }
      }

      return response;
    } catch (error) {
      console.error("❌ Error al iniciar sesión:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };


  // 🔹 Cerrar sesión
  const logout = async () => {
    try {
      await authService.signOut();
      setUser(null);
      // Limpiar localStorage
      localStorage.removeItem("facefind_user");
      localStorage.removeItem("facefind_session");
      console.log("✅ Sesión cerrada y localStorage limpiado");
    } catch (error) {
      console.error("❌ Error al cerrar sesión:", error);
    }
  };

  // 🔹 Helpers
  //const isAdmin = () => user?.role === "admin";
  //const isAdmin = () => user?.email === "admin@facefind.com";
  //const isAdmin = () => user?.app_metadata?.role === "admin";
  const isAdmin = () => {
  if (!user) return false;
  return user.app_metadata?.role === "admin" || user.email === "admin@facefind.com";
};


  const isAuthenticated = () => user !== null;

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        register,
        login,
        logout,
        isAdmin,
        isAuthenticated,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
