import React, { useState } from 'react';
import '../../styles/admin/AddUserModal.css';

const AddUserModal = ({ isOpen, onClose, onAddUser }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    dni: '',
    role: 'user',
    password: ''
  });

  if (!isOpen) return null;

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
    if (!formData.name || !formData.email || !formData.dni || !formData.password) {
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

    // Llamar a la función de agregar usuario
    onAddUser(formData);

    // Limpiar formulario
    setFormData({
      name: '',
      email: '',
      dni: '',
      role: 'user',
      password: ''
    });
  };

  const handleClose = () => {
    setFormData({
      name: '',
      email: '',
      dni: '',
      role: 'user',
      password: ''
    });
    onClose();
  };

  return (
    <div className="add-user-modal">
      <div className="modal-overlay" onClick={handleClose}>
        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
          <div className="modal-header">
            <h2>Agregar Nuevo Usuario</h2>
            <button className="modal-close" onClick={handleClose}>&times;</button>
          </div>
        
        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-group">
            <label htmlFor="name">Nombre Completo</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="Ingresa el nombre completo"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder="usuario@ejemplo.com"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="dni">DNI</label>
            <input
              type="text"
              id="dni"
              name="dni"
              value={formData.dni}
              onChange={handleInputChange}
              placeholder="12345678"
              maxLength="8"
              pattern="\d{8}"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Contraseña</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              placeholder="Contraseña temporal"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="role">Rol</label>
            <select
              id="role"
              name="role"
              value={formData.role}
              onChange={handleInputChange}
            >
              <option value="user">Usuario</option>
              <option value="admin">Administrador</option>
            </select>
          </div>

          <div className="modal-actions">
            <button type="button" className="btn-cancel" onClick={handleClose}>
              Cancelar
            </button>
            <button type="submit" className="btn-submit">
              Agregar Usuario
            </button>
          </div>
        </form>
      </div>
    </div>
    </div>
  );
};

export default AddUserModal;
