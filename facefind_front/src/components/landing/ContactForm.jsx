import React, { useState } from 'react';
import '../../styles/landing/ContactForm.css';

const ContactForm = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });

  const [formStatus, setFormStatus] = useState({
    submitted: false,
    error: false,
    message: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validación básica
    if (!formData.name || !formData.email || !formData.message) {
      setFormStatus({
        submitted: false,
        error: true,
        message: 'Por favor, completa todos los campos obligatorios.'
      });
      return;
    }

    // Validación de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setFormStatus({
        submitted: false,
        error: true,
        message: 'Por favor, ingresa un email válido.'
      });
      return;
    }

    // Simulación de envío
    console.log('Form submitted:', formData);
    
    setFormStatus({
      submitted: true,
      error: false,
      message: '¡Gracias por contactarnos! Te responderemos pronto.'
    });

    // Limpiar formulario
    setFormData({
      name: '',
      email: '',
      subject: '',
      message: ''
    });

    // Limpiar mensaje después de 5 segundos
    setTimeout(() => {
      setFormStatus({ submitted: false, error: false, message: '' });
    }, 5000);
  };

  return (
    <section id="contact" className="contact">
      <div className="contact-container">
        <div className="contact-info">
          <h2 className="section-title">Contáctanos</h2>
          <p className="contact-description">
            ¿Tienes preguntas o sugerencias? Estamos aquí para ayudarte. 
            Completa el formulario y nos pondremos en contacto contigo lo antes posible.
          </p>
          
          <div className="contact-details">
            <div className="contact-detail-item">
              <div className="detail-icon">📧</div>
              <div className="detail-content">
                <h4>Email</h4>
                <p>contacto@facefind.com</p>
              </div>
            </div>
            
            <div className="contact-detail-item">
              <div className="detail-icon">📱</div>
              <div className="detail-content">
                <h4>Teléfono</h4>
                <p>+51 999 888 777</p>
              </div>
            </div>
            
            <div className="contact-detail-item">
              <div className="detail-icon">⏰</div>
              <div className="detail-content">
                <h4>Horario</h4>
                <p>Lunes a Viernes: 9:00 AM - 6:00 PM</p>
              </div>
            </div>
          </div>
        </div>

        <div className="contact-form-wrapper">
          <form className="contact-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="name">Nombre Completo *</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Tu nombre"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="email">Email *</label>
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
              <label htmlFor="subject">Asunto</label>
              <input
                type="text"
                id="subject"
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                placeholder="Asunto de tu mensaje"
              />
            </div>

            <div className="form-group">
              <label htmlFor="message">Mensaje *</label>
              <textarea
                id="message"
                name="message"
                value={formData.message}
                onChange={handleChange}
                placeholder="Escribe tu mensaje aquí..."
                rows="5"
                required
              ></textarea>
            </div>

            {formStatus.message && (
              <div className={`form-message ${formStatus.error ? 'error' : 'success'}`}>
                {formStatus.message}
              </div>
            )}

            <button type="submit" className="btn-submit">
              Enviar Mensaje
            </button>
          </form>
        </div>
      </div>
    </section>
  );
};

export default ContactForm;
