import React from "react";
import Header from "../components/common/Header";
import Footer from "../components/common/Footer";
import "../styles/views/AboutPage.css";

export default function AboutPage() {
  return (
    <>
      <Header />
      <div className="about-page">
        <div className="about-container">
          {/* Hero Section */}
          <section className="about-hero">
            <div className="about-hero-content">
              <h1 className="about-title">
                Sobre <span className="highlight">FaceFind</span>
              </h1>
              <p className="about-subtitle">
                Tecnología de reconocimiento facial al servicio de la búsqueda de personas desaparecidas
              </p>
            </div>
          </section>

          {/* Misión y Visión */}
          <section className="mission-vision-section">
            <div className="mission-vision-grid">
              <div className="mission-card">
                <div className="card-icon">🎯</div>
                <h2>Nuestra Misión</h2>
                <p>
                  Proporcionar una herramienta tecnológica innovadora que permita a las autoridades 
                  y familias localizar personas desaparecidas mediante el uso de reconocimiento 
                  facial y sistemas de vigilancia integrados, reduciendo el tiempo de búsqueda y 
                  aumentando las posibilidades de encuentro exitoso.
                </p>
              </div>

              <div className="vision-card">
                <div className="card-icon">🌟</div>
                <h2>Nuestra Visión</h2>
                <p>
                  Ser la plataforma líder en América Latina para la localización de personas 
                  desaparecidas, reconocida por nuestra eficacia, innovación tecnológica y 
                  compromiso con la seguridad ciudadana, contribuyendo a reducir los índices 
                  de desapariciones sin resolver.
                </p>
              </div>
            </div>
          </section>

          {/* Qué es FaceFind */}
          <section className="what-is-section">
            <div className="what-is-content">
              <div className="what-is-text">
                <h2>¿Qué es FaceFind?</h2>
                <p>
                  <strong>FaceFind</strong> es un sistema inteligente de reconocimiento facial 
                  diseñado específicamente para la búsqueda y localización de personas desaparecidas. 
                  Nuestra plataforma integra tecnología de vanguardia con sistemas de videovigilancia 
                  para crear una red de monitoreo continuo y eficiente.
                </p>
                <p>
                  El sistema permite registrar casos de personas desaparecidas con fotografías de 
                  referencia, las cuales son procesadas mediante algoritmos de deep learning para 
                  generar "embeddings" faciales únicos. Estos perfiles son comparados en tiempo 
                  real con las imágenes capturadas por cámaras de seguridad conectadas al sistema.
                </p>
                <p>
                  Cuando se detecta una coincidencia potencial, el sistema genera una alerta 
                  automática que notifica a las autoridades y familiares, proporcionando la 
                  ubicación exacta, hora de detección y nivel de similitud, facilitando una 
                  respuesta rápida y coordinada.
                </p>
              </div>
              <div className="what-is-image">
                <div className="feature-box">
                  <div className="feature-icon">🤖</div>
                  <h3>IA Avanzada</h3>
                  <p>Algoritmos de reconocimiento facial de última generación</p>
                </div>
                <div className="feature-box">
                  <div className="feature-icon">📹</div>
                  <h3>Red de Cámaras</h3>
                  <p>Integración con sistemas de videovigilancia urbana</p>
                </div>
                <div className="feature-box">
                  <div className="feature-icon">⚡</div>
                  <h3>Alertas en Tiempo Real</h3>
                  <p>Notificaciones instantáneas ante coincidencias</p>
                </div>
              </div>
            </div>
          </section>

          {/* Cómo Funciona */}
          <section className="how-it-works-section">
            <h2 className="section-title">¿Cómo Funciona?</h2>
            <div className="steps-grid">
              <div className="step-card">
                <div className="step-number">1</div>
                <div className="step-icon">📝</div>
                <h3>Registro del Caso</h3>
                <p>
                  Familiares o autoridades registran el caso de la persona desaparecida, 
                  cargando fotografías desde diferentes ángulos y proporcionando información 
                  relevante como ubicación, fecha y circunstancias de la desaparición.
                </p>
              </div>

              <div className="step-card">
                <div className="step-number">2</div>
                <div className="step-icon">🧠</div>
                <h3>Procesamiento con IA</h3>
                <p>
                  El sistema analiza las fotografías usando algoritmos de deep learning para 
                  generar un perfil facial único (embedding). Este perfil captura características 
                  distintivas del rostro que permiten identificaciones precisas.
                </p>
              </div>

              <div className="step-card">
                <div className="step-number">3</div>
                <div className="step-icon">🔍</div>
                <h3>Monitoreo Continuo</h3>
                <p>
                  Las cámaras conectadas al sistema capturan y analizan rostros en tiempo real, 
                  comparándolos con los perfiles de personas desaparecidas registrados en la 
                  base de datos mediante técnicas de similitud facial.
                </p>
              </div>

              <div className="step-card">
                <div className="step-number">4</div>
                <div className="step-icon">🔔</div>
                <h3>Alerta Inmediata</h3>
                <p>
                  Cuando se detecta una coincidencia con alto grado de similitud, se genera 
                  automáticamente una alerta que incluye ubicación GPS, timestamp, imagen 
                  capturada y porcentaje de coincidencia para acción inmediata.
                </p>
              </div>
            </div>
          </section>

          {/* Tecnología */}
          <section className="technology-section">
            <h2 className="section-title">Tecnología de Vanguardia</h2>
            <div className="tech-grid">
              <div className="tech-card">
                <div className="tech-icon">🐍</div>
                <h3>Python & Deep Learning</h3>
                <p>Face Recognition, OpenCV, y algoritmos avanzados de ML</p>
              </div>
              <div className="tech-card">
                <div className="tech-icon">⚛️</div>
                <h3>React & Vite</h3>
                <p>Frontend moderno y responsive para experiencia óptima</p>
              </div>
              <div className="tech-card">
                <div className="tech-icon">🗄️</div>
                <h3>Supabase</h3>
                <p>Base de datos en la nube con PostgreSQL para seguridad</p>
              </div>
              <div className="tech-card">
                <div className="tech-icon">📡</div>
                <h3>API REST</h3>
                <p>Comunicación eficiente entre componentes del sistema</p>
              </div>
            </div>
          </section>

          {/* Equipo */}
          <section className="team-section">
            <h2 className="section-title">Nuestro Equipo</h2>
            <p className="team-intro">
              FaceFind fue desarrollado por un equipo comprometido de estudiantes de Ingeniería de Software 
              de la Universidad, como proyecto del curso de Ingeniería de Software I.
            </p>
            <div className="team-values">
              <div className="value-card">
                <div className="value-icon">💡</div>
                <h3>Innovación</h3>
                <p>Aplicando tecnología de punta para resolver problemas sociales reales</p>
              </div>
              <div className="value-card">
                <div className="value-icon">🤝</div>
                <h3>Compromiso</h3>
                <p>Dedicados a hacer una diferencia en la búsqueda de personas desaparecidas</p>
              </div>
              <div className="value-card">
                <div className="value-icon">🎓</div>
                <h3>Excelencia</h3>
                <p>Implementando las mejores prácticas de ingeniería de software</p>
              </div>
            </div>
          </section>

          {/* Impacto Social */}
          <section className="impact-section">
            <div className="impact-content">
              <h2>Impacto Social</h2>
              <p>
                FaceFind no es solo una aplicación tecnológica, es una herramienta que puede 
                salvar vidas y reunir familias. Cada persona encontrada gracias a nuestro 
                sistema representa una historia de esperanza y el poder transformador de la 
                tecnología aplicada con propósito social.
              </p>
              <div className="impact-stats">
                <div className="stat-box">
                  <div className="stat-number">24/7</div>
                  <div className="stat-label">Monitoreo Continuo</div>
                </div>
                <div className="stat-box">
                  <div className="stat-number">&lt;3s</div>
                  <div className="stat-label">Tiempo de Alerta</div>
                </div>
                <div className="stat-box">
                  <div className="stat-number">95%+</div>
                  <div className="stat-label">Precisión</div>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
      <Footer />
    </>
  );
}

