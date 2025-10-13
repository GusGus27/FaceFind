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
        // Buscar usuario en la BD para obtener role_id
        const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
        const userResponse = await fetch(`${API_URL}/users?search=${response.user.email}`);
        const userResult = await userResponse.json();
        
        if (userResult.success && userResult.data.length > 0) {
          const dbUser = userResult.data[0];
          // Combinar datos de Supabase Auth con datos de BD
          const completeUser = {
            ...response.user,
            db_id: dbUser.id,
            role_id: dbUser.role_id,
            role_name: dbUser.Rol?.nombre,
            nombre: dbUser.nombre,
            dni: dbUser.dni
          };
          
          setUser(completeUser);
          localStorage.setItem("facefind_user", JSON.stringify(completeUser));
        } else {
          // Si no se encuentra en BD, usar solo datos de Auth
          setUser(response.user);
          localStorage.setItem("facefind_user", JSON.stringify(response.user));
        }
        
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
  // Verificar si el usuario es admin basado en role_id de la BD
  // role_id 1 = Administrador (según esquema de BD)
  const isAdmin = () => {
    if (!user) return false;
    // Verificar por role_id (prioridad) o por nombre de rol o por email hardcodeado (fallback temporal)
    return user.role_id === 1 || 
           user.role_name === 'Administrador' || 
           user.email === "admin@facefind.com";
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
