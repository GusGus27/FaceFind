import React, { createContext, useState, useContext } from "react";
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
  const [loading, setLoading] = useState(false);

  // 🔹 Registro
  const register = async ({ nombre, email, password }) => {
    setLoading(true);
    try {
      const response = await authService.signUp({ nombre, email, password });
      // Supabase devuelve algo como { message, data }
      if (response?.data) {
        setUser(response.data);
      }
      return response;
    } catch (error) {
      console.error("❌ Error en registro:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // context/AuthContext.jsx
const login = async (email, password) => {
  setLoading(true);
  try {
    const response = await authService.signIn(email, password);

    if (response?.user) {
      // Asegúrate de guardar el user con sus metadatos
      setUser(response.user);
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
