import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import '../../styles/common/Header.css';

const Header = () => {
  const { user, logout, isAdmin, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  // Obtener nombre del usuario (puede venir de diferentes propiedades)
  const getUserName = () => {
    if (!user) return '';
    return user.nombre || user.name || user.email?.split('@')[0] || 'Usuario';
  };

  return (
    <header className="header">
      <div className="header-container">
        <Link to="/" className="logo" style={{ textDecoration: 'none', color: 'inherit' }}>
          <h1>FACEFIND</h1>
          <span className="logo-subtitle">Sistema de Reconocimiento Facial</span>
        </Link>
        <nav className="nav">
          <ul className="nav-list">
            <li><Link to="/acerca-de" className="nav-link">Acerca de</Link></li>
            <li><Link to="/estadisticas" className="nav-link">Estadísticas</Link></li>
            <li><Link to="/contacto" className="nav-link">Contacto</Link></li>
            
            {/* Mostrar "Ver Casos" solo si está autenticado */}
            {isAuthenticated() && (
              <li><Link to="/casos" className="nav-link">Ver Casos</Link></li>
            )}
            
            {/* Mostrar "Registrar Caso" siempre, pero redirigirá a login si no está autenticado */}
            <li><Link to="/registrar_caso" className="nav-link register-case-link">Registrar Caso</Link></li>
            
            {/* Panel admin solo para administradores */}
            {isAdmin() && (
              <li><Link to="/admin" className="nav-link admin-link">⚙️ Panel Admin</Link></li>
            )}
          </ul>
        </nav>
        <div className="auth-buttons">
          {isAuthenticated() ? (
            <>
              <span className="user-info">
                👤 {getUserName()} {isAdmin() && <span className="admin-badge">Admin</span>}
              </span>
              <button className="btn-logout" onClick={handleLogout}>Cerrar Sesión</button>
            </>
          ) : (
            <>
              <button className="btn-login" onClick={() => navigate('/login')}>
                Iniciar Sesión
              </button>
              <button className="btn-register" onClick={() => navigate('/register')}>
                Registrarse
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;