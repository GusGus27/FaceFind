import React from 'react';
import '../styles/Footer.css';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-section">
          <h3>FACEFIND</h3>
          <p className="footer-description">
            Reuniendo familias a través de la tecnología. 
            Sistema de reconocimiento facial para personas desaparecidas.
          </p>
          <div className="social-links">
            <a href="#" aria-label="Facebook">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z"/>
              </svg>
            </a>
            <a href="#" aria-label="Twitter">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z"/>
              </svg>
            </a>
            <a href="#" aria-label="Instagram">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
                <path d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37z" fill="none" stroke="black" strokeWidth="2"/>
                <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" stroke="black" strokeWidth="2"/>
              </svg>
            </a>
            <a href="#" aria-label="LinkedIn">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6zM2 9h4v12H2z"/>
                <circle cx="4" cy="4" r="2"/>
              </svg>
            </a>
          </div>
        </div>

        <div className="footer-section">
          <h4>Enlaces Rápidos</h4>
          <ul className="footer-links">
            <li><a href="#about">Acerca de</a></li>
            <li><a href="#statistics">Estadísticas</a></li>
            <li><a href="#contact">Contacto</a></li>
            <li><a href="#">Preguntas Frecuentes</a></li>
          </ul>
        </div>

        <div className="footer-section">
          <h4>Legal</h4>
          <ul className="footer-links">
            <li><a href="#">Términos y Condiciones</a></li>
            <li><a href="#">Política de Privacidad</a></li>
            <li><a href="#">Política de Cookies</a></li>
            <li><a href="#">Aviso Legal</a></li>
          </ul>
        </div>

        <div className="footer-section">
          <h4>Soporte</h4>
          <ul className="footer-links">
            <li><a href="#">Centro de Ayuda</a></li>
            <li><a href="#">Documentación</a></li>
            <li><a href="#">Reportar un Problema</a></li>
            <li><a href="#">Estado del Sistema</a></li>
          </ul>
        </div>
      </div>

      <div className="footer-bottom">
        <div className="footer-bottom-container">
          <p>&copy; {currentYear} FACEFIND. Todos los derechos reservados.</p>
          <p className="footer-disclaimer">
            Sistema desarrollado con fines educativos y de ayuda humanitaria.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
