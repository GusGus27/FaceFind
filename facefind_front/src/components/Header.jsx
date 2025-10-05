import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import LoginModal from './LoginModal';
import '../styles/Header.css';

const Header = () => {
  const { user, logout, isAdmin } = useAuth();
  const [showLoginModal, setShowLoginModal] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
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
            <li><a href="#about">Acerca de</a></li>
            <li><a href="#statistics">Estadísticas</a></li>
            <li><a href="#contact">Contacto</a></li>
            <li><Link to="/cases" className="nav-link">Ver Casos</Link></li>
            {isAdmin() && (
              <li><Link to="/admin" className="nav-link admin-link">⚙️ Panel Admin</Link></li>
            )}
          </ul>
        </nav>
        <div className="auth-buttons">
          {user ? (
            <>
              <span className="user-info">
                👤 {user.name} {isAdmin() && <span className="admin-badge">Admin</span>}
              </span>
              <button className="btn-logout" onClick={handleLogout}>Cerrar Sesión</button>
            </>
          ) : (
            <>
              <button className="btn-login" onClick={() => setShowLoginModal(true)}>
                Iniciar Sesión
              </button>
              <button className="btn-register">Registrarse</button>
            </>
          )}
        </div>
      </div>
      
      <LoginModal 
        isOpen={showLoginModal} 
        onClose={() => setShowLoginModal(false)} 
      />
    </header>
  );
};

export default Header;