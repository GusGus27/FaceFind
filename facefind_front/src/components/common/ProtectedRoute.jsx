import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

/**
 * Componente para proteger rutas que requieren autenticación
 * Redirige al login si el usuario no está autenticado
 * y guarda la ubicación para redirigir después del login
 */
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  // Mostrar loading mientras se verifica la sesión
  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        fontSize: '1.2rem',
        color: '#666'
      }}>
        Cargando...
      </div>
    );
  }

  if (!isAuthenticated()) {
    // Redirigir al login guardando la ubicación actual
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Si está autenticado, renderizar el componente hijo
  return children;
};

export default ProtectedRoute;
