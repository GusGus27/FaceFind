import React from 'react';
import '../styles/About.css';

const About = () => {
  const features = [
    {
      icon: '🔍',
      title: 'Búsqueda Inteligente',
      description: 'Utiliza algoritmos avanzados de reconocimiento facial para comparar imágenes de manera eficiente.'
    },
    {
      icon: '🔒',
      title: 'Seguridad y Privacidad',
      description: 'Protegemos la información sensible con los más altos estándares de seguridad y encriptación.'
    },
    {
      icon: '⚡',
      title: 'Resultados Rápidos',
      description: 'Procesamiento en tiempo real que permite obtener resultados en segundos.'
    },
    {
      icon: '🤝',
      title: 'Colaboración',
      description: 'Conectamos autoridades, familiares y ciudadanos para maximizar las posibilidades de éxito.'
    }
  ];

  return (
    <section id="about" className="about">
      <div className="about-container">
        <h2 className="section-title">¿Qué es FACEFIND?</h2>
        <p className="about-intro">
          FACEFIND es una plataforma tecnológica que combina inteligencia artificial 
          y reconocimiento facial para ayudar en la búsqueda de personas desaparecidas. 
          Nuestro objetivo es reunir familias y brindar esperanza a través de la innovación.
        </p>
        
        <div className="features-grid">
          {features.map((feature, index) => (
            <div key={index} className="feature-card">
              <div className="feature-icon">{feature.icon}</div>
              <h3 className="feature-title">{feature.title}</h3>
              <p className="feature-description">{feature.description}</p>
            </div>
          ))}
        </div>

        <div className="about-mission">
          <h3>Nuestra Misión</h3>
          <p>
            Proporcionar una herramienta efectiva y accesible que facilite la localización 
            de personas desaparecidas, trabajando en conjunto con autoridades y la comunidad 
            para hacer una diferencia real en la vida de las familias afectadas.
          </p>
        </div>
      </div>
    </section>
  );
};

export default About;
