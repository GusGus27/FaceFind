import React, { useState } from "react";
import Header from "../components/common/Header";
import Footer from "../components/common/Footer";
import "../styles/views/ContactPage.css";

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: ""
  });

  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Aquí iría la lógica para enviar el formulario
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setFormData({ name: "", email: "", subject: "", message: "" });
    }, 3000);
  };

  return (
    <>
      <Header />
      <div className="contact-page">
        <div className="contact-container">
          {/* Hero */}
          <section className="contact-hero">
            <h1 className="contact-title">
              ¿Necesitas <span className="highlight">Ayuda?</span>
            </h1>
            <p className="contact-subtitle">
              Estamos aquí para apoyarte. Contáctanos y te responderemos lo antes posible.
            </p>
          </section>
          {/* Main Content */}
          <br />
          <div className="contact-content">
            {/* Contact Form */}
            <div className="form-section">
              <div className="form-card">
                <div className="form-header">
                  <h2>Envíanos un Mensaje</h2>
                  <p>Completa el formulario y nos pondremos en contacto contigo</p>
                </div>

                {submitted ? (
                  <div className="success-message">
                    <div className="success-icon">✅</div>
                    <h3>¡Mensaje Enviado!</h3>
                    <p>Gracias por contactarnos. Te responderemos pronto.</p>
                  </div>
                ) : (
                  <form className="contact-form" onSubmit={handleSubmit}>
                    <div className="form-group">
                      <label htmlFor="name">Nombre Completo *</label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="Tu nombre completo"
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="email">Correo Electrónico *</label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="tu@email.com"
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="subject">Asunto *</label>
                      <select
                        id="subject"
                        name="subject"
                        value={formData.subject}
                        onChange={handleChange}
                        required
                      >
                        <option value="">Selecciona un asunto</option>
                        <option value="reporte">Reportar Persona Desaparecida</option>
                        <option value="informacion">Información sobre un Caso</option>
                        <option value="soporte">Soporte Técnico</option>
                        <option value="colaboracion">Colaboración Institucional</option>
                        <option value="otro">Otro</option>
                      </select>
                    </div>

                    <div className="form-group">
                      <label htmlFor="message">Mensaje *</label>
                      <textarea
                        id="message"
                        name="message"
                        value={formData.message}
                        onChange={handleChange}
                        placeholder="Escribe tu mensaje aquí..."
                        rows="6"
                        required
                      ></textarea>
                    </div>

                    <button type="submit" className="submit-btn">
                      <span>Enviar Mensaje</span>
                      <span className="btn-icon">📤</span>
                    </button>
                  </form>
                )}
              </div>
            </div>

            {/* Contact Info - Columna derecha */}
            <div className="info-section">
              {/* Card de Emergencia primero */}
              <div className="emergency-card">
                <div className="emergency-icon">🚨</div>
                <h3>¿Es una Emergencia?</h3>
                <p>
                  Si necesitas reportar una desaparición urgente o tienes información 
                  crítica sobre un caso activo, usa nuestro sistema inmediato.
                </p>
                <div className="emergency-buttons">
                  <a href="/registrar_caso" className="emergency-btn primary">
                    Registrar Caso Urgente
                  </a>
                  <a href="tel:105" className="emergency-btn secondary">
                    Llamar al 105 (PNP)
                  </a>
                </div>
              </div>

              {/* Card de información de contacto */}
              <div className="info-card">
                <h3>Información de Contacto</h3>
                <div className="info-items">
                  <div className="info-item">
                    <div className="info-item-icon">📧</div>
                    <div className="info-item-content">
                      <h4>Email</h4>
                      <p>soporte@facefind.pe</p>
                      <p>info@facefind.pe</p>
                    </div>
                  </div>

                  <div className="info-item">
                    <div className="info-item-icon">📞</div>
                    <div className="info-item-content">
                      <h4>Teléfono</h4>
                      <p>+51 1 234-5678</p>
                      <p>+51 987-654-321</p>
                    </div>
                  </div>

                  <div className="info-item">
                    <div className="info-item-icon">📍</div>
                    <div className="info-item-content">
                      <h4>Dirección</h4>
                      <p>Javier Prado 123, Lima, Perú</p>
                      <p>Lima, Perú</p>
                    </div>
                  </div>

                  <div className="info-item">
                    <div className="info-item-icon">🕒</div>
                    <div className="info-item-content">
                      <h4>Horario de Atención</h4>
                      <p>Lunes a Viernes: 9:00 AM - 6:00 PM</p>
                      <p>Emergencias: 24/7</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Card de redes sociales */}
              <div className="social-card">
                <h3>Síguenos en Redes</h3>
                <p>Mantente informado sobre actualizaciones</p>
                <div className="social-links">
                  <a href="#" className="social-link facebook">
                    <span className="social-icon">f</span>
                    <span>Facebook</span>
                  </a>
                  <a href="#" className="social-link twitter">
                    <span className="social-icon">𝕏</span>
                    <span>Twitter</span>
                  </a>
                  <a href="#" className="social-link instagram">
                    <span className="social-icon">📷</span>
                    <span>Instagram</span>
                  </a>
                </div>
              </div>
            </div>
          </div>
          <br />
          {/* FAQ Section */}
          <section className="faq-section">
            <h2 className="section-title">Preguntas Frecuentes</h2>
            <div className="faq-grid">
              <div className="faq-item">
                <h3>¿Cómo registro un caso de persona desaparecida?</h3>
                <p>
                  Debes crear una cuenta en el sistema, completar el formulario de registro 
                  con información detallada y subir fotografías claras desde diferentes 
                  ángulos. El sistema procesará la información inmediatamente.
                </p>
              </div>

              <div className="faq-item">
                <h3>¿Cuánto tiempo toma procesar un caso?</h3>
                <p>
                  El procesamiento de las fotografías y la generación del perfil facial 
                  toma menos de 5 minutos. Una vez procesado, el sistema comienza el 
                  monitoreo inmediatamente a través de las cámaras conectadas.
                </p>
              </div>

              <div className="faq-item">
                <h3>¿El servicio tiene algún costo?</h3>
                <p>
                  No, FaceFind es completamente gratuito. Es un proyecto desarrollado con 
                  fines sociales para ayudar en la localización de personas desaparecidas.
                </p>
              </div>

              <div className="faq-item">
                <h3>¿Qué hago si el sistema genera una alerta?</h3>
                <p>
                  Recibirás una notificación inmediata con la ubicación, hora y nivel de 
                  coincidencia. Coordina con las autoridades para verificar la información 
                  y actuar de manera segura.
                </p>
              </div>

              <div className="faq-item">
                <h3>¿Qué tan preciso es el reconocimiento facial?</h3>
                <p>
                  Nuestro sistema tiene una precisión superior al 95%. Sin embargo, todas 
                  las alertas deben ser verificadas por personal autorizado antes de tomar 
                  acción.
                </p>
              </div>

              <div className="faq-item">
                <h3>¿Cómo protegen mi privacidad?</h3>
                <p>
                  Todos los datos son encriptados y almacenados de manera segura. Solo 
                  usuarios autorizados tienen acceso a la información de los casos. 
                  Cumplimos con todas las regulaciones de protección de datos.
                </p>
              </div>
            </div>
          </section>
        </div>
      </div>
      <Footer />
    </>
  );
}

