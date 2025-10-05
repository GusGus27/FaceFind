import React from 'react';
import '../styles/Header.css';

const Header = () => {
  return (
    <header className="header">
      <div className="header-container">
        <div className="logo">
          <h1>FACEFIND</h1>
          <span className="logo-subtitle">Sistema de Reconocimiento Facial</span>
        </div>
        <nav className="nav">
          <ul className="nav-list">
            <li><a href="#about">Acerca de</a></li>
            <li><a href="#statistics">Estadísticas</a></li>
            <li><a href="#contact">Contacto</a></li>
          </ul>
        </nav>
        <div className="auth-buttons">
          <button className="btn-login">Iniciar Sesión</button>
          <button className="btn-register">Registrarse</button>
        </div>
      </div>
    </header>
  );
};

export default Header;
