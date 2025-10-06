import React from 'react';
import '../../styles/landing/Hero.css';

const Hero = () => {
  return (
    <section className="hero">
      <div className="hero-content">
        <h1 className="hero-title">
          Reuniendo Familias a través de la Tecnología
        </h1>
        <p className="hero-description">
          FACEFIND es un sistema innovador de reconocimiento facial diseñado para 
          ayudar a localizar personas desaparecidas y reunirlas con sus familias.
        </p>
        <div className="hero-buttons">
          <button className="btn-primary">Comenzar Ahora</button>
          <button className="btn-secondary">Saber Más</button>
        </div>
      </div>
      <div className="hero-image">
        <div className="hero-placeholder">
          {/* Aquí se puede agregar una imagen o ilustración */}
          <div className="face-recognition-icon">
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
              <circle cx="9" cy="10" r="1.5" fill="currentColor"/>
              <circle cx="15" cy="10" r="1.5" fill="currentColor"/>
              <path d="M8 15 Q12 17 16 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
