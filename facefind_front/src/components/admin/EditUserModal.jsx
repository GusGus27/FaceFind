import React, { useState, useEffect } from 'react';
import '../../styles/admin/EditUserModal.css';

/**
 * Modal para editar información de un usuario existente
 * @param {boolean} isOpen - Controla la visibilidad del modal
 * @param {function} onClose - Función callback para cerrar el modal
 * @param {function} onUpdateUser - Función callback para actualizar el usuario
 * @param {object} user - Objeto con los datos del usuario a editar
 */
const EditUserModal = ({ isOpen, onClose, onUpdateUser, user }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    dni: '',
    role: 'user'
  });

  // Cargar datos del usuario cuando cambia
  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        dni: user.dni || '',
        role: user.role || 'user'
      });
    }
  }, [user]);

  if (!isOpen || !user) return null;

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validaciones básicas
    if (!formData.name || !formData.email || !formData.dni) {
      alert('Por favor completa todos los campos');
      return;
    }

    // Validar formato de DNI (8 dígitos)
    if (!/^\d{8}$/.test(formData.dni)) {
      alert('El DNI debe tener exactamente 8 dígitos');
      return;
    }

    // Validar formato de email
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      alert('Por favor ingresa un email válido');
      return;
    }

    // Validar longitud del nombre
    if (formData.name.length < 3) {
      alert('El nombre debe tener al menos 3 caracteres');
      return;
    }

    onUpdateUser(formData);
  };

  const handleClose = () => {
    onClose();
  };

  // Cerrar modal al hacer clic en el overlay
  const handleOverlayClick = (e) => {
    if (e.target.className === 'edit-user-modal modal-overlay') {
      handleClose();
    }
  };

  return (
    <div className="edit-user-modal">
    <div className="modal-overlay" onClick={handleOverlayClick}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>✏️ Editar Usuario</h2>
          <button 
            className="modal-close" 
            onClick={handleClose}
            aria-label="Cerrar modal"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="edit-name">Nombre completo *</label>
            <input
              type="text"
              id="edit-name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="Ej: Juan Pérez"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="edit-email">Email *</label>
            <input
              type="email"
              id="edit-email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder="usuario@example.com"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="edit-dni">DNI *</label>
            <input
              type="text"
              id="edit-dni"
              name="dni"
              value={formData.dni}
              onChange={handleInputChange}
              placeholder="12345678"
              maxLength="8"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="edit-role">Rol *</label>
            <select
              id="edit-role"
              name="role"
              value={formData.role}
              onChange={handleInputChange}
            >
              <option value="user">Usuario</option>
              <option value="moderator">Moderador</option>
              <option value="admin">Administrador</option>
            </select>
          </div>

          <div className="form-info">
            <p>📅 Registrado: {user.registeredDate}</p>
            <p>🔑 ID: {user.id}</p>
          </div>

          <div className="modal-actions">
            <button type="button" className="btn-cancel" onClick={handleClose}>
              Cancelar
            </button>
            <button type="submit" className="btn-submit">
              Guardar Cambios
            </button>
          </div>
        </form>
      </div>
    </div>
    </div>
  );
};

export default EditUserModal;
